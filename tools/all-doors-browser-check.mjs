import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const dir='all-door-reports';fs.mkdirSync(dir,{recursive:true});
const report={commit:process.env.GITHUB_SHA??null,automationPassed:false,visualAccepted:false,normalSpawnRouteBrowserTested:false,portablePlayHtmlTested:true,checks:[],errors:[]};
const browser=await chromium.launch({headless:true});let page;
try{
 page=await browser.newPage({viewport:{width:1160,height:1120}});page.on('pageerror',e=>report.errors.push(e.message));
 await page.clock.install();await page.goto(pathToFileURL(path.resolve('PLAY.html')).href);
 await page.waitForFunction(()=>window.__ASH_ITERATION_2__?.combatDoor);
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
 const defs=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();return d.combatDoor().scene.doors;});assert.equal(defs.length,6);
 for(const def of defs){
  const {x,y}=def.transform,stage={id:def.id,modelId:def.modelId};report.checks.push(stage);
  await page.evaluate(({x,y})=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(x,y+1.1,x<8?15:2,15);d.render();},{x,y});
  await page.locator('#game').screenshot({path:path.join(dir,def.modelId+'-closed.png')});
  const box=await page.locator('#game').boundingBox();assert.ok(box);let hovered=false;
  for(const z of [.5,1,1.6]){for(let dx=-.7;dx<=.7;dx+=.1){
   const q=await page.evaluate(({x,y,z})=>{const d=window.__ASH_ITERATION_2__;return{p:d.project(x,y,z),v:d.viewport()};},{x:x+dx,y,z});
   await page.mouse.move(box.x+q.p[0]*box.width/q.v.width,box.y+q.p[1]*box.height/q.v.height);
   await page.evaluate(()=>window.__ASH_ITERATION_2__.render());
   if(await page.evaluate(id=>window.__ASH_ITERATION_2__.target()?.id===id,def.id)){hovered=true;break;}
  }if(hovered)break;}
  assert.ok(hovered,'hover '+def.id);await page.locator('#game').focus();await page.keyboard.press('KeyF');let animated=false,opened=false;
  for(let n=0;n<900;n++){
   await page.clock.runFor(17);
   const s=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;return{s:d.state(),door:d.combatDoor()};});
   assert.equal(s.s.phase,'playing',def.id);
   if(s.s.interactionAnimation&&!animated){animated=true;await page.locator('#game').screenshot({path:path.join(dir,def.modelId+'-interaction.png')});}
   if(s.door.scene.doors.find(d=>d.id===def.id).status==='open'&&!s.door.interaction){opened=true;break;}
  }
  assert.ok(animated,'hero animation '+def.id);assert.ok(opened,'open '+def.id);
  await page.evaluate(()=>window.__ASH_ITERATION_2__.render());await page.locator('#game').screenshot({path:path.join(dir,def.modelId+'-open.png')});
  const before=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());
  await page.keyboard.down('KeyW');await page.keyboard.down('KeyD');
  try{await page.clock.runFor(1800);}finally{await page.keyboard.up('KeyD');await page.keyboard.up('KeyW');}
  const after=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());
  assert.ok(before.y>y&&after.y<y-.5,'passage '+def.id);assert.ok(Math.abs(after.x-before.x)<.12,'no lateral bypass '+def.id);
  const scene=await page.evaluate(()=>window.__ASH_ITERATION_2__.combatDoor());
  assert.equal(scene.events.filter(e=>e.type==='interaction-effect'&&e.targetId===def.id).length,1);
  assert.ok(scene.scene.doors.filter(d=>d.id!==def.id).every(d=>d.status==='closed'));
  stage.passed=true;stage.passage={before:{x:before.x,y:before.y},after:{x:after.x,y:after.y}};
  await page.evaluate(()=>window.__ASH_ITERATION_2__.render());await page.locator('#game').screenshot({path:path.join(dir,def.modelId+'-passed.png')});
 }
 await page.evaluate(()=>window.__ASH_ITERATION_2__.start());assert.ok(await page.evaluate(()=>window.__ASH_ITERATION_2__.combatDoor().scene.doors.every(d=>d.status==='closed')));
 assert.deepEqual(report.errors,[]);report.automationPassed=true;
}catch(e){report.failure=String(e.stack??e);if(page)try{await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true});report.failureState=await page.evaluate(()=>window.__ASH_ITERATION_2__.report());}catch{}throw e;}
finally{fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));await browser.close();}
