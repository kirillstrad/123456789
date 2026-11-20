import test from 'node:test';
import assert from 'node:assert/strict';
import {ActionMachine} from '../runtime/combat/action-machine.js';
import {attackTiming} from '../runtime/combat/attack-timing.js';
import {allowedContinuation} from '../runtime/combat/mechanics-4c.js';
import {COMBAT} from '../runtime/combat/config.js';
import {sampleAttack4C,attack4CWeight} from '../runtime/animation/attack-poses-4c.js';
const module={sample:()=>({})};
const hooks={position:()=>({x:0,y:0}),facing:()=>({x:1,y:0}),hit:()=>{},lunge:()=>{}};
const command=c=>({kind:c==='L'?'light':'heavy',aim:null});
const shape=p=>({right:p.right,az:p.az,down:p.down,lean:p.lean,twist:p.twist,head:p.head});

test('mixed chains preserve actual previous-clip endpoints and reject queue spam',()=>{
 for(const chain of ['LLL','LLH','HH','LH','HL','HLL']){
  const m=new ActionMachine();assert(m.request(command(chain[0]),hooks));
  assert.equal(m.view().previousClip,null);
  for(let i=1;i<chain.length;i++){
   m.step(m.current.duration*.5,false,hooks);
   assert(m.request(command(chain[i]),hooks));
   assert(!m.request(command(chain[i]),hooks));
   const before=m.view(),end=shape(sampleAttack4C(module,before,1));
   m.step(m.current.duration,false,hooks);
   assert.equal(m.view().previousClip,before.clip);
   assert.deepEqual(shape(sampleAttack4C(module,m.view(),0)),end);
  }
  m.step(m.current.duration*.5,false,hooks);
  if(chain!=='HL'){
   assert(!m.canContinue('light'));assert(!m.canContinue('heavy'));
  }else{assert(m.canContinue('light'));assert(!m.canContinue('heavy'));}
  m.step(m.current.duration,false,hooks);
  assert.equal(m.current,null);assert.equal(m.started,chain.length);
 }
});

test('invalid extra branches remain rejected',()=>{
 for(const chain of ['LH','HH','LLL','LLH','HLL'])for(const c of ['L','H'])assert(!allowedContinuation(chain,command(c).kind));
 assert(!allowedContinuation('HL','heavy'));
});

test('phase windows have exact early and late acceptance boundaries',()=>{
 for(const c of ['L','H']){
  const m=new ActionMachine();m.request(command(c),hooks);
  const q=attackTiming(m.current.kind),duration=m.current.duration;
  for(const [t,expected] of [[q.queueStart-.001,false],[q.queueStart+.001,true],[q.queueEnd-.001,true],[q.queueEnd+.001,false]]){
   m.current.elapsed=duration*t;assert.equal(m.canContinue(),expected);
  }
  assert.equal(q.queueStart,.06);assert(q.queueEnd>=.87);
 }
});

test('late accepted continuation cannot snap a faded pose back',()=>{
 for(const c of ['L','H']){
  const m=new ActionMachine();m.request(command(c),hooks);
  const q=attackTiming(m.current.kind);m.step(m.current.duration*(q.queueEnd-.001),false,hooks);
  const view=m.view(),before=shape(sampleAttack4C(module,view));
  assert(m.request(command(c),hooks));
  assert.deepEqual(shape(sampleAttack4C(module,m.view())),before);
  assert.equal(attack4CWeight(view,view.progress),1);
  assert.equal(attack4CWeight(m.view(),view.progress),1);
 }
});

test('contact fires once at the shared pose threshold',()=>{
 for(const c of ['L','H']){
  let hits=0;const h={...hooks,hit:()=>hits++},m=new ActionMachine();m.request(command(c),h);
  const q=attackTiming(m.current.kind);m.step(m.current.duration*(q.contact-.001),false,h);
  assert.equal(hits,0);m.step(.02,false,h);assert.equal(hits,1);
  m.step(10,false,h);assert.equal(hits,1);
 }
});

test('mixed-clip samples and attack weights stay finite',()=>{
 for(const c of ['L','H'])for(let stage=0;stage<3;stage++)for(const prior of [null,'light1','heavy1','light2','heavy2']){
  const kind=command(c).kind,a={kind,stage,clip:kind+(stage+1),previousClip:prior,continuation:null};
  for(let i=0;i<=100;i++){
   const p=sampleAttack4C(module,a,i/100);
   assert([...p.right,p.az,p.down,p.lean,p.twist,p.head].every(Number.isFinite));
   const w=attack4CWeight(a,i/100);assert(Number.isFinite(w)&&w>=0&&w<=1);
  }
 }
});

test('clear forgets previous clip and pending continuation',()=>{
 const m=new ActionMachine();m.request(command('H'),hooks);m.step(m.current.duration*.5,false,hooks);
 assert(m.request(command('L'),hooks));m.step(m.current.duration,false,hooks);
 assert.equal(m.view().previousClip,'heavy1');m.clear();m.request(command('L'),hooks);
 assert.equal(m.view().previousClip,null);assert.equal(m.queued,null);assert.equal(m.view().stage,0);
});

test('new durations and recovery cancellation follow configured boundaries',()=>{
 assert.deepEqual(COMBAT.lightDurations,[1.18,1.30,1.42]);assert.deepEqual(COMBAT.heavyDurations,[1.90,2.06,2.26]);
 for(const c of ['L','H']){
  const m=new ActionMachine();m.request(command(c),hooks);const q=attackTiming(m.current.kind);
  m.step(m.current.duration*(q.release-.001),true,hooks);assert(m.current);
  m.step(.02,true,hooks);assert.equal(m.current,null);
 }
});

test('authored active arcs retain compact light and broad heavy profiles',()=>{
 for(const kind of ['light','heavy'])for(let stage=0;stage<3;stage++){
  const a={kind,stage,clip:kind+(stage+1)},q=attackTiming(kind);
  const arc=Math.abs(sampleAttack4C(module,a,q.follow).az-sampleAttack4C(module,a,q.ready).az);
  assert(kind==='light'?arc<.8:arc>2);
 }
});
