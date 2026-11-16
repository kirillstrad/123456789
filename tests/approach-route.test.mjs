import test from 'node:test';
import assert from 'node:assert/strict';
import {planApproachRoute as plan} from '../src/interaction/approach-route.js';
import {createGalleryCollisionWorld} from '../src/gallery/collision.js';
const bounds={minX:0,minY:0,maxX:12,maxY:12};
const box=(x,y,X,Y,minZ=0,maxZ=2)=>({kind:'polygon',points:[[x,y],[X,y],[X,Y],[x,Y]],minZ,maxZ});
const request=(extra={})=>({start:{x:2,y:6},goal:{x:10,y:6},colliders:[],bounds,...extra});
function verify(q,r){
 assert.equal(r.status,'ready');const world=createGalleryCollisionWorld(q.colliders,q.bounds,{radius:q.radius??.24});let p=q.start;
 for(const v of r.waypoints){assert.ok(v.x===p.x||v.y===p.y,'axis-aligned leg');const m=world.move(p.x,p.y,v.x-p.x,v.y-p.y);assert.equal(m.blocked,false);assert.ok(Math.hypot(m.x-v.x,m.y-v.y)<1e-8);p=v;}
 assert.deepEqual(p,{x:q.goal.x,y:q.goal.y});
}
test('open route ends at the exact approach point',()=>{const q=request();const r=plan(q);verify(q,r);assert.equal(r.visited,0);assert.equal(r.waypoints.length,1);});
test('same valid position is arrived without movement',()=>{const q=request({goal:{x:2,y:6}});assert.deepEqual(plan(q),{status:'arrived',waypoints:[],visited:0});});
test('blocked and out-of-bounds endpoints fail closed, including same blocked point',()=>{for(const extra of [{goal:{x:13,y:6}},{start:{x:0,y:6}},{colliders:[box(1,5,3,7)]},{goal:{x:2,y:6},colliders:[box(1,5,3,7)]}])assert.equal(plan(request(extra)).status,'unreachable');});
test('detours around a wall with actual hero radius',()=>{const q=request({colliders:[box(5,3,7,9)]});const r=plan(q);verify(q,r);assert.ok(r.visited>0);assert.ok(r.waypoints.some(p=>p.y<2.76||p.y>9.24));});
test('wall across the entire world returns unreachable',()=>{const r=plan(request({colliders:[box(5,0,7,12)]}));assert.equal(r.status,'unreachable');assert.equal(r.waypoints.length,0);});
test('visit budget is explicit, bounded, and never yields a partial route',()=>{const r=plan(request({colliders:[box(5,3,7,9)],maxVisited:1}));assert.equal(r.status,'budget-exceeded');assert.equal(r.visited,1);assert.deepEqual(r.waypoints,[]);});
test('sub-cell endpoints attach to the grid and preserve exact goal',()=>{const q=request({start:{x:2.13,y:6.07},goal:{x:10.17,y:6.11},colliders:[box(5,3,7,9)]});verify(q,plan(q));});
test('narrow passage rejects a hero too wide to fit',()=>{const q=request({colliders:[box(5,0,7,5.8),box(5,6.2,7,12)],radius:.24});assert.equal(plan(q).status,'unreachable');const small={...q,radius:.1};verify(small,plan(small));});
test('overhead and below-ground colliders use existing height rules',()=>{const q=request({colliders:[box(5,0,7,12,2,3),box(5,0,7,12,-2,0)]});verify(q,plan(q));});
test('invalid geometry and unsafe settings throw instead of moving',()=>{for(const extra of [{goal:{x:NaN,y:1}},{goal:{x:2,y:2,z:1}},{radius:0},{cellSize:0},{maxVisited:1.1},{maxVisited:Infinity},{colliders:[{}]},{bounds:{...bounds,maxX:Infinity}}])assert.throws(()=>plan(request(extra)));});
test('planning is deterministic, immutable and does not mutate input',()=>{const q=request({colliders:[box(5,3,7,9)]}),before=structuredClone(q),a=plan(q);assert.deepEqual(plan(q),a);assert.deepEqual(q,before);assert.ok(Object.isFrozen(a)&&Object.isFrozen(a.waypoints)&&a.waypoints.every(Object.isFrozen));});
test('no diagonal corner cutting between touching obstacles',()=>{const q=request({start:{x:2,y:2},goal:{x:10,y:10},colliders:[box(0,6,6,12),box(6,0,12,6)]});assert.equal(plan(q).status,'unreachable');});
test('oversized search grid reports its resource limit',()=>{const q=request({bounds:{minX:0,minY:0,maxX:100,maxY:100},start:{x:2,y:50},goal:{x:98,y:50},cellSize:.1,colliders:[box(49,20,51,80)]});assert.equal(plan(q).status,'budget-exceeded');});
