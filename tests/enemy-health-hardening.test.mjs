import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {createHealthHitIndex,healthVisibleIds,createEnemyHealthRuntime} from '../src/app/enemy-health-runtime.js';
const quad=(x=0,y=0,w=20,h=20)=>({kind:0,v:[[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]]}),viewport={width:256,height:256},project=(x,y)=>[x,y];
function index(parts,groups){return createHealthHitIndex({parts,groups,project,zoom:1,viewport});}
test('tile boundary preserves front-to-back occlusion',()=>{const a=quad(55,55),b=quad(62,62);assert.equal(index([a,b],[{id:1,parts:[a]}]).pick([65,65]),null);assert.equal(index([a,b],[{id:1,parts:[a]}]).pick([57,57]),1);});
test('offscreen shapes are excluded and invalid points fail closed',()=>{const a=quad(300,300),i=index([a],[{id:1,parts:[a]}]);assert.equal(i.records.length,0);for(const p of [null,[],[NaN,2],[-1,2]])assert.equal(i.pick(p),null);});
test('edge samples retain a partially visible enemy',()=>{const a=quad(),b=quad(7,0,13,20),i=index([a,b],[{id:1,parts:[a]}]);assert.equal(i.pick([10,10]),null);assert.ok(healthVisibleIds(i,{data:new Uint8Array(256*256*4).fill(90),cols:256,rows:256},viewport).has(1));});
test('duplicate IDs and shared mesh ownership are rejected',()=>{const a=quad();assert.equal(index([a],[{id:1,parts:[a]},{id:1,parts:[a]}]).pick([5,5]),null);assert.equal(index([a],[{id:1,parts:[a]},{id:2,parts:[a]}]).pick([5,5]),null);});
test('diagnostics are read only copies, not game setters',()=>{const target={},runtime=createEnemyHealthRuntime({diagnosticsTarget:target});assert.ok(Object.isFrozen(target.__ASH_ENEMY_HEALTH__));const a=target.__ASH_ENEMY_HEALTH__.snapshot();a.visibleIds.push(999);assert.deepEqual(runtime.snapshot().visibleIds,[]);assert.equal(target.__ASH_ENEMY_HEALTH__.setTarget,undefined);});
test('world reset preserves relic ordering and clears HP exactly once',()=>{
 const source=fs.readFileSync('src/app/main.js','utf8'),fn=source.split('\n').find(line=>line.startsWith('function resetWorld(){'));assert.ok(fn);
 assert.ok(fn.includes('targeting.clear();relicWorld?.reset();manifest?.reset();enemyHealth.reset();'));
 const calls=[],mark=name=>()=>calls.push(name),context={targeting:{clear:mark('target')},relicWorld:{reset:mark('relic')},manifest:{reset:mark('manifest')},enemyHealth:{reset:mark('hp')},combatDoor:{cancel:mark('combat')},doorScene:{reset:mark('door')},world:{reset:mark('world')},applyLevelSpawn:mark('spawn'),selectedLevelId:'test-chamber',ritualBonfire:{reset:mark('ritual')},dashHud:{},effects:{reset:mark('effects')},fireHintLayer:{clear:mark('hints')},view:{}};
 vm.runInNewContext(fn+';resetWorld();',context);assert.deepEqual(calls.slice(0,4),['target','relic','manifest','hp']);assert.equal(calls.filter(name=>name==='hp').length,1);assert.ok(calls.includes('world'));assert.ok(calls.includes('spawn'));assert.equal(context.view.zoom,1);
});
