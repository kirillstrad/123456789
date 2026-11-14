import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {SparkSystem} from '../runtime/combat/sparks.js';
function emit(n,walking,sweep=false){const s=new SparkSystem(),counts=[];s.spawn=(q,count,force,facing)=>counts.push({count,force,facing});for(let i=0;i<n;i++)s.stone([i*.1,0,.03],i*.05,{x:1,y:0},sweep,walking);return{system:s,counts,total:counts.reduce((v,c)=>v+c.count,0)};}
test('walking keeps three fifths with less than one particle rounding error',()=>{for(let n=1;n<=100;n++){const base=emit(n,false).total;assert.equal(emit(n,true).total,Math.floor(base*3/5));}});
test('nonwalking stone contacts keep original counts',()=>assert.deepEqual(emit(3,false).counts.map(c=>c.count),[7,3,3]));
test('sweep contacts ignore walking density',()=>{const a=emit(5,true,true);assert.deepEqual(a.counts.map(c=>c.count),[12,12,12,12,12]);assert.ok(a.counts.every(c=>c.force===2.3&&c.facing.x===1));});
test('walking keeps force and direction policy',()=>assert.ok(emit(10,true).counts.every(c=>c.force===1&&c.facing===null)));
test('clear resets the fractional walking budget',()=>{const {system:s,counts}=emit(3,true);s.clear();s.stone([0,0,.03],1,{x:1,y:0},false,true);assert.equal(counts.at(-1).count,4);});
test('active sweep still emits seventy-two particles',()=>{const s=new SparkSystem();s.sweep({x:0,y:0},{x:1,y:0});assert.equal(s.particles.length,72);assert.ok(s.cone);});
test('world explicitly classifies free walking at the contact call',()=>{const s=fs.readFileSync('src/game/combat-world.ts','utf8');assert.ok(s.includes('this.sweepElapsed!==null,s.moving&&!s.action&&s.sweepProgress===null'));});
