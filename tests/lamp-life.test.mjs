import test from 'node:test';
import assert from 'node:assert/strict';
import {lampAfterDamage,lampCostPreview} from '../runtime/combat/lamp-life.js';
test('lamp: ordinary damage preserves the existing lethal rule',()=>{assert.deepEqual(lampAfterDamage(20,30),{life:0,usedGrace:false});assert.equal(lampAfterDamage(20,5).life,15);});
test('lamp: interaction receives the last ember only once',()=>{assert.deepEqual(lampAfterDamage(20,30,true),{life:1,usedGrace:true});assert.equal(lampAfterDamage(1,1,true).life,0);assert.equal(lampAfterDamage(20,30,true,true).life,0);});
test('lamp: invalid damage is ignored, dead life never revives',()=>{for(const n of [0,-1,NaN,Infinity])assert.equal(lampAfterDamage(20,n,true).life,20);assert.equal(lampAfterDamage(0,5,true).life,0);});
test('lamp: spending remainder warns and never kills or heals',()=>{assert.deepEqual(lampCostPreview(10,30),{remaining:1,warning:'LAST EMBER - ONE HIT LEFT'});assert.equal(lampCostPreview(10,3).remaining,7);assert.equal(lampCostPreview(1,30).remaining,1);assert.equal(lampCostPreview(.5,0).remaining,.5);});
test('lamp: invalid costs and dead resources are rejected',()=>{for(const cost of [-1,NaN,Infinity])assert.equal(lampCostPreview(10,cost),null);assert.equal(lampCostPreview(0,1),null);assert.equal(lampCostPreview(NaN,1),null);});
test('lamp: damage state-space respects one-use grace',()=>{for(let hp=1;hp<=100;hp++)for(let n=1;n<=150;n++)for(const busy of [false,true])for(const used of [false,true]){const r=lampAfterDamage(hp,n,busy,used);assert.ok(r.life>=0&&r.life<=hp);if(r.usedGrace){assert.ok(busy&&!used);assert.equal(r.life,1);}if(hp===1)assert.equal(r.life,0);}});
