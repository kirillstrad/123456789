import test from 'node:test';
import assert from 'node:assert/strict';
import {comboEdgeStyle} from '../runtime/animation/combo-edge.js';
import {attackTiming} from '../runtime/combat/attack-timing.js';
const state=(kind='light',progress=.5)=>({phase:'playing',comboEdgeActive:true,action:{kind,progress,continuation:null},sweepProgress:null});

test('3c edge follows both per-kind queue boundaries',()=>{
 for(const kind of ['light','heavy']){
  const q=attackTiming(kind);
  assert.equal(comboEdgeStyle(state(kind,q.queueStart-.001)),null);
  assert(comboEdgeStyle(state(kind,q.queueStart)));
  assert(comboEdgeStyle(state(kind,q.queueEnd)));
  assert.equal(comboEdgeStyle(state(kind,q.queueEnd+.001)),null);
 }
});
test('3c edge never invents eligibility for terminal or queued strikes',()=>{
 assert.equal(comboEdgeStyle({...state(),comboEdgeActive:false}),null);
 assert.equal(comboEdgeStyle({...state(),comboEdgeActive:undefined}),null);
 for(const continuation of ['light','heavy'])assert.equal(comboEdgeStyle({...state(),action:{...state().action,continuation}}),null);
});
test('3c edge is absent during dash execution interactions sweep and terminal phase',()=>{
 for(const override of [{dash:{}},{execution:{}},{interaction:{}},{sweepProgress:0},{phase:'dead'},{phase:'won'},{action:null}])assert.equal(comboEdgeStyle({...state(),...override}),null);
});
test('3c edge rejects nonfinite progress and invalid kinds',()=>{
 for(const progress of [NaN,Infinity,-Infinity])assert.equal(comboEdgeStyle(state('light',progress)),null);
 assert.equal(comboEdgeStyle(state('sweep')),null);
});
test('3c edge sampling is deterministic frozen and does not mutate input',()=>{
 const s=state(),before=JSON.stringify(s),style=comboEdgeStyle(s);
 assert.equal(style.color,'#ff4460');assert.equal(style.width,2.2);
 assert(Object.isFrozen(style));assert.equal(style,comboEdgeStyle(s));assert.equal(JSON.stringify(s),before);
});
