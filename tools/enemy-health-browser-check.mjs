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
  const pixel=await page.evaluate(()=>{const c=document.getElementById('game'),w=Math.min(c.width-32,340),x=Math.floor((c.width-w)/2+w*.2);return [...c.getContext('2d').getImageData(x,47,1,1).data];});assert.deepEqual(pixel.slice(0,3),[142,37,51]);await page.screenshot({path:dir+'/hover.png'});
 });
 await run('real attack updates HP and the last-hit panel expires',async()=>{
  const accepted=await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__,e=a.state().enemy;const ok=a.attack('light',e.x,e.y);a.advance(1.5);a.render();return ok;});assert.ok(accepted);const enemy=await page.evaluate(()=>window.__ASH_ITERATION_2__.state().enemy);assert.ok(enemy.hp<70&&enemy.hp>0);assert.equal((await state()).target?.hp,enemy.hp);
  await page.mouse.move(1,1);await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.advance(2.2);a.render();});assert.equal((await state()).target,null);
 });
 await run('pause and restart remove stale target ownership',async()=>{await page.evaluate(()=>window.__ASH_ITERATION_2__.pause());assert.equal((await state()).target,null);await fresh();assert.equal((await state()).target,null);});
 await run('real relic modal suppresses HP',async()=>{const opened=await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.start();a.place(8,12,100,100);const ok=window.__ASH_MANIFEST__.openReading({id:'hp-check',title:'HP CHECK',text:'Blocking panel test.',transition:'instant'});a.render();return ok;});assert.equal(opened,true);assert.equal((await state()).target,null);assert.equal((await state()).hoverId,null);await page.screenshot({path:dir+'/modal.png'});});
 assert.deepEqual(report.errors,[]);report.ok=true;
}catch(error){report.ok=false;report.failure=String(error.stack??error);if(page)await page.screenshot({path:dir+'/failure.png'}).catch(()=>{});process.exitCode=1;
}finally{await fs.writeFile(dir+'/report.json',JSON.stringify(report,null,2));await browser?.close();server.kill();}
