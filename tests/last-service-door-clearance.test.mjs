import test from 'node:test';
import assert from 'node:assert/strict';
import {createLastServiceEntry,LAST_SERVICE_DOOR} from '../runtime/levels/last-service-entry.js';
import {createCombatDoorScene} from '../runtime/game/combat-door-scene.js';
import {enableCombatLights} from '../runtime/game/combat-light-context.js';
import {solid} from '../runtime/combat/geometry.js';
const scene=()=>{const {doorScene}=createLastServiceEntry(createCombatDoorScene,()=>({parts:[],lights:[]}));enableCombatLights(doorScene);return doorScene;};
const tick=(door,count=100)=>{for(let i=0;i<count;i++)door.step(1/60);};
for(const side of [1,-1]){
 test('Last Service door opens and clears a hero-width path, side '+side,()=>{
  const door=scene();
  door.setActors(()=>[{x:8,y:11.5+side*.72,radius:.24}]);
  assert.equal(solid(8,11.5,door.map),true,'Closed door must block passage');
  assert.equal(door.open(LAST_SERVICE_DOOR,1,side),true,'Empty sweep must be clear');
  tick(door);assert.equal(door.snapshot().doors[0].status,'open');
  for(let i=0;i<=40;i++)assert.equal(solid(8,10.5+i*.05,door.map,.24),false,'Open doorway must pass the hero');
  door.reset();assert.equal(door.snapshot().doors[0].status,'closed');
  assert.equal(solid(8,11.5,door.map),true,'Reset must close passage');
 });
 test('Last Service door still rejects an occupied sweep, side '+side,()=>{
  const door=scene();door.setActors(()=>[{x:7.35,y:11.5-side*.5,radius:.18}]);
  assert.equal(door.open(LAST_SERVICE_DOOR,1,side),false);
  assert.equal(door.isBlocked(LAST_SERVICE_DOOR),true);
  assert.equal(door.snapshot().doors[0].status,'closed');
  door.setActors(()=>[]);assert.equal(door.open(LAST_SERVICE_DOOR,2,side),true);
  tick(door);assert.equal(door.snapshot().doors[0].status,'open');
 });
}
test('Last Service changes only the first partition opening',()=>{
 let base;
 createLastServiceEntry((map)=>{base=map;return{map};},()=>({}));
 for(const y of [11.5,1,-10,-22,-33,-41]){
  const walls=base.rects.filter(r=>r.minY===y-.2&&r.maxY===y+.2).sort((a,b)=>a.minX-b.minX);
  assert.equal(walls.length,2);
  assert.equal(walls[0].maxX,y===11.5?6.65:6.8);
  assert.equal(walls[1].minX,y===11.5?9.35:9.2);
 }
});
