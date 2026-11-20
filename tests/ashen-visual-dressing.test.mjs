import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createAshenPlan,ashenWalkable,ASHEN_PROPS} from '../src/levels/ashen-layout.js';
import {ASHEN_DRESSING,ASHEN_ACCENT_LIGHTS,ashenFloorColour,ashenWallOpening} from '../src/levels/ashen-visual-data.js';
import {buildAshenDressModel} from '../src/levels/ashen-dress-models.js';
import {buildAshenWallDress} from '../src/levels/ashen-wall-dress.js';
import {buildAshenBackdrop} from '../src/levels/ashen-backdrop.js';
import {ashenMotionParts} from '../src/levels/ashen-ambient-motion.js';
import {createAshenDressing} from '../src/levels/ashen-dressing.js';
import {createAshenEnvironment} from '../src/levels/ashen-environment.js';
const plan=()=>createAshenPlan(),dress=options=>createAshenDressing(plan(),ashenWalkable,options);

test('42 authored props use unique stable IDs and immutable placements',()=>{
 assert.equal(ASHEN_DRESSING.length,42);assert.equal(new Set(ASHEN_DRESSING.map(p=>p.id)).size,42);assert(Object.isFrozen(ASHEN_DRESSING[0]));
 for(const p of ASHEN_DRESSING)assert(ashenWalkable(p.x,p.y),p.id);
});
test('native dressing geometry is deterministic, finite and bounded in colour',()=>{
 for(const p of ASHEN_DRESSING){const a=buildAshenDressModel(p),b=buildAshenDressModel(p);assert.deepEqual(a,b);assert(a.parts.length>0);for(const part of a.parts){assert(part.v.flat().every(Number.isFinite));assert(part.c.every(x=>Number.isFinite(x)&&x>=0&&x<=255));assert(Number.isFinite(part.d));}}
});
test('unknown models and invalid transforms fail instead of silently substituting boxes',()=>{
 assert.throws(()=>buildAshenDressModel({type:'unknown'}));assert.throws(()=>buildAshenDressModel({...ASHEN_DRESSING[0],yaw:NaN}));
});
test('furniture is volumetric and elevated table props are not left on the floor',()=>{
 for(const type of ['wardrobe','shelf','desk','coffin','memorial']){const p=ASHEN_DRESSING.find(p=>p.type===type),m=buildAshenDressModel(p);assert(m.bounds.maxZ-m.bounds.minZ>.5);}
 assert(ASHEN_DRESSING.some(p=>p.type==='pages'&&p.z>.8));assert(ASHEN_DRESSING.some(p=>p.type==='candles'&&p.z>.8));
});
test('assembly preserves plan data and creates fourteen explicit colliders',()=>{
 const p=plan(),before=JSON.stringify(p),d=createAshenDressing(p,ashenWalkable);assert.equal(JSON.stringify(p),before);assert.equal(d.rects.length,14);assert.equal(d.snapshot().props.length,42);
 for(const r of d.rects)assert([r.minX,r.maxX,r.minY,r.maxY].every(Number.isFinite));
});
test('candles are unlit and decoration does not add interaction targets',()=>{
 const d=dress();assert.equal(d.targets,undefined);for(const p of ASHEN_DRESSING.filter(p=>p.type==='candles'))assert.deepEqual(buildAshenDressModel(p).lights,[]);
});
test('solid furniture stays off doors lights and central warden combat floor',()=>{
 const d=dress(),p=plan();for(const b of d.rects){
  for(const door of p.doors)assert(!(door.x>b.minX-2.1&&door.x<b.maxX+2.1&&door.y>b.minY-2.1&&door.y<b.maxY+2.1));
  assert(!(b.minX<36.5&&b.maxX>31.5&&b.minY<14.5&&b.maxY>9.5));
 }
});
test('wall dressing is noncolliding and banners are bounded to wall anchor data',()=>{
 const w=buildAshenWallDress(plan(),ashenWalkable);assert(w.parts.length>0&&w.records.length>0&&w.banners.length>0);assert.equal(w.colliders,undefined);assert(w.parts.every(p=>p.wallDressing));
 assert.equal(new Set(w.records.map(r=>r.id)).size,w.records.length);
});
test('wall anchors never occupy the gate clearance zone',()=>{
 const p=plan(),w=buildAshenWallDress(p,ashenWalkable);for(const r of w.records)for(const d of p.doors)assert(Math.hypot(r.x-d.x,r.y-d.y)>=3);
});
test('breaches are explicitly authored and do not change walkable floor',()=>{
 assert(ashenWallOpening(20,7,'north'));assert(ashenWallOpening(34,2,'north'));assert(ashenWallOpening(29,29,'west'));assert(!ashenWallOpening(27,12,'north'));
 assert(!ashenWalkable(20.5,6.5));assert(!ashenWalkable(34.5,1.5));assert(!ashenWalkable(28.5,29.5));
});
test('background contains descending foundations high apse silhouettes and three depth bands',()=>{
 const b=buildAshenBackdrop(ashenWalkable);assert(b.records.some(r=>r.z<-4));assert(b.records.some(r=>r.z+r.h>6));assert.deepEqual([...new Set(b.records.map(r=>r.band))].sort(),[0,1,2]);
});
test('background is noninteractive noncolliding and casts no gameplay light',()=>{
 const b=buildAshenBackdrop(ashenWalkable);assert.deepEqual(b.colliders,[]);assert.deepEqual(b.targets,[]);assert.deepEqual(b.lights,[]);
});
test('every background footprint is outside playable floor',()=>{
 const b=buildAshenBackdrop(ashenWalkable);for(const r of b.records)for(let y=r.y;y<=r.y+r.d;y+=.2)for(let x=r.x;x<=r.x+r.w;x+=.2)assert(!ashenWalkable(x,y),r.id);
});
test('background draws before game floor and fades by material rather than bright fog',()=>{
 const b=buildAshenBackdrop(ashenWalkable);assert(b.parts.every(p=>p.d<-19000&&p.backdrop));assert(b.parts.every(p=>Math.max(...p.c)<=33));assert(b.parts.filter(p=>p.depthBand===2).every(p=>Math.max(...p.c)<=13));
});
test('floor palettes distinguish rooms without changing the global light system',()=>{
 const colours=[[8,12],[20,12],[20,25],[32,26],[34,4]].map(([x,y])=>ashenFloorColour(x,y));assert(new Set(colours.map(c=>c.join(','))).size>=4);assert(colours.flat().every(n=>n>=40&&n<=64));
});
test('two architectural accents are weak local lights, not lit braziers',()=>{
 assert.equal(ASHEN_ACCENT_LIGHTS.length,2);assert(ASHEN_ACCENT_LIGHTS.every(l=>l.architectural&&l.power<=.025&&l.r<=65));assert(ASHEN_ACCENT_LIGHTS.reduce((n,l)=>n+l.power,0)<=.05);
});
test('reads never advance ambient motion or mutate simulation clock',()=>{
 const d=dress(),a=d.dynamicParts(),before=d.snapshot();for(let i=0;i<10;i++){assert.equal(d.dynamicParts(),a);d.snapshot();}assert.deepEqual(d.snapshot(),before);
});
test('simulation steps animate banners and dust while zero-step pause freezes them',()=>{
 const d=dress(),a=JSON.stringify(d.dynamicParts());for(let i=0;i<60;i++)d.step(1/60);const b=JSON.stringify(d.dynamicParts());assert.notEqual(a,b);assert.equal(JSON.stringify(d.dynamicParts()),b);assert(Math.abs(d.snapshot().time-1)<1e-8);
});
test('reduced motion removes dust and keeps the banner static from the first frame',()=>{
 const d=dress({reducedMotion:()=>true}),a=JSON.stringify(d.dynamicParts());for(let i=0;i<60;i++)d.step(1/60);assert.equal(JSON.stringify(d.dynamicParts()),a);assert(!d.dynamicParts().some(p=>p.alpha===.35));
});
test('ambient geometry is deterministic and invalid tick durations are rejected',()=>{
 const w=buildAshenWallDress(plan(),ashenWalkable);assert.deepEqual(ashenMotionParts(2,w.banners),ashenMotionParts(2,w.banners));const d=dress();for(const dt of [NaN,Infinity,-1,0,.2])assert.throws(()=>d.step(dt));
});
test('snapshots and separate runs do not share mutable state',()=>{
 const a=dress(),b=dress(),s=a.snapshot();s.props[0].x=999;assert.notEqual(a.snapshot().props[0].x,999);a.step(1/60);assert.equal(b.snapshot().time,0);
});
test('environment wires dressing alongside all original level props',()=>{
 const p=plan(),before=JSON.stringify(p),e=createAshenEnvironment(p);assert.equal(JSON.stringify(p),before);assert(e.parts.some(p=>p.backdrop));assert(e.parts.some(p=>p.visualDressing));assert(e.parts.some(p=>p.wallDressing));assert.equal(new Set(e.parts.filter(p=>p.levelInstanceId?.startsWith('ashen.prop.')).map(p=>p.levelInstanceId)).size,ASHEN_PROPS.length);
 const t=e.dressingSnapshot().time;e.step(1/60);assert(e.dressingSnapshot().time>t);assert(e.dynamicParts().length>0);
});
test('common renderer delegates updates and merges accents motion and original light targets',()=>{
 const src=fs.readFileSync('src/render/combat-door-environment.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,''),d=dress(),floor={v:[[0,0,0],[1,0,0],[1,1,0]],d:1},lit={x:1,y:2,z:1,r:30,power:.2},target={id:'real-brazier',activation:'lantern'};
 const env={parts:[floor,...d.parts],lights:d.lights,step:d.step,dynamicParts:d.dynamicParts},ctx=vm.createContext({createEnvironment:()=>env,enableCombatLights:()=>({getFrame:()=>({parts:[],lights:[lit],targets:[target]})})});vm.runInContext(src+';globalThis.make=createCombatDoorEnvironment;',ctx);
 const view=ctx.make({parts:[],targets:[],snapshot:()=>({doors:[]})});assert(view.lights.includes(lit));assert(view.lights.some(l=>l.architectural));assert(view.targets.includes(target));view.step(1/60);assert(d.snapshot().time>0);assert(view.parts.some(p=>p.ambientMotion));assert.equal(floor.d,1);
});
test('world tick only advances ambient environment after the modal guard',()=>{
 const src=fs.readFileSync('src/app/main.js','utf8'),line=src.split('\n').find(l=>l.startsWith('function stepWorld('));assert(line?.includes('env.step?.(dt)'));const calls=[];
 const c=vm.createContext({manifest:{blocking:()=>true},combatDoor:{step:()=>calls.push('world')},ritualBonfire:{step(){}},effects:{step(){}},world:{current:{},events:[]},env:{step:()=>calls.push('decor')}});vm.runInContext(line+';globalThis.step=stepWorld;',c);c.step(1/60,{});assert.equal(calls.length,0);
});
test('new colliders preserve sampled routes with gates treated as open',()=>{
 const p=plan(),d=dress(),rects=[...p.obstacles.rects,...d.rects];
 // Original solid props: two benches, stretcher and pedestal.
 rects.push({minX:17.3,maxX:19.7,minY:9.675,maxY:10.325},{minX:20.8,maxX:23.2,minY:13.675,maxY:14.325},{minX:33.95,maxX:35.05,minY:25.65,maxY:28.35},{minX:33.5,maxX:34.5,minY:3,maxY:4});
 const circles=[...p.obstacles.circles,...p.lights.map(l=>({x:l.transform.x,y:l.transform.y,r:.55}))],step=.25,nx=161,ny=121;
 const blocked=(x,y)=>!ashenWalkable(x,y)||rects.some(r=>x>r.minX-.24&&x<r.maxX+.24&&y>r.minY-.24&&y<r.maxY+.24)||circles.some(c=>Math.hypot(x-c.x,y-c.y)<c.r+.24);
 const key=(x,y)=>y*nx+x,start=[24,40],queue=[start],seen=new Set([key(...start)]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=queue[i][0]+dx,y=queue[i][1]+dy,k=key(x,y);if(x<0||y<0||x>=nx||y>=ny||seen.has(k)||blocked(2+x*step,2+y*step))continue;seen.add(k);queue.push([x,y]);}
 for(const [x,y]of [[20,12],[20,25],[32,26],[34,13],[34,5]])assert(seen.has(key(Math.round((x-2)/step),Math.round((y-2)/step))),'unreachable '+x+','+y);
});
