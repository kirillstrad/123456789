import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export function seedDoorScene(source){
 const call='return assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);';
 assert.equal(source.split(call).length,2,'scene factory changed; review the spawn fixture');
 return source.replace(call,`const scene=assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);
 scene.getSpawn=()=>{const t=scene.getTarget('prison-door.a');if(!t)throw Error('Missing door');return{x:t.approach.x,y:t.approach.y+1.5};};return scene;`);
}
export function bindingProbe(){return `
import {bindGalleryDoorInteraction as bindOriginal} from './__door-original-binding.js';
import {buildPrisonDoorGeometry,PRISON_DOOR_OPEN_ANGLE} from '../gallery/models/prison-door.js';
export function bindGalleryDoorInteraction(lifecycle,scene,refreshActor=null){
 const original=(life,view)=>bindOriginal(life,view,refreshActor);
 const owner=original(lifecycle,scene),id='prison-door.a',target=scene.getTarget(id);
 const entry=scene.getFrame(target.approach,4).entries.find(e=>e.id===id);
 const model=buildPrisonDoorGeometry({transform:entry}),split=model.frameParts.length;
 const parts=target.parts,frame=parts.slice(0,split),approach=JSON.stringify(target.approach),closed=scene.getColliders();
 const leaf=closed.filter(c=>c.objectId===id).at(-1),h=model.hinge,a=PRISON_DOOR_OPEN_ANGLE*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
 const open=closed.map(c=>c!==leaf?c:{...c,points:c.points.map(([x,y])=>[h[0]+(x-h[0])*co-(y-h[1])*si,h[1]+(x-h[0])*si+(y-h[1])*co])});
 const closedText=JSON.stringify(closed),openText=JSON.stringify(open);
 window.__ASH_DOOR_VISUAL__=Object.freeze({
  sample(){const t=scene.getTarget(id),s=owner.snapshot(),motion=owner.doorMotion();return{motion,collisionRevision:scene.getCollisionRevision(),doorY:entry.y,animation:s.interactionAnimation,interaction:s.interaction,lamp:s.lamp,hero:{x:s.x,y:s.y},partsStable:t.parts===parts,frameStable:frame.every((p,i)=>t.parts[i]===p),approachStable:JSON.stringify(t.approach)===approach,collidersStable:JSON.stringify(scene.getColliders())===(motion.status==='open'?openText:closedText),events:owner.interactionEvents()};},
  candidates(){const project=window.__ASH_ITERATION_2__.project,c=document.getElementById('game'),r=c.getBoundingClientRect();return parts.map(p=>{const v=p.v.map(q=>project(...q)),x=v.reduce((n,q)=>n+q[0],0)/v.length,y=v.reduce((n,q)=>n+q[1],0)/v.length,area=(Math.max(...v.map(q=>q[0]))-Math.min(...v.map(q=>q[0])))*(Math.max(...v.map(q=>q[1]))-Math.min(...v.map(q=>q[1])));return{x:r.left+x*r.width/c.width,y:r.top+y*r.height/c.height,area,visible:x>0&&x<c.width&&y>0&&y<720};}).filter(p=>p.visible).sort((a,b)=>b.area-a.area).slice(0,40);}
 });
 return owner;
}`;}
export function auditDoorSample(sample,previous=null){
 const m=sample.motion;
 assert.ok(['closed','opening','open'].includes(m.status),'invalid door status');
 assert.ok(Number.isFinite(m.angle)&&m.angle>=-90&&m.angle<=0,'invalid angle');
 assert.ok(Number.isFinite(m.progress)&&m.progress>=0&&m.progress<=1,'invalid progress');
 for(const key of ['partsStable','frameStable','approachStable','collidersStable'])assert.equal(sample[key],true,key);
 assert.equal(sample.lamp,100,'unexpected lamp expenditure');
 if('collisionRevision' in sample)assert.equal(sample.collisionRevision,m.status==='open'?1:0,'wrong collision revision');
 if(m.status==='closed'){assert.equal(m.angle,0);assert.equal(m.progress,0);}
 if(m.status==='open'){assert.equal(m.angle,-90);assert.equal(m.progress,1);}
 const effects=sample.events.filter(e=>e.type==='interaction-effect');
 assert.ok(effects.length<=1,'duplicate effect');
 if(m.status!=='closed'){assert.equal(effects.length,1,'motion without an effect');assert.equal(effects[0].id,m.actionId,'wrong action owner');}
 if(previous){const rank={closed:0,opening:1,open:2};assert.ok(rank[m.status]>=rank[previous.motion.status],'status went backwards');assert.ok(m.progress>=previous.motion.progress,'progress went backwards');assert.ok(m.angle<=previous.motion.angle,'angle went backwards');}
}
export function snapshotStage(sample,seen){
 if(sample.motion.status==='closed'&&sample.animation?.progress>0&&sample.animation.progress<.35&&!seen.has('reach'))return'reach';
 if(sample.motion.status==='closed'&&sample.animation?.progress>=.5&&!seen.has('before-effect'))return'before-effect';
 if(sample.motion.status==='opening'&&!seen.has('opening-start'))return'opening-start';
 if(sample.motion.status==='opening'&&sample.motion.progress>=.45&&!seen.has('opening-mid'))return'opening-mid';
 if(sample.motion.status==='open'&&!sample.interaction&&!seen.has('open'))return'open';
 return null;
}
export async function runDoorVisualCheck(){
 const root=process.cwd(),folder=path.join(root,'door-visual-reports');fs.mkdirSync(folder,{recursive:true});
 const output=fs.mkdtempSync(path.join(folder,'run-')),errors=[],frames=[],trace=[],checks=[];
 let browser=null,server=null,page=null,failure=null,commit=null;
 try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
 try{
  assert.ok(fs.existsSync('runtime/index.html'),'run npm run build first');
  const {chromium}=await import('playwright');
  server=http.createServer(async(req,res)=>{
   try{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'};
    const body=await fs.promises.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
   }catch{res.writeHead(404);res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=await chromium.launch({headless:true});
  page=await browser.newPage({viewport:{width:1160,height:1120}});page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/runtime/gallery/scene.js',route=>route.fulfill({contentType:'text/javascript',body:seedDoorScene(fs.readFileSync('runtime/gallery/scene.js','utf8'))}));
  await page.route('**/runtime/interaction/gallery-door-binding.js',route=>route.fulfill({contentType:'text/javascript',body:bindingProbe()}));
  await page.route('**/runtime/interaction/__door-original-binding.js',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync('runtime/interaction/gallery-door-binding.js','utf8')}));
  await page.clock.install();
  await page.goto(`http://127.0.0.1:${server.address().port}/runtime/index.html`);
  await page.waitForFunction(()=>window.__ASH_GALLERY__&&window.__ASH_ITERATION_2__);
  await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
  await page.evaluate(()=>window.__ASH_GALLERY__.walk());
  await page.locator('#game').focus();await page.clock.runFor(200);
  await page.evaluate(()=>window.__ASH_GALLERY__.render());
  const seen=new Set();
  const capture=async(stage,sample)=>{await page.evaluate(()=>window.__ASH_GALLERY__.render());const file=stage+'.png';await page.locator('#game').screenshot({path:path.join(output,file),animations:'disabled',timeout:15000});seen.add(stage);frames.push({stage,file,sample});};
  let previous=await page.evaluate(()=>window.__ASH_DOOR_VISUAL__.sample());auditDoorSample(previous);await capture('closed',previous);
  const candidates=await page.evaluate(()=>window.__ASH_DOOR_VISUAL__.candidates());let hovered=false;
  for(const p of candidates){await page.mouse.move(p.x,p.y);await page.evaluate(()=>window.__ASH_GALLERY__.render());if(await page.evaluate(()=>window.__ASH_ITERATION_2__.target()?.id==='prison-door.a')){hovered=true;break;}}
  assert.ok(hovered,'cannot point at the real door');await page.keyboard.press('f');
  for(let i=0;i<720;i++){
   await page.clock.runFor(17);
   const sample=await page.evaluate(()=>window.__ASH_DOOR_VISUAL__.sample());auditDoorSample(sample,previous);trace.push(sample);
   const stage=snapshotStage(sample,seen);if(stage)await capture(stage,sample);
   previous=sample;if(seen.has('open'))break;
  }
  for(const stage of ['closed','reach','before-effect','opening-start','opening-mid','open'])assert.ok(seen.has(stage),'missing snapshot: '+stage);
  const events=previous.events;
  for(const type of ['interaction-start','interaction-effect','interaction-end'])assert.equal(events.filter(e=>e.type===type).length,1,type);
  assert.ok(frames.at(-1).sample.hero.y<frames[0].sample.hero.y,'real player did not approach from fixture spawn');
  assert.deepEqual(errors,[]);
  checks.push('real pointer/F/approach, one effect/end, opening, stable frame/target/approach, phase-correct colliders, unchanged lamp');
  const beforePassage=previous;
  await page.keyboard.down('KeyW');
  try{await page.clock.runFor(1800);}finally{await page.keyboard.up('KeyW');}
  await page.clock.runFor(200);
  const traversed=await page.evaluate(()=>window.__ASH_DOOR_VISUAL__.sample());auditDoorSample(traversed,previous);trace.push(traversed);
  assert.ok(beforePassage.hero.y>beforePassage.doorY,'hero must start in front of door');
  assert.ok(traversed.hero.y<traversed.doorY-.5,'same player did not cross the open doorway');
  await capture('passed-through',traversed);assert.deepEqual(errors,[]);
  checks.push('same player crosses the open doorway using real KeyW input');
  await page.evaluate(()=>window.__ASH_GALLERY__.close());
  assert.equal(await page.evaluate(()=>window.__ASH_GALLERY__.player()),null);
  checks.push('gallery closes and releases its player');
 }catch(error){failure=String(error.stack??error);if(page)try{await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,timeout:5000});}catch{}}
 finally{
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({commit,automationPassed:failure===null,visualAccepted:false,visualReview:'pending',fixture:{nearDoorSpawn:true,distanceBeyondApproach:1.5,readOnlyProbe:true,esmRuntime:true,portablePlayHtmlTested:false},checks,errors,failure,frames,trace},null,2));
  if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
 }
 if(failure)throw Error(failure);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await runDoorVisualCheck();
