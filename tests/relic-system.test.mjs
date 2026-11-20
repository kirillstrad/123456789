import test from 'node:test';
import assert from 'node:assert/strict';
import {createRelicState} from '../src/ui/relic-state.js';
import {relicStages,relicLayout,relicTextLayout,relicHit,wrapRelic} from '../src/ui/relic-layout.js';
import {paintRelic,drawRelicText} from '../src/ui/relic-paint.js';
import {relicAlphabet,relicLetters} from '../src/ui/relic-font.js';
import {installManifest} from '../src/ui/relic.js';
import {createRelicWorld,RELIC_OBJECTS} from '../src/interaction/relic-world.js';
const goal=n=>({id:String(n),title:'OBJECTIVE '+n,text:'Defeat the warden. '+n});
const ticks=(s,n=50,reduced=false)=>{for(let i=0;i<n;i++)s.step(.1,reduced);};
const opened=()=>{const s=createRelicState();s.setObjective(goal(1));s.toggle();ticks(s);return s;};
const dialog=(id='d',transition='quiet')=>({id,speaker:'KEEPER',text:'Remember the ember.',choices:[{id:'a',label:'Ask about the ember.'},{id:'b',label:'Leave.'}],transition});
function harness({reduced=false,onChoice=()=>{}}={}){
 const listeners=new Map(),changes=[],events=[];
 const root={matchMedia:()=>({matches:reduced}),addEventListener(n,f){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f);},removeEventListener(n,f){listeners.get(n)?.delete(f);},CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail;}}};
 const canvas={width:1008,height:864,getBoundingClientRect:()=>({left:0,top:0,width:1008,height:864}),focus(){},dispatchEvent:e=>events.push(e)};
 const ui=installManifest({canvas,root,dimensions:()=>({cols:196,rows:168}),active:()=>true,onModalChange:b=>changes.push(b),onChoice});
 let now=0;
 const advance=(frames=100)=>{for(let i=0;i<frames;i++){now+=20;ui.advance(now);ui.update({phase:'playing',time:0});}};
 const emit=(type,args={})=>{
  const e={target:canvas,button:0,code:'',repeat:false,clientX:504,clientY:159*864/168,stopped:false,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...args};
  for(const f of listeners.get(type)??[])f(e);return e;
 };
 return {root,canvas,ui,changes,events,advance,emit,listeners};
}
test('quest notices stay closed and latest objective wins across burn and reversals',()=>{
 const s=createRelicState();s.setObjective(goal(1));ticks(s);assert(s.view().unread);assert.equal(s.view().shown,null);
 s.toggle();ticks(s);assert.deepEqual(s.view().shown,goal(1));assert(!s.blocking());
 s.setObjective(goal(2));assert.equal(s.view().phase,'burn');ticks(s,2);s.setObjective(goal(3));s.close();ticks(s);s.toggle();ticks(s);assert.deepEqual(s.view().shown,goal(3));
});
test('stage order and reverse travel are bounded',()=>{
 const a=relicStages(.06),b=relicStages(.22),c=relicStages(.35),d=relicStages(.75),e=relicStages(1);
 assert(a.flash>0);assert.equal(a.bolts,0);assert(b.bolts>0);assert.equal(b.lift,0);assert(c.split>0);assert.equal(c.lift,0);assert(d.lift>0);assert.equal(e.seat,1);
 const s=createRelicState();s.toggle();ticks(s,6);const before=s.view().amount;s.toggle();s.step(.1);assert(s.view().amount<before);s.toggle();ticks(s);assert.equal(s.view().amount,1);
});
test('modal lock starts before travel and persists through close animation',()=>{
 const s=createRelicState();s.openDialogue(dialog());assert(s.blocking());assert.equal(s.view().amount,0);ticks(s);s.close();assert(s.blocking());ticks(s);assert(!s.blocking());
});
test('choice confirmation emits once only after heat impulse',()=>{
 const s=opened();s.openDialogue(dialog());ticks(s);assert(s.confirm(1));assert(!s.confirm(0));assert.equal(s.takeChoice(),null);
 ticks(s,3);assert.deepEqual(s.takeChoice(),{dialogueId:'d',choiceId:'b',index:1});assert.equal(s.takeChoice(),null);assert(s.blocking());ticks(s);assert(!s.blocking());
});
test('quiet, burn and instant document transitions remain distinct',()=>{
 const s=createRelicState();s.openDialogue(dialog());ticks(s);s.openDialogue(dialog('second'));assert.equal(s.view().docPhase,'quiet');assert.equal(s.view().dialogue.id,'second');
 ticks(s);s.openDialogue(dialog('third','burn'));assert.equal(s.view().dialogue.id,'second');assert.equal(s.view().docPhase,'burn');ticks(s,7);assert.equal(s.view().dialogue.id,'third');assert.equal(s.view().docPhase,'assemble');
 ticks(s);s.openDialogue(dialog('fourth','instant'));assert.equal(s.view().docPhase,'idle');assert.equal(s.view().dialogue.id,'fourth');
});
test('closing during burn does not release modal lock early or dereference missing document',()=>{
 const s=createRelicState();s.openDialogue(dialog());ticks(s);s.openDialogue(dialog('next','burn'));s.close();s.step(.1);assert(s.blocking());ticks(s);assert(!s.blocking());
});
test('objective update waits behind conversation and appears after closing',()=>{
 const s=opened();s.openDialogue(dialog());ticks(s);s.setObjective(goal(2));assert.deepEqual(s.view().shown,goal(1));s.close();ticks(s);s.toggle();ticks(s);assert.deepEqual(s.view().shown,goal(2));
});
test('reading pages retain every word and navigation clamps at both ends',()=>{
 const s=createRelicState(),text=Array.from({length:400},(_,i)=>'WORD'+i).join(' ');s.openReading({title:'INSCRIPTION',text});ticks(s);
 const t=relicTextLayout(196,168,1008,864,s.view());assert(t.pages.length>1);assert.equal(t.pages.flat().join(' ').replace(/\s+/g,' '),text);
 s.turnPage(-1,t.pages.length);assert.equal(s.view().page,0);for(let i=0;i<999;i++)s.turnPage(1,t.pages.length);assert.equal(s.view().page,t.pages.length-1);
 assert.equal(wrapRelic('ABCDEFGHIJK',3).join(''),'ABCDEFGHIJK');
});
test('modal geometry interpolates instead of jumping between quest and conversation',()=>{
 const s=opened(),a=relicLayout(196,168,s.view());s.openDialogue(dialog());const b=relicLayout(196,168,s.view());assert.equal(a.width,b.width);
 s.step(.1);const c=relicLayout(196,168,s.view());ticks(s);const d=relicLayout(196,168,s.view());assert(c.width>a.width&&c.width<d.width);assert.equal(a.gemY,d.gemY);
 const hit=relicHit(196,168,s.view(),98,d.choiceTop+2);assert.deepEqual(hit,{kind:'choice',index:0});
});
test('reduced motion settles travel, text and choice impulse',()=>{
 const s=createRelicState();s.openDialogue(dialog());s.step(0,true);assert.equal(s.view().amount,1);assert.equal(s.view().spread,1);assert(s.confirm(0));s.step(0,true);assert(s.takeChoice());s.step(0,true);assert(!s.blocking());
});
test('invalid input fails atomically and snapshots are isolated',()=>{
 const s=opened(),before=s.view();assert.throws(()=>s.openDialogue({...dialog(),transition:'unknown'}));assert.throws(()=>s.openDialogue({...dialog(),choices:[{id:'x',label:'A'},{id:'x',label:'B'}]}));assert.deepEqual(s.view(),before);
 const v=s.view();v.shown.text='changed';assert.notEqual(s.view().shown.text,'changed');for(const dt of [-1,NaN,Infinity])s.step(dt);assert.deepEqual(s.view(),before);
});
test('embedded English alphabet renders without system fonts',()=>{
 for(const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')assert(relicAlphabet[letter]);let pixels=0;relicLetters({fillRect(){pixels++;}},'THE ASH KEEPER',0,0,1.3,true);assert(pixels>100);
});
test('raster and glyph rendering are deterministic and do not mutate state',()=>{
 const s=opened(),v=s.view(),before=JSON.stringify(v),a=new Uint8ClampedArray(196*168*4),b=new Uint8ClampedArray(a.length);paintRelic(a,196,168,v,2);paintRelic(b,196,168,v,2);assert.deepEqual(a,b);assert(a.some(x=>x));
 let pixels=0;const ctx={canvas:{width:1008},save(){},restore(){},beginPath(){},rect(){},clip(){},fillRect(){pixels++;}};drawRelicText(ctx,196,168,864,v);assert(pixels>0);assert.equal(JSON.stringify(v),before);
});
test('animation progresses on UI time while world time remains frozen',()=>{
 const h=harness();h.root.__ASH_MANIFEST__.openDialogue(dialog());assert(h.ui.blocking());h.advance();assert.equal(h.root.__ASH_MANIFEST__.state().amount,1);assert.deepEqual(h.changes,[true]);
 h.root.__ASH_MANIFEST__.close();h.advance();assert(!h.ui.blocking());assert.deepEqual(h.changes,[true,false]);h.ui.dispose();
});
test('movement pressed or held across a modal cannot replay until key release',()=>{
 const h=harness();h.emit('keydown',{code:'KeyW'});h.root.__ASH_MANIFEST__.openReading({title:'STONE',text:'READ THIS.'});assert(h.emit('keydown',{code:'ShiftLeft'}).stopped);h.ui.dismiss();
 assert(h.emit('keydown',{code:'KeyW',repeat:true}).stopped);assert(h.emit('keydown',{code:'ShiftLeft',repeat:true}).stopped);
 h.emit('keyup',{code:'KeyW'});assert(!h.emit('keydown',{code:'KeyW'}).stopped);h.ui.dispose();
});
test('modal blocks canvas clicks outside the panel; quest does not',()=>{
 const h=harness();assert(!h.emit('pointerdown',{clientX:0,clientY:0}).stopped);h.root.__ASH_MANIFEST__.openDialogue(dialog());assert(h.emit('pointerdown',{clientX:0,clientY:0}).stopped);h.ui.dispose();
});
test('confirmation event reaches game callback once and UI listeners dispose',()=>{
 const choices=[],h=harness({onChoice:e=>choices.push(e)});h.root.__ASH_MANIFEST__.openDialogue(dialog());h.advance();h.emit('keydown',{code:'Enter'});h.emit('keydown',{code:'Enter'});h.advance(20);assert.equal(choices.length,1);assert.equal(h.events.length,1);assert.equal(choices[0].choiceId,'a');h.ui.dispose();for(const values of h.listeners.values())assert.equal(values.size,0);
});
test('in-world NPC branches, conditions, objective effects, duplicate rejection and reset',()=>{
 const docs=[],goals=[],map={circles:[],rects:[]};const w=createRelicWorld({map,openDialogue:v=>{docs.push(v);return true;},openReading:()=>true,setObjective:v=>goals.push(v)});
 assert(w.press({phase:'playing',x:6.8,y:10.4}));assert.equal(docs.at(-1).speaker,'THE ASH KEEPER');
 const e={dialogueId:docs.at(-1).id,choiceId:'vow'};assert(w.choose(e));assert(!w.choose(e));assert.equal(goals.length,1);assert(w.snapshot().flags.includes('vow'));
 w.cancel();w.press({phase:'playing',x:6.8,y:10.4});assert(!docs.at(-1).choices.some(c=>c.id==='vow'));w.reset();assert.equal(w.snapshot().flags.length,0);assert.equal(map.circles.length,2);
});
test('in-world tablet opens real reading mode and walls prevent remote interaction',()=>{
 const readings=[],map={circles:[],rects:[]};const w=createRelicWorld({map,openDialogue:()=>true,openReading:v=>{readings.push(v);return true;},setObjective(){}});
 assert(w.press({phase:'playing',x:10.4,y:12.2}));assert.equal(readings[0].id,'nave.ember-inscription');assert(readings[0].text.includes('WARDEN'));
 assert(!w.press({phase:'playing',x:30,y:20}));assert(!w.press({phase:'playing',x:10.4,y:12.2,dash:{}}));
 map.rects.push({minX:6.4,maxX:7.2,minY:10.8,maxY:11});assert.equal(w.nearest({phase:'playing',x:6.8,y:10.4}),null);
 assert(RELIC_OBJECTS.every(o=>w.parts({phase:'playing',x:o.x+1,y:o.y}).some(p=>p.kind===3)));
});

test('NPC -> heat -> significant node -> close remains modal without an intermediate unlock',()=>{
 let world;const h=harness({onChoice:e=>world.choose(e)}),api=h.root.__ASH_MANIFEST__;
 world=createRelicWorld({map:{circles:[],rects:[]},openDialogue:v=>api.openDialogue(v),openReading:v=>api.openReading(v),setObjective:v=>api.setObjective(v)});
 assert(world.press({phase:'playing',x:6.8,y:10.4}));h.advance();h.emit('keydown',{code:'ArrowDown'});h.emit('keydown',{code:'Enter'});h.advance(100);
 assert.equal(api.state().dialogue.id,'nave.ash-keeper:vow');assert.deepEqual(h.changes,[true]);assert(api.state().wanted.text.includes('reclaim'));
 h.emit('keydown',{code:'Enter'});h.advance(100);assert.deepEqual(h.changes,[true,false]);h.ui.dispose();
});

test('main simulation gate freezes world and drops prequeued commands while modal',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL('../src/app/main.js',import.meta.url),'utf8');
 const line=source.split('\n').find(s=>s.startsWith('const updateAt=performance.now();'));
 assert(line);assert(source.includes('manifest?.advance(performance.now())'));assert(source.includes('targeting.clear();relicWorld?.reset();manifest?.reset();'));
 const run=new Function('manifest','commands','keys',`
  const performance={now:()=>0};let attacks=0,steps=0,acc=1/60,simLast=0;
  const now=17,frozen=false,aimPoint=null,combatDoor={cancel(){}},world={dash(){attacks++;},sweep(){attacks++;},attack(){attacks++;}};
  const movementInput=()=>({x:1,y:0}),unpr=()=>null,stepWorld=()=>{steps++;};
  ${line}
  return {attacks,steps,acc,queued:commands.length,held:keys.size};
 `);
 const modal=run({blocking:()=>true},[{kind:'dash'}],new Set(['KeyW']));assert.deepEqual(modal,{attacks:0,steps:0,acc:0,queued:0,held:0});
 const running=run({blocking:()=>false},[{kind:'light'}],new Set(['KeyW']));assert.equal(running.attacks,1);assert(running.steps>0);
});
