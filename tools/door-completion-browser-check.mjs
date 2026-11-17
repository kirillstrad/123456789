import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const dir='door-completion-reports';fs.mkdirSync(dir,{recursive:true});const report={commit:process.env.GITHUB_SHA??null,automationPassed:false,visualAccepted:false,checks:[],errors:[],portablePlayHtmlTested:true},browser=await chromium.launch({headless:true});let page;
try{
 page=await browser.newPage({viewport:{width:1160,height:1120}});page.on('pageerror',e=>report.errors.push(e.message));await page.clock.install();await page.goto(pathToFileURL(path.resolve('PLAY.html')).href);await page.waitForFunction(()=>window.__ASH_ITERATION_2__?.combatDoor);await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
 const sample=()=>page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;return{state:d.state(),door:d.combatDoor()};});const defs=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();return d.combatDoor().scene.doors;});assert.equal(defs.length,6);
 for(const def of defs)for(const side of [-1,1]){
  const {x,y}=def.transform,name=def.modelId+'-'+side,check={id:def.id,side};report.checks.push(check);
  await page.evaluate(({x,y,side})=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(x+.2,y+side*1.1,x<8?15:2,15);d.render();},{x,y,side});
  const capture=async stage=>{await page.evaluate(()=>window.__ASH_ITERATION_2__.render());await page.locator('#game').screenshot({path:path.join(dir,name+'-'+stage+'.png'),animations:'disabled'});};
  const box=await page.locator('#game').boundingBox();assert.ok(box);let hovered=false;
  for(const z of [.4,1,1.7]){for(let dx=-.7;dx<=.8;dx+=.08){const q=await page.evaluate(({x,y,z})=>{const d=window.__ASH_ITERATION_2__;return{p:d.project(x,y,z),v:d.viewport()};},{x:x+dx,y,z});await page.mouse.move(box.x+q.p[0]*box.width/q.v.width,box.y+q.p[1]*box.height/q.v.height);await page.evaluate(()=>window.__ASH_ITERATION_2__.render());if(await page.evaluate(id=>window.__ASH_ITERATION_2__.target()?.id===id,def.id)){hovered=true;break;}}if(hovered)break;}
  assert.ok(hovered,'hover '+name);await capture('highlight');await page.locator('#game').focus();await page.keyboard.press('KeyF');let contact=false,fx=false,opened=false;
  for(let i=0;i<900;i++){
   await page.clock.runFor(17);const s=await sample(),d=s.door.scene.doors.find(d=>d.id===def.id);assert.equal(s.state.phase,'playing');
   if(s.state.interactionAnimation?.progress>=.55&&!contact){await capture('contact');contact=true;}
   if(d.status==='opening'&&d.elapsed>.025&&!fx){await capture('sparks-smoke');fx=true;check.style=d.style;check.motion=d.motion;}
   if(d.status==='open'&&!s.door.interaction){assert.equal(d.side,side);opened=true;break;}
  }
  assert.ok(contact&&fx&&opened,'complete '+name);await capture('open');const before=await sample(),keys=side===1?['KeyW','KeyD']:['KeyS','KeyA'];for(const key of keys)await page.keyboard.down(key);try{await page.clock.runFor(1200);}finally{for(const key of keys)await page.keyboard.up(key);}
  const after=await sample();assert.ok((after.state.y-y)*side<-.3,'passage '+name);assert.ok(Math.abs(after.state.x-before.state.x)<.12);assert.equal(after.door.events.filter(e=>e.type==='interaction-effect').length,1);assert.ok(after.door.scene.doors.filter(d=>d.id!==def.id).every(d=>d.status==='closed'));check.passed=true;await capture('passage');
 }
 assert.equal(new Set(report.checks.map(c=>c.style)).size,6);assert.deepEqual(report.errors,[]);await page.evaluate(()=>window.__ASH_ITERATION_2__.start());assert.ok((await sample()).door.scene.doors.every(d=>d.status==='closed'&&!d.blocked));report.automationPassed=true;
}catch(e){report.failure=String(e.stack??e);if(page)try{await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true});report.failureState=await page.evaluate(()=>window.__ASH_ITERATION_2__.report());}catch{}throw e;}finally{fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));await browser.close();}
