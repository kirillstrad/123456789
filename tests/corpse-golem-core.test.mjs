import test from 'node:test';
import assert from 'node:assert/strict';
import {CORPSE_GOLEM,GOLEM_ATTACKS,GOLEM_FINISHER,golemExecutionWeak,canFinishGolem,
 beginGolemExecution,advanceGolemExecution,golemFinisherFrame,golemExecutionPresentation,
 stepCorpseGolem} from '../src/combat/corpse-golem.js';
import {golemArenaMap,createGolemArena} from '../src/game/golem-arena.js';
const boss=()=>({id:7,archetype:'corpse-golem',maxHp:600,hp:600,x:8,y:8,fx:0,fy:1,
 mode:'chase',timer:0,cooldown:0,walkDistance:0,hitFired:false});
const hero=()=>({x:8,y:9.3,fx:0,fy:-1,lamp:100,phase:'playing',busy:false,execution:null});
const args=(enemy,extra={})=>({enemy,dt:1/60,player:hero(),map:{circles:[],rects:[]},
 damage:()=>{},solid:()=>false,blocked:()=>false,allowAttack:true,...extra});
function weak(){return {...boss(),hp:30};}
function scene(){const map=golemArenaMap(),arena=createGolemArena(map,7),b=boss(),h={...hero(),y:16};return{map,arena,b,h};}
test('profiles are frozen provisional and have exactly three attacks',()=>{
 assert.ok(Object.isFrozen(CORPSE_GOLEM));assert.equal(CORPSE_GOLEM.boss,true);
 assert.deepEqual(Object.keys(GOLEM_ATTACKS),['slam','sweep','press']);
 for(const a of Object.values(GOLEM_ATTACKS)){assert.ok(Object.isFrozen(a));for(const n of Object.values(a))assert.ok(Number.isFinite(n)&&n>0);}
});
test('finisher is restricted to positive HP at or below five percent',()=>{
 for(const hp of [30,1,.01])assert.equal(golemExecutionWeak({...boss(),hp}),true);
 for(const hp of [30.001,31,180,0,-1,NaN,Infinity])assert.equal(golemExecutionWeak({...boss(),hp}),false);
 assert.equal(golemExecutionWeak({...weak(),archetype:'bonebound'}),false);
 assert.equal(golemExecutionWeak({...weak(),maxHp:0}),false);
});
test('finisher needs a living idle aligned hero and a clear close target',()=>{
 assert.ok(canFinishGolem(hero(),weak()));assert.equal(canFinishGolem(hero(),weak(),true),false);
 for(const patch of [{busy:true},{phase:'dead'},{lamp:0},{x:12},{fy:1},{fx:0,fy:0},{x:NaN}])assert.equal(canFinishGolem({...hero(),...patch},weak()),false);
});
test('starting finisher does not auto-kill or mutate either actor',()=>{
 const h=hero(),b=weak(),before=JSON.stringify([h,b]),s=beginGolemExecution(h,b);
 assert.equal(s.kind,'corpse-golem');assert.equal(s.targetId,7);assert.equal(s.elapsed,0);assert.equal(s.extracted,false);
 assert.equal(JSON.stringify([h,b]),before);assert.equal(beginGolemExecution(h,{...b,hp:31}),null);
});
test('one large finisher tick emits every event in chronological order once',()=>{
 const s=beginGolemExecution(hero(),weak()),before=JSON.stringify(s),r=advanceGolemExecution(s,100);
 assert.deepEqual(r.events,['impact','pierced','hand-released','lamp-offered','extracted','regripped','blade-pulled','finished']);
 assert.equal(r.state.elapsed,6.8);assert.equal(r.state.phase,'done');assert.equal(r.state.extracted,true);
 assert.equal(JSON.stringify(s),before);assert.deepEqual(advanceGolemExecution(r.state,1).events,[]);
});
test('small finisher ticks extract and finish exactly once',()=>{
 let s=beginGolemExecution(hero(),weak());const events=[];
 for(let i=0;i<600;i++){const r=advanceGolemExecution(s,1/60);s=r.state;events.push(...r.events);}
 assert.equal(events.filter(e=>e==='extracted').length,1);assert.equal(events.filter(e=>e==='finished').length,1);
 assert.equal(s.elapsed,GOLEM_FINISHER.duration);
});
test('death cancels finisher without extraction and never repeats cancellation',()=>{
 const s=beginGolemExecution(hero(),weak()),r=advanceGolemExecution(s,.1,false);
 assert.equal(r.state.phase,'cancelled');assert.deepEqual(r.events,['cancelled']);
 assert.deepEqual(advanceGolemExecution(r.state,10,false).events,[]);assert.equal(r.state.extracted,false);
});
test('invalid or zero finisher duration never advances events',()=>{
 const s=beginGolemExecution(hero(),weak());for(const dt of [0,-1,NaN,Infinity]){const r=advanceGolemExecution(s,dt);assert.deepEqual(r.state,s);assert.deepEqual(r.events,[]);}
});
test('finisher presentation is finite bounded deterministic and nonmutating',()=>{
 for(const elapsed of [-1,0,.5,1,2.6,3.25,4.8,5.8,6.8,9,NaN]){
  const e={elapsed},a=golemFinisherFrame(e);assert.deepEqual(a,golemFinisherFrame(e));
  assert.ok(Object.values(a).every(n=>Number.isFinite(n)&&n>=0&&n<=1));
  const p=golemExecutionPresentation(e);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.cameraZoom>=1&&p.cameraZoom<=1.09);
 }
});
for(const [index,name] of Object.keys(GOLEM_ATTACKS).entries()){
 test(name+' has a readable windup and exactly one damage event',()=>{
  const e=boss();e.golemAttackIndex=index;const hits=[],a=args(e,{damage:n=>hits.push(n)});
  stepCorpseGolem(a);assert.equal(e.mode,'windup');assert.equal(e.golemAttack,name);assert.deepEqual(hits,[]);
  for(let i=0;i<Math.ceil(GOLEM_ATTACKS[name].windup*60)+1;i++)stepCorpseGolem(a);
  assert.deepEqual(hits,[GOLEM_ATTACKS[name].damage]);assert.equal(e.mode,'recover');
 });
 test(name+' cannot hit through a wall',()=>{
  const e={...boss(),golemAttack:name,mode:'windup'},hits=[];
  for(let i=0;i<120;i++)stepCorpseGolem(args(e,{damage:n=>hits.push(n),blocked:()=>true}));assert.deepEqual(hits,[]);
 });
}
test('normal and weakened golem follow the same attack cycle',()=>{
 const a=boss(),b=weak();for(let i=0;i<1600;i++){
  stepCorpseGolem(args(a));stepCorpseGolem(args(b));
  for(const key of ['mode','timer','cooldown','golemAttack','golemAttackIndex','x','y'])assert.equal(a[key],b[key]);
 }
});
test('distant golem approaches instead of endlessly swinging out of reach',()=>{
 const e=boss(),before=e.y;stepCorpseGolem(args(e,{player:{x:8,y:11}}));assert.equal(e.mode,'chase');assert.ok(e.y>before);
});
test('group budget blocks attack start without changing attack index',()=>{
 const e=boss();stepCorpseGolem(args(e,{allowAttack:false}));assert.notEqual(e.mode,'windup');assert.equal(e.golemAttackIndex,undefined);
});
test('windup direction stays fixed when player sidesteps',()=>{
 const e=boss();stepCorpseGolem(args(e));const facing=[e.fx,e.fy];
 stepCorpseGolem(args(e,{player:{x:9,y:8}}));assert.deepEqual([e.fx,e.fy],facing);
});
test('press movement is substepped bounded and respects blocked movement',()=>{
 const e={...boss(),mode:'windup',golemAttack:'press',timer:.4};let samples=0;
 stepCorpseGolem(args(e,{dt:.65,player:{x:8,y:12},solid:()=>{samples++;return false;}}));
 assert.ok(samples>10);assert.ok(e.y<=8.8+1e-8);assert.ok(e.y>8);
 const blocked={...boss(),mode:'windup',golemAttack:'press',timer:.4};
 stepCorpseGolem(args(blocked,{dt:.65,player:{x:8,y:12},solid:()=>true}));assert.equal(blocked.y,8);
});
test('dead golem and unrelated enemies are not updated',()=>{
 const e={...boss(),hp:0},before=JSON.stringify(e);stepCorpseGolem(args(e));assert.equal(JSON.stringify(e),before);
 const other={...boss(),archetype:'bonebound'};assert.equal(stepCorpseGolem(args(other)),false);
});
test('arena map instances do not share mutable arrays bounds or rectangles',()=>{
 const a=golemArenaMap(),b=golemArenaMap();a.rects[0].minX=99;a.bounds.minX=99;a.circles.push({x:1,y:1,r:1});
 assert.equal(b.rects[0].minX,2);assert.equal(b.bounds.minX,2.4);assert.equal(b.circles.length,0);
});
test('arena remains open outside and closes once after complete entry',()=>{
 const {map,arena,b,h}=scene(),base=map.rects.length;assert.equal(arena.update(h,b).status,'waiting');
 h.y=14.1;assert.equal(arena.update(h,b).locked,false);h.y=13.7;
 assert.equal(arena.update(h,b).status,'fighting');assert.equal(map.rects.length,base+1);
 const revision=map.golemRevision;for(let i=0;i<20;i++)arena.update(h,b);
 assert.equal(map.rects.length,base+1);assert.equal(map.golemRevision,revision);
});
test('active arena clamps attempted escape while retaining the gate collider',()=>{
 const {map,arena,b,h}=scene();h.y=13.7;arena.update(h,b);h.x=-99;h.y=99;
 const s=arena.update(h,b);assert.equal(s.locked,true);assert.equal(s.inRoom,true);assert.equal(h.x,2.65);assert.equal(h.y,14.25);
 assert.equal(map.rects.filter(r=>r.golemGate).length,1);
});
test('normal boss death opens the arena exactly once',()=>{
 const {map,arena,b,h}=scene();h.y=13;arena.update(h,b);b.hp=0;h.phase='won';
 assert.equal(arena.update(h,b).status,'won');assert.equal(map.rects.some(r=>r.golemGate),false);
 const revision=map.golemRevision;arena.update(h,b);assert.equal(map.golemRevision,revision);
});
test('extraction alone keeps gate closed until the finishing animation ends',()=>{
 const {map,arena,b,h}=scene();h.y=13;arena.update(h,b);b.hp=0;h.execution={kind:'corpse-golem',phase:'drain'};
 assert.equal(arena.update(h,b).locked,true);h.execution=null;
 assert.equal(arena.update(h,b).status,'won');assert.equal(map.rects.some(r=>r.golemGate),false);
});
test('hero death keeps arena locked until explicit restart',()=>{
 const {map,arena,b,h}=scene();h.y=13;arena.update(h,b);h.phase='dead';h.lamp=0;
 assert.equal(arena.update(h,b).status,'failed');assert.equal(arena.snapshot().locked,true);
 arena.reset();assert.equal(arena.snapshot().status,'waiting');assert.equal(map.rects.some(r=>r.golemGate),false);
 h.phase='playing';h.lamp=100;b.hp=600;assert.equal(arena.update(h,b).status,'fighting');
});
test('snapshots cannot mutate arena state and wrong boss ownership fails',()=>{
 const {arena,b,h}=scene(),s=arena.snapshot();s.status='won';assert.equal(arena.snapshot().status,'waiting');
 assert.throws(()=>arena.update(h,{...b,id:99}));assert.throws(()=>arena.update({...h,x:NaN},b));
});
test('arena rejects detached readonly or replaced collision arrays',()=>{
 assert.throws(()=>createGolemArena({get rects(){return [];}},7));
 assert.throws(()=>createGolemArena({rects:Object.freeze([])},7));
 const {map,arena,b,h}=scene();map.rects=[];assert.throws(()=>arena.update(h,b));
});
