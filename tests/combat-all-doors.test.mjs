import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeometry} from '../src/gallery/geometry.js';
import {buildPrisonDoor} from '../src/gallery/models/prison-door.js';
import {buildSetpiece} from '../src/gallery/models/setpieces.js';
import {buildDoorGeometry,DOOR_MODELS} from '../src/gallery/models/door-geometry.js';
import {createCombatDoorScene,COMBAT_DOORS} from '../runtime/game/combat-door-scene.js';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {OBSTACLES,solid,blocked} from '../runtime/combat/geometry.js';
import {createCombatDoorController} from '../runtime/interaction/combat-door-controller.js';
const ticks=s=>{for(let i=0;i<73;i++)s.step(1/60);};
for(const modelId of DOOR_MODELS){
 test(modelId+' preserves source geometry, frame and exact hinge rotation',()=>{
  const variant=modelId.charCodeAt(modelId.length-1)-97,g=createGeometry();
  if(modelId.startsWith('prison'))buildPrisonDoor(variant,g);else buildSetpiece('iron-door',variant,g);
  const original=g.finish(),closed=buildDoorGeometry({modelId}),open=buildDoorGeometry({modelId,angle:-90});
  assert.deepEqual(closed.parts,original.parts);assert.deepEqual(closed.colliders,original.colliders);
  assert.deepEqual(open.frameParts,closed.frameParts);assert.deepEqual(open.frameColliders,closed.frameColliders);
  const h=closed.hinge;
  for(let i=0;i<closed.leafParts.length;i++)for(let j=0;j<closed.leafParts[i].v.length;j++){
   const a=closed.leafParts[i].v[j],b=open.leafParts[i].v[j];
   assert.ok(Math.abs(b[0]-(h[0]+a[1]-h[1]))<1e-9);assert.ok(Math.abs(b[1]-(h[1]-a[0]+h[0]))<1e-9);assert.equal(b[2],a[2]);
  }
 });
}
test('all six doors remain independent, solid and reset without template mutation',()=>{
 const before=JSON.stringify(OBSTACLES),s=createCombatDoorScene(OBSTACLES),closedMap=JSON.stringify(s.map);
 assert.equal(s.targets.length,6);const parts=s.targets.map(t=>t.parts),frames=s.targets.map(t=>t.parts[0]);
 for(let i=0;i<COMBAT_DOORS.length;i++){
  const d=COMBAT_DOORS[i],mapBefore=JSON.stringify(s.map);assert.ok(solid(d.x,d.y,s.map));assert.ok(blocked({x:d.x,y:d.y-.5},{x:d.x,y:d.y+.5},s.map));
  assert.equal(s.open(d.id,i+1),true);s.step(1/60);assert.equal(JSON.stringify(s.map),mapBefore);ticks(s);
  assert.equal(solid(d.x,d.y,s.map),false);assert.equal(s.open(d.id,i+20),false);
  const hinge=d.x-(d.modelId.startsWith('iron')?1.1:.8);assert.ok(solid(hinge,d.y-.8,s.map));
  for(let j=i+1;j<COMBAT_DOORS.length;j++){const other=COMBAT_DOORS[j];assert.equal(s.getTarget(other.id).availability,'ready');assert.ok(solid(other.x,other.y,s.map));}
 }
 s.reset();assert.equal(JSON.stringify(s.map),closedMap);assert.equal(JSON.stringify(OBSTACLES),before);
 s.targets.forEach((t,i)=>{assert.equal(t.parts,parts[i]);assert.equal(t.parts[0],frames[i]);});
});
test('actual hero can approach each closed door from normal spawn and cross it',()=>{
 for(const d of COMBAT_DOORS){
  const scene=createCombatDoorScene(OBSTACLES),world=new CombatWorld(scene.map);world.current.enemy.hp=0;
  let intent={id:1,targetId:d.id,kind:'door',context:'game'};
  const owner=createCombatDoorController({world,scene,targeting:{intent:()=>intent,cancelIntent:()=>intent=null}}),actor=world.current;
  assert.equal(solid(d.x,d.y+.96,scene.map),false,'approach clear '+d.id);
  for(let n=0;n<7200;n++){owner.step(1/60);if(scene.getTarget(d.id).availability==='open'&&!owner.snapshot().interaction)break;}
  assert.equal(scene.getTarget(d.id).availability,'open',d.id+JSON.stringify(owner.snapshot()));assert.equal(world.current,actor);
  assert.equal(owner.snapshot().events.filter(e=>e.type==='interaction-effect').length,1);
  for(let n=0;n<120;n++)owner.step(1/60,{x:0,y:-1});assert.ok(actor.y<d.y-.5,'passage '+d.id);assert.ok(Math.abs(actor.x-d.x)<.12);
 }
});
test('invalid models and unsupported placement fail explicitly',()=>{
 for(const angle of [NaN,Infinity,1,-91])assert.throws(()=>buildDoorGeometry({angle}));
 assert.throws(()=>buildDoorGeometry({modelId:'unknown'}));
 assert.throws(()=>createCombatDoorScene(OBSTACLES,[{...COMBAT_DOORS[0],yaw:45}]));
 assert.throws(()=>createCombatDoorScene(OBSTACLES,[COMBAT_DOORS[0],COMBAT_DOORS[0]]));
});
