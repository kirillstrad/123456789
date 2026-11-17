import test from 'node:test';
import assert from 'node:assert/strict';
import {createGalleryPlayer} from '../src/gallery/player.js';
import {createGalleryApproach} from '../src/interaction/gallery-approach.js';

// Real player, approach, route planner and collision engine.
// Collision fixtures are synthetic; velocity/heading/contact animation hooks are scripted.
const box=(x,y,w,d)=>({kind:'polygon',points:[[x,y],[x+w,y],[x+w,y+d],[x,y+d]],minZ:0,maxZ:2.3});
const closed=()=>[box(7.05,7.84,.15,.32),box(8.8,7.84,.15,.32),box(7.2,7.925,1.6,.15)];
const opened=()=>[...closed().slice(0,2),box(7.125,6.4,.15,1.6)];
const bounds=()=>({minX:0,maxX:20,minY:0,maxY:20});
function actor({spawn={x:8,y:10},colliders=closed(),limits=bounds()}={}){
 let contacts=0;
 const motion={createMotion:()=>({vx:0,vy:0,speed:0,heading:-Math.PI/2,weight:0}),velocity:(m,i)=>({x:i.x,y:i.y}),finishMotion:(m,dt,fx,fy,moving)=>{m.heading=Math.atan2(fy,fx);m.speed=moving?Math.hypot(m.vx,m.vy):0;},contacts:s=>({count:++contacts,time:s.time})};
 const player=createGalleryPlayer({custom:'preserved'},spawn,limits,{...motion,colliders});
 return{player,contacts:()=>contacts};
}
const tick=(p,n,input={x:0,y:-1})=>{for(let i=0;i<n;i++)p.step(1/60,input);};
function approachFixture(){
 const {player}=actor(),target={id:'prison-door.a',kind:'door',parts:[{v:[[7,8,0],[9,8,0]]}],approach:{x:8,y:9,z:0}};
 let pending={id:1,targetId:target.id,kind:'door',context:'gallery-walk',approach:target.approach};
 const scene={getTarget:()=>target,getColliders:closed,getBounds:bounds},targeting={intent:()=>pending,cancelIntent:()=>pending=null};
 const approach=createGalleryApproach(player,scene,targeting);
 return{player,approach,pending:()=>pending};
}

test('the same actual player blocks before refresh and passes after explicit refresh',()=>{const {player}=actor(),same=player;tick(player,180);assert.ok(player.snapshot().y>8);assert.equal(player.refreshColliders(opened()),true);tick(player,120);assert.equal(player,same);assert.ok(player.snapshot().y<7);});
test('refresh alone does not reset position, velocity, camera, lamp, time or custom state',()=>{const f=actor();tick(f.player,10);const before=f.player.snapshot(),calls=f.contacts();f.player.refreshColliders(opened());assert.deepEqual(f.player.snapshot(),before);assert.equal(f.contacts(),calls);});
test('invalid collider data is rejected atomically and the closed blocker still works',()=>{const {player}=actor(),before=player.snapshot();for(const data of [null,{},[{kind:'bad'}],[box(0,0,-1,0)]])assert.throws(()=>player.refreshColliders(data));assert.deepEqual(player.snapshot(),before);tick(player,180);assert.ok(player.snapshot().y>8);});
test('new collider overlapping the actor is rejected without moving or trapping it',()=>{const {player}=actor(),before=player.snapshot();assert.throws(()=>player.refreshColliders([box(7,9,2,2)]),/overlaps player/);assert.deepEqual(player.snapshot(),before);tick(player,30,{x:1,y:0});assert.ok(player.snapshot().x>8.4);});
test('a prior successful grid survives a failed subsequent refresh',()=>{const {player}=actor();player.refreshColliders(opened());assert.throws(()=>player.refreshColliders([box(7,9,2,2)]));tick(player,180);assert.ok(player.snapshot().y<7.1);});
test('frame and open leaf remain solid after refresh',()=>{const {player}=actor({spawn:{x:7.1,y:9}});player.refreshColliders(opened());tick(player,180);assert.ok(player.snapshot().y>8);});
test('the same actor can traverse the open center in both directions',()=>{const {player}=actor({spawn:{x:8,y:9}});player.refreshColliders(opened());tick(player,120);assert.ok(player.snapshot().y<7.1);tick(player,120,{x:0,y:1});assert.ok(player.snapshot().y>8.9);});
test('original placement bounds are retained despite external bounds mutation',()=>{const limits=bounds(),{player}=actor({limits});limits.minX=9;assert.equal(player.refreshColliders(opened()),true);tick(player,30,{x:-1,y:0});assert.ok(player.snapshot().x<7.6);});
test('collider source mutation after refresh cannot silently mutate the built collision grid',()=>{const source=opened(),{player}=actor();player.refreshColliders(source);source.push(box(7,9,2,2));tick(player,180);assert.ok(player.snapshot().y<7.1);});
test('independent players do not share replacement grids',()=>{const a=actor().player,b=actor().player;a.refreshColliders(opened());tick(a,180);tick(b,180);assert.ok(a.snapshot().y<7.1);assert.ok(b.snapshot().y>8);});
test('approach forwards refresh to the existing actual player without changing an idle actor',()=>{const f=approachFixture(),before=f.player.snapshot();assert.equal(f.approach.refreshColliders(opened()),true);assert.deepEqual(f.player.snapshot(),before);assert.ok(f.pending());});
test('successful refresh cancels an already planned route explicitly',()=>{const f=approachFixture();f.approach.step(1/60);assert.equal(f.approach.approach().status,'approaching');assert.equal(f.approach.refreshColliders(opened()),true);assert.equal(f.pending(),null);assert.equal(f.approach.approach().status,'cancelled');assert.equal(f.approach.approach().reason,'obstacles-changed');tick(f.approach,180);assert.ok(f.player.snapshot().y<7.1);});
test('failed refresh preserves the pending route and actor state',()=>{const f=approachFixture();f.approach.step(1/60);const state=f.approach.approach(),before=f.player.snapshot(),pending=f.pending();assert.throws(()=>f.approach.refreshColliders([box(7,9,2,2)]));assert.equal(f.pending(),pending);assert.equal(f.approach.approach(),state);assert.deepEqual(f.player.snapshot(),before);});
test('legacy approach players without refresh support do not advertise the method',()=>{const p={stop(){},step(){},snapshot:()=>({})},a=createGalleryApproach(p,{},{});assert.equal(a.refreshColliders,undefined);assert.ok(Object.isFrozen(a));});
