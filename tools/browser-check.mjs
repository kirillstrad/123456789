import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1160,height:1120},acceptDownloads:true});
const errors=[],checks=[],consoleErrors=[],attackDiagnostics=[];
let failure=null,downloadDiagnostics=null;
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
const check=async(name,fn)=>{await fn();checks.push({name,passed:true});};
async function diagnostics(){return page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;return{mode:d.mode(),state:d.state(),events:d.events(),viewport:d.viewport()};});}
try{
 await page.goto(pathToFileURL(path.resolve('PLAY.html')).href);
 await page.waitForFunction(()=>window.__ASH_ITERATION_2__);
 await check('file:// boot',async()=>assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.mode()),'menu'));
 await page.locator('#game').screenshot({path:'docs/menu.png'});
 await page.locator('#game').focus();await page.keyboard.press('Enter');
 await check('Enter starts game',async()=>assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.mode()),'game'));
 const pos=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());
 await page.keyboard.down('KeyW');await page.waitForTimeout(200);await page.keyboard.up('KeyW');
 await check('WASD movement',async()=>{const s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.ok(Math.hypot(s.x-pos.x,s.y-pos.y)>.01);});
 await page.keyboard.press('Escape');
 const old=await page.evaluate(()=>({t:window.__ASH_ITERATION_2__.state().time,m:window.__ASH_ITERATION_2__.menuTime()}));
 await page.waitForTimeout(200);
 await check('pause freezes world but fire continues',async()=>{const s=await page.evaluate(()=>({t:window.__ASH_ITERATION_2__.state().time,m:window.__ASH_ITERATION_2__.menuTime()}));assert.equal(s.t,old.t);assert.ok(s.m>old.m);});
 await page.keyboard.press('Escape');
 for(const [button,kind,damage]of [['left','light',18],['right','heavy',34]]){
  await check(button+' attack',async()=>{
   const diagnostic={button,kind,damage};attackDiagnostics.push(diagnostic);
   const aim=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.freeze();d.place(8,10,8,8.4);d.render();const s=d.state();return{point:d.project(s.enemy.x,s.enemy.y,0),viewport:d.viewport()};});
   const box=await page.locator('#game').boundingBox();assert.ok(box);
   const x=box.x+aim.point[0]/aim.viewport.width*box.width,y=box.y+aim.point[1]/aim.viewport.height*box.height;
   await page.mouse.move(x,y);await page.locator('#game').focus();
   await page.evaluate(()=>document.getElementById('freeze').click());
   await page.mouse.click(x,y,{button});
   try{
    await page.waitForFunction(kind=>window.__ASH_ITERATION_2__.state().action?.kind===kind,kind,{timeout:12000});
    diagnostic.started=await diagnostics();
    await page.waitForFunction(damage=>window.__ASH_ITERATION_2__.events().some(e=>e.type==='hit'&&e.amount===damage),damage,{timeout:12000});
    await page.waitForFunction(()=>window.__ASH_ITERATION_2__.state().action===null,null,{timeout:12000});
    diagnostic.finished=await diagnostics();
    assert.equal(diagnostic.finished.events.filter(e=>e.type==='strike-start').length,1);
    assert.ok(diagnostic.finished.events.some(e=>e.type==='hit'&&e.amount===damage));
   }catch(error){diagnostic.failed=await diagnostics();throw error;}
  });
 }
 await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(8,12,15,15);d.render();});
 await page.locator('#game').focus();await page.keyboard.press('KeyE');
 await check('E illuminates ASCII texture',async()=>{
  await page.waitForFunction(()=>window.__ASH_ITERATION_2__.state().sweepProgress!==null,null,{timeout:12000});
  await page.waitForFunction(()=>{const d=window.__ASH_ITERATION_2__;d.render();return d.coneBoost()>0;},null,{timeout:12000});
  assert.ok(await page.evaluate(()=>window.__ASH_ITERATION_2__.coneBoost()>0));
 });
 await page.locator('#game').screenshot({path:'docs/sweep.png'});
 await check('JSON export',async()=>{
  const serialized=await page.evaluate(()=>JSON.stringify(window.__ASH_ITERATION_2__.report()));assert.ok(JSON.parse(serialized).build,'Report must serialize before clicking export');
  const button=page.locator('#report');
  downloadDiagnostics=await button.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{x:r.x,y:r.y,width:r.width,height:r.height,display:s.display,visibility:s.visibility,opacity:s.opacity,topElement:top?.id||top?.tagName,receivesPointer:top===el||el.contains(top),stage:'before trial click'};});
  await button.click({trial:true,timeout:5000});downloadDiagnostics.stage='trial click passed';
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:30000}),button.click({timeout:5000}).then(()=>{downloadDiagnostics.stage='export click completed';})]);
  assert.equal(await download.failure(),null);await download.saveAs('docs/browser-runtime-report.json');assert.ok(JSON.parse(fs.readFileSync('docs/browser-runtime-report.json','utf8')).build);downloadDiagnostics.stage='download verified';
 });
 await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.damage(100);});
 await page.waitForFunction(()=>window.__ASH_ITERATION_2__.mode()==='dead',null,{timeout:15000});
 await check('death menu',async()=>assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.state().lamp),0));
 await page.locator('#game').focus();await page.keyboard.press('Enter');
 await check('restart',async()=>assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.state().lamp),100));
 await page.locator('#game').screenshot({path:'docs/gameplay.png'});assert.deepEqual(errors,[]);
}catch(error){
 failure=String(error.stack||error);
 try{console.error('Browser failure state:',JSON.stringify(await diagnostics()));await page.screenshot({path:'docs/throne-browser-failure.png',fullPage:true});}catch{}
 throw error;
}finally{
 fs.writeFileSync('docs/browser-check.json',JSON.stringify({sourceCommit:process.env.GITHUB_SHA??null,checks,errors,consoleErrors,failure,downloadDiagnostics,attackDiagnostics,passed:!failure&&checks.length>=10&&errors.length===0,environment:'Headless Chromium / GitHub Actions; not user hardware FPS'},null,2));
 await browser.close();
}
