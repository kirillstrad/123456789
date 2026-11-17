import test from 'node:test';
import assert from 'node:assert/strict';
import {createInteractionStartGate} from '../src/interaction/start-gate.js';
import {createInteractionIntent} from '../src/interaction/intent.js';

function fixture({begin,options,context='gallery-walk'}={}){
 const target={id:'door.a',kind:'door',parts:[{v:[[7,8,0],[9,8,0],[9,8,2],[7,8,2]]}],approach:{x:8,y:9,z:0}};
 const pending=createInteractionIntent();pending.request(target,context);
 const intent=pending.current(),actor={x:8,y:9,lamp:1,phase:'playing',moving:false,action:null,interaction:null,dash:null,execution:null,sweepProgress:null,hitReaction:0,motion:{vx:0,vy:0,heading:-Math.PI/2}},approach={status:'arrived',targetId:target.id};
 let calls=0,request=null;
 const gate=createInteractionStartGate({...options,getIntent:()=>pending.current(),begin:r=>{calls++;request=r;return begin?begin(r):17;}});
 const args={intent,target,actor,approach,context};
 assert.ok(gate.arm(intent,target));
 return{gate,args,pending,get calls(){return calls;},get request(){return request;}};
}

test('starts once for a stopped, facing actor, including one remaining ember',()=>{
 const f=fixture(),before=structuredClone(f.args.actor),r=f.gate.attempt(f.args);
 assert.deepEqual(r,{status:'started',reason:null,intentId:1,actionId:17});assert.equal(f.calls,1);assert.deepEqual(f.args.actor,before);assert.ok(f.pending.current());
 assert.deepEqual(f.request,{kind:'door',targetId:'door.a',intentId:1,context:'gallery-walk'});assert.ok(Object.isFrozen(r)&&Object.isFrozen(f.request));
});
test('an attempted intent cannot start again after cancel or rearm',()=>{const f=fixture();f.gate.attempt(f.args);f.gate.cancel();assert.equal(f.gate.arm(f.args.intent,f.args.target),false);f.gate.attempt(f.args);assert.equal(f.calls,1);});
test('preflight failure can be retried after arrival becomes valid',()=>{const f=fixture();f.args.approach.status='approaching';assert.equal(f.gate.attempt(f.args).reason,'not-arrived');assert.equal(f.calls,0);f.args.approach.status='arrived';assert.equal(f.gate.attempt(f.args).status,'started');});
test('zero lamp, death, busy actor and hit reaction block the executor',()=>{
 for(const patch of [{lamp:0},{lamp:NaN},{phase:'dead'},{phase:'won'},{action:{}},{interaction:{}},{execution:{}},{dash:{}},{sweepProgress:0},{hitReaction:.1}]){const f=fixture();Object.assign(f.args.actor,patch);assert.equal(f.gate.attempt(f.args).reason,'actor-unavailable');assert.equal(f.calls,0);}
});
test('context changes, hidden document and queued input block execution',()=>{
 for(const patch of [{context:'menu'},{context:'gallery-preview'},{context:'game'},{hidden:true},{queued:true}]){const f=fixture();Object.assign(f.args,patch);assert.equal(f.gate.attempt(f.args).status,'blocked');assert.equal(f.calls,0);}
});
test('frozen combat is blocked but inherited combat freeze does not block gallery walk',()=>{const f=fixture();f.args.frozen=true;assert.equal(f.gate.attempt(f.args).status,'started');const g=fixture({context:'game'});g.args.frozen=true;assert.equal(g.gate.attempt(g.args).reason,'actor-unavailable');});
test('removed, locked, disabled, replaced or moved targets cannot start',()=>{
 for(const patch of [{removed:true},{availability:'locked'},{availability:'requires-item'},{enabled:false},{visible:false},{parts:[]},{parts:[{v:[[7,8],[9,8]]}]},{approach:{x:8,y:10,z:0}},{kind:'campfire'},{id:'other'}]){const f=fixture();f.args.target={...f.args.target,...patch};assert.equal(f.gate.attempt(f.args).reason,'target-changed');assert.equal(f.calls,0);}
});
test('arrival reported for a different target is rejected',()=>{const f=fixture();f.args.approach.targetId='other';assert.equal(f.gate.attempt(f.args).reason,'not-arrived');});
test('live position, movement and velocity override an old arrived report',()=>{
 for(const patch of [{x:8.1},{moving:true},{motion:{vx:.1,vy:0,heading:-Math.PI/2}},{motion:{vx:0,vy:0,heading:NaN}}]){const f=fixture();Object.assign(f.args.actor,patch);assert.equal(f.gate.attempt(f.args).status,'blocked');assert.equal(f.calls,0);}
});
test('wrong heading and invalid target coordinates block execution',()=>{const f=fixture();f.args.actor.motion.heading=0;assert.equal(f.gate.attempt(f.args).reason,'not-facing');const g=fixture();g.args.target.parts[0].v[0][0]=NaN;assert.equal(g.gate.attempt(g.args).reason,'invalid-facing');});
test('executor rejection or exception reserves the intent without automatic retry',()=>{
 for(const begin of [()=>null,()=>false,()=>({id:1}),()=>{throw Error('possible partial side effect');}]){const f=fixture({begin}),r=f.gate.attempt(f.args);assert.ok(['rejected','failed'].includes(r.status));assert.equal(f.gate.arm(f.args.intent,f.args.target),false);f.gate.attempt(f.args);assert.equal(f.calls,1);}
});
test('synchronous reentry cannot invoke the executor twice',()=>{let f;f=fixture({begin:()=>{assert.equal(f.gate.attempt(f.args).status,'blocked');return 21;}});assert.equal(f.gate.attempt(f.args).actionId,21);assert.equal(f.calls,1);});
test('later physical request serial is accepted but an older serial is rejected',()=>{const f=fixture();f.gate.attempt(f.args);f.pending.clear();f.pending.request(f.args.target,'gallery-walk');const next=f.pending.current();assert.ok(f.gate.arm(next,f.args.target));assert.equal(f.gate.attempt({...f.args,intent:next}).status,'started');assert.equal(f.calls,2);assert.equal(f.gate.arm(f.args.intent,f.args.target),false);});
test('a new live request can change context after the previous launch',()=>{const f=fixture();f.gate.attempt(f.args);f.pending.clear();f.pending.request(f.args.target,'game');const i=f.pending.current();assert.ok(f.gate.arm(i,f.args.target));assert.equal(f.gate.attempt({...f.args,intent:i,context:'game'}).status,'started');});
test('a cloned request cannot replace the exact live intention',()=>{const f=fixture(),clone={...f.args.intent};assert.equal(f.gate.attempt({...f.args,intent:clone}).reason,'not-armed');assert.equal(f.calls,0);assert.equal(f.gate.arm(clone,f.args.target),false);assert.ok(Object.isFrozen(f.args.intent)&&Object.isFrozen(f.args.intent.approach));});
test('invalid construction or request metadata fails closed',()=>{
 assert.throws(()=>createInteractionStartGate());for(const options of [{positionTolerance:NaN},{positionTolerance:1},{speedTolerance:.1},{headingTolerance:1}])assert.throws(()=>fixture({options}));
 const f=fixture();for(const patch of [{id:0},{id:Infinity},{context:'gallery-preview'},{kind:'unknown'}])assert.equal(f.gate.arm({...f.args.intent,...patch},f.args.target),false);assert.equal(f.calls,0);
});
test('explicit gate cancellation preserves pending F but prevents execution',()=>{const f=fixture();f.gate.cancel();assert.equal(f.gate.attempt(f.args).reason,'not-armed');assert.ok(f.pending.current());assert.equal(f.calls,0);});
test('heading comparison handles wraparound',()=>{const f=fixture();for(const part of f.args.target.parts)for(const v of part.v){v[0]-=2;v[1]+=1;}f.args.actor.motion.heading=Math.PI;assert.equal(f.gate.attempt(f.args).status,'started');});
test('a cleared live intention cannot be substituted by a cached snapshot',()=>{const f=fixture();f.pending.clear();assert.equal(f.gate.attempt(f.args).reason,'intent-lost');assert.equal(f.calls,0);assert.equal(f.gate.arm(f.args.intent,f.args.target),false);});
test('malformed mesh data blocks execution rather than throwing',()=>{for(const part of [null,{}, {v:[null]}, {v:['bad']}, {v:[]}]){const f=fixture();f.args.target.parts[0]=part;assert.equal(f.gate.attempt(f.args).reason,'invalid-facing');assert.equal(f.calls,0);}});
