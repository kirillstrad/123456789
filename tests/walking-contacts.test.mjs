import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {combatHero} from '../runtime/animation/combat-hero.js';
import {loadedLocomotion} from '../runtime/animation/weight-transitions.js';
import {applyWorldFootContacts,contactFrame} from '../runtime/animation/foot-contact-world.js';
import {gaitPhase,advanceWalkingContacts,limitGaitContacts} from '../runtime/animation/walking-contacts.js';
import {footToWorld} from '../runtime/animation/foot-contact.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const hero=globalThis.IronPilgrim,dt=1/60;
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function make(){const w=new CombatWorld({circles:[],rects:[]});w.current.enemy.hp=0;return w;}
function advance(w,n,input={x:0,y:0}){for(let i=0;i<n;i++)w.step(dt,input);}
function sampled(w){const s=w.snapshot(),base=loadedLocomotion(s,hero).rig;return {s,base,rig:applyWorldFootContacts(s,base,hero)};}

test('walking: gait phases match actual vendor stance and opposite leg offset',()=>{
  for(let i=0;i<2;i++)for(const d of [0,.01,.1,.247,.249,.39,.4,.7,1.1]){
    const phase=gaitPhase(d,i),vendor=hero.foot(d/.4,i===0?-1:1);
    assert.equal(phase.stance,vendor.stance);
    assert.ok(phase.support>=0&&phase.support<=1);
    if(!phase.stance)assert.equal(phase.support,0);
  }
  assert.equal(gaitPhase(.05,0).stance,false);
  assert.equal(gaitPhase(.05,1).stance,true);
});

test('walking: real-hero full-weight stance anchors remain fixed in world space',()=>{
  const w=make();let checked=0;
  for(let n=0;n<180;n++){
    w.step(dt,{x:0,y:-1});const {s,rig}=sampled(w);
    for(let i=0;i<2;i++){
      const c=s.footContacts?.[i];
      if(c?.mode==='stance'&&c.weight===1&&!c.releasing){
        assert.ok(distance(footToWorld(rig.legs[i].end,rig.p.root,contactFrame(s)),c.anchor)<1e-7);
        checked++;
      }
    }
  }
  assert.ok(checked>5);
});

test('walking: swinging legs use original unpinned endpoints',()=>{
  const w=make();let checked=0;
  for(let n=0;n<100;n++){
    w.step(dt,{x:0,y:-1});const {s,base,rig}=sampled(w);
    for(let i=0;i<2;i++)if(!gaitPhase(s.walkDistance,i).stance){
      assert.equal(s.footContacts[i].weight,0);
      assert.deepEqual(rig.legs[i].end,base.legs[i].end);checked++;
    }
  }
  assert.ok(checked>20);
});

test('walking: corners and reversals preserve finite legs, bone lengths and ground clearance',()=>{
  const w=make();let released=0;
  for(const input of [{x:0,y:-1},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:1,y:-1},{x:0,y:0}])for(let n=0;n<45;n++){
    w.step(dt,input);const {s,rig}=sampled(w);
    for(let i=0;i<2;i++){
      const leg=rig.legs[i];
      for(const p of [leg.base,leg.joint,leg.end])assert.ok(p.every(Number.isFinite));
      assert.ok(Math.abs(distance(leg.base,leg.joint)-leg.a)<1e-7);
      assert.ok(Math.abs(distance(leg.joint,leg.end)-leg.b)<1e-7);
      assert.ok(leg.end[2]>=.0648);
      assert.ok((i===0?-1:1)*(leg.end[0]-rig.p.root[0])>=-1e-8);
      if(s.footContacts?.[i].releasing)released++;
    }
  }
  assert.ok(released>0);
});

test('walking: idle-start-stop-repeat changes support modes without stale idle anchors',()=>{
  const w=make();advance(w,30);assert.ok(w.current.footContacts.every(c=>c.mode==='idle'&&c.weight===1));
  for(let round=0;round<3;round++){
    w.step(dt,{x:0,y:-1});assert.equal(w.current.footContacts,null);
    advance(w,25,{x:0,y:-1});assert.ok(w.current.footContacts.every(c=>c.mode!=='idle'));
    advance(w,120);assert.ok(w.current.footContacts.every(c=>c.mode==='idle'&&c.weight===1));
  }
});

test('walking: skipping whole gait cycles captures a new anchor instead of dragging the old one',()=>{
  const rig=hero.rig(hero.sample('walk',.0625,1)),f={x:8,y:12,heading:-Math.PI/2};
  let state=null;for(let n=0;n<10;n++)state=advanceWalkingContacts(state,rig,f,dt,.05);
  assert.equal(state[1].weight,1);
  const next=advanceWalkingContacts(state,rig,{...f,x:9},dt,.85);
  assert.equal(next[1].weight,0);assert.notEqual(next[1].step,state[1].step);
  assert.deepEqual(next[1].anchor,footToWorld(rig.legs[1].end,rig.p.root,{...f,x:9}));
});

test('walking: render sampling is pure and never changes gait simulation',()=>{
  const a=make(),b=make();
  for(let n=0;n<70;n++){
    const input=n<35?{x:0,y:-1}:{x:1,y:0};a.step(dt,input);b.step(dt,input);
    const before=JSON.stringify({current:a.current,previous:a.previous});
    for(const alpha of [1,0,.5])combatHero(a.snapshot(alpha));
    assert.equal(JSON.stringify({current:a.current,previous:a.previous}),before);
    assert.deepEqual(a.snapshot(),b.snapshot());
  }
  const s=a.snapshot(),original=JSON.stringify(a.current.footContacts);s.footContacts[0].anchor[0]+=10;
  assert.equal(JSON.stringify(a.current.footContacts),original);
  a.reset();assert.equal(a.snapshot().footContacts,null);
});

test('walking: invalid time steps never advance or mutate gait state',()=>{
  const rig=hero.rig(hero.sample('walk',.0625,1)),f={x:8,y:12,heading:0};
  const state=advanceWalkingContacts(null,rig,f,dt,.05),before=JSON.stringify(state);
  for(const value of [0,-1,NaN,Infinity])assert.deepEqual(advanceWalkingContacts(state,rig,f,value,.06),state);
  assert.equal(JSON.stringify(state),before);
});

test('walking: render safety bounds prevent opposite-side targets and disable swing support',()=>{
  const rig=hero.rig(hero.sample('breath',.2,1)),f={x:8,y:12,heading:0};
  const state=rig.legs.map(leg=>({anchor:footToWorld([-leg.end[0],leg.end[1],leg.end[2]],rig.p.root,f),weight:1,releasing:false}));
  const limited=limitGaitContacts(state,rig,f,null);assert.ok(limited.every(c=>c.weight<1));
  const swing=limitGaitContacts(state,rig,f,.05);assert.equal(swing[0].weight,0);
  assert.ok(state.every(c=>c.weight===1));
});
