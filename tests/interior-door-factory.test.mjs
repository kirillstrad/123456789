import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {seedDoorScene} from '../tools/door-visual-check.mjs';
const source=fs.readFileSync('src/gallery/scene.js','utf8');
function harness(text,{interior=false}={}){
 const calls=[],spawn={x:8,y:6},target={approach:{x:22,y:31}},layout={marker:'real-layout'},builder=()=>{};
 const base={getSpawn:()=>({...spawn}),getTarget:id=>id==='prison-door.a'?target:null},catalogue={getSpawn:()=>({x:90,y:91})};
 const assemble=(l,b)=>{calls.push(['assemble',l,b]);return base;};
 const context=vm.createContext({
  createGalleryLayout:()=>{calls.push(['layout']);return layout;},
  buildObjectGeometry:builder,assembleGalleryScene:assemble,
  createRequestedInteriorScene:fn=>{assert.equal(fn,assemble);calls.push(['interior']);return interior?catalogue:null;},
  installInteriorCatalogue:()=>{throw Error('window registration must not run in Node');},
 });
 const executable=text.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 vm.runInContext(executable+'\nglobalThis.factory=createGalleryScene;',context);
 return {run:()=>context.factory(),calls,base,catalogue,layout,builder,target};
}
test('door spawn fixture patches the catalogue-aware source exactly once',()=>{
 const patched=seedDoorScene(source);assert.equal(patched.split('scene.getSpawn=').length,2);
 assert(source.includes('return assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);'));
 assert(patched.includes('createRequestedInteriorScene(assembleGalleryScene)'));
});
test('normal gallery keeps original assembler layout builder and spawn',()=>{
 const h=harness(source);assert.equal(h.run(),h.base);assert.deepEqual(h.base.getSpawn(),{x:8,y:6});
 assert.deepEqual(h.calls.map(c=>c[0]),['interior','layout','assemble']);assert.equal(h.calls[2][1],h.layout);assert.equal(h.calls[2][2],h.builder);
});
test('interior branch does not instantiate or replace the standard gallery',()=>{
 const h=harness(source,{interior:true});assert.equal(h.run(),h.catalogue);assert.deepEqual(h.calls.map(c=>c[0]),['interior']);
});
test('real spawn fixture changes only the default scene spawn without replacing scene identity',()=>{
 const h=harness(seedDoorScene(source));assert.equal(h.run(),h.base);const spawn=h.base.getSpawn();assert.equal(spawn.x,h.target.approach.x);assert.equal(spawn.y,h.target.approach.y+1.5);
 assert.equal(h.calls.filter(c=>c[0]==='assemble').length,1);assert.deepEqual(h.catalogue.getSpawn(),{x:90,y:91});
});
test('door spawn fixture leaves an explicitly requested interior scene untouched',()=>{
 const h=harness(seedDoorScene(source),{interior:true});assert.equal(h.run(),h.catalogue);assert.deepEqual(h.catalogue.getSpawn(),{x:90,y:91});assert.deepEqual(h.calls.map(c=>c[0]),['interior']);
});
test('spawn guard still rejects missing duplicate or already patched default factory',()=>{
 assert.throws(()=>seedDoorScene('export function createGalleryScene(){}'));
 const call='return assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);';assert.throws(()=>seedDoorScene(call+call));assert.throws(()=>seedDoorScene(seedDoorScene(source)));
});
