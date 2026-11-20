import fs from 'node:fs/promises';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const dir='docs/enemy-health-browser',report={cases:[],errors:[],fixture:'Legacy test warden; controlled placement through existing test API. No forced HP selection.'};
await fs.mkdir(dir,{recursive:true});const server=spawn(process.execPath,['server.mjs'],{stdio:'ignore'});let browser,page;
async function run(name,fn){const item={name,ok:false};report.cases.push(item);await fn();item.ok=true;}
try{
 let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Test server exited');try{if((await fetch('http://127.0.0.1:5173/')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'server readiness');
 browser=await chromium.launch({headless:true});page=await browser.newPage({viewport:{width:1440,height:1080},reducedMotion:'reduce'});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>!!window.__ASH_ITERATION_2__&&!!window.__ASH_ENEMY_HEALTH__);
 const state=()=>page.evaluate(()=>window.__ASH_ENEMY_HEALTH__.snapshot());
 const fresh=()=>page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.start();a.place(8,11.2,8,10);a.freeze();a.render();});
 await run('normal pointer selects actual warden geometry and paints HP',async()=>{
  await fresh();const points=(await state()).candidates;let found=false;
  for(const p of points){const q=await page.evaluate(p=>{const c=document.getElementById('game'),r=c.getBoundingClientRect();return{x:r.left+p[0]*r.width/c.width,y:r.top+p[1]*r.height/c.height};},p);await page.mouse.move(q.x,q.y);await page.evaluate(()=>window.__ASH_ITERATION_2__.render());if((await state()).target){found=true;break;}}
  assert.ok(found,'visible enemy must be selectable without setting target state');const s=await state(),enemy=await page.evaluate(()=>window.__ASH_ITERATION_2__.state().enemy);assert.equal(s.target.id,enemy.id);assert.equal(s.target.hp,enemy.hp);assert.equal(s.hoverId,enemy.id);
  const painted=await page.evaluate(()=>{const c=document.getElementById('game'),d=c.getContext('2d').getImageData(0,0,c.width,85).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===182&&d[i+1]===92&&d[i+2]===70)n++;return n;});assert.ok(painted>0,'ASCII health fill glyphs must be painted');await page.screenshot({path:dir+'/hover.png'});
 });
 await run('real attack updates HP and the last-hit panel expires',async()=>{
  const accepted=await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__,e=a.state().enemy;const ok=a.attack('light',e.x,e.y);a.advance(1.5);a.render();return ok;});assert.ok(accepted);const enemy=await page.evaluate(()=>window.__ASH_ITERATION_2__.state().enemy);assert.ok(enemy.hp<70&&enemy.hp>0);assert.equal((await state()).target?.hp,enemy.hp);
  await page.mouse.move(1,1);await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.advance(2.2);a.render();});assert.equal((await state()).target,null);
 });
 await run('pause and restart remove stale target ownership',async()=>{await page.evaluate(()=>window.__ASH_ITERATION_2__.pause());assert.equal((await state()).target,null);await fresh();assert.equal((await state()).target,null);});
 await run('real relic modal suppresses HP',async()=>{const opened=await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.start();a.place(8,12,100,100);const ok=window.__ASH_MANIFEST__.openReading({id:'hp-check',title:'HP CHECK',text:'Blocking panel test.',transition:'instant'});a.render();return ok;});assert.equal(opened,true);assert.equal((await state()).target,null);assert.equal((await state()).hoverId,null);await page.screenshot({path:dir+'/modal.png'});});
 await run('Bonebound trial and restart preserve three distinct undead',async()=>{await page.locator('#bestiaryTrial').click();await page.locator('#game').scrollIntoViewIfNeeded();await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});let s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,3);assert.equal(new Set(s.enemies.map(e=>e.id)).size,3);assert.ok(s.enemies.every(e=>e.archetype==='bonebound'&&e.hp===36));await page.screenshot({path:dir+'/bonebound-trial.png'});await page.locator('#restart').click();s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,3);assert.ok(s.enemies.every(e=>e.hp===36));});
 await run('group pointer switches real HP ownership and pause clears it',async()=>{
  await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});
  const found=new Set();
  for(const p of (await state()).candidates){
   const q=await page.evaluate(p=>{const c=document.getElementById('game'),r=c.getBoundingClientRect();return{x:r.left+p[0]*r.width/c.width,y:r.top+p[1]*r.height/c.height};},p);
   await page.mouse.move(q.x,q.y);await page.evaluate(()=>window.__ASH_ITERATION_2__.render());
   const hp=await state();if(hp.hoverId===null)continue;assert.ok(hp.target,'hovered enemy must have an HP panel');
   const enemies=await page.evaluate(()=>window.__ASH_ITERATION_2__.state().enemies),enemy=enemies.find(e=>e.id===hp.target.id);
   assert.ok(enemy);assert.equal(hp.hoverId,enemy.id);assert.equal(hp.target.hp,enemy.hp);assert.equal(hp.target.maxHp,36);found.add(enemy.id);if(found.size>=2)break;
  }
  assert.ok(found.size>=2,'normal pointer must select at least two distinct Bonebound instances');await page.screenshot({path:dir+'/group-hover.png'});
  await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.pause();a.render();});assert.equal((await state()).target,null);assert.equal((await state()).hoverId,null);
 });
 await run('mixed melee trial exposes five archetypes and survives restart',async()=>{
 await page.locator('#undeadTrial').click();await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});
 const check=async()=>{const s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,5);assert.deepEqual(s.enemies.map(e=>e.archetype),['bonebound','ossuary-guard','gravebearer','bloated-remnant','ashbound']);assert.ok(s.enemies.every(e=>e.hp===e.maxHp&&e.hp>0));};
 await check();await page.screenshot({path:dir+'/mixed-undead.png'});await page.locator('#restart').click();await check();
 });
 await run('Archer mixed trial renders released arrows and restart clears them',async()=>{await page.locator('#archerTrial').click();await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});let s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.deepEqual(s.enemies.map(e=>e.archetype),['marrow-archer','bonebound','ossuary-guard']);let seen=false;for(let i=0;i<30;i++){await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.advance(.1);a.render();});s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());if(s.arrows?.length){seen=true;break;}}assert.ok(seen,'a real arrow must be released');await page.screenshot({path:dir+'/archer-shot.png'});await page.locator('#restart').click();s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,3);assert.equal((s.arrows??[]).length,0);});
 assert.deepEqual(report.errors,[]);report.ok=true;
}catch(error){report.ok=false;report.failure=String(error.stack??error);if(page)await page.screenshot({path:dir+'/failure.png'}).catch(()=>{});process.exitCode=1;
}finally{await fs.writeFile(dir+'/report.json',JSON.stringify(report,null,2));await browser?.close();server.kill();}
