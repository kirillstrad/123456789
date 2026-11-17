import test from 'node:test';
import assert from 'node:assert/strict';
import {createGalleryInteraction} from '../src/interaction/gallery-interaction.js';
import {createInteractionIntent} from '../src/interaction/intent.js';
import {assembleGalleryScene} from '../src/gallery/scene-core.js';
import {buildPrisonDoorGeometry} from '../src/gallery/models/prison-door.js';

// Real factory -> lifecycle -> event bridge -> timed motion -> assembled scene.
// Player movement is scripted; this is not a browser/input or real-player test.
function fixture(existing=null,{publish=true,id='prison-door.a'}={}){
 const scene=existing??assembleGalleryScene({name:'TEST',bounds:{minX:0,maxX:30,minY:0,maxY:30},spawn:{x:8,y:10},entries:[{id,role:'door',x:8,y:8}]},(key,t)=>({...buildPrisonDoorGeometry({transform:t}),objectId:key}));
 const target=()=>scene.getTarget(id),point=target().approach,pending=createInteractionIntent();
 let mode='gallery-walk',arrival={status:'idle',targetId:id};
 const actor={x:point.x,y:point.y,lamp:100,phase:'playing',moving:false,action:null,interaction:null,dash:null,execution:null,sweepProgress:null,hitReaction:0,motion:{vx:0,vy:0,heading:0}};
 const targeting={intent:()=>pending.reconcile(target(),mode,true),cancelIntent:()=>pending.clear()};
 const player={snapshot:()=>structuredClone(actor),approach:()=>({...arrival}),cancelApproach:()=>{pending.clear();arrival={status:'cancelled',targetId:id};},step:()=>{}};
 const dependency=publish?scene:{getTarget:scene.getTarget};
 const world=createGalleryInteraction(player,dependency,targeting,{context:()=>mode});
 function start(){const t=target(),vertices=t.parts.flatMap(p=>p.v),x=vertices.reduce((s,v)=>s+v[0],0)/vertices.length,y=vertices.reduce((s,v)=>s+v[1],0)/vertices.length;actor.motion.heading=Math.atan2(y-actor.y,x-actor.x);assert.ok(pending.request(t,mode));arrival={status:'arrived',targetId:id};world.step(1/60);assert.ok(world.interaction());}
 return{scene,world,actor,target,start,setMode:value=>mode=value};
}
const tick=(f,n)=>{for(let i=0;i<n;i++)f.world.step(1/60);};
const mesh=f=>f.scene.getFrame({x:8,y:8},4).parts;

test('existing factory automatically binds a capable scene and starts only at effect',()=>{const f=fixture(),before=structuredClone(mesh(f));f.start();tick(f,107);assert.equal(f.world.doorMotion().status,'closed');assert.deepEqual(mesh(f),before);tick(f,1);assert.equal(f.world.doorMotion().status,'opening');assert.equal(f.world.doorMotion().elapsed,0);assert.deepEqual(mesh(f),before);tick(f,1);assert.ok(f.world.doorMotion().angle<0);assert.notDeepEqual(mesh(f),before);});
test('full app-style steps open real geometry while identity, approach, frame and blockers stay fixed',()=>{const f=fixture(),t=f.target(),approach={...t.approach},refs=[...t.parts],split=buildPrisonDoorGeometry().frameParts.length,colliders=structuredClone(f.scene.getColliders());f.start();tick(f,108);for(let i=0;i<72;i++){tick(f,1);assert.equal(f.target().parts,t.parts);assert.deepEqual(f.target().approach,approach);assert.deepEqual(f.scene.getColliders(),colliders);for(let j=0;j<split;j++)assert.equal(t.parts[j],refs[j]);}assert.equal(f.world.doorMotion().status,'open');assert.equal(f.world.doorMotion().angle,-90);assert.equal(f.world.interaction(),null);assert.deepEqual(mesh(f),buildPrisonDoorGeometry({angle:-90,transform:{x:8,y:8}}).parts);assert.deepEqual(f.world.interactionEvents().map(e=>e.type),['interaction-start','interaction-effect','interaction-end']);assert.equal(f.actor.lamp,100);});
test('snapshot, diagnostics, target and frame reads never advance door time',()=>{const f=fixture();f.start();tick(f,130);const before=f.world.doorMotion(),parts=[...mesh(f)];for(let i=0;i<30;i++){f.world.snapshot();f.world.interaction();f.world.interactionEvents();f.world.drainInteractionEvents();f.target();mesh(f);}assert.equal(f.world.doorMotion(),before);assert.deepEqual(mesh(f),parts);});
test('death before effect cancels without a late door launch',()=>{const f=fixture();f.start();tick(f,30);f.actor.phase='dead';f.world.snapshot();tick(f,200);assert.equal(f.world.doorMotion().status,'closed');assert.deepEqual(f.world.interactionEvents().map(e=>e.type),['interaction-start','interaction-cancelled']);});
test('hidden target before effect cancels without applying the effect',()=>{const f=fixture();f.start();tick(f,30);f.scene.getFrame({x:8,y:8},4).entries[0].visible=false;f.world.interaction();tick(f,200);assert.equal(f.world.doorMotion().status,'closed');assert.equal(f.world.interactionEvents().at(-1).reason,'target-lost');});
test('early legacy completion cannot manufacture an effect',()=>{const f=fixture();f.start();assert.ok(f.world.finishInteraction(f.world.interaction().id));tick(f,200);assert.equal(f.world.doorMotion().status,'closed');});
test('subsequent interaction cannot reset or reopen an already open motion',()=>{const f=fixture();f.start();tick(f,180);const before=f.world.doorMotion(),parts=[...mesh(f)];f.start();tick(f,180);assert.equal(f.world.doorMotion(),before);assert.deepEqual(mesh(f),parts);});
test('invalid inputs do not dispose the owner or mutate progress',()=>{const f=fixture();f.start();tick(f,120);const before=f.world.doorMotion();for(const dt of [0,-1,NaN,1])assert.throws(()=>f.world.step(dt));assert.throws(()=>f.world.step(1/60,{x:Infinity,y:0}));assert.equal(f.world.doorMotion(),before);tick(f,1);assert.ok(f.world.doorMotion().elapsed>before.elapsed);});
test('owner disposal stops stale updates and releases a persistent scene motion',()=>{const f=fixture();f.start();tick(f,130);const before=f.world.doorMotion(),parts=[...mesh(f)];f.world.dispose();f.world.dispose();tick(f,30);assert.equal(f.world.doorMotion(),before);assert.deepEqual(mesh(f),parts);const next=fixture(f.scene);assert.equal(next.world.doorMotion(),before);tick(next,100);assert.equal(next.world.doorMotion().status,'open');assert.equal(f.world.doorMotion().status,'open');});
test('a second simultaneous owner is rejected without disturbing the first',()=>{const f=fixture();assert.throws(()=>fixture(f.scene),/already has/);f.start();tick(f,180);assert.equal(f.world.doorMotion().status,'open');});
test('scene disposal rejects the next tick before advancing motion',()=>{const f=fixture();f.start();tick(f,120);const before=f.world.doorMotion();f.scene.dispose();assert.throws(()=>f.world.step(1/60),/disposed/);assert.equal(f.world.doorMotion(),before);assert.doesNotThrow(()=>f.world.step(1/60));});
test('scenes without the angle API keep the original transport-disabled behavior',()=>{const f=fixture(null,{publish:false});f.start();tick(f,200);assert.equal(f.world.doorMotion,undefined);assert.deepEqual(f.world.drainInteractionEvents(),[]);assert.equal(f.world.interactionEvents().length,3);assert.deepEqual(mesh(f),buildPrisonDoorGeometry({transform:{x:8,y:8}}).parts);});
test('scene without prison-door.a is not bound even if it has the angle API',()=>{const f=fixture(null,{id:'other'});f.start();tick(f,200);assert.equal(f.world.doorMotion,undefined);assert.deepEqual(f.world.drainInteractionEvents(),[]);});
test('independent scenes keep independent clocks and immutable public APIs',()=>{const a=fixture(),b=fixture();assert.ok(Object.isFrozen(a.world));a.start();tick(a,180);assert.equal(a.world.doorMotion().status,'open');assert.equal(b.world.doorMotion().status,'closed');assert.ok(Object.isFrozen(a.world.doorMotion()));});
