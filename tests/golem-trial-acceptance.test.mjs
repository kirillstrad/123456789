import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {createMotion} from '../runtime/animation/motion.js';
import {golemArenaMap} from '../src/game/golem-arena.js';
import {captureGolemLoadout,restoreGolemLoadout,stageGolem} from '../src/game/golem-trial-state.js';
import {solid} from '../runtime/combat/geometry.js';
import {actorCanOccupy} from '../runtime/combat/enemy-roster.js';
vm.runInThisContext(fs.readFileSync('public/vendor/hero.js','utf8'));
const dt=1/60;
const tick=(w,n,input={x:0,y:0})=>{for(let i=0;i<n;i++)w.step(dt,input);};
const gate=map=>map.rects.filter(r=>r.golemGate);
function setup(){const map=golemArenaMap(),w=new CombatWorld(map);w.current.lamp=43;w.startGolemTrial();return {w,map};}
function enter(w){Object.assign(w.current,{x:8,y:13.8});tick(w,62);assert.equal(w.current.bossEncounter.status,'fighting');}
function ready(){
 const {w,map}=setup();enter(w);
 Object.assign(w.current,{x:8,y:8.3,fx:0,fy:-1,hitReaction:0,motion:createMotion(0,-1)});
 Object.assign(w.current.enemy,{x:8,y:7,hp:30,mode:'recover',timer:-10});
 return {w,map};
}
function appClock(w){
 const src=fs.readFileSync('src/app/main.js','utf8');
 const pause=src.split('\n').find(l=>l.startsWith('function pause(){'));
 const resume=src.split('\n').find(l=>l.startsWith('function resume(){'));
 const advance=src.match(/^function advanceWorld\(seconds\)\{[\s\S]*?^\}/m)?.[0];
 assert.ok(pause&&resume&&advance,'Real app pause/resume/manual clock functions must be available');
 const ctx=vm.createContext({world:w,document:{hidden:false},stepWorld:(t,input)=>w.step(t,input)});
 vm.runInContext(`let mode='game',paused=false,selected=0,manualAdvance=false,simLast=0,acc=0;
 const keys=new Set(),commands=[],cv={focus(){}},enemyHealth={reset(){}},manifest={blocking:()=>false,dismiss(){}},targeting={clear(){}},combatDoor={cancel(){}},closeGallery=()=>{};
 ${pause}\n${resume}\n${advance}
 globalThis.api={pause,resume,advance:advanceWorld,mode:()=>mode};`,ctx);
 return ctx.api;
}

test('5.3A full entry locks the gate and preparation prevents damage in both directions',()=>{
 const {w,map}=setup();w.current.y=14.4;tick(w,1);assert.equal(gate(map).length,0);
 w.current.y=14.25;tick(w,1);assert.equal(gate(map).length,1);assert.equal(w.current.bossEncounter.status,'preparing');
 const hp=w.current.enemy.hp,lamp=w.current.lamp;w.damage(20);assert.equal(w.current.lamp,lamp);
 Object.assign(w.current.enemy,{x:8,y:13});assert.ok(w.attack({kind:'heavy',aim:{x:8,y:13}}));
 tick(w,50);assert.equal(w.current.enemy.hp,hp);assert.equal(w.current.lamp,lamp);
});
test('5.3A a dash entering the arena cannot later escape through the closed gate',()=>{
 const {w,map}=setup();w.current.y=15.2;assert.ok(w.dash({x:0,y:-1}));tick(w,55);
 assert.equal(gate(map).length,1);assert.ok(w.current.y<=14.25);
 tick(w,80);assert.ok(w.dash({x:0,y:1}));
 for(let i=0;i<55;i++){w.step(dt);assert.ok(w.current.y<=14.26,'Hero escaped the gate during dash');}
});
test('5.3A a dash planned just before gate closure respects the new collider',()=>{
 const {w,map}=setup();w.current.y=14.2;assert.ok(w.dash({x:0,y:1}));
 for(let i=0;i<55;i++){w.step(dt);assert.ok(w.current.y<=14.26);}
 assert.equal(gate(map).length,1);
});
test('5.3A walking cannot leave through gate or side walls',()=>{
 for(const [x,y,input] of [[8,14.2,{x:0,y:1}],[2.7,12,{x:-1,y:0}],[13.3,12,{x:1,y:0}]]){
  const {w}=setup();enter(w);Object.assign(w.current,{x,y});tick(w,120,input);
  assert.ok(w.current.x>=2.64&&w.current.x<=13.36);assert.ok(w.current.y<=14.26);
 }
});
test('5.3A HP threshold excludes zero and values above five percent',()=>{
 const {w}=ready();w.current.enemy.hp=31;assert.equal(w.executionAvailable(),false);assert.equal(w.execute(),false);
 w.current.enemy.hp=0;assert.equal(w.execute(),false);w.current.enemy.hp=30;assert.equal(w.executionAvailable(),true);
});
test('5.3A a blocked staging route rejects execution without changing resource or locking controls',()=>{
 const {w,map}=ready();w.current.y=8.49;
 map.rects.push({minX:7.8,maxX:8.2,minY:8.35,maxY:8.37});
 const lamp=w.current.lamp,hp=w.current.enemy.hp;
 assert.equal(w.executionAvailable(),false);assert.equal(w.execute(),false);
 assert.equal(w.current.execution,null);assert.notEqual(w.current.golemAligning,true);
 assert.equal(w.current.lamp,lamp);assert.equal(w.current.enemy.hp,hp);
});
test('5.3A staging samples intermediate points even when both endpoints are clear',()=>{
 const s={x:8,y:8.49},boss={x:8,y:7};
 assert.equal(stageGolem(s,boss,{},(x,y)=>y>8.38&&y<8.40,()=>true),null);
});
test('5.3A valid staging does not cross colliders near the left wall',()=>{
 const {w,map}=ready();Object.assign(w.current.enemy,{x:3.35,y:7});Object.assign(w.current,{x:3.35,y:8.49});
 assert.ok(w.execute());let before={x:w.current.x,y:w.current.y};
 for(let i=0;i<24;i++){w.step(dt);assert.equal(solid(w.current.x,w.current.y,map),false);assert.ok(Math.hypot(w.current.x-before.x,w.current.y-before.y)<.1);before={x:w.current.x,y:w.current.y};}
});
test('5.3A repeated execution requests cannot restart staging or duplicate final events',()=>{
 const {w,map}=ready();assert.ok(w.execute());const lamp=w.current.lamp;
 for(let i=0;i<450;i++){
  assert.equal(w.execute(),false);w.damage(100);assert.equal(w.current.lamp,lamp);w.step(dt);
 }
 assert.equal(w.current.execution,null);assert.equal(w.current.enemy.hp,0);assert.equal(gate(map).length,0);
 assert.equal(w.events.filter(e=>e.type==='execution-start').length,1);
 assert.equal(w.events.filter(e=>e.type==='enemy-dead').length,1);
 assert.equal(w.events.filter(e=>e.type==='execution-end').length,1);
 assert.equal(w.events.filter(e=>e.executionEvent==='extracted').length,1);
});
test('5.3A combat commands are rejected during staging and finisher',()=>{
 const {w}=ready();assert.ok(w.execute());
 for(const n of [0,30]){tick(w,n);assert.equal(w.attack({kind:'light',aim:null}),false);assert.equal(w.sweep(),false);assert.equal(w.dash({x:1,y:0}),false);}
});
test('5.3A actual app pause blocks manual clock during staging and resumes without catch-up',()=>{
 const {w}=ready();assert.ok(w.execute());tick(w,5);const app=appClock(w);app.pause();
 const before=JSON.stringify(w.snapshot()),events=JSON.stringify(w.events);
 assert.equal(app.advance(2),false);assert.equal(JSON.stringify(w.snapshot()),before);assert.equal(JSON.stringify(w.events),events);
 app.resume();const t=w.current.time;assert.equal(app.advance(dt),true);assert.ok(Math.abs(w.current.time-t-dt)<1e-8);
});
test('5.3A actual app pause blocks manual clock during the active finisher',()=>{
 const {w}=ready();assert.ok(w.execute());tick(w,120);assert.ok(w.current.execution.elapsed>1);
 const app=appClock(w);app.pause();const before=JSON.stringify(w.snapshot());assert.equal(app.advance(3),false);assert.equal(JSON.stringify(w.snapshot()),before);
 app.resume();app.advance(dt);assert.ok(w.current.execution.elapsed>1);
});
test('5.3A extraction keeps gate locked until the finisher ends',()=>{
 const {w,map}=ready();assert.ok(w.execute());let n=0;
 while(w.current.enemy.hp>0&&n++<400)w.step(dt);
 assert.equal(w.current.enemy.hp,0);assert.ok(w.current.execution);assert.equal(gate(map).length,1);
 tick(w,150);assert.equal(w.current.execution,null);assert.equal(gate(map).length,0);assert.equal(w.current.lamp,43);
});
test('5.3A ordinary sword kill opens gate after the fall with no lamp reward',()=>{
 const {w,map}=ready();w.current.enemy.hp=1;assert.ok(w.attack({kind:'heavy',aim:{x:8,y:7}}));let n=0;
 while(w.current.enemy.hp>0&&n++<120)w.step(dt);
 assert.equal(w.current.enemy.hp,0);assert.equal(gate(map).length,1);tick(w,60);
 assert.equal(gate(map).length,0);assert.equal(w.current.lamp,43);assert.equal(actorCanOccupy(w.current,w.current.enemy.x,w.current.enemy.y),true);
});
test('5.3A death and retry restore the checkpoint without duplicate gate colliders',()=>{
 const {w,map}=setup();const checkpoint=captureGolemLoadout(w.current);enter(w);w.damage(100);assert.equal(w.current.phase,'dead');
 for(let attempt=0;attempt<3;attempt++){
  w.reset();w.startGolemTrial();restoreGolemLoadout(w.current,checkpoint);
  assert.equal(w.current.lamp,43);assert.equal(w.current.enemy.hp,600);assert.equal(w.current.execution,null);assert.equal(gate(map).length,0);
  enter(w);assert.equal(gate(map).length,1);w.damage(100);
 }
});
test('5.3A restart during staging or after extraction removes all execution state',()=>{
 for(const frames of [5,330]){
  const {w,map}=ready();const checkpoint=captureGolemLoadout(w.current);assert.ok(w.execute());tick(w,frames);
  w.reset();w.startGolemTrial();restoreGolemLoadout(w.current,checkpoint);
  assert.equal(w.current.execution,null);assert.notEqual(w.current.golemAligning,true);assert.equal(w.current.enemy.hp,600);assert.equal(gate(map).length,0);assert.equal(w.events.length,0);
 }
});
test('5.3A loadout excludes staging state and survives resource and equipment mutations',()=>{
 const {w}=ready();w.current.weapon={id:'current',level:3};w.current.golemAligning=true;
 const checkpoint=captureGolemLoadout(w.current);assert.equal('golemAligning' in checkpoint,false);
 w.current.weapon.level=8;w.current.lamp=1;w.reset();w.startGolemTrial();restoreGolemLoadout(w.current,checkpoint);
 assert.equal(w.current.lamp,43);assert.deepEqual(w.current.weapon,{id:'current',level:3});assert.notEqual(w.current.golemAligning,true);
 const second=captureGolemLoadout({...w.current,lamp:28});restoreGolemLoadout(w.current,second);assert.equal(w.current.lamp,28);
});
