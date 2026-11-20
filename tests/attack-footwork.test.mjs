import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleAttackStep,applyAttackFootwork} from '../runtime/animation/attack-footwork.js';
import {attackTiming} from '../runtime/combat/attack-timing.js';

const action=(kind='light',stage=0,progress=.3)=>({id:1,clip:kind+(stage+1),kind,stage,progress,animation4C:true,continuation:null});
const leg=x=>({base:[x,0,1],joint:[x,.1,.5],end:[x,0,0],a:.6,b:.6});
const fixture=()=>({p:{root:[0,0,0]},legs:[leg(-.15),leg(.15)]});
const state=a=>({phase:'playing',action:a,combatEntry:{actionId:1,clip:a.clip,feet:[[0,.15,0],[0,-.15,0]]}});
const frame={x:0,y:0,heading:0};
const ik=(base,target,a,b,pole)=>({base,joint:pole,end:target,a,b});

test('attack footwork alternates feet and has exact zero-lift endpoints',()=>{
 for(const kind of ['light','heavy'])for(let stage=0;stage<3;stage++){
  const a=action(kind,stage),q=attackTiming(kind);
  assert.equal(sampleAttackStep({...a,progress:0}).weight,0);
  assert.equal(sampleAttackStep({...a,progress:q.ready}).lift,0);
  assert.equal(sampleAttackStep({...a,progress:1}).weight,0);
  const mid=sampleAttackStep({...a,progress:(.12+q.ready)/2});
  assert.equal(mid.foot,stage%2);assert(mid.lift>0);
 }
});
test('attack step sampling stays finite and bounded',()=>{
 for(const kind of ['light','heavy'])for(let stage=0;stage<3;stage++)for(let i=0;i<=200;i++){
  const p=sampleAttackStep(action(kind,stage,i/200));
  assert(Object.values(p).every(Number.isFinite));
  assert(p.weight>=0&&p.weight<=1&&p.lift>=0&&p.lift<=.085&&p.travel>=0&&p.travel<=.20);
 }
});
test('support foot remains anchored while other foot lifts; inputs are pure',()=>{
 const a=action(),s=state(a),r=fixture(),before=JSON.stringify({s,r});
 const result=applyAttackFootwork(s,r,{ik},frame);
 assert(result.legs[0].end[2]>0);
 assert.deepEqual(result.legs[1].end,[.15,0,0]);
 assert.equal(JSON.stringify({s,r}),before);
 assert.deepEqual(result,applyAttackFootwork(s,r,{ik},frame));
});
test('dash execution death and missing/mismatched captured entry bypass steps',()=>{
 const a=action(),s=state(a),r=fixture();
 for(const override of [{dash:{}},{execution:{}},{phase:'dead'},{combatEntry:null},{combatEntry:{...s.combatEntry,actionId:9}},{action:{...a,animation4C:false}}])assert.equal(applyAttackFootwork({...s,...override},r,{ik},frame),r);
});
test('planted feet survive a moving actor frame when within reach',()=>{
 const a=action('heavy',0,.7),s=state(a),r=fixture();
 const result=applyAttackFootwork(s,r,{ik},{x:.04,y:0,heading:0});
 // World forward maps to local Y at heading zero.
 assert(Math.abs(result.legs[1].end[1]+.04)<1e-9);
 for(const l of result.legs)assert(Math.hypot(...l.end.map((n,j)=>n-l.base[j]))<=l.a+l.b);
});
