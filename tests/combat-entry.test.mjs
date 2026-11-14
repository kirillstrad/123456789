import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {combatHero} from '../runtime/animation/combat-hero.js';
import {transitionPose,loadSecondary} from '../runtime/animation/weight-transitions.js';
import {captureCombatFeet,bridgeCombatEntry,combatSecondary,bindCombatEntry} from '../runtime/animation/combat-entry.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const hero=globalThis.IronPilgrim,dt=1/60;
function make(){const w=new CombatWorld({circles:[],rects:[]});w.current.enemy.hp=0;return w;}
function step(w,n,input={x:0,y:0}){for(let i=0;i<n;i++)w.step(dt,input);}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('combat entry: first idle and walking attack frames retain rendered foot positions',()=>{
  for(const moving of [false,true])for(const kind of ['light','heavy']){
    const w=make();step(w,30,moving?{x:0,y:-1}:{x:0,y:0});
    const before=captureCombatFeet(w.snapshot());assert.equal(w.attack({kind,aim:null}),true);
    assert.equal(w.current.footContacts,null);assert.ok(w.current.combatEntry);
    const after=captureCombatFeet(w.snapshot());
    for(let i=0;i<2;i++)assert.ok(distance(before[i],after[i])<1e-7);
  }
});

test('combat entry: all active light/heavy rigs are exactly untouched',()=>{
  const w=make();step(w,30);const feet=captureCombatFeet(w.snapshot());
  for(const clip of ['light1','light2','light3','heavy1','heavy2','heavy3'])for(const progress of [.46,.55,.71]){
    const s=w.snapshot();s.action={id:99,kind:clip.startsWith('heavy')?'heavy':'light',stage:0,progress,fx:0,fy:-1,clip};
    s.combatEntry=bindCombatEntry(feet,s);const rig=transitionPose(s,hero,clip,progress).rig;
    assert.equal(bridgeCombatEntry(s,rig,hero),rig);
    assert.deepEqual(combatHero(s),combatHero({...s,combatEntry:null}));
  }
});

test('combat entry: sweep and hit reaction capture the previously rendered feet',()=>{
  for(const command of [w=>w.sweep(),w=>w.damage(1)]){
    const w=make();step(w,30);const before=captureCombatFeet(w.snapshot());command(w);
    assert.ok(w.current.combatEntry);const after=captureCombatFeet(w.snapshot());
    for(let i=0;i<2;i++)assert.ok(distance(before[i],after[i])<1e-7);
  }
});

test('combat entry: rejected LH and queued LL preserve entry; next strike gets a fresh id',()=>{
  const w=make();assert.equal(w.attack({kind:'light',aim:null}),true);
  for(let n=0;n<180&&w.current.action&&w.current.action.progress<.65;n++)w.step(dt);
  assert.ok(w.current.action);
  const entry=w.current.combatEntry,id=w.current.action.id;
  assert.equal(w.attack({kind:'heavy',aim:null}),false);
  assert.equal(w.current.combatEntry,entry);assert.equal(w.current.action.id,id);
  assert.equal(w.attack({kind:'light',aim:null}),true);assert.equal(w.current.combatEntry,entry);
  for(let n=0;n<180&&w.current.action&&w.current.action.id===id;n++)w.step(dt);
  assert.ok(w.current.action);assert.ok(w.current.combatEntry);
  assert.notEqual(w.current.action.id,id);assert.equal(w.current.action.kind,'light');
  assert.equal(w.current.action.stage,1);assert.equal(w.current.action.clip,'light2');
  assert.equal(w.current.combatEntry.actionId,w.current.action.id);
});

test('combat entry: movement cancel clears bridge and locomotion support returns',()=>{
  const w=make();w.attack({kind:'light',aim:null});
  for(let n=0;n<180&&w.current.action;n++)w.step(dt,{x:1,y:0});
  assert.equal(w.current.action,null);assert.equal(w.current.combatEntry,null);
  step(w,120);assert.ok(w.current.footContacts.every(c=>c.weight===1));
});

test('combat entry: death, victory and reset never keep old entry feet',()=>{
  const w=make();w.attack({kind:'light',aim:null});w.damage(100);
  assert.equal(w.current.combatEntry,null);w.reset();assert.equal(w.current.combatEntry,null);
  assert.equal(w.previous.combatEntry,null);w.current.enemy.hp=0;
  w.attack({kind:'heavy',aim:null});w.current.phase='won';w.step(dt);assert.equal(w.current.combatEntry,null);
});

test('combat entry: snapshots own entry arrays and rendering cannot mutate simulation',()=>{
  const w=make();step(w,30,{x:0,y:-1});w.attack({kind:'light',aim:null});
  const before=JSON.stringify({current:w.current,previous:w.previous}),s=w.snapshot();
  s.combatEntry.feet[0][0]+=10;
  for(const alpha of [0,.5,1,.25])combatHero(w.snapshot(alpha));
  assert.equal(JSON.stringify({current:w.current,previous:w.previous}),before);
  const frame=combatHero(w.snapshot());assert.deepEqual(frame,combatHero(w.snapshot()));
});

test('combat entry: authored attack takes over without changing sword or lamp endpoints',()=>{
  const w=make();step(w,30);w.attack({kind:'light',aim:null});
  for(const progress of [0,.04,.08,.12,.5,.85,1]){
    const s=w.snapshot();s.action.progress=progress;
    const a=combatHero(s),b=combatHero({...s,combatEntry:null});
    assert.deepEqual(a.tip,b.tip);assert.deepEqual(a.lamp,b.lamp);
    if(progress>=.12)assert.deepEqual(a.parts,b.parts);
  }
});

test('combat entry: secondary load is suppressed in active poses and terminal states',()=>{
  const w=make(),base={cloth:.02,chains:[.01,-.02,.03,-.04]},before=JSON.stringify(base);
  const s=w.snapshot();s.motion.weight=1;s.motion.speed=0;s.fx=1;s.fy=0;
  assert.deepEqual(combatSecondary(s,base),loadSecondary(s,base));
  for(const progress of [.46,.55,.71]){
    s.action={id:1,kind:'light',stage:0,progress,fx:1,fy:0,clip:'light1'};
    assert.deepEqual(combatSecondary(s,base),base);
  }
  for(const phase of ['dead','won']){s.phase=phase;assert.deepEqual(combatSecondary(s,base),base);}
  assert.equal(JSON.stringify(base),before);
});

test('combat entry: repeated sampling during windup has no hidden timer',()=>{
  const a=make(),b=make();step(a,30,{x:0,y:-1});step(b,30,{x:0,y:-1});
  a.attack({kind:'heavy',aim:null});b.attack({kind:'heavy',aim:null});
  for(let n=0;n<30;n++){
    a.step(dt);b.step(dt);for(const alpha of [0,.5,1])combatHero(a.snapshot(alpha));
    assert.deepEqual(a.snapshot(),b.snapshot());
  }
});
