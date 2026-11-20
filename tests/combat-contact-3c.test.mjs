import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {ActionMachine} from '../runtime/combat/action-machine.js';
import {COMBAT} from '../runtime/combat/config.js';
import {attackTiming} from '../runtime/combat/attack-timing.js';
import {DASH} from '../runtime/combat/ash-dash.js';
import {selectStrikeTargets} from '../runtime/combat/mechanics-4c.js';
import {sampleAttack4C} from '../runtime/animation/attack-poses-4c.js';
import {comboEdgeStyle} from '../runtime/animation/combo-edge.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const dt=1/60,empty={circles:[],rects:[]};
const ticks=(w,n)=>{for(let i=0;i<n;i++)w.step(dt);};
const frame=w=>({...w.snapshot(),comboEdgeActive:w.actions.canContinue()});
function make(map=empty){const w=new CombatWorld(map);Object.assign(w.current,{x:8,y:8,fx:1,fy:0});Object.assign(w.current.enemy,{x:14,y:14,hp:1000,mode:'recover',timer:-100,cooldown:100});return w;}
function finish(w){const a=w.actions.current;assert(a);const limit=Math.ceil(a.duration/dt)+2;for(let i=0;i<limit&&w.actions.current;i++)w.step(dt);assert.equal(w.actions.current,null);}

test('3c contact threshold matches authored first-strike contact pose and fires once',()=>{
 const module={sample:()=>({})};
 for(const kind of ['light','heavy']){
  let count=0;const m=new ActionMachine(),hooks={position:()=>({x:0,y:0}),facing:()=>({x:1,y:0}),lunge:()=>{},hit:()=>count++};
  m.request({kind,aim:null},hooks);const q=attackTiming(kind),duration=m.current.duration;
  m.step(duration*(q.contact-.001),false,hooks);assert.equal(count,0);
  const p=sampleAttack4C(module,m.view(),q.contact);
  const expected=kind==='light'?[.12,.54,.92]:[.12,.53,1.01];
  p.right.forEach((v,i)=>assert(Math.abs(v-expected[i])<1e-10));
  m.step(.02,false,hooks);assert.equal(count,1);m.step(10,false,hooks);assert.equal(count,1);
 }
});
test('3c real world hit is single, uses configured damage and walls block it',()=>{
 for(const kind of ['light','heavy'])for(const wall of [false,true]){
  const map=wall?{circles:[],rects:[{minX:8.6,maxX:8.65,minY:7,maxY:9}]}:empty;
  const w=make(map);Object.assign(w.current.enemy,{x:9.6,y:8,hp:1000});
  assert(w.attack({kind,aim:{x:10,y:8}}));finish(w);
  const hits=w.events.filter(e=>e.type==='hit');assert.equal(hits.length,wall?0:1);
  assert.equal(w.current.enemy.hp,1000-(wall?0:kind==='light'?COMBAT.lightDamage:COMBAT.heavyDamage));
 }
});
test('3c nearest-two light cap survives repeated selection; heavy remains multi-target',()=>{
 const origin={x:8,y:8},facing={x:1,y:0},targets=[{id:1,x:9,y:8,hp:100},{id:2,x:9.1,y:8.05,hp:100},{id:3,x:9.2,y:7.95,hp:100}];
 const first=selectStrikeTargets(origin,facing,'light',targets,empty);assert.deepEqual(first.map(t=>t.id),[1,2]);
 assert.deepEqual(selectStrikeTargets(origin,facing,'light',targets,empty,new Set(first.map(t=>t.id))),[]);
 assert.equal(selectStrikeTargets(origin,facing,'heavy',targets,empty).length,3);
});
test('3c valid dash cancels queued combo and leaves no hidden attack after dash',()=>{
 const w=make();assert(w.attack({kind:'light',aim:null}));
 const first=w.actions.current;ticks(w,Math.ceil(first.duration*.4/dt));
 assert(w.attack({kind:'light',aim:null}));assert(w.actions.queued);
 assert.equal(w.dash({x:1,y:0}),true);
 assert.equal(w.actions.current,null);assert.equal(w.actions.queued,null);assert.equal(w.current.action,null);
 assert.equal(w.attack({kind:'light',aim:null}),false);assert.equal(w.attack({kind:'heavy',aim:null}),false);
 assert.equal(comboEdgeStyle(frame(w)),null);
 ticks(w,Math.ceil(DASH.total/dt)+2);assert.equal(w.current.dash,null);
 assert.equal(w.current.action,null);assert.equal(w.current.combatEntry,null);assert.equal(w.actions.queued,null);
 const started=w.actions.started;
 assert(w.attack({kind:'heavy',aim:null}));assert.equal(w.actions.started,started+1);assert.equal(w.current.action.stage,0);
});
test('3c rejected dash preserves current attack and queued continuation',()=>{
 const w=make();assert(w.attack({kind:'light',aim:null}));
 ticks(w,Math.ceil(w.actions.current.duration*.4/dt));assert(w.attack({kind:'light',aim:null}));
 const id=w.actions.current.id,queued=w.actions.queued;
 assert.equal(w.dash({x:0,y:0}),false);assert.equal(w.actions.current.id,id);assert.equal(w.actions.queued,queued);
 w.current.dashCooldown=1;
 assert.equal(w.dash({x:1,y:0}),false);assert.equal(w.actions.current.id,id);assert.equal(w.actions.queued,queued);
});
test('3c thin wall blocks dash and does not leak buffered attacks',()=>{
 const w=make({circles:[],rects:[{minX:9,maxX:9.02,minY:7,maxY:9}]});
 assert(w.dash({x:1,y:0}));assert.equal(w.attack({kind:'light',aim:null}),false);
 ticks(w,Math.ceil(DASH.total/dt)+2);
 assert(w.current.x<=8.76+1e-8);assert.equal(w.actions.started,0);assert.equal(w.actions.queued,null);
});
test('3c edge ends immediately when continuation is accepted; reset removes all combat feedback',()=>{
 const w=make();w.attack({kind:'light',aim:null});ticks(w,Math.ceil(w.actions.current.duration*.4/dt));
 assert(comboEdgeStyle(frame(w)));assert(w.attack({kind:'light',aim:null}));
 assert.equal(comboEdgeStyle(frame(w)),null);w.reset();
 assert.equal(w.current.action,null);assert.equal(w.actions.queued,null);assert.equal(w.current.dash,null);
 assert.equal(comboEdgeStyle(frame(w)),null);
});
