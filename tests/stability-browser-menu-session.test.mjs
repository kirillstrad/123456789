import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('tools/stability-browser.mjs','utf8');
const menu=fs.readFileSync('src/ui/throne-menu.js','utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
const begin=source.indexOf('try{')+4,loopStart=source.indexOf('  for(const [kind,target]'),loopEnd=source.indexOf('\n  await page.evaluate(',loopStart);
assert.ok(begin>=4&&loopStart>begin&&loopEnd>loopStart);
const bootstrap=source.slice(begin,loopStart),pauseLoop=source.slice(loopStart,loopEnd);
// Real menu handler and actual checker source; browser transport and combat are fixtures.
function harness(){
 let mode='menu',starts=0,resumes=0,handler=null,escapeCount=0,pausedWaits=0;
 const state={phase:'playing',time:0,action:null};
 const api={mode:()=>mode,state:()=>state,start(){mode='game';starts++;state.time=0;state.action=null;},place(){},attack:kind=>state.action={kind,progress:.9},pause(){mode='pause';},resume(){mode='game';resumes++;}};
 const canvas={addEventListener(){},focus(){},matches:()=>false},elements=new Map();
 const context={api,out:{canvas},URLSearchParams,location:{search:'?desktop=1'},localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),ASCII:class{},window:{__ASH_ITERATION_2__:api,addEventListener:(name,fn)=>{if(name==='keydown')handler=fn;}},document:{documentElement:{dataset:{ashDesktop:'active'}},createElement:()=>({}),getElementById:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);}},assert,checks:[],path:{resolve:p=>p},pathToFileURL:()=>({href:'file:///PLAY.html'})};
 vm.createContext(context);vm.runInContext(menu,context);
 const key=code=>{if(code==='Escape')escapeCount++;handler({code,target:canvas,repeat:false,preventDefault(){},stopImmediatePropagation(){}});};
 context.page={goto:async()=>vm.runInContext('install(out,api);app.cpuMs=1;',context),waitForFunction:async(fn,arg)=>assert.ok(fn(arg),'readiness condition'),evaluate:async(fn,arg)=>fn(arg),waitForTimeout:async ms=>{if(mode==='game')state.time+=ms/1000;else pausedWaits++;},locator:()=>({focus:async()=>canvas.focus()}),keyboard:{press:async code=>key(code)}};
 return{context,api,state,key,get mode(){return mode;},get starts(){return starts;},get resumes(){return resumes;},get escapeCount(){return escapeCount;},get pausedWaits(){return pausedWaits;}};
}
test('reproduces failure: API-only stability fixtures cannot Escape-resume the new menu',async()=>{const h=harness();await h.context.page.goto();await assert.rejects(vm.runInContext('(async()=>{'+pauseLoop+'})()',h.context),/readiness condition/);assert.equal(h.mode,'pause');assert.equal(h.context.window.__ASH_THRONE__.state().hasRun,false);});
test('checker startup enters NEW GAME and establishes the resumable session',async()=>{const h=harness();await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);assert.equal(h.mode,'game');assert.equal(h.starts,1);assert.equal(h.context.window.__ASH_THRONE__.state().hasRun,true);});
test('all three original attack phases freeze and Escape-resume after startup',async()=>{const h=harness();await vm.runInContext('(async()=>{'+bootstrap+pauseLoop+'})()',h.context);assert.equal(h.mode,'game');assert.equal(h.starts,4);assert.equal(h.resumes,3);assert.equal(h.escapeCount,3);assert.equal(h.pausedWaits,3);assert.equal(h.context.checks.length,4);});
test('pause loop retains real Escape, exact frozen-state equality and mode assertion',()=>{assert.ok(pauseLoop.includes("keyboard.press('Escape')"));assert.ok(pauseLoop.includes('JSON.stringify'));assert.ok(pauseLoop.includes(')),before)'));assert.ok(pauseLoop.includes("mode()==='game'"));assert.equal(pauseLoop.includes('.resume()'),false);});
test('held-key blur and measurement checks are preserved',()=>{const tail=source.slice(loopEnd);for(const text of ["keyboard.down('KeyW')","window.dispatchEvent(new Event('blur'))",'Math.hypot(later.x-stopped.x,later.y-stopped.y)<1e-6','observed.frames.length>=10','assert.deepEqual(observed.errors,[])'])assert.ok(tail.includes(text));});
test('startup does not make initial CONTINUE available without a real run',async()=>{const h=harness();await h.context.page.goto();h.key('ArrowDown');h.key('Enter');assert.equal(h.mode,'menu');assert.equal(h.starts,0);assert.equal(h.context.window.__ASH_THRONE__.state().page,'notice');});
