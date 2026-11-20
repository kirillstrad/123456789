import fs from 'node:fs';
const file='src/game/combat-world.ts',browserFile='tools/enemy-health-browser-check.mjs';
let text=fs.readFileSync(file,'utf8'),browser=fs.readFileSync(browserFile,'utf8');
const oldLoop="for(const e of selectStrikeTargets(s,{x:a.fx,y:a.fy},a.kind,enemiesOf(s),this.map,a.hitIds)){a.hitIds.add(e.id);",newLoop="let struck=false;for(const e of selectStrikeTargets(s,{x:a.fx,y:a.fy},a.kind,enemiesOf(s),this.map,a.hitIds)){struck=true;a.hitIds.add(e.id);";
const oldWin="if(!aliveEnemies(s).length){s.phase='won';s.note='The nave is silent.';}}};}",newWin="if(struck&&!aliveEnemies(s).length){s.phase='won';s.note='The nave is silent.';}}};}";
if(!(text.split(newLoop).length===2&&text.split(newWin).length===2)){
 if(text.split(oldLoop).length!==2||text.split(oldWin).length!==2)throw Error('Unexpected strike victory context');
 text=text.replace(oldLoop,newLoop).replace(oldWin,newWin);
}
const marker='group pointer switches real HP ownership and pause clears it',end=' assert.deepEqual(report.errors,[]);report.ok=true;';
if(!browser.includes(marker)){
 if(browser.split(end).length!==2)throw Error('Unexpected browser test context');
 browser=browser.replace(end,` await run('${marker}',async()=>{
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
`+end);
}
fs.writeFileSync(file,text);fs.writeFileSync(browserFile,browser);
console.log('Strike victory guard and group pointer checks applied');
