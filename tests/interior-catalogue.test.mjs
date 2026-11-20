import test from 'node:test';
import assert from 'node:assert/strict';
import {INTERIOR_CARDS,INTERIOR_FAMILIES,INTERIOR_CATEGORIES,interiorCard,listInteriorCards} from '../src/interior/catalogue.js';
import {createInteriorGeometry} from '../src/interior/geometry.js';
import {buildInteriorModel} from '../src/interior/models.js';
import {buildInteriorPreviewModel} from '../src/interior/preview.js';
import {createInteriorLayout} from '../src/interior/layout.js';
import {installInteriorCatalogue,createRequestedInteriorScene} from '../src/interior/viewer.js';

test('catalogue includes the agreed 122 families, two variants each, in 12 categories',()=>{
 assert.equal(INTERIOR_FAMILIES.length,122);assert.equal(INTERIOR_CARDS.length,244);assert.equal(INTERIOR_CATEGORIES.length,12);
 assert.equal(new Set(INTERIOR_CARDS.map(c=>c.modelId)).size,244);
 for(const f of INTERIOR_FAMILIES)assert.equal(INTERIOR_CARDS.filter(c=>c.familyId===f.familyId).length,2);
});
test('cards have English identifiers, dimensions, explicit collision and noninteractive roles',()=>{
 for(const c of INTERIOR_CARDS){
  assert.match(c.name,/^[A-Z0-9 ']+$/);assert.match(c.modelId,/^interior\.[a-z.-]+$/);
  assert(Object.values(c.dimensions).every(n=>Number.isFinite(n)&&n>0));
  assert.deepEqual(c.interaction,{type:'none',prompt:null});assert.equal(c.role,c.collision==='none'?'decor':'decorative-obstacle');
  assert.equal(c.visualAcceptance,'pending');
 }
});
test('catalogue metadata is deeply immutable',()=>{
 const c=INTERIOR_CARDS[0];assert(Object.isFrozen(c)&&Object.isFrozen(c.dimensions)&&Object.isFrozen(c.interaction));
 assert.throws(()=>{c.dimensions.width=99;},TypeError);
});
test('category filter and unknown identifiers fail explicitly',()=>{
 const ids=[];for(const category of INTERIOR_CATEGORIES){const cards=listInteriorCards(category);assert(cards.length);assert(cards.every(c=>c.category===category));ids.push(...cards.map(c=>c.modelId));}
 assert.equal(new Set(ids).size,244);assert.throws(()=>listInteriorCards('bad'));assert.throws(()=>interiorCard('bad'));assert.throws(()=>buildInteriorModel('bad'));
});
test('all 244 meshes are finite, nonempty and deterministic',()=>{
 for(const card of INTERIOR_CARDS){
  const a=buildInteriorModel(card.modelId),b=buildInteriorModel(card.modelId);assert.deepEqual(a,b,card.modelId);
  assert(a.parts.length>0&&a.parts.length<=120);assert.equal(a.objectId,card.modelId);
  for(const p of a.parts){assert([0,1].includes(p.kind));assert(p.v.length>=(p.kind===0?3:2));assert(p.v.every(v=>v.length===3&&v.every(Number.isFinite)));assert(p.c.every(v=>Number.isFinite(v)&&v>=0&&v<=255));assert(Number.isFinite(p.d));}
  assert(Object.values(a.bounds).every(Number.isFinite));assert(a.bounds.maxZ>=a.bounds.minZ);
 }
});
test('variants differ in geometry or material, not identifiers only',()=>{
 for(const f of INTERIOR_FAMILIES){const a=buildInteriorModel(f.familyId+'.a'),b=buildInteriorModel(f.familyId+'.b');assert.notDeepEqual(a.parts,b.parts,f.familyId);}
});
test('building a second instance does not share mutable geometry',()=>{
 const id=INTERIOR_CARDS[0].modelId,a=buildInteriorModel(id),b=buildInteriorModel(id);a.parts[0].v[0][0]=12345;assert.notEqual(b.parts[0].v[0][0],12345);
});
test('geometry supports translation and rotation without modifying cards',()=>{
 const id=INTERIOR_CARDS[0].modelId,a=buildInteriorModel(id),b=buildInteriorModel(id,{x:7,y:9,z:2,yaw:90});
 for(let i=0;i<a.parts.length;i++)for(let j=0;j<a.parts[i].v.length;j++){
  const p=a.parts[i].v[j],q=b.parts[i].v[j];assert(Math.abs(q[0]-(7-p[1]))<1e-8);assert(Math.abs(q[1]-(9+p[0]))<1e-8);assert(Math.abs(q[2]-(2+p[2]))<1e-8);
 }
 assert.throws(()=>buildInteriorModel(id,{x:NaN}));assert.throws(()=>createInteriorGeometry({yaw:Infinity}));
});
test('only authored obstacles create finite polygon colliders',()=>{
 for(const c of INTERIOR_CARDS){const m=buildInteriorModel(c.modelId,{x:3,y:4,z:1,yaw:35});assert.equal(m.colliders.length,c.collision==='none'?0:1);
  for(const collider of m.colliders){assert.equal(collider.kind,'polygon');assert.equal(collider.points.length,4);assert(collider.points.flat().every(Number.isFinite));assert(collider.maxZ>collider.minZ);}
 }
});
test('flat textile and trace categories never block walking',()=>{
 for(const c of INTERIOR_CARDS.filter(c=>['textile','blood','damp','decay'].includes(c.category)))assert.equal(buildInteriorModel(c.modelId).colliders.length,0);
});
test('preview fill lights do not leak into gameplay model builders',()=>{
 const id=INTERIOR_CARDS[0].modelId,a=buildInteriorModel(id),b=buildInteriorPreviewModel(id,{x:4,y:5});assert.equal(a.lights.length,0);assert(b.lights.some(l=>l.previewOnly&&l.x===4&&l.y===5));assert.equal(buildInteriorModel(id).lights.length,0);
});
test('catalogue layout has unique placements, bounded spawn and separated cells',()=>{
 const l=createInteriorLayout();assert.equal(l.entries.length,244);assert(l.spawn.x>=l.bounds.minX&&l.spawn.y>=l.bounds.minY);
 const cells=new Set();for(const e of l.entries){const key=e.x+','+e.y;assert(!cells.has(key));cells.add(key);assert(e.bounds.minX>=l.bounds.minX);assert(e.bounds.maxX<=l.bounds.maxX);assert(e.bounds.maxY<=l.bounds.maxY);assert.notEqual(e.role,'door');}
});
test('all actual geometry remains inside its catalogue cell',()=>{
 for(const e of createInteriorLayout().entries){const b=buildInteriorModel(e.id,{x:e.x,y:e.y}).bounds;assert(b.minX>=e.bounds.minX&&b.maxX<=e.bounds.maxX&&b.minY>=e.bounds.minY&&b.maxY<=e.bounds.maxY,e.id);}
});
test('layout filters categories without changing model identifiers',()=>{
 for(const cat of INTERIOR_CATEGORIES){const l=createInteriorLayout(cat);assert.equal(l.entries.length,listInteriorCards(cat).length);assert(l.entries.every(e=>e.category===cat));}
 assert.throws(()=>createInteriorLayout('bad'));
});
function harness(){
 let scene=null,camera=null,closes=0,walks=0;const publications=[];
 const assemble=(layout,build)=>{
  const meshes=layout.entries.map(e=>build(e.id,{x:e.x,y:e.y,z:e.z,yaw:e.yaw}));
  publications.push({layout,meshes});let disposed=false;
  return {dispose(){disposed=true;},stats(){if(disposed)throw Error('disposed');return {objects:meshes.length};},getSpawn:()=>layout.spawn};
 };
 const root={__ASH_GALLERY__:{close(){closes++;scene?.dispose();scene=null;camera=null;},open(){scene=createRequestedInteriorScene(assemble);camera=scene?{...scene.getSpawn()}:null;return scene?.stats()??{objects:0};},setCamera(x,y){camera={x,y};},camera:()=>camera,walk(){walks++;return {walking:true};}}};
 const installed=installInteriorCatalogue(root);return {root,api:installed.api,dispose:()=>{root.__ASH_GALLERY__.close();installed.dispose();},publications,read:()=>({camera,closes,walks})};
}
test('default gallery construction has no interior request',()=>{assert.equal(createRequestedInteriorScene(()=>{throw Error('unexpected');}),null);});
test('viewer opens only requested category and publishes native meshes',()=>{
 const h=harness();try{assert.equal(h.api.open('textile').objects,26);assert.equal(h.api.info().category,'textile');assert.equal(h.publications[0].meshes.length,26);assert(h.publications[0].meshes.every(m=>m.card.category==='textile'));}finally{h.dispose();}
});
test('viewer focuses IDs and cycles entries without recreating the scene',()=>{
 const h=harness();try{h.api.open('blood');const id=h.api.list('blood')[3].modelId;assert.equal(h.api.focus(id).modelId,id);assert.equal(h.publications.length,1);const n=h.api.next();assert.equal(n.modelId,h.api.list('blood')[4].modelId);h.api.previous();assert.equal(h.publications.length,1);}finally{h.dispose();}
});
test('invalid category or focus does not close a live catalogue',()=>{
 const h=harness();try{h.api.open('ritual');const before=h.read().closes;assert.throws(()=>h.api.open('bad'));assert.throws(()=>h.api.focus('bad'));assert.equal(h.read().closes,before);assert.equal(h.api.info().category,'ritual');}finally{h.dispose();}
});
test('viewer metadata copies cannot modify the catalogue',()=>{
 const h=harness();try{const list=h.api.list('textile');list[0].dimensions.width=99;assert.notEqual(h.api.list('textile')[0].dimensions.width,99);assert.deepEqual(h.api.categories(),INTERIOR_CATEGORIES);}finally{h.dispose();}
});
test('closing clears ownership and the default gallery request is restored',()=>{
 const h=harness();try{h.api.open('iron');h.api.close();assert.equal(h.api.info(),null);assert.equal(createRequestedInteriorScene(()=>{throw Error('unexpected');}),null);}finally{h.dispose();}
});
test('walk mode delegates to the existing gallery walk owner',()=>{
 const h=harness();try{assert.deepEqual(h.api.walk('furniture'),{walking:true});assert.equal(h.read().walks,1);assert.equal(h.api.info().category,'furniture');}finally{h.dispose();}
});
test('failed scene creation clears pending request for later default gallery opens',()=>{
 const root={__ASH_GALLERY__:{close(){},setCamera(){},open(){return createRequestedInteriorScene(()=>{throw Error('scripted build failure');});}}};
 const h=installInteriorCatalogue(root);try{assert.throws(()=>h.api.open('blood'),/scripted build failure/);assert.equal(createRequestedInteriorScene(()=>{throw Error('leaked request');}),null);}finally{h.dispose();}
});
