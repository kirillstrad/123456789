import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {bindGalleryDoorInteraction} from '../src/interaction/gallery-door-binding.js';
import {auditDoorSample,bindingProbe} from '../tools/door-visual-check.mjs';

// Actual binding, state, motion and effect bridge; lifecycle/scene/refresh are probes.
// Physical actor replacement is covered separately by gallery-player-collider-refresh.
function fixture({refresh=true}={}){
 let revision=0,angle=0,committed=false,alive=true,fail=false,steps=0,disposed=0;
 const queue=[],log=[],updates=[],closed=[{tag:'closed'}],open=[{tag:'open'}];
 const scene={getTarget(){if(!alive)throw Error('scene disposed');return{id:'prison-door.a'};},getCollisionRevision:()=>revision,getColliders:()=>committed?open:closed,setPrisonDoorAngle:value=>{angle=value;log.push('angle');},openPrisonDoorPassage:s=>{assert.equal(s.status,'open');assert.equal(angle,-90);if(committed)return false;committed=true;revision++;log.push('commit');return true;}};
 const lifecycle={step(){steps++;log.push('step');},snapshot:()=>({}),interaction:()=>null,finishInteraction:()=>false,drainInteractionEvents:()=>queue.splice(0),dispose(){disposed++;queue.length=0;}};
 const replace=source=>{log.push('refresh:'+revision);if(fail)throw Error('replacement failed');updates.push(source);return true;};
 const owner=bindGalleryDoorInteraction(lifecycle,scene,refresh?replace:null);
 function effect(){queue.push({type:'interaction-start',id:7,intentId:8,targetId:'prison-door.a'},{type:'interaction-effect',id:7,intentId:8,targetId:'prison-door.a'});}
 return{owner,scene,lifecycle,replace,effect,updates,log,setRevision:value=>revision=value,fail:()=>fail=true,close:()=>alive=false,get revision(){return revision;},get committed(){return committed;},get steps(){return steps;},get disposed(){return disposed;}};
}
const tick=(f,n)=>{for(let i=0;i<n;i++)f.owner.step(1/60);};
function finish(f){f.effect();tick(f,1);tick(f,72);}

test('initial grid sync precedes movement and repeats only for a new revision',()=>{const f=fixture();tick(f,10);assert.equal(f.updates.length,1);assert.deepEqual(f.log.slice(0,2),['refresh:0','step']);f.setRevision(2);tick(f,1);assert.equal(f.updates.length,2);assert.deepEqual(f.log.slice(-2),['refresh:2','step']);});
test('closed and opening states do not commit passage early',()=>{const f=fixture();f.effect();tick(f,1);assert.equal(f.owner.doorMotion().angle,0);tick(f,71);assert.equal(f.owner.doorMotion().status,'opening');assert.equal(f.committed,false);assert.equal(f.revision,0);assert.equal(f.updates.length,1);});
test('endpoint publishes angle then commits scene and refreshes the same owner before next movement',()=>{const f=fixture();finish(f);assert.equal(f.owner.doorMotion().status,'open');assert.equal(f.revision,1);assert.equal(f.updates.length,2);assert.deepEqual(f.log.slice(-3),['angle','commit','refresh:1']);tick(f,1);assert.equal(f.log.at(-1),'step');assert.equal(f.updates.length,2);});
test('open ticks do not reconstruct actor collision grids repeatedly',()=>{const f=fixture();finish(f);tick(f,300);assert.equal(f.revision,1);assert.equal(f.updates.length,2);});
test('an owner without actor refresh support remains fail-closed',()=>{const f=fixture({refresh:false});finish(f);assert.equal(f.owner.doorMotion().status,'open');assert.equal(f.committed,false);assert.equal(f.revision,0);assert.equal(f.updates.length,0);});
test('failed endpoint refresh is reported and detaches the owner rather than teleporting or retrying',()=>{const f=fixture();f.effect();tick(f,72);f.fail();assert.throws(()=>tick(f,1),/replacement failed/);assert.equal(f.committed,true);assert.equal(f.disposed,1);const count=f.steps;tick(f,20);assert.equal(f.steps,count);});
test('producer forwards refresh privately and refuses it after lifecycle disposal',()=>{let captured=null,calls=0,received=null;const context=vm.createContext({bindGalleryDoorInteraction:(api,scene,refresh)=>{captured=refresh;return api;},createInteractionStartGate:()=>({cancel(){}}),interactionFrame:()=>({})});const source=fs.readFileSync('src/interaction/gallery-interaction.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');vm.runInContext(source,context);const actor={step(){},snapshot:()=>({}),approach:()=>({}),cancelApproach(){},refreshColliders:data=>{calls++;received=data;return true;}},scene={getTarget:()=>({kind:'door'}),setPrisonDoorAngle(){}},targeting={intent:()=>null,cancelIntent(){}};const api=context.createGalleryInteraction(actor,scene,targeting),data=[];assert.equal(captured(data),true);assert.equal(received,data);assert.equal(calls,1);assert.equal(api.refreshColliders,undefined);api.dispose();assert.equal(captured(data),false);assert.equal(calls,1);});
test('browser scenario requires actual keyboard traversal and still does not self-approve visuals',()=>{const source=fs.readFileSync('tools/door-visual-check.mjs','utf8');assert.ok(source.includes("page.keyboard.down('KeyW')"));assert.ok(bindingProbe().includes('bindOriginal(life,view,refreshActor)'));assert.ok(source.includes('traversed.hero.y<traversed.doorY-.5'));assert.ok(source.includes("capture('passed-through'"));assert.ok(source.includes('visualAccepted:false'));});
