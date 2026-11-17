import test from 'node:test';
import assert from 'node:assert/strict';
import {createGeometry} from '../src/gallery/geometry.js';
import {OBJECTS,objectById} from '../src/gallery/registry.js';
import {buildRemaining} from '../src/gallery/models/remaining.js';
import {buildLightGeometry} from '../src/gallery/models/light-geometry.js';
const models=OBJECTS.filter(o=>o.role==='light');
for(const spec of models){
 test(spec.id+' preserves catalogue geometry in lit state and leaves legacy builder unchanged',()=>{
  const g=createGeometry();buildRemaining(spec.familyId,spec.variant,g);const original=g.finish(),lit=buildLightGeometry({modelId:spec.id,status:'lit'});
  assert.deepEqual(lit.parts,original.parts);assert.deepEqual(lit.lights,original.lights);assert.deepEqual(lit.colliders,original.colliders);assert.deepEqual(lit.bounds,original.bounds);
  buildLightGeometry({modelId:spec.id,status:'off'});const again=createGeometry();buildRemaining(spec.familyId,spec.variant,again);assert.deepEqual(again.finish(),original);
 });
 test(spec.id+' separates body flame and emission without changing colliders',()=>{
  const build=status=>buildLightGeometry({modelId:spec.id,status});const lit=build('lit'),off=build('off'),warm=build('smoldering'),igniting=build('igniting');
  assert.ok(lit.flameParts.length>0);assert.equal(lit.flameParts.length,lit.lights.length*2);assert.equal(lit.emissionPoints.length,lit.lights.length);
  for(const mesh of [off,warm,igniting]){assert.deepEqual(mesh.lights,[]);assert.deepEqual(mesh.colliders,lit.colliders);assert.deepEqual(mesh.bodyParts,lit.bodyParts);}
  assert.deepEqual(off.parts,lit.bodyParts);assert.deepEqual(igniting.parts,off.parts);assert.equal(warm.emberParts.length,lit.lights.length);assert.ok(warm.emberParts.every(p=>p.kind===2&&p.r===.8));
  lit.lights.forEach((l,i)=>assert.deepEqual(lit.emissionPoints[i],[l.x,l.y,l.z]));assert.deepEqual(lit.contactPoint,lit.emissionPoints[0]);
 });
 test(spec.id+' transforms approach contact and emissions consistently',()=>{
  const local=buildLightGeometry({modelId:spec.id,status:'lit'}),m=buildLightGeometry({modelId:spec.id,status:'lit',transform:{x:10,y:20,z:2,yaw:90}});
  const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
  local.emissionPoints.forEach((p,i)=>{close(m.emissionPoints[i][0],10-p[1]);close(m.emissionPoints[i][1],20+p[0]);close(m.emissionPoints[i][2],2+p[2]);});
  close(m.approach.x,10-local.approach.y);close(m.approach.y,20+local.approach.x);close(m.approach.z,2+local.approach.z);
  assert.ok(local.approach.y<local.bounds.minY-.24,'approach clears authored body footprint');
  for(const part of m.parts)for(const vertex of part.v)assert.ok(vertex.every(Number.isFinite));
 });
}
test('all nine variants and all invalid inputs have explicit contracts',()=>{
 assert.equal(models.length,9);assert.equal(new Set(models.map(m=>m.id)).size,9);
 for(const modelId of ['missing','prison-door.a',undefined])assert.throws(()=>buildLightGeometry({modelId}),/Invalid light model/);
 for(const status of ['burning',null,1])assert.throws(()=>buildLightGeometry({modelId:'brazier.a',status}),/Invalid light geometry state/);
 for(const transform of [null,[],{x:NaN},{yaw:Infinity},{z:'2'}])assert.throws(()=>buildLightGeometry({modelId:'brazier.a',transform}));
 assert.equal(objectById('brazier.a').role,'light');
});
