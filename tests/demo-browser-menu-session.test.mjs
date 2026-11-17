import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('tools/demo-browser-check.mjs','utf8');
const menu=fs.readFileSync('src/ui/throne-menu.js','utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
const begin=source.indexOf('try{')+4,end=source.indexOf("for(const chain of ['LLL','LLH','HH'])");
assert.ok(begin>=4&&end>begin);
const bootstrap=source.slice(begin,end);
// Real menu installation/keyboard handler; rendering and browser transport are stubs.
function harness(){
 let mode='menu',starts=0,resumes=0,handler=null;const state={phase:'playing',execution:null},browserCalls=[];
 const api={build:'ASH_IRON_DEMO_4BC',mode:()=>mode,state:()=>state,executionEffects(){},start(){mode='game';starts++;state.execution=null;},pause(){if(mode==='game')mode='pause';},resume(){mode='game';resumes++;}};
 const canvas={addEventListener(){},focus(){},matches:()=>false},elements=new Map();
 const context={api,out:{canvas},URLSearchParams,location:{search:'?desktop=1'},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),ASCII:class{},window:{__ASH_ITERATION_2__:api,addEventListener:(name,fn)=>{if(name==='keydown')handler=fn;}},document:{createElement:()=>({}),getElementById:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);}},assert,checks:[],path:{resolve:p=>p},pathToFileURL:()=>({href:'file:///PLAY.html'})};
 vm.createContext(context);vm.runInContext(menu,context);
 const key=code=>handler({code,target:canvas,repeat:false,preventDefault(){},stopImmediatePropagation(){}});
 context.page={clock:{install:async()=>{browserCalls.push('clock.install');},pauseAt:async instant=>{assert.ok(Number.isFinite(instant.getTime()),'clock pause requires a valid date');assert.equal(mode,'game');assert.equal(context.window.__ASH_THRONE__.state().hasRun,true);browserCalls.push('clock.pauseAt');}},goto:async()=>{browserCalls.push('goto');return vm.runInContext('install(out,api);app.cpuMs=1;',context);},waitForFunction:async fn=>assert.ok(fn(),'bootstrap readiness condition'),evaluate:async fn=>fn(),locator:()=>({focus:async()=>canvas.focus()}),keyboard:{press:async code=>key(code)}};
 return{context,api,state,key,browserCalls,get mode(){return mode;},get starts(){return starts;},get resumes(){return resumes;}};
}
test('reproduces old API-only fixture: Escape cannot resume without a menu-owned run',async()=>{const h=harness();await h.context.page.goto();h.api.start();h.state.execution={targetId:0,elapsed:1/60};h.api.pause();h.key('Escape');assert.equal(h.mode,'pause');assert.equal(h.context.window.__ASH_THRONE__.state().hasRun,false);assert.equal(h.resumes,0);});
test('actual demo startup selects NEW GAME and establishes menu ownership',async()=>{const h=harness();await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);assert.equal(h.mode,'game');assert.equal(h.starts,1);assert.equal(h.context.window.__ASH_THRONE__.state().hasRun,true);});
test('bootstrap installs clock before navigation and pauses only after menu-owned NEW GAME',async()=>{const h=harness();await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);assert.deepEqual(h.browserCalls,['clock.install','goto','clock.pauseAt']);assert.equal(h.starts,1);});
test('debug fixture resets retain ownership, and Escape resumes the same execution',async()=>{const h=harness();await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);h.api.start();const execution={targetId:0,elapsed:1/60};h.state.execution=execution;h.api.pause();h.key('Escape');assert.equal(h.mode,'game');assert.equal(h.resumes,1);assert.equal(h.starts,2);assert.equal(h.state.execution,execution);});
test('initial CONTINUE stays unavailable; fix does not weaken production menu policy',async()=>{const h=harness();await h.context.page.goto();h.key('ArrowDown');h.key('Enter');assert.equal(h.mode,'menu');assert.equal(h.starts,0);assert.equal(h.context.window.__ASH_THRONE__.state().page,'notice');});
test('browser scenario still uses Escape twice and checks pause and resume modes',()=>{const block=source.slice(source.indexOf("await fixture();await page.keyboard.press('r')"),source.indexOf('execution?.elapsed>=2.35'));assert.equal((block.match(/keyboard.press\('Escape'\)/g)??[]).length,2);assert.ok(block.includes("mode()==='pause'"));assert.ok(block.includes("mode()==='game'"));assert.ok(block.includes('ESC must resume the existing execution'));assert.equal(block.includes('.resume()'),false);});
