import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createSceneScope} from '../src/app/scene-scope.js';
class Target{
 constructor(){this.events=[];this.children=[];this.style={};this.textContent='';}
 addEventListener(type,fn,o){this.events.push({type,fn,cap:typeof o==='boolean'?o:!!o?.capture});}
 removeEventListener(type,fn,o){const cap=typeof o==='boolean'?o:!!o?.capture;this.events=this.events.filter(r=>r.type!==type||r.fn!==fn||r.cap!==cap);}
 append(...children){for(const c of children){c.parent=this;this.children.push(c);}}
 contains(n){return this===n||this.children.some(c=>c.contains(n));}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
 setAttribute(){}focus(){}getContext(){return {fillRect(){}};}
 emit(type,extra={}){const e={type,target:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.immediate=true;},...extra};for(const r of [...this.events].filter(r=>r.type===type).sort((a,b)=>Number(b.cap)-Number(a.cap))){if(e.immediate)break;r.fn(e);}return e;}
}
function fixture(){const window=new Target(),document={body:new Target(),createElement:()=>new Target()},canvas=new Target();window.location={hash:'#last-service-test'};return {window,document,canvas};}
test('scope disposal restores listeners, owned DOM and globals without duplicate cleanup',()=>{const f=fixture(),s=createSceneScope({...f,hosted:true}),node=new Target();f.document.body.append(node);s.ownNode(node);f.window.api='main';s.setGlobal(f.window,'api','scene');let n=0;s.listen(f.window,'blur',()=>n++);f.window.emit('blur');s.dispose();s.dispose();f.window.emit('blur');assert.equal(n,1);assert.equal(f.window.api,'main');assert.equal(f.window.events.length,0);assert.equal(f.document.body.children.length,0);});
test('hosted routing blocks main bubble handlers and honours modal capture priority',()=>{const f=fixture();let old=0;f.window.addEventListener('keydown',()=>old++);const s=createSceneScope({...f,hosted:true}),calls=[];s.listen(f.window,'keydown',()=>calls.push('game'));s.listen(f.window,'keydown',e=>{calls.push('modal');e.stopImmediatePropagation();},true);f.window.emit('keydown',{code:'Enter'});assert.deepEqual(calls,['modal']);assert.equal(old,0);s.dispose();f.window.emit('keydown',{code:'Enter'});assert.equal(old,1);});
test('scope blocks outside controls, preserves own controls and browser modifier shortcuts',()=>{const f=fixture(),s=createSceneScope({...f,hosted:true}),b=new Target();b.closest=()=>b;assert.equal(f.window.emit('click',{target:b}).defaultPrevented,true);s.ownNode(b);assert.equal(f.window.emit('click',{target:b}).defaultPrevented,false);assert.equal(f.window.emit('keydown',{code:'KeyR',ctrlKey:true}).defaultPrevented,false);s.dispose();});
test('partial globals and throwing cleanup cannot leave resources owned',()=>{const f=fixture(),s=createSceneScope(f);f.window.api='main';assert.throws(()=>s.trackGlobal(f.window,'api',()=>{f.window.api='partial';throw Error('setup');}));let done=false;s.defer(()=>done=true);s.defer(()=>{throw Error('cleanup');});assert.throws(()=>s.dispose(),AggregateError);assert.equal(f.window.api,'main');assert.equal(done,true);});
function loading(f,{scope=null,renderFailure=false}={}){
 const source=fs.readFileSync('src/ui/last-service-loading-screen.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 let active=false,cancelled=0;const ctx=vm.createContext({...f,createLastServiceThresholdRenderer(){if(renderFailure)throw Error('renderer');return {reset(){},paint:()=>true};},createLastServiceTransition:({onClose})=>({active:()=>active,snapshot:()=>active?{id:'wing',preview:false}:null,start(){active=true;return true;},cancel(){cancelled++;if(active){active=false;onClose();}},close(){active=false;onClose();},painted(){},fail(){}})});
 vm.runInContext(source+';globalThis.make=createLastServiceLoadingScreen;',ctx);return {ui:ctx.make({scope,captureHero:()=>({})}),cancelled:()=>cancelled};
}
test('loading dispose works without a scope and cannot reopen detached UI',()=>{const f=fixture(),a=loading(f);assert.equal(f.window.events.length,1);a.ui.start('wing');a.ui.dispose();a.ui.dispose();assert.equal(a.cancelled(),1);assert.equal(f.window.events.length,0);assert.equal(f.document.body.children.length,0);assert.equal(a.ui.active(),false);assert.equal(a.ui.start('wing'),false);});
test('scoped loading UI is released on scene cleanup',()=>{const f=fixture(),scope=createSceneScope({...f,hosted:true}),a=loading(f,{scope});scope.defer(()=>a.ui.dispose());a.ui.start('wing');scope.dispose();assert.equal(a.cancelled(),1);assert.equal(f.document.body.children.length,0);assert.equal(f.window.events.length,0);});
test('scope cleans an overlay if its renderer constructor fails',()=>{const f=fixture(),scope=createSceneScope({...f,hosted:true});assert.throws(()=>loading(f,{scope,renderFailure:true}),/renderer/);scope.dispose();assert.equal(f.document.body.children.length,0);assert.equal(f.window.events.length,0);});
test('inspection panel uses scene-owned buttons and disappears on dispose',()=>{const f=fixture(),scope=createSceneScope(f),source=fs.readFileSync('src/ui/last-service-test-panel.js','utf8').replace(/^export /gm,''),ctx=vm.createContext({...f,URLSearchParams});vm.runInContext(source+';globalThis.make=installLastServiceTestPanel;',ctx);const p=ctx.make({scope,jump(){},preview(){},restart(){}});assert.ok(p);const buttons=p.children.filter(n=>n.events.length);assert.ok(buttons.length>0);scope.dispose();assert.ok(buttons.every(b=>b.events.length===0));assert.equal(f.document.body.children.length,0);});
