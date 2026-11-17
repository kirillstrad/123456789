import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const app=fs.readFileSync('src/app/main.js','utf8');
const advance=app.match(/^function advanceWorld\(seconds\)\{[\s\S]*?^\}/m)?.[0];
assert.ok(advance,'explicit app manual advance function');
const active=app.match(/active:(\(\)=>mode==='game'&&\(!frozen\|\|manualAdvance\))/)?.[1];
assert.ok(active,'manual advance participates only in the game controller gate');
assert.ok(app.includes('advance:advanceWorld'));
function harness(){
 const c=vm.createContext({});
 vm.runInContext(`let mode='game',frozen=true,manualAdvance=false,simLast=42,acc=.5,calls=0,fail=false;const document={hidden:false};const active=${active};function stepWorld(dt){if(!active())throw Error('inactive');calls++;if(fail)throw Error('tick failure');}
 ${advance}
 globalThis.p={advance:advanceWorld,mode:v=>mode=v,hidden:v=>document.hidden=v,fail:v=>fail=v,read:()=>({mode,frozen,manualAdvance,simLast,acc,calls,active:active()})};`,c);
 return c.p;
}
test('explicit frozen advance executes fixed ticks and leaves freeze in place',()=>{const p=harness();assert.equal(p.read().active,false);assert.equal(p.advance(.08),true);assert.equal(p.read().calls,5);assert.equal(p.read().frozen,true);assert.equal(p.read().manualAdvance,false);assert.equal(p.read().active,false);assert.equal(p.read().simLast,null);assert.equal(p.read().acc,0);});
test('manual advance cannot run in menu pause gallery or hidden document',()=>{for(const mode of ['menu','pause','gallery','dead','won']){const p=harness();p.mode(mode);assert.equal(p.advance(1),false);assert.equal(p.read().calls,0);}const p=harness();p.hidden(true);assert.equal(p.advance(1),false);assert.equal(p.read().calls,0);});
test('tick failure restores gate and timing without unfreezing',()=>{const p=harness();p.fail(true);assert.throws(()=>p.advance(1),/tick failure/);assert.equal(p.read().manualAdvance,false);assert.equal(p.read().frozen,true);assert.equal(p.read().active,false);assert.equal(p.read().simLast,null);assert.equal(p.read().acc,0);});
test('invalid manual durations are rejected before ticking',()=>{const p=harness();for(const value of [NaN,Infinity,-1,121,'1'])assert.throws(()=>p.advance(value),/Invalid manual advance/);assert.equal(p.read().calls,0);assert.equal(p.advance(0),true);assert.equal(p.read().calls,0);});
