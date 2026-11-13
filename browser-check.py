from __future__ import annotations
import asyncio,json,os,subprocess
from pathlib import Path
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
browser_errors=[]
browser_results=[]
portable_errors=[]
portable_requests=[]
async def check(name,action):
 try:
  details=await action();browser_results.append({'name':name,'passed':True,'details':details})
 except Exception as e:
  browser_results.append({'name':name,'passed':False,'error':str(e)[:1500]})


async def state():return await page.evaluate('window.__ASH_ITERATION_1__.state()')


async def first_load():
 await page.goto(url,wait_until='networkidle');await page.wait_for_function('window.__ASH_ITERATION_1__?.getRenderCount()>0')
 d=await page.evaluate('({backend:window.__ASH_ITERATION_1__.getBackend(),build:window.__ASH_ITERATION_1__.buildId,profile:window.__ASH_ITERATION_1__.profile})')
 assert d['backend']=='WEBGL2',d
 assert d['profile']['cols']==196 and d['profile']['zoom']==65
 assert not browser_errors,browser_errors
 return d


async def freeze():
 await page.locator('#pause').click();await page.wait_for_timeout(150)
 a=await state();await page.wait_for_timeout(180);b=await state()
 assert a==b,(a,b)
 return {'frozen_time':a['time'],'button':await page.locator('#pause').text_content()}


async def resume_move():
 await page.locator('#pause').click();a=await state()
 try:
  await page.keyboard.down('d');await page.wait_for_function('(x)=>window.__ASH_ITERATION_1__.state().x>x+.05',arg=a['x'],timeout=10000)
 finally:await page.keyboard.up('d')
 b=await state();active=await page.evaluate('document.activeElement.id')
 assert active=='game',active
 return {'before':[a['x'],a['y']],'after':[b['x'],b['y']],'focus':active}


async def reset_move_arrow():
 await page.locator('#reset').click();s=await state();assert s['x']==8 and s['y']==12,s
 try:
  await page.keyboard.down('ArrowLeft');await page.wait_for_function('window.__ASH_ITERATION_1__.state().x<7.95',timeout=10000)
 finally:await page.keyboard.up('ArrowLeft')
 s=await state();assert s['lamp']==100 and 'hp' not in s
 return {'position':[s['x'],s['y']],'lamp':s['lamp']}


async def no_combat():
 await page.evaluate('window.__ASH_ITERATION_1__.pause(true)');a=await state()
 for k in ['r','e','q','Shift']:await page.keyboard.press(k)
 b=await state();assert a==b
 return {'state_unchanged':True,'lamp':b['lamp']}


async def backend_reference():
 n=await page.evaluate('window.__ASH_ITERATION_1__.getRenderCount()')
 await page.locator('#backend').select_option('REFERENCE')
 await page.wait_for_function('(n)=>window.__ASH_ITERATION_1__.getRenderCount()>n',arg=n)
 pix=await page.evaluate("(()=>{const c=document.getElementById('game').getContext('2d'),a=c.getImageData(0,0,1008,720).data;let n=0,sum=0;for(let i=0;i<a.length;i+=4){sum+=a[i]+a[i+1]+a[i+2];if(Math.max(a[i],a[i+1],a[i+2])>10)n++;}return{mean:sum/(1008*720*3),nonblack:n/(1008*720),focus:document.activeElement.id,backend:window.__ASH_ITERATION_1__.getBackend()};})()")
 assert pix['backend']=='REFERENCE' and pix['mean']>.5 and pix['nonblack']>.01,pix
 async with page.expect_download() as info:await page.locator('#export').click()
 download=await info.value;await download.save_as(str(root/'docs/reference-frame.png'))
 return pix


async def reference_input():
 await page.locator('#pause').click();a=await state()
 try:
  await page.keyboard.down('w');await page.wait_for_function('(y)=>window.__ASH_ITERATION_1__.state().y<y-.05',arg=a['y'],timeout=10000)
 finally:await page.keyboard.up('w')
 b=await state();assert b['x']<a['x'] and b['y']<a['y']
 await page.evaluate('window.__ASH_ITERATION_1__.pause(true)')
 return {'before':[a['x'],a['y']],'after':[b['x'],b['y']]}


async def backend_gpu():
 n=await page.evaluate('window.__ASH_ITERATION_1__.getRenderCount()')
 await page.locator('#backend').select_option('WEBGL2');await page.wait_for_function('(n)=>window.__ASH_ITERATION_1__.getRenderCount()>n',arg=n)
 assert await page.evaluate('window.__ASH_ITERATION_1__.getBackend()')=='WEBGL2'
 pix=await page.evaluate("(()=>{const a=document.getElementById('game').getContext('2d').getImageData(0,0,1008,720).data;let s=0;for(let i=0;i<a.length;i+=4)s+=a[i]+a[i+1]+a[i+2];return{mean:s/(1008*720*3),focus:document.activeElement.id};})()")
 assert pix['mean']>.5 and pix['focus']=='game',pix
 async with page.expect_download() as info:await page.locator('#export').click()
 download=await info.value;await download.save_as(str(root/'docs/webgl2-frame.png'))
 return pix


async def report_download():
 async with page.expect_download() as info:await page.locator('#report').click()
 download=await info.value;path=root/'docs/sample-report.json';await download.save_as(str(path));d=json.loads(path.read_text())
 assert d['buildId']=='ASH_IRON_ITERATION_1_0_1' and d['profile']['cols']==196 and d['state']['lamp']==100
 assert d['gpuTime'] is None and not d['errors']
 return {'filename':download.suggested_filename,'buildId':d['buildId'],'valid_json':True,'errors':d['errors']}


async def paused_reset():
 await page.locator('#reset').click();a=await state();assert a['x']==8 and a['y']==12 and a['cameraX']==8 and a['lamp']==100
 await page.wait_for_timeout(150);b=await state();assert a==b
 return {'frozen_reset_state':b}


async def perf_panel():
 await page.locator('#perfToggle').click();assert await page.locator('#perf').is_visible()
 return {'panel_visible':True}


async def collision_browser():
 d=await page.evaluate("""async()=>{const {World,isSolid}=await import('/game/world.js');const w=new World();Object.assign(w.current,{x:5,y:6.7});w.previous={...w.current};for(let i=0;i<150;i++)w.update(1/60,{x:0,y:-1});return{x:w.current.x,y:w.current.y,solid:isSolid(w.current.x,w.current.y),lamp:w.current.lamp};}""")
 assert d['y']>5.8 and not d['solid'] and d['lamp']==100,d
 return d


async def portable_boot():
 await p2.goto((root/'CONTROL.html').as_uri(),wait_until='load');await p2.wait_for_function('window.__ASH_ITERATION_1__?.getRenderCount()>0')
 d=await p2.evaluate('({build:window.__ASH_ITERATION_1__.buildId,backend:window.__ASH_ITERATION_1__.getBackend(),state:window.__ASH_ITERATION_1__.state()})')
 assert d['build']=='ASH_IRON_ITERATION_1_0_1' and d['backend']=='WEBGL2',d
 assert not portable_errors,portable_errors
 assert not any(v.startswith(('http://','https://')) for v in portable_requests),portable_requests
 return {'build':d['build'],'backend':d['backend'],'http_requests':0,'page_errors':portable_errors}


async def portable_input():
 await p2.locator('#pause').click();await p2.wait_for_timeout(120);a=await p2.evaluate('window.__ASH_ITERATION_1__.state()');await p2.wait_for_timeout(120);b=await p2.evaluate('window.__ASH_ITERATION_1__.state()');assert a==b
 await p2.locator('#pause').click()
 try:
  await p2.keyboard.down('d');await p2.wait_for_function('(x)=>window.__ASH_ITERATION_1__.state().x>x+.05',arg=a['x'])
 finally:await p2.keyboard.up('d')
 c=await p2.evaluate('window.__ASH_ITERATION_1__.state()');assert c['x']>a['x']
 return {'frozen':True,'moved_after_resume':True,'before':a['x'],'after':c['x']}


async def portable_export():
 await p2.evaluate('window.__ASH_ITERATION_1__.pause(true)')
 async with p2.expect_download() as info:await p2.locator('#report').click()
 d=await info.value;await d.save_as(str(root/'docs/portable-report.json'));data=json.loads((root/'docs/portable-report.json').read_text());assert not data['errors'] and data['buildId']=='ASH_IRON_ITERATION_1_0_1'
 return {'valid_report':True,'errors':data['errors']}

async def main():
 global proc,url,pw,browser,page,p2,browser_version
 proc=subprocess.Popen(['node','server.mjs'],cwd=root,env=dict(os.environ,ASH_NO_OPEN='1'),stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 proc.stdout.readline()
 url=proc.stdout.readline().strip()
 pw=await async_playwright().start()
 browser=await pw.chromium.launch(headless=True,args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
 browser_version=browser.version
 page=await browser.new_page(viewport={'width':1280,'height':1000},device_scale_factor=1,accept_downloads=True)
 page.set_default_timeout(10000)
 page.on('pageerror',lambda e:browser_errors.append(str(e)))
 try:
  await check('runtime starts and real WebGL2 shaders link',first_load)
  await check('freeze button stops simulation',freeze)
  await check('WASD works immediately after clicking Resume',resume_move)
  await check('Reset restores state and Arrow movement still works',reset_move_arrow)
  await check('disabled combat and ability keys do not affect iteration 1',no_combat)
  await check('REFERENCE renders a nonblack scene after backend selector',backend_reference)
  await check('WASD works after backend switch and Resume in REFERENCE',reference_input)
  await check('WEBGL2 renders after switching back and retains focus',backend_gpu)
  await check('SAVE REPORT downloads valid diagnostic JSON',report_download)
  await check('reset while paused remains frozen at original camera',paused_reset)
  await check('performance panel opens without F2',perf_panel)
  await check('collision module runs in browser and stops before column',collision_browser)
  await page.evaluate('window.__ASH_ITERATION_1__.pause(true);window.__ASH_ITERATION_1__.reset()')
  for backend,name in [('REFERENCE','reference-frame.png'),('WEBGL2','webgl2-frame.png')]:
   n=await page.evaluate('window.__ASH_ITERATION_1__.getRenderCount()')
   await page.locator('#backend').select_option(backend)
   await page.wait_for_function('(n)=>window.__ASH_ITERATION_1__.getRenderCount()>n',arg=n)
   async with page.expect_download() as info:
    await page.locator('#export').click()
   download=await info.value
   await download.save_as(str(root/'docs'/name))
  p2=await browser.new_page(viewport={'width':1280,'height':1000},accept_downloads=True)
  p2.set_default_timeout(10000)
  p2.on('pageerror',lambda e:portable_errors.append(str(e)))
  p2.on('request',lambda req:portable_requests.append(req.url))
  await check('portable CONTROL.html starts offline through file://',portable_boot)
  await check('portable pause/resume does not lose WASD focus',portable_input)
  await check('portable diagnostic download works',portable_export)
 finally:
  await browser.close()
  await pw.stop()
  proc.terminate()
  proc.wait(timeout=3)
 result={'buildId':'ASH_IRON_ITERATION_1_0_1','browser':browser_version,'gpu':'ANGLE SwiftShader / software','checks':browser_results,'pageErrors':browser_errors,'portablePageErrors':portable_errors,'actualDeviceFPSVerified':False}
 (root/'docs/browser-check.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 print(json.dumps(result,indent=2))
 if any(not x['passed'] for x in browser_results) or browser_errors or portable_errors:
  raise SystemExit(1)
if __name__=='__main__':
 asyncio.run(main())
