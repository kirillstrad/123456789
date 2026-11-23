import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createSceneHost} from '../src/app/scene-host.js';
import {LEVELS,covered,menuRects} from '../src/ui/throne-menu.js';
let serial=0;
async function fixture(fn,scenes){
 const names=['document','window','localStorage','matchMedia','location','__ASH_SCENES__','__ASH_LEVELS__','__ASH_GALLERY__'],old=Object.fromEntries(names.map(k=>[k,globalThis[k]])),wh={},ch={};
 const canvas=()=>{const c={width:1008,height:864,focus(){},addEventListener:(k,f)=>{ch[k]=f;},getBoundingClientRect:()=>({left:0,top:0,width:1008,height:864})};const g=new Proxy({canvas:c,getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:()=>{}});c.getContext=()=>g;return c;};
 try{
  globalThis.document={createElement:canvas,getElementById:()=>null};globalThis.window={addEventListener:(k,f)=>{wh[k]=f;}};globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.matchMedia=()=>({matches:false});globalThis.location={search:''};
  delete globalThis.__ASH_LEVELS__;delete globalThis.__ASH_GALLERY__;if(scenes)globalThis.__ASH_SCENES__=scenes;else delete globalThis.__ASH_SCENES__;
  const api={mode:()=>'menu',state:()=>({phase:'playing'}),start(){},resume(){},pause(){}},m=await import('../src/ui/throne-menu.js?menu22='+serial++),cv=canvas();m.throneMenu(cv.getContext('2d'),api);
  const event=o=>({...o,target:{matches:()=>false},repeat:false,preventDefault(){},stopImmediatePropagation(){}});
  await fn({key:code=>wh.keydown(event({code})),click:i=>ch.pointerdown(event({clientX:504,clientY:415+i*49,button:0})),menu:()=>window.__ASH_THRONE__});
 }finally{for(const k of names)if(old[k]===undefined)delete globalThis[k];else globalThis[k]=old[k];}
}
const open=f=>{f.menu().levels();for(let i=0;i<3;i++)f.key('ArrowDown');};
test('prologue is the fourth level choice and fits the existing menu font and hitboxes',()=>{assert.deepEqual([...LEVELS],['TEST CHAMBER','THE ASHEN NAVE','OBJECT GALLERY','THE LAST SERVICE','BACK']);for(const s of [...LEVELS,'PROLOGUE UNAVAILABLE','PROLOGUE BUSY','PROLOGUE COULD NOT START','THE BURIAL WING AND THE LOWER CHAPEL'])assert.ok(covered(s),s);assert.ok(menuRects(LEVELS.length).at(-1).y+43<641);});
test('keyboard route starts the hosted prologue once and leaves Continue disabled',()=>{const calls=[];return fixture(async f=>{f.menu().levels();assert.deepEqual(f.menu().choices(),[...LEVELS]);for(let i=0;i<3;i++)f.key('ArrowDown');f.key('Enter');assert.deepEqual(calls,['last-service']);assert.equal(f.menu().state().page,'main');assert.equal(f.menu().state().hasRun,false);},{list:()=>['last-service'],start(id){calls.push(id);return true;}});});
test('pointer route starts the same hosted prologue',()=>{const calls=[];return fixture(async f=>{f.menu().levels();f.click(3);assert.deepEqual(calls,['last-service']);},{list:()=>['last-service'],start(id){calls.push(id);return true;}});});
test('unavailable, unregistered and busy prologue show a notice and keep the menu usable',async()=>{
 await fixture(async f=>{open(f);f.key('Enter');assert.equal(f.menu().state().page,'notice');assert.deepEqual(f.menu().choices(),['BACK']);f.key('Enter');assert.equal(f.menu().state().page,'main');});
 let starts=0;await fixture(async f=>{open(f);f.key('Enter');assert.equal(f.menu().state().page,'notice');assert.equal(starts,0);},{list:()=>[],start(){starts++;return true;}});
 await fixture(async f=>{open(f);f.key('Enter');assert.equal(f.menu().state().page,'notice');},{list:()=>['last-service'],start:()=>false});
});
test('failed prologue startup is reported and returns the menu to a notice page',()=>fixture(async f=>{open(f);assert.throws(()=>f.key('Enter'),/mount failed/);assert.equal(f.menu().state().page,'notice');assert.equal(f.menu().state().hasRun,false);},{list:()=>['last-service'],start(){throw Error('mount failed');}}));
function ornaments(fail=false){
 let paused=0,opened=0,mode='menu';const canvas={width:1008,height:864,focus(){}},out={canvas},mounts=[];
 const window={__ASH_ITERATION_2__:{pause(){paused++;mode='pause';},mode:()=>mode,state:()=>({phase:'playing'}),start(){},resume(){}},__ASH_THRONE__:{open(){opened++;}}},document={documentElement:{dataset:{}},createElement:()=>({getContext:()=>({})}),getElementById:()=>({textContent:''})};
 const source=fs.readFileSync('src/ui/ornaments.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 const context=vm.createContext({window,document,createSceneHost,performance:{now:()=>0},throneMenu(){},mountLastService(options){if(fail)throw Error('mount failed');const scene={disposed:0,frame(){},dispose(){scene.disposed++;}};mounts.push({options,scene});return scene;}});
 vm.runInContext(source+';globalThis.make=makeUI;',context);return {ui:context.make(out,()=>{}),window,canvas,mounts,counts:()=>({paused,opened})};
}
test('real UI registers the hosted prologue on the shared canvas and exit returns to the menu',()=>{const f=ornaments(),scenes=f.window.__ASH_SCENES__;assert.ok(scenes.list().includes('last-service'));assert.equal(scenes.start('last-service'),true);assert.equal(scenes.current(),'last-service');const {options,scene}=f.mounts[0];assert.equal(f.mounts.length,1);assert.equal(options.canvas,f.canvas);assert.equal(options.hosted,true);assert.equal(typeof options.onExit,'function');assert.equal(scenes.start('last-service'),false);options.onExit();assert.equal(scenes.current(),null);assert.equal(scene.disposed,1);assert.deepEqual(f.counts(),{paused:1,opened:1});assert.equal(scenes.start('last-service'),true);scenes.exit();assert.equal(f.mounts[1].scene.disposed,1);f.ui.dispose();assert.equal(f.window.__ASH_SCENES__,undefined);});
test('a prologue mount failure restores the menu owner and can be retried',()=>{const f=ornaments(true),scenes=f.window.__ASH_SCENES__;assert.throws(()=>scenes.start('last-service'),/mount failed/);assert.equal(scenes.current(),null);assert.deepEqual(f.counts(),{paused:1,opened:1});assert.throws(()=>scenes.start('last-service'),/mount failed/);assert.deepEqual(f.counts(),{paused:2,opened:2});f.ui.dispose();});
test('menu wiring imports the mounted prologue and does not navigate away from the game page',()=>{const source=fs.readFileSync('src/ui/ornaments.js','utf8'),menu=fs.readFileSync('src/ui/throne-menu.js','utf8');assert.match(source,/import \{mountLastService\} from '\.\.\/app\/last-service-mounted\.js';/);assert.ok(source.includes("host.register('last-service'"));assert.ok(menu.includes("scenes.start('last-service')"));assert.ok(!menu.includes('launchLastService'));assert.ok(!menu.includes('location.assign'));});
