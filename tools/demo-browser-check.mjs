import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1160,height:1120}}),checks=[],errors=[],report={sourceCommit:process.env.GITHUB_SHA??null,passed:false,checks,errors,fixtures:[],scope:'Rebuilt main demo in Chromium, not human visual acceptance or native input certification'};
page.on('pageerror',e=>errors.push(e.message));const state=()=>page.evaluate(()=>window.__ASH_ITERATION_2__.state());
async function clickAttack(kind){const box=await page.locator('#game').boundingBox();assert.ok(box);await page.mouse.click(box.x+box.width*.53,box.y+box.height*.44,{button:kind==='L'?'left':'right'});}
async function waitForAttack(predicate,arg,label,timeout=6000){
 for(let elapsed=0;elapsed<=timeout;elapsed+=17){if(await page.evaluate(predicate,arg))return;await page.clock.runFor(17);}
 report.attackFailure={chain:report.attackChain,expected:label,state:await diagnostic(),events:await page.evaluate(()=>window.__ASH_ITERATION_2__.events())};
 throw Error('Attack check timed out after '+timeout+'ms of controlled browser time: '+report.attackChain+' / '+label);
}
async function diagnostic(){return page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;if(!d)return{api:false};const s=d.state(),dx=s.enemy.x-s.x,dy=s.enemy.y-s.y,distance=Math.hypot(dx,dy);return{mode:d.mode(),phase:s.phase,lamp:s.lamp,x:s.x,y:s.y,fx:s.fx,fy:s.fy,distance,facingDot:distance?(dx*s.fx+dy*s.fy)/distance:1,enemy:s.enemy,hitReaction:s.hitReaction,action:s.action,dash:s.dash,sweepProgress:s.sweepProgress,execution:s.execution,available:d.executionAvailable(),effects:d.executionEffects().counts};});}
function prepareExecutionFixture(){
 const d=window.__ASH_ITERATION_2__,hero={x:8,y:8},target={x:8,y:9},parked={x:15,y:15},expectedHp=[52,34,16],trace=[];
 const details=()=>({positions:{hero,target,parked},trace,state:d.state(),events:d.events()});
 d.start();d.freeze();d.place(hero.x,hero.y,parked.x,parked.y);d.damage(45);d.advance(1);
 for(let i=0;i<3;i++){
  const eventStart=d.events().length;
  if(!d.attack('light',target.x,target.y))throw Error('Fixture attack rejected: '+JSON.stringify(details()));
  d.advance(.45);d.place(hero.x,hero.y,target.x,target.y);d.advance(.1);d.place(hero.x,hero.y,parked.x,parked.y);d.advance(.5);
  const s=d.state(),hits=d.events().slice(eventStart).filter(e=>e.type==='hit');trace.push({strike:i+1,expectedHp:expectedHp[i],actualHp:s.enemy.hp,hits,hero:{x:s.x,y:s.y},action:s.action});
  if(hits.length!==1||hits[0].amount!==18||s.enemy.hp!==expectedHp[i])throw Error('Fixture strike '+(i+1)+' failed: '+JSON.stringify(details()));
 }
 d.place(hero.x,hero.y,target.x,target.y);const metrics=d.render(),s=d.state();if(metrics.executionCamera.zoom!==1)throw Error('Fixture camera did not reset');
 const ready=d.executionAvailable();if(!ready)throw Error('Fixture not execution-ready: '+JSON.stringify(details()));
 return{ready,s,trace,positions:{hero,target,parked}};
}
async function fixture(){
const prepared=await page.evaluate(prepareExecutionFixture);
report.fixtures.push({positions:prepared.positions,strikes:prepared.trace,prepared:await diagnostic()});assert.equal(prepared.ready,true,'Frozen execution fixture must already satisfy gameplay rules');
const box=await page.locator('#game').boundingBox();assert.ok(box);const size=await page.locator('#game').evaluate(c=>({width:c.width,height:c.height})),s=prepared.s,dx=s.enemy.x-s.cameraX,dy=s.enemy.y-s.cameraY,px=504+(dx-dy)*65*.76,py=430+(dx+dy)*65*.43;
await page.mouse.move(box.x+px/size.width*box.width,box.y+py/size.height*box.height);await page.locator('#game').focus();
await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;if(!d.executionAvailable())throw Error('Fixture lost readiness before resume');document.getElementById('freeze').click();});
await page.waitForFunction(()=>window.__ASH_ITERATION_2__.executionAvailable(),null,{timeout:5000});report.fixtures.at(-1).resumed=await diagnostic();
}
try{
await page.clock.install();
await page.goto(pathToFileURL(path.resolve('PLAY.html')).href+'?desktop=1');await page.waitForFunction(()=>window.__ASH_ITERATION_2__?.executionEffects);assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.build),'ASH_IRON_DEMO_4BC');
// Establish menu-owned run state before debug API resets used by later fixtures.
await page.waitForFunction(()=>!!window.__ASH_THRONE__);
assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.mode()),'menu');
await page.locator('#game').focus();await page.keyboard.press('Enter');
await page.waitForFunction(()=>window.__ASH_ITERATION_2__.mode()==='game',null,{timeout:5000});
assert.equal(await page.evaluate(()=>window.__ASH_THRONE__.state().hasRun),true);
checks.push('Real NEW GAME establishes a resumable menu session');
await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
for(const chain of ['LLL','LLH','HH']){
 report.attackChain=chain;
 await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(8,12,15,15);});await page.locator('#game').focus();await clickAttack(chain[0]);
 for(let i=1;i<chain.length;i++){await waitForAttack(stage=>{const a=window.__ASH_ITERATION_2__.state().action;return a&&a.stage===stage&&a.progress>.2&&a.progress<.65;},i-1,'input window of stage '+(i-1),5000);await clickAttack(chain[i]);}
 await waitForAttack(stage=>{const a=window.__ASH_ITERATION_2__.state().action;return a&&a.stage===stage&&a.progress>.2;},chain.length-1,'final stage '+(chain.length-1));
 const a=(await state()).action;assert.equal(a.kind,chain.at(-1)==='H'?'heavy':'light');assert.equal(a.animation4C,true);await page.locator('#game').screenshot({path:`docs/demo-${chain}.png`});
 await waitForAttack(()=>window.__ASH_ITERATION_2__.state().action===null,null,'chain recovery');
 assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.events().filter(e=>e.type==='strike-start').length),chain.length);checks.push(`Real mouse input ${chain}, new pose path, no hidden repeat`);
}
await page.clock.resume();
await fixture();await page.keyboard.press('r');await page.waitForFunction(()=>!!window.__ASH_ITERATION_2__.state().execution,null,{timeout:3000});await page.keyboard.press('Escape');await page.waitForFunction(()=>window.__ASH_ITERATION_2__.mode()==='pause',null,{timeout:3000});const frozen=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;return JSON.stringify({s:d.state(),fx:d.executionEffects()});});await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;return JSON.stringify({s:d.state(),fx:d.executionEffects()});}),frozen);await page.keyboard.press('Escape');await page.waitForFunction(()=>window.__ASH_ITERATION_2__.mode()==='game',null,{timeout:3000});assert.ok((await state()).execution,'ESC must resume the existing execution');checks.push('Real R starts execution; ESC freezes and resumes world and effect state');
await page.waitForFunction(()=>window.__ASH_ITERATION_2__.state().execution?.elapsed>=2.35,null,{timeout:7000});assert.equal((await page.evaluate(()=>window.__ASH_ITERATION_2__.executionEffects())).counts.blood,94);await page.locator('#game').screenshot({path:'docs/demo-execution-pin.png'});
await page.waitForFunction(()=>window.__ASH_ITERATION_2__.state().execution?.elapsed>=4.5,null,{timeout:7000});await page.evaluate(()=>window.__ASH_ITERATION_2__.freeze());const metrics=await page.evaluate(()=>window.__ASH_ITERATION_2__.render()),fx=await page.evaluate(()=>window.__ASH_ITERATION_2__.executionEffects());assert.ok(metrics.executionCamera.zoom>1);assert.ok(fx.counts.ember>0&&fx.counts.soul>0);assert.ok(fx.stains.length>0);await page.locator('#game').screenshot({path:'docs/demo-execution-fire.png'});
for(const [key,option]of [['F6','camera'],['F7','shake'],['F8','blood']]){await page.keyboard.press(key);assert.equal(await page.evaluate(k=>window.__ASH_ITERATION_2__.executionOptions()[k],option),false);}assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.render().executionCamera.zoom),1);for(const key of ['F6','F7','F8'])await page.keyboard.press(key);checks.push('Blood stains embers stream and camera are present; visual toggles work');
const before=(await state()).lamp;await page.evaluate(()=>window.__ASH_ITERATION_2__.damage(5));assert.equal((await state()).lamp,before-5);assert.ok((await state()).execution);await page.evaluate(()=>window.__ASH_ITERATION_2__.advance(2.2));const extracted=await state();assert.ok(extracted.enemy.charred);assert.equal(extracted.enemy.hp,0);assert.equal(extracted.lamp,Math.min(100,before-5+30));assert.equal(extracted.phase,'playing');await page.evaluate(()=>window.__ASH_ITERATION_2__.render());await page.locator('#game').screenshot({path:'docs/demo-execution-charred.png'});await page.evaluate(()=>window.__ASH_ITERATION_2__.advance(7));assert.equal((await state()).phase,'won');assert.equal((await state()).execution,null);assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.events().filter(e=>e.executionEvent==='extracted').length),1);checks.push('Damage does not interrupt; reward once; victory waits for blade recovery');
await fixture();await page.keyboard.press('r');await page.waitForFunction(()=>!!window.__ASH_ITERATION_2__.state().execution);await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.freeze();d.damage(100);d.advance(2);});assert.equal((await state()).lamp,0);assert.equal((await state()).phase,'dead');assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.events().filter(e=>e.executionEvent==='extracted').length),0);checks.push('Lethal damage before extraction never restores lamp');
await page.evaluate(()=>window.__ASH_ITERATION_2__.start());assert.equal((await state()).execution,null);const cleared=await page.evaluate(()=>window.__ASH_ITERATION_2__.executionEffects());assert.equal(cleared.particles.length,0);assert.equal(cleared.stains.length,0);assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.render().executionCamera.zoom),1);checks.push('Restart clears execution effects and camera');
assert.deepEqual(errors,[]);assert.deepEqual(await page.evaluate(()=>window.__ASH_ITERATION_2__.report().errors),[]);report.passed=true;
}catch(e){report.error=e.stack??String(e);try{report.failureState=await diagnostic();console.error('Demo failure state:',JSON.stringify(report.failureState));}catch(d){report.diagnosticError=String(d);}throw e;}finally{fs.writeFileSync('docs/demo-browser-check.json',JSON.stringify(report,null,2));await browser.close();}
