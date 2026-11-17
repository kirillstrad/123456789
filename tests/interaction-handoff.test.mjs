import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGalleryPlayer} from '../runtime/gallery/player.js';
import {createGalleryCollisionWorld} from '../runtime/gallery/collision.js';
import {createGalleryApproach} from '../runtime/interaction/gallery-approach.js';
import {createGalleryInteraction} from '../runtime/interaction/gallery-interaction.js';
import {createInteractionIntent,interactionInputAllowed} from '../runtime/interaction/intent.js';
import {createMotion,velocity,finishMotion,MOTION,angleDelta} from '../runtime/animation/motion.js';

// Requires npm run build. No movement/approach/planner/animation-math doubles.
// The scene registry is a fixture; this is not an authored-scene or DOM test.
const dt=1/60,zero={x:0,y:0};
const box=(x,y,X,Y)=>({kind:'polygon',points:[[x,y],[X,y],[X,Y],[x,Y]],minZ:0,maxZ:2});
function fixture({colliders=[],kind='door'}={}){
 const bounds={minX:0,minY:0,maxX:20,maxY:20};
 let target={id:'object.a',kind,parts:[{v:[[9.8,5,0],[10.2,5,0],[10.2,5,2],[9.8,5,2]]}],approach:{x:10,y:6,z:0}},context='gallery-walk',held=false;
 const scene={getTarget:id=>target?.id===id?target:null,getBounds:()=>({...bounds}),getColliders:()=>colliders};
 const actor=createGalleryPlayer({}, {x:2,y:6},bounds,{createMotion,velocity,finishMotion,MOTION,colliders});
 const pending=createInteractionIntent();
 const targeting={intent:()=>pending.reconcile(target,context,true),cancelIntent:()=>pending.clear()};
 const approach=createGalleryApproach(actor,scene,targeting,{allowed:()=>context==='gallery-walk',manualHeld:()=>held});
 const world=createGalleryInteraction(approach,scene,targeting,{context:()=>context});
 const request=()=>interactionInputAllowed({mode:context,actor:world.snapshot()})&&pending.request(target,context);
 return{world,actor,approach,pending,bounds,request,target:()=>target,setTarget:t=>target=t,setHeld:v=>held=v,setContext:v=>context=v};
}
function advance(f,until=()=>!!f.world.interaction(),limit=1800,observe=()=>{}){
 for(let n=0;n<limit;n++){f.world.step(dt,zero);observe(f.world.snapshot());if(until())return;}
 assert.fail('Expected transition did not occur within the fixed-step budget');
}
function launch(f){assert.ok(f.request());advance(f);const a=f.world.interaction();assert.ok(a);return a;}

test('build prerequisite: JS runtime matches source and motion includes current inertia',()=>{
 for(const path of ['gallery/player.js','gallery/collision.js','interaction/gallery-approach.js','interaction/approach-route.js','interaction/gallery-interaction.js','interaction/start-gate.js','interaction/intent.js'])assert.equal(readFileSync(new URL('../runtime/'+path,import.meta.url),'utf8'),readFileSync(new URL('../src/'+path,import.meta.url),'utf8'),'Run npm run build: '+path);
 const motion=createMotion();assert.ok(Object.hasOwn(motion,'bodyForward'));assert.ok(Object.hasOwn(motion,'chainLagV'));
});
test('real movement stops and turns before a single lifecycle launch',()=>{
 const f=fixture();assert.ok(f.request());const intentId=f.pending.current().id,states=new Set();let last=f.world.snapshot(),moved=false;
 advance(f,()=>!!f.world.interaction(),1800,s=>{states.add(f.approach.approach().status);assert.ok(Math.hypot(s.x-last.x,s.y-last.y)<=MOTION.maxSpeed*dt+1e-8);if(s.x>2)moved=true;last=s;});
 const s=f.world.snapshot(),a=s.interaction;assert.ok(moved&&states.has('approaching')&&states.has('turning'));assert.ok(Math.hypot(s.x-10,s.y-6)<1e-8);assert.equal(s.motion.speed,0);assert.equal(s.moving,false);assert.ok(Math.abs(angleDelta(s.motion.heading,-Math.PI/2))<.02);assert.equal(a.intentId,intentId);assert.equal(f.pending.current(),null);assert.equal(f.approach.approach().reason,'interaction-start');assert.equal(f.world.interactionEvents().filter(e=>e.type==='interaction-start').length,1);
});
test('the real route planner detours around a wall before ownership transfer',()=>{
 const colliders=[box(5,3,7,9)],f=fixture({colliders}),world=createGalleryCollisionWorld(colliders,f.bounds);assert.ok(f.request());let detoured=false;
 advance(f,()=>!!f.world.interaction(),1800,s=>{assert.ok(world.isFree(s.x,s.y));if(s.y<2.76||s.y>9.24)detoured=true;});assert.ok(detoured);assert.equal(f.world.interactionEvents().length,1);
});
test('manual movement during real approach prevents a delayed action',()=>{
 const f=fixture();f.request();for(let n=0;n<10;n++)f.world.step(dt,zero);assert.ok(f.world.snapshot().x>2);f.world.step(dt,{x:-1,y:0});for(let n=0;n<120;n++)f.world.step(dt,zero);assert.equal(f.pending.current(),null);assert.equal(f.world.interaction(),null);assert.equal(f.world.interactionEvents().length,0);assert.equal(f.world.snapshot().motion.speed,0);
});
test('held manual keys cancel the real approach even with a zero input vector',()=>{
 const f=fixture();f.request();f.world.step(dt,zero);f.setHeld(true);f.world.step(dt,zero);f.setHeld(false);for(let n=0;n<60;n++)f.world.step(dt,zero);assert.equal(f.pending.current(),null);assert.equal(f.world.interaction(),null);assert.equal(f.approach.approach().reason,'manual');
});
test('an unreachable physical route never reaches lifecycle creation',()=>{
 const f=fixture({colliders:[box(5,0,7,20)]});f.request();for(let n=0;n<60;n++)f.world.step(dt,zero);assert.equal(f.approach.approach().reason,'unreachable');assert.equal(f.world.snapshot().x,2);assert.equal(f.world.interaction(),null);assert.equal(f.world.interactionEvents().length,0);assert.equal(f.pending.current(),null);
});
test('target loss during actual movement stops the player without a launch',()=>{
 const f=fixture();f.request();for(let n=0;n<10;n++)f.world.step(dt,zero);const before=f.world.snapshot();f.setTarget(null);f.world.step(dt,zero);assert.equal(f.world.snapshot().x,before.x);assert.equal(f.world.snapshot().motion.speed,0);assert.equal(f.pending.current(),null);assert.equal(f.world.interactionEvents().length,0);
});
test('an active action holds the real player stationary and blocks another F request',()=>{
 const f=fixture(),a=launch(f),before=f.world.snapshot();for(let n=0;n<60;n++)f.world.step(dt,{x:1,y:1});const after=f.world.snapshot();assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(after.motion.speed,0);assert.equal(after.interaction.id,a.id);assert.equal(f.world.cancelApproach('manual'),false);assert.equal(f.request(),false);assert.equal(f.world.interactionEvents().length,1);
});
test('matching completion returns actual movement ownership; duplicate completion is inert',()=>{
 const f=fixture(),a=launch(f),before=f.world.snapshot();assert.equal(f.world.finishInteraction(a.id+1),false);assert.equal(f.world.finishInteraction(a.id),true);assert.equal(f.world.finishInteraction(a.id),false);f.world.step(dt,{x:1,y:0});assert.ok(f.world.snapshot().x>before.x);assert.equal(f.world.interaction(),null);assert.deepEqual(f.world.interactionEvents().map(e=>e.type),['interaction-start','interaction-end']);
});
test('a new request at the reached point starts once and rejects an old completion',()=>{
 const f=fixture(),a=launch(f);assert.ok(f.world.finishInteraction(a.id));const b=launch(f);assert.ok(b.id>a.id&&b.intentId>a.intentId);assert.equal(f.world.finishInteraction(a.id),false);assert.equal(f.world.interaction().id,b.id);assert.equal(f.world.interactionEvents().filter(e=>e.type==='interaction-start').length,2);
});
test('target loss after physical arrival cancels and rejects late completion',()=>{
 const f=fixture(),a=launch(f);f.setTarget(null);assert.equal(f.world.interaction(),null);assert.equal(f.world.finishInteraction(a.id),false);assert.equal(f.world.interactionEvents().at(-1).reason,'target-lost');
});
test('context loss after physical arrival cancels without an end event',()=>{
 const f=fixture(),a=launch(f);f.setContext('menu');assert.equal(f.world.interaction(),null);assert.equal(f.world.finishInteraction(a.id),false);assert.equal(f.world.interactionEvents().at(-1).reason,'context-changed');assert.equal(f.world.interactionEvents().filter(e=>e.type==='interaction-end').length,0);
});
test('door and ignition share real movement without premature object effects or lamp cost',()=>{
 for(const kind of ['door','ignite']){const f=fixture({kind}),before=structuredClone(f.target()),a=launch(f);assert.equal(a.kind,kind);assert.equal(a.phase,'awaiting-animation');assert.equal(f.world.snapshot().lamp,100);assert.deepEqual(f.target(),before);assert.ok(f.world.finishInteraction(a.id));assert.equal(f.world.snapshot().lamp,100);assert.deepEqual(f.target(),before);}
});
