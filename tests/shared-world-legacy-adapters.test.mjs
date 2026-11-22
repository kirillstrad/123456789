import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(bindings={}){
 const src=fs.readFileSync('src/render/combat-door-environment.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 const ctx=vm.createContext(bindings);vm.runInContext(src+';globalThis.make=createCombatDoorEnvironment;',ctx);return ctx.make;
}
const floor=()=>({kind:0,v:[[0,0,0],[1,0,0],[1,1,0]],d:1});
test('legacy mapless interior preserves cached geometry without requiring dressing dependency',()=>{
 const f=floor(),wall={kind:0,v:[[0,0,0],[1,0,1],[1,0,2]],d:2},inside={kind:1,v:[[2,2,0],[2,2,1]],d:4};let builds=0;
 const make=load({createEnvironment:()=>{builds++;return {parts:[f,wall]};},enableCombatLights:()=>({getFrame:()=>({parts:[],lights:[],targets:[]})})});
 const env=make({interior:{parts:[inside]},parts:[],targets:[],snapshot:()=>({doors:[]})});
 const a=env.parts,b=env.parts;assert.ok(a.includes(inside));assert.equal(a[0].d,-9999);assert.equal(a[1],wall);assert.equal(f.d,1);assert.equal(builds,1);assert.equal(a.length,b.length);assert.equal(env.lights.length,0);assert.equal(env.targets.length,0);
});
test('legacy ambient adapter preserves step, motion and original light identity without a map',()=>{
 let time=0;const f=floor(),lit=Object.freeze({x:1,y:2,z:1,r:30,power:.2}),accent={architectural:true,power:.02},target={id:'real-brazier',activation:'lantern'},moving={kind:1,v:[[1,1,1],[1,1,2]],d:2,ambientMotion:true};
 const make=load({createEnvironment:()=>({parts:[f],lights:[accent],step:dt=>time+=dt,dynamicParts:()=>[moving]}),enableCombatLights:()=>({getFrame:()=>({parts:[],lights:[lit],targets:[target]})})});
 const env=make({parts:[],targets:[],snapshot:()=>({doors:[]})});assert.ok(env.lights.includes(lit));assert.ok(env.lights.includes(accent));assert.ok(env.targets.includes(target));env.step(1/60);assert.ok(time>0);assert.ok(env.parts.includes(moving));assert.equal(f.d,1);
});
test('a real bounded map still invokes shared dressing exactly once and publishes its geometry',()=>{
 let calls=0;const map={bounds:{minX:0,maxX:10,minY:0,maxY:10},rects:[],circles:[]},dressed={kind:0,v:[[2,2,0],[3,2,0],[3,3,0]],d:5,worldDressing:true};
 const make=load({createEnvironment:()=>({parts:[]}),enableCombatLights:()=>({getFrame:()=>({parts:[],lights:[],targets:[]})}),createWorldDressing:actual=>{assert.equal(actual,map);calls++;return {parts:[dressed]};}});
 const env=make({map,parts:[],targets:[],snapshot:()=>({doors:[]})});assert.ok(env.parts.includes(dressed));assert.ok(env.parts.includes(dressed));assert.equal(calls,1);
});
