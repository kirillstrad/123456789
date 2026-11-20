import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('src/app/main.js','utf8');
const targeting=source.split('\n').find(line=>line.startsWith('const targeting=installFrameTargeting('));
const expression=targeting?.match(/canRequest:\(\)=>(.*)\}\);$/)?.[1];
assert.ok(expression,'extract actual canRequest expression, including modal guard and actor policy');
const evaluate=new Function('mode','manifest','interactionInputAllowed','interactionContext','galleryPlayer','world','frozen','document','commands',`return (${expression});`);
function fixture({blocked=false,permission=true,scope='game',hidden=false,frozen=false,queued=false}={}){
 const hero={id:'combat-hero'},walker={id:'gallery-hero'},calls=[];
 const allowed=args=>{calls.push(args);return permission&&!args.hidden&&!args.frozen&&!args.queued;};
 const run=()=>evaluate(scope,{blocking:()=>blocked},allowed,()=>scope,{snapshot:()=>walker},{current:hero},frozen,{hidden},queued?[{kind:'light'}]:[]);
 return {run,calls,hero,walker};
}
test('target request modal guard short-circuits actor policy',()=>{
 const f=fixture({blocked:true});assert.equal(f.run(),false);assert.equal(f.calls.length,0);
});
test('target request retains combat actor, context and permission policy',()=>{
 const f=fixture();assert.equal(f.run(),true);assert.equal(f.calls.length,1);assert.equal(f.calls[0].actor,f.hero);assert.equal(f.calls[0].mode,'game');
 assert.equal(fixture({permission:false}).run(),false);
});
test('target request retains gallery player lookup',()=>{
 const f=fixture({scope:'gallery'});assert.equal(f.run(),true);assert.equal(f.calls[0].actor,f.walker);
});
test('target request forwards hidden frozen and queued restrictions',()=>{
 for(const flag of ['hidden','frozen','queued']){const f=fixture({[flag]:true});assert.equal(f.run(),false);assert.equal(f.calls[0][flag],true);}
});
