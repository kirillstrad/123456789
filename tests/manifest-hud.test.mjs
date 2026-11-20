import test from 'node:test';
import assert from 'node:assert/strict';
import {createManifestState} from '../src/ui/manifest-state.js';
import {manifestLayout,manifestHit} from '../src/ui/manifest-layout.js';
import {paintManifest,drawManifestText} from '../src/ui/manifest-paint.js';
import {installManifest} from '../src/ui/manifest.js';
const goal=(n)=>({id:String(n),title:'ЦЕЛЬ '+n,text:'Найди огонь '+n});
const advance=(s,n=40)=>{for(let i=0;i<n;i++)s.step(.1);};
const opened=()=>{const s=createManifestState();s.setObjective(goal(1));s.toggle();advance(s);return s;};

test('manifest: objective waits behind closed slab and marks the stone unread',()=>{
 const s=createManifestState();assert(s.setObjective(goal(1)));advance(s);
 assert.equal(s.view().amount,0);assert.equal(s.view().shown,null);assert(s.view().unread);
 s.toggle();advance(s);assert.deepEqual(s.view().shown,goal(1));assert(!s.view().unread);assert.equal(s.view().phase,'idle');
});
test('manifest: update burns old text before assembling new text',()=>{
 const s=opened();s.setObjective(goal(2));assert.equal(s.view().phase,'burn');assert.deepEqual(s.view().shown,goal(1));
 advance(s,7);assert.equal(s.view().phase,'assemble');assert.deepEqual(s.view().shown,goal(2));
 advance(s);assert.equal(s.view().phase,'idle');
});
test('manifest: updates during burn coalesce into the latest objective',()=>{
 const s=opened();s.setObjective(goal(2));advance(s,2);s.setObjective(goal(3));s.setObjective(goal(4));advance(s);
 assert.deepEqual(s.view().shown,goal(4));assert.equal(s.view().phase,'idle');
});
test('manifest: repeated clicks reverse travel and do not corrupt text state',()=>{
 const s=createManifestState();s.setObjective(goal(1));s.toggle();advance(s,3);s.toggle();advance(s);assert.equal(s.view().amount,0);
 s.toggle();advance(s);assert.deepEqual(s.view().shown,goal(1));
 s.setObjective(goal(2));s.close();advance(s);s.toggle();advance(s);assert.deepEqual(s.view().shown,goal(2));
});
test('manifest: reduced motion skips transitions without auto-opening',()=>{
 const s=createManifestState();s.setObjective(goal(1));s.step(0,true);assert.equal(s.view().amount,0);
 s.toggle();s.step(0,true);assert.equal(s.view().amount,1);assert.deepEqual(s.view().shown,goal(1));
 s.setObjective(goal(2));s.step(0,true);assert.deepEqual(s.view().shown,goal(2));assert.equal(s.view().phase,'idle');
});
test('manifest: dialogue choice emits once and retains the latest objective',()=>{
 const s=opened();s.openDialogue({id:'d',speaker:'ХРАНИТЕЛЬ',text:'Выбери.',choices:[{id:'a',label:'Остаться'},{id:'b',label:'Уйти'}]});advance(s);
 s.setObjective(goal(2));assert.equal(s.view().dialogue.id,'d');
 assert.deepEqual(s.choose(1),{dialogueId:'d',choiceId:'b',index:1});assert.equal(s.choose(1),null);
 advance(s);s.toggle();advance(s);assert.deepEqual(s.view().shown,goal(2));
});
test('manifest: malformed requests fail without replacing current state',()=>{
 const s=opened(),before=s.view();assert.throws(()=>s.setObjective({text:'x'}));
 assert.throws(()=>s.openDialogue({text:'x',choices:[{id:'x',label:'A'},{id:'x',label:'B'}]}));
 assert.deepEqual(s.view(),before);assert.equal(s.setObjective(goal(1)),false);
});
test('manifest: state snapshots own arrays and reset removes dialogue and unread state',()=>{
 const s=opened();s.openDialogue({text:'x',choices:[{label:'A'}]});
 const v=s.view();v.dialogue.choices[0].label='mutated';assert.equal(s.view().dialogue.choices[0].label,'A');
 s.reset();assert.equal(s.view().amount,0);assert.equal(s.view().dialogue,null);assert(!s.view().unread);
});
test('manifest: invalid time never moves the slab',()=>{
 const s=createManifestState();s.toggle();const v=s.view();for(const dt of [NaN,Infinity,-1])s.step(dt);assert.deepEqual(s.view(),v);
});
test('manifest: gem stays fixed while the slab rises and dialogue expands',()=>{
 const s=createManifestState(),a=manifestLayout(196,168,s.view());s.toggle();advance(s);const b=manifestLayout(196,168,s.view());
 assert.equal(a.gemY,b.gemY);assert(b.top<a.top);assert.equal(manifestHit(196,168,s.view(),98,b.gemY).kind,'gem');
 s.openDialogue({text:'x',choices:[{id:'a',label:'A'}]});advance(s);const d=manifestLayout(196,168,s.view());assert(d.width>b.width);assert(d.height>b.height);
 const hit=manifestHit(196,168,s.view(),98,d.top+d.height-5-5+2);assert.deepEqual(hit,{kind:'choice',index:0});
 assert.equal(manifestHit(196,168,s.view(),0,0),null);
});
test('manifest: raster drawing is bounded deterministic and snapshot-pure',()=>{
 const s=opened(),v=s.view(),before=JSON.stringify(v),a=new Uint8ClampedArray(196*168*4),b=new Uint8ClampedArray(a.length);
 paintManifest(a,196,168,v,2);paintManifest(b,196,168,v,2);assert.deepEqual(a,b);assert(a.some(n=>n>0));assert.equal(JSON.stringify(v),before);
});
test('manifest: text draws Cyrillic on the existing context without changing model',()=>{
 const s=opened(),v=s.view(),texts=[],ctx={canvas:{width:1008},save(){},restore(){},beginPath(){},rect(){},clip(){},fillRect(){},measureText(t){return {width:[...t].length*8};},fillText(t){texts.push(t);}};
 const before=JSON.stringify(v);drawManifestText(ctx,196,168,864,v);assert(texts.length>0);assert.equal(JSON.stringify(v),before);
});
test('manifest: input consumes UI clicks only and disposal restores prior API',()=>{
 const handlers={},old={old:true},root={__ASH_MANIFEST__:old,addEventListener(n,fn){handlers[n]=fn;},removeEventListener(n,fn){if(handlers[n]===fn)delete handlers[n];},matchMedia(){return {matches:false};}};
 let isActive=true,stops=0,prevented=0;
 const canvas={getBoundingClientRect:()=>({left:0,top:0,width:1008,height:864}),focus(){},dispatchEvent(){}};
 const controller=installManifest({canvas,dimensions:()=>({cols:196,rows:168}),active:()=>isActive,root});
 const event={target:canvas,button:0,clientX:504,clientY:159*864/168,preventDefault(){prevented++;},stopImmediatePropagation(){stops++;}};
 handlers.pointerdown(event);assert(root.__ASH_MANIFEST__.state().opened);assert.equal(stops,1);assert.equal(prevented,1);
 handlers.pointerdown({...event,clientX:0,clientY:0});assert.equal(stops,1);
 isActive=false;handlers.pointerdown(event);assert.equal(stops,1);
 controller.dispose();assert.equal(root.__ASH_MANIFEST__,old);assert.equal(handlers.pointerdown,undefined);
});
