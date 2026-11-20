import {buildInteriorModel} from './models.js';
import {naveInteriorPlacements,NAVE_COMPOSITIONS} from './nave-compositions.js';
import {validateNaveInterior} from './nave-placement.js';
const copy=x=>JSON.parse(JSON.stringify(x));
export function createNaveInterior({build=buildInteriorModel,circles=[],rects=[]}={}){
 const placements=naveInteriorPlacements();validateNaveInterior(placements,{circles,rects});
 const parts=[],collisionRects=[],records=[];
 for(const p of placements){
  const mesh=build(p.modelId,{x:p.x,y:p.y,z:p.z,yaw:p.yaw});
  if(!mesh||!Array.isArray(mesh.parts)||!mesh.parts.length||!Array.isArray(mesh.colliders))throw Error('Invalid placed interior model: '+p.modelId);
  const owned=mesh.parts.map(part=>({...part,interiorInstanceId:p.instanceId,compositionId:p.compositionId}));
  parts.push(...owned);
  for(const collider of mesh.colliders){
   if(collider.kind!=='polygon'||!Array.isArray(collider.points)||!collider.points.every(v=>v.length>=2&&v.slice(0,2).every(Number.isFinite)))throw Error('Invalid interior collider: '+p.instanceId);
   collisionRects.push({minX:Math.min(...collider.points.map(v=>v[0])),maxX:Math.max(...collider.points.map(v=>v[0])),minY:Math.min(...collider.points.map(v=>v[1])),maxY:Math.max(...collider.points.map(v=>v[1])),interiorId:p.instanceId});
  }
  records.push({...p,bounds:copy(mesh.bounds)});
 }
 // No preview fill light and no interactive targets are published into combat.
 return Object.freeze({parts,rects:collisionRects,
  snapshot:()=>({compositions:NAVE_COMPOSITIONS.map(({id,name,size,x,y})=>({id,name,size,x,y})),placements:copy(records),parts:parts.length,colliders:collisionRects.length}),
 });
}
