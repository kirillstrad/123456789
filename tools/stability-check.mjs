import fs from 'node:fs';import vm from 'node:vm';import os from 'node:os';import assert from 'node:assert/strict';import {performance} from 'node:perf_hooks';
import {CombatWorld} from '../runtime/game/combat-world.js';import {combatHero} from '../runtime/animation/combat-hero.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const dt=1/60,sim=[],animation=[],memory=[],checks=[];
const report={sourceCommit:process.env.GITHUB_SHA??null,passed:false,checks,environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},notes:['CI measurements, not user-hardware FPS.','Heap/RSS samples are observations, not proof of absence of leaks.','Animation timings include snapshot sampling and geometry emission, not drawing.']};
const make=()=>{const w=new CombatWorld({circles:[],rects:[]});w.current.enemy.hp=0;return w;};
const stats=a=>{const s=[...a].sort((a,b)=>a-b);return {samples:s.length,meanMs:s.reduce((a,b)=>a+b,0)/Math.max(1,s.length),p95Ms:s[Math.max(0,Math.ceil(s.length*.95)-1)]??null,maxMs:s.at(-1)??null};};
try{
  const w=make();for(let i=0;i<120;i++)w.step(dt,{x:1,y:0});w.reset();w.current.enemy.hp=0;
  for(let cycle=0;cycle<12;cycle++){
    w.reset();w.current.enemy.hp=0;
    for(let n=0;n<480;n++){
      if(n===100)w.attack({kind:'light',aim:null});if(n===150)w.attack({kind:'heavy',aim:null});if(n===300)w.sweep();if(n===390)w.damage(1);
      const input=n<80?{x:1,y:0}:n<160?{x:0,y:-1}:n<240?{x:-1,y:0}:n<320?{x:1,y:1}:{x:0,y:0};
      const at=performance.now();w.step(dt,input);sim.push(performance.now()-at);
      assert.ok([w.current.x,w.current.y,w.current.time,w.current.walkDistance,...Object.values(w.current.motion)].every(Number.isFinite));
      assert.ok(w.current.x>=1.7&&w.current.x<=16&&w.current.y>=1.7&&w.current.y<=16);assert.ok(w.events.length<=400);
      if(n%30===0){const before=JSON.stringify(w.current),t=performance.now(),hero=combatHero(w.snapshot());animation.push(performance.now()-t);assert.ok(hero.parts.length>100);assert.ok(hero.tip.every(Number.isFinite));assert.equal(JSON.stringify(w.current),before);}
    }
    w.damage(100);assert.equal(w.current.phase,'dead');assert.equal(w.current.footContacts,null);assert.equal(w.current.combatEntry,null);
    w.reset();assert.equal(w.current.lamp,100);assert.equal(w.current.footContacts,null);assert.equal(w.current.combatEntry,null);memory.push({cycle,...process.memoryUsage()});
  }
  checks.push('12 repeated mixed movement/combat/death/reset cycles','finite state and world bounds','bounded event history','render sampling leaves simulation unchanged');
  const column=new CombatWorld({circles:[{x:9,y:12,r:.57}],rects:[]});column.current.enemy.hp=0;
  for(let i=0;i<180;i++)column.step(dt,{x:1,y:0});assert.ok(column.current.x<8.2);assert.equal(column.current.motion.speed,0);
  for(let i=0;i<30;i++)column.step(dt,{x:-1,y:0});assert.ok(column.current.x<8);checks.push('column blocks movement and allows retreat');
  report.passed=true;
} catch(e){report.error=e.stack??String(e);throw e;}
finally{Object.assign(report,{simulation:stats(sim),animation:stats(animation),memory});fs.writeFileSync('docs/stability-check.json',JSON.stringify(report,null,2));}
