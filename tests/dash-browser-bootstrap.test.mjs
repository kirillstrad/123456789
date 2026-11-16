import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const script=fs.readFileSync('tools/dash-browser-check.mjs','utf8');
const desktop=fs.readFileSync('src/app/desktop-mode.js','utf8').replace(/export /g,'');
const begin=script.indexOf('try{')+4,end=script.indexOf("await page.keyboard.press('Shift')");
assert.ok(begin>=4&&end>begin,'Dash startup must precede real Shift input');
const bootstrap=script.slice(begin,end);
function harness(menu){
 let mode='menu',starts=0,placement=null,focused=false;
 const api={dash(){},mode:()=>mode,start(){mode='game';starts++;},place(...p){placement=p;}};
 const document={documentElement:{dataset:menu?{ashMenu:'throne'}:{}},head:{append(){}},createElement:()=>({})};
 const context={URLSearchParams,document,window:{__ASH_ITERATION_2__:api,addEventListener(){}},location:{search:'?desktop=1'},assert,checks:[],path:{resolve:p=>p},pathToFileURL:()=>({href:'file:///PLAY.html'})};
 vm.createContext(context);vm.runInContext(desktop,context);
 context.page={goto:async()=>vm.runInContext('installDesktop(()=>window.__ASH_ITERATION_2__.start(),()=>{});',context),waitForFunction:async fn=>assert.ok(fn()),evaluate:async fn=>fn(),locator:()=>({focus:async()=>{focused=true;}})};
 return{context,api,get mode(){return mode;},get starts(){return starts;},get placement(){return placement;},get focused(){return focused;}};
}
test('throne desktop intentionally stays in the menu until explicitly started',async()=>{const h=harness(true);await h.context.page.goto();assert.equal(h.mode,'menu');assert.equal(h.starts,0);});
test('the actual dash checker bootstrap enters gameplay before keyboard input',async()=>{const h=harness(true);await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);assert.equal(h.mode,'game');assert.equal(h.starts,1);assert.deepEqual(h.placement,[8,12,15,15]);assert.equal(h.focused,true);});
test('explicit preparation also resets an already auto-started desktop session',async()=>{const h=harness(false);await vm.runInContext('(async()=>{'+bootstrap+'})()',h.context);assert.equal(h.mode,'game');assert.equal(h.starts,2);assert.deepEqual(h.placement,[8,12,15,15]);});
test('fixture setup errors are not swallowed by the startup sequence',async()=>{const h=harness(true);h.api.start=()=>{throw Error('fixture failed');};await assert.rejects(vm.runInContext('(async()=>{'+bootstrap+'})()',h.context),/fixture failed/);});
test('directional dash remains driven by keyboard events, not a debug dash call',()=>{const input=script.slice(script.indexOf("await page.keyboard.press('Shift')"),script.indexOf('const before='));assert.ok(input.includes("page.keyboard.down('KeyW')"));assert.ok(input.includes("page.keyboard.press('Shift')"));assert.ok(input.includes('state().dash'));assert.equal(input.includes('d.dash('),false);});
