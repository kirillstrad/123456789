import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {advanceFootContacts,cloneFootContacts,solveFootContacts,footToWorld,footToLocal,FOOT_CONTACT} from '../runtime/animation/foot-contact.js';

vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const hero=globalThis.IronPilgrim,dt=1/60;
const frame={x:8,y:12,heading:-Math.PI/2};
const rig=()=>hero.rig(hero.sample('breath',.2,1));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function planted(r,f=frame){let state=null;for(let i=0;i<16;i++)state=advanceFootContacts(state,r,f,dt,true);return state;}

test('3C contacts: world/local transform matches hero heading and round-trips',()=>{
  const root=[.12,.34,.02],p=[-.2,.4,.065];
  for(const heading of [0,Math.PI/2,-Math.PI/2,Math.PI,2.9]){
    const f={...frame,heading};
    assert.ok(distance(footToLocal(footToWorld(p,root,f),root,f),p)<1e-12);
  }
  assert.deepEqual(footToWorld([1,2,3],[0,0,0],{x:0,y:0,heading:0}),[2,-1,3]);
});

test('3C contacts: planted real-hero feet stay in world space during a small turn',()=>{
  const r=rig(),state=planted(r),f={...frame,heading:frame.heading+.12};
  const next=advanceFootContacts(state,r,f,dt,true);
  const corrected=solveFootContacts(r,f,next,hero.ik);
  for(let i=0;i<2;i++){
    assert.equal(next[i].weight,1);
    assert.deepEqual(next[i].anchor,state[i].anchor);
    assert.ok(distance(footToWorld(corrected.legs[i].end,r.p.root,f),state[i].anchor)<1e-8);
  }
});

test('3C contacts: corrected real legs keep bone lengths and stay above the floor',()=>{
  const r=rig(),state=planted(r);
  for(const delta of [-.2,-.1,0,.1,.2]){
    const f={...frame,heading:frame.heading+delta};
    for(const leg of solveFootContacts(r,f,state,hero.ik).legs){
      assert.ok(Math.abs(distance(leg.base,leg.joint)-leg.a)<1e-8);
      assert.ok(Math.abs(distance(leg.joint,leg.end)-leg.b)<1e-8);
      assert.ok(leg.end[2]>=.0649);
    }
  }
});

test('3C contacts: an excessive turn fades support before recapturing',()=>{
  const r=rig(),original=planted(r),f={...frame,heading:frame.heading+Math.PI};
  let state=original;
  for(let i=0;i<8;i++){
    const next=advanceFootContacts(state,r,f,dt,true);
    for(let j=0;j<2;j++){
      assert.ok(next[j].releasing);
      assert.ok(next[j].weight<=state[j].weight);
      assert.ok(state[j].weight-next[j].weight<=FOOT_CONTACT.blendRate*dt+1e-12);
      assert.deepEqual(next[j].anchor,original[j].anchor);
    }
    state=next;
  }
  state=advanceFootContacts(state,r,f,dt,true);
  for(let i=0;i<2;i++){
    assert.equal(state[i].weight,0);
    assert.equal(state[i].releasing,false);
    assert.deepEqual(state[i].anchor,footToWorld(r.legs[i].end,r.p.root,f));
  }
});

test('3C contacts: disabling support leaves the original rig unchanged',()=>{
  const r=rig(),state=planted(r);
  assert.equal(advanceFootContacts(state,r,frame,dt,false),null);
  assert.equal(solveFootContacts(r,frame,null,hero.ik),r);
});

test('3C contacts: sampling and state updates do not mutate their inputs',()=>{
  const r=rig(),state=planted(r),before=JSON.stringify({r,state,frame});
  const a=solveFootContacts(r,frame,state,hero.ik);
  assert.deepEqual(a,solveFootContacts(r,frame,state,hero.ik));
  advanceFootContacts(state,r,{...frame,heading:0},dt,true);
  const cloned=cloneFootContacts(state);
  cloned[0].anchor[0]+=100;
  assert.equal(JSON.stringify({r,state,frame}),before);
});

test('3C contacts: invalid time steps never advance support state',()=>{
  const r=rig(),state=planted(r);
  for(const value of [0,-1,NaN,Infinity])assert.deepEqual(advanceFootContacts(state,r,frame,value,true),state);
  assert.equal(advanceFootContacts(null,r,frame,0,true),null);
});
