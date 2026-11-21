import test from 'node:test';
import assert from 'node:assert/strict';
import {createLastServiceSegment,sealInspectionWeight,SEAL_DURATION} from '../src/game/last-service-segment.js';
test('intro has smooth bounded animation endpoints',()=>{
 assert.equal(sealInspectionWeight(0),0);assert.equal(sealInspectionWeight(SEAL_DURATION),0);
 for(let t=0;t<SEAL_DURATION;t+=.01)assert.ok(sealInspectionWeight(t)>=0&&sealInspectionWeight(t)<=1);
 assert.equal(sealInspectionWeight(1.5),1);
});
test('pause and modal freeze introduction',()=>{
 const s=createLastServiceSegment();s.tick(1,{paused:true});s.tick(1,{modal:true});assert.equal(s.snapshot().elapsed,0);
 assert.equal(s.next({y:16,phase:'playing'}),null);s.tick(SEAL_DURATION);assert.equal(s.next({y:16,phase:'playing'}).id,'light');
});
test('lessons happen before their respective encounters',()=>{
 const s=createLastServiceSegment();s.tick(SEAL_DURATION);
 for(const [y,id]of [[16,'light'],[13,'door'],[10.8,'attack']]){
  assert.equal(s.next({y,phase:'playing'}).id,id);s.tutorial.dismiss();s.tick(1);
 }
});
test('retry keeps knowledge but fresh start restores introduction',()=>{
 const s=createLastServiceSegment();s.tick(SEAL_DURATION);s.next({y:16,phase:'playing'});s.tutorial.dismiss();s.retry();
 assert.equal(s.snapshot().intro,false);assert.equal(s.next({y:16,phase:'playing'}),null);
 s.reset();assert.equal(s.snapshot().intro,true);assert.deepEqual(s.tutorial.snapshot().read,[]);
});
test('dead and won heroes do not open a new lesson',()=>{
 const s=createLastServiceSegment();s.tick(SEAL_DURATION);
 for(const phase of ['dead','won'])assert.equal(s.next({y:10,phase}),null);
});
