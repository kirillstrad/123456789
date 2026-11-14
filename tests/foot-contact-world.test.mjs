import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {combatHero} from '../runtime/animation/combat-hero.js';
import {loadedLocomotion} from '../runtime/animation/weight-transitions.js';
import {applyWorldFootContacts,contactFrame,interpolateFootContacts} from '../runtime/animation/foot-contact-world.js';
import {footToWorld} from '../runtime/animation/foot-contact.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const hero=globalThis.IronPilgrim,dt=1/60;
function make(){const w=new CombatWorld({circles:[],rects:[]});w.current.enemy.hp=0;return w;}
function step(w,n,input={x:0,y:0}){for(let i=0;i<n;i++)w.step(dt,input);}
function planted(){const w=make();step(w,30);assert.ok(w.current.footContacts.every(c=>c.weight===1));return w;}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('3C integration: stationary feet remain anchored during a small aim turn',()=>{
  const w=planted(),anchors=w.current.footContacts.map(c=>[...c.anchor]);
  w.step(dt,{x:0,y:0,aim:{x:w.current.x+.5,y:w.current.y-5}});
  const s=w.snapshot(),base=loadedLocomotion(s,hero).rig,corrected=applyWorldFootContacts(s,base,hero);
  for(let i=0;i<2;i++)assert.ok(distance(footToWorld(corrected.legs[i].end,corrected.p.root,contactFrame(s)),anchors[i])<1e-8);
  const unplanted=combatHero({...s,footContacts:null});
  assert.notDeepEqual(combatHero(s).parts,unplanted.parts);
  assert.deepEqual(combatHero(s).tip,unplanted.tip);
  assert.deepEqual(combatHero(s).lamp,unplanted.lamp);
});

test('3C integration: moving releases support and stopping acquires it again',()=>{
  const w=planted();w.step(dt,{x:1,y:0});assert.equal(w.current.footContacts,null);
  step(w,120);assert.ok(w.current.footContacts.every(c=>c.weight===1));
});

test('3C integration: combat commands and hit/death reactions clear support immediately',()=>{
  for(const command of [w=>w.attack({kind:'light',aim:null}),w=>w.sweep(),w=>w.damage(1),w=>w.damage(100)]){
    const w=planted();command(w);assert.equal(w.current.footContacts,null);
    w.step(dt);assert.equal(w.current.footContacts,null);
  }
  const w=planted();w.current.phase='won';w.step(dt);assert.equal(w.current.footContacts,null);
});

test('3C integration: reset clears both current and previous contacts',()=>{
  const w=planted();w.reset();
  assert.equal(w.current.footContacts,null);assert.equal(w.previous.footContacts,null);
  for(const alpha of [0,.5,1])assert.equal(w.snapshot(alpha).footContacts,null);
});

test('3C integration: snapshots and interpolated contacts own their anchor arrays',()=>{
  const w=planted(),before=JSON.stringify(w.current.footContacts);
  const s=w.snapshot(.5);s.footContacts[0].anchor[0]+=100;
  assert.equal(JSON.stringify(w.current.footContacts),before);
  assert.notEqual(w.previous.footContacts[0].anchor,w.current.footContacts[0].anchor);
  const b=w.current.footContacts,a=b.map(c=>({...c,anchor:[...c.anchor],weight:0}));
  const half=interpolateFootContacts(a,b,.5);
  assert.equal(half[0].weight,.5);half[0].anchor[0]+=50;
  assert.equal(JSON.stringify(w.current.footContacts),before);
});

test('3C integration: render frequency never changes contact simulation',()=>{
  const a=make(),b=make();
  for(let i=0;i<45;i++){
    const input={x:0,y:0,aim:{x:8+.3*Math.sin(i*.1),y:7}};
    a.step(dt,input);b.step(dt,input);
    const before=JSON.stringify({current:a.current,previous:a.previous});
    for(const alpha of [0,.5,1,.25])combatHero(a.snapshot(alpha));
    assert.equal(JSON.stringify({current:a.current,previous:a.previous}),before);
    assert.deepEqual(a.snapshot(),b.snapshot());
  }
});
