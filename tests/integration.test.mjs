import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';import {CombatWorld} from '../runtime/game/combat-world.js';
import {createEnvironment} from '../runtime/render/environment.js';
test('original hero asset retained',()=>{assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public/vendor/hero.js')).digest('hex'),'96a7de64ec52577f69aa3ca0ae3ca49edd4ff795b315e61ef1df6d13c243a1e8');});
test('expanded environment covers the room, retains boundary walls and emits no static light',()=>{
  const {parts,lights}=createEnvironment();
  const floor=parts.filter(p=>p.v.every(v=>v[2]===0));
  const tile=(x,y)=>`${x},${y}`;
  const cells=new Set(floor.map(p=>tile(Math.floor(p.v[0][0]),Math.floor(p.v[0][1]))));
  assert.equal(floor.length,43*25);
  const vertices=parts.flatMap(p=>p.v);
  for(let x=1;x<44;x++){
    for(let y=1;y<26;y++)assert.ok(cells.has(tile(x,y)),`missing floor tile ${x},${y}`);
    assert.ok(vertices.some(([a,b,z])=>a===x&&b===1&&z>=2.65),`missing north wall at ${x}`);
  }
  for(let y=1;y<26;y++)assert.ok(vertices.some(([x,b,z])=>x===1&&b===y&&z>=2.7),`missing west wall at ${y}`);
  assert.deepEqual(lights,[]);
});
test('4C LLL and LLH reject queue spam and fourth strike',()=>{
  for(const third of ['light','heavy']){
    const w=new CombatWorld({circles:[],rects:[]});w.current.enemy.x=15;
    assert.equal(w.attack({kind:'light',aim:null}),true);
    for(let i=0;i<12;i++)w.step(1/60);
    assert.equal(w.attack({kind:'heavy',aim:null}),false);
    assert.equal(w.attack({kind:'light',aim:null}),true);
    assert.equal(w.attack({kind:'light',aim:null}),false);
    assert.equal(w.attack({kind:'heavy',aim:null}),false);
    for(let i=0;i<60;i++)w.step(1/60);
    assert.ok(w.actions.current);assert.equal(w.actions.current.stage,1);
    assert.equal(w.actions.current.kind,'light');
    assert.equal(w.attack({kind:third,aim:null}),true);
    assert.equal(w.attack({kind:third,aim:null}),false);
    for(let i=0;i<70;i++)w.step(1/60);
    assert.ok(w.actions.current);assert.equal(w.actions.current.stage,2);
    assert.equal(w.actions.current.kind,third);
    assert.equal(w.attack({kind:'light',aim:null}),false);
    assert.equal(w.attack({kind:'heavy',aim:null}),false);
    for(let i=0;i<90;i++)w.step(1/60);
    assert.equal(w.actions.current,null);assert.equal(w.actions.queued,null);
    assert.equal(w.actions.started,3);
  }
});
test('portable HTML has no external dependencies',()=>{const s=fs.readFileSync('PLAY.html','utf8');assert.equal(/<script[^>]*src=/.test(s),false);assert.equal(/<link[^>]*href=/.test(s),false);});
