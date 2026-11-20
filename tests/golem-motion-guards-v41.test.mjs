import test from 'node:test';import assert from 'node:assert/strict';
import {updateGolemMotion} from '../src/animation/golem-motion.js';
const live=()=>({id:7,archetype:'corpse-golem',hp:600,x:8,y:8,fx:0,fy:1,mode:'chase',walkDistance:0});
for(const [name,patch]of [['zero HP',{hp:0}],['negative HP',{hp:-1}],['dead mode',{mode:'dead'}],['unrelated enemy',{archetype:'bonebound'}]])test('V4.1 motion must not mutate '+name,()=>{
 const e={...live(),...patch},before=JSON.stringify(e);Object.freeze(e);updateGolemMotion(e,1/60,{x:8,y:8});assert.equal(JSON.stringify(e),before);
});
test('V4.1 dead motion preserves existing nested contacts without advancing',()=>{
 const e=live();updateGolemMotion(e,1/60,{x:8,y:8});e.hp=0;const before=JSON.stringify(e),motion=e.golemMotion;updateGolemMotion(e,1/60,{x:7,y:8});assert.equal(e.golemMotion,motion);assert.equal(JSON.stringify(e),before);
});
test('V4.1 living golem still gets finite fresh foot contacts',()=>{const e=live();updateGolemMotion(e,1/60,{x:8,y:8});assert.ok(e.golemMotion);const before=e.golemMotion;e.x+=.01;updateGolemMotion(e,1/60,{x:8,y:8});assert.notEqual(e.golemMotion,before);assert.ok(e.golemMotion.feet.every(f=>f.p.every(Number.isFinite)));});
