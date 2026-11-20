import test from 'node:test';
import assert from 'node:assert/strict';
import {assembleGalleryScene} from '../src/gallery/scene-core.js';
import {createInteriorLayout} from '../src/interior/layout.js';
import {buildInteriorPreviewModel} from '../src/interior/preview.js';
import {INTERIOR_CARDS} from '../src/interior/catalogue.js';

test('interior catalogue assembles through the actual gallery scene contract',()=>{
 const layout=createInteriorLayout(),scene=assembleGalleryScene(layout,buildInteriorPreviewModel);
 try{
  const stats=scene.stats();assert.equal(stats.objects,244);assert(stats.parts>244);assert.equal(stats.colliders,INTERIOR_CARDS.filter(c=>c.collision!=='none').length);
  for(const card of INTERIOR_CARDS)assert.equal(scene.getTarget(card.modelId),null);
  assert.equal(scene.getCollisionRevision(),0);
 }finally{scene.dispose();}
});
test('interior catalogue frames are culled, floor-cached and have no interaction targets',()=>{
 const scene=assembleGalleryScene(createInteriorLayout(),buildInteriorPreviewModel);
 try{
  const camera={x:8,y:10},a=scene.getFrame(camera,12),b=scene.getFrame(camera,12);
  assert(a.entries.length>0&&a.entries.length<244);assert(a.parts.length<scene.stats().parts);assert.equal(a.floorParts,b.floorParts);assert(a.floorParts.length>0);assert.deepEqual(a.targets,[]);assert.deepEqual(a.parts,b.parts);
  assert(a.lights.some(l=>l.previewOnly));
 }finally{scene.dispose();}
});
test('interior catalogue scene disposal is idempotent and cannot publish stale geometry',()=>{
 const scene=assembleGalleryScene(createInteriorLayout('textile'),buildInteriorPreviewModel);
 scene.dispose();assert.doesNotThrow(()=>scene.dispose());assert.throws(()=>scene.stats(),/disposed/);assert.throws(()=>scene.getFrame({x:8,y:10}),/disposed/);
});
