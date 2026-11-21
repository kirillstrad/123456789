import test from 'node:test';
import assert from 'node:assert/strict';
import {createLastServiceRoute,LAST_SERVICE_ENCOUNTERS} from '../src/game/last-service-route.js';
function setup(){const read=new Set(),recorded=[],tutorial={snapshot:()=>({read:[...read],completed:[],blocksWorld:false,dialogue:null}),record:id=>recorded.push(id),enter(id){read.add(id);this.snapshot=()=>({read:[...read],completed:[],blocksWorld:false,dialogue:{id}});return true;}};return {read,recorded,route:createLastServiceRoute(tutorial)};}
const player=(x=8,y=-49)=>({phase:'playing',x,y,enemies:[],arrows:[],execution:null});
function nextFight(route,s=player()){let a;do{a=route.next(s);}while(a?.kind==='lesson');return a;}
function complete(route){for(const e of LAST_SERVICE_ENCOUNTERS){const a=nextFight(route);assert.equal(a.id,e.id);route.commit(a);route.observe({...player(),enemies:a.enemies.map(e=>({id:e[1],hp:0}))});}}
test('route contains seven mandatory encounters with unique identifiers',()=>{assert.equal(LAST_SERVICE_ENCOUNTERS.length,7);const ids=LAST_SERVICE_ENCOUNTERS.flatMap(e=>e.enemies.map(e=>e[1]));assert.equal(new Set(ids).size,ids.length);});
test('ordinary kills complete without executions or ritual',()=>{const {route}=setup();complete(route);assert.equal(route.snapshot().finished,true);});
test('missing enemies and duplicate commit cannot complete a fight',()=>{const {route}=setup(),a=nextFight(route);route.commit(a);route.observe(player());assert.equal(route.snapshot().index,0);assert.equal(route.next(player()),null);assert.throws(()=>route.commit(a));});
test('arrows and active execution delay completion',()=>{
 const {route}=setup(),a=nextFight(route);route.commit(a);const s={...player(),enemies:a.enemies.map(e=>({id:e[1],hp:0})),arrows:[{}]};route.observe(s);assert.equal(route.snapshot().index,0);s.arrows=[];s.execution={};route.observe(s);assert.equal(route.snapshot().index,0);s.execution=null;route.observe(s);assert.equal(route.snapshot().index,1);
});
test('optional fight is optional and resets',()=>{
 const {route}=setup();complete(route);assert.equal(route.snapshot().optionalStarted,false);const a=route.next(player(16,-35));assert.equal(a.kind,'optional');route.commit(a);assert.equal(route.snapshot().finished,true);assert.equal(route.next(player(16,-35)),null);route.reset();assert.deepEqual(route.snapshot(),{index:0,running:null,optionalStarted:false,finished:false});
});
test('nearby optional spawn is deferred without consuming it',()=>{const {route}=setup();complete(route);assert.equal(route.next(player(18,-35)),null);assert.equal(route.snapshot().optionalStarted,false);assert.equal(route.next(player(16,-35)).kind,'optional');});
test('live enemy touching hero defers the next roster replacement',()=>{const {route}=setup(),s={...player(),enemies:[{id:190,x:8.1,y:-49,hp:10,radius:.5}]};assert.equal(nextFight(route,s),null);s.enemies[0].x=12;assert.equal(nextFight(route,s).kind,'encounter');});
test('execution and granted ritual are observed even without a running fight',()=>{const {route,recorded}=setup();route.observe({...player(),execution:{phase:'pin'},interaction:{kind:'campfire',recoveryGranted:25}});assert.ok(recorded.includes('execution-started'));assert.ok(recorded.includes('ritual-completed'));});
test('death does not advance or teach a cancelled execution',()=>{const {route,recorded}=setup(),a=nextFight(route);route.commit(a);route.observe({...player(),phase:'dead',enemies:a.enemies.map(e=>({id:e[1],hp:0}))});assert.equal(route.snapshot().index,0);route.observe({...player(),execution:{phase:'cancelled'}});assert.deepEqual(recorded,[]);});
