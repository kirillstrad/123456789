import test from 'node:test';
import assert from 'node:assert/strict';
import {createLastServiceRoute,LAST_SERVICE_ENCOUNTERS} from '../src/game/last-service-route.js';
function setup(){const read=new Set(),tutorial={snapshot:()=>({read:[...read],completed:[],blocksWorld:false,dialogue:null}),enter(id){read.add(id);this.snapshot=()=>({read:[...read],completed:[],blocksWorld:false,dialogue:{id}});return true;}};return {read,route:createLastServiceRoute(tutorial)};}
const player=(x=8,y=-49)=>({phase:'playing',x,y,enemies:[],arrows:[],execution:null});
function complete(route){for(const e of LAST_SERVICE_ENCOUNTERS){let a;do{a=route.next(player());}while(a?.kind==='lesson');assert.equal(a.id,e.id);route.commit(a);route.observe({...player(),enemies:a.enemies.map(e=>({id:e[1],hp:0}))});}}
test('route contains seven mandatory encounters with unique enemy identifiers',()=>{
 assert.equal(LAST_SERVICE_ENCOUNTERS.length,7);const ids=LAST_SERVICE_ENCOUNTERS.flatMap(e=>e.enemies.map(e=>e[1]));assert.equal(new Set(ids).size,ids.length);
});
test('ordinary kills complete route without executions or ritual',()=>{const {route}=setup();complete(route);assert.equal(route.snapshot().finished,true);});
test('active encounter cannot be replaced or completed by missing enemies',()=>{
 const {route}=setup();let a;do{a=route.next(player());}while(a.kind==='lesson');route.commit(a);
 route.observe(player());assert.equal(route.snapshot().index,0);assert.equal(route.next(player()),null);assert.throws(()=>route.commit(a));
});
test('flying arrows and active execution delay encounter completion',()=>{
 const {route}=setup();let a;do{a=route.next(player());}while(a.kind==='lesson');route.commit(a);
 const s={...player(),enemies:a.enemies.map(e=>({id:e[1],hp:0})),arrows:[{}]};route.observe(s);assert.equal(route.snapshot().index,0);
 s.arrows=[];s.execution={};route.observe(s);assert.equal(route.snapshot().index,0);s.execution=null;route.observe(s);assert.equal(route.snapshot().index,1);
});
test('optional encounter is not required for final route state',()=>{
 const {route}=setup();complete(route);assert.equal(route.snapshot().optionalStarted,false);
 const a=route.next(player(18,-35));assert.equal(a.kind,'optional');route.commit(a);assert.equal(route.snapshot().finished,true);assert.equal(route.next(player(18,-35)),null);
 route.reset();assert.deepEqual(route.snapshot(),{index:0,running:null,optionalStarted:false,finished:false});
});
