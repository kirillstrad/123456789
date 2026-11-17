import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync('src/app/main.js','utf8');
const names=['renderGallery','openGallery','closeGallery','gallerySetCamera','walkGallery'];
const selected=names.map(name=>{
 const lines=app.split('\n').filter(line=>line.startsWith('function '+name+'('));
 assert.equal(lines.length,1,'app function must be extracted explicitly: '+name);
 return lines[0];
});
const debug=app.split('\n').filter(line=>line.startsWith('window.__ASH_GALLERY__='));
assert.equal(debug.length,1);
const runtime=[
 'src/interaction/door-state.js','src/interaction/prison-door-motion.js',
 'src/interaction/door-effect-bridge.js','src/interaction/gallery-door-binding.js',
 'src/interaction/intent.js','src/interaction/start-gate.js',
 'src/animation/interaction.js','src/interaction/gallery-interaction.js'
].map(path=>fs.readFileSync(path,'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,''));
const angle=fs.readFileSync('src/gallery/models/prison-door.js','utf8').match(/^export const PRISON_DOOR_OPEN_ANGLE=.*;$/m);
assert.ok(angle);

// Actual app transition functions + actual interaction/door code in a fresh VM.
// Scene assembly/geometry, actor/approach, combat cancellation, input, DOM and renderer are test doubles.
function harness(){
 const context=vm.createContext({structuredClone,window:{},document:{hidden:false,activeElement:null}});
 const seed=`
 let mode='game',camera={x:3,y:4},view={zoom:1.2,dx:5,dy:6};
 let galleryScene=null,galleryCamera=null,galleryReturn=null,galleryTimings=null,galleryTime=0,galleryPlayer=null;
 let aimPoint={x:1,y:2},simLast=10,acc=.2,drawAt=20;
 const keys=new Set(),commands=[],W=1008,H=720,log=[],made=[],actors=[];
 let failRender=false,failCombatCancel=false;
 const combatDoor={cancel(reason){log.push('combat-cancel:'+reason);if(failCombatCancel)throw Error('scripted combat cancellation failure');return true;}};
 const cv={focus(){}},status={textContent:''},$=()=>status;
 const world={snapshot:()=>({}),current:{note:'COMBAT'}};
 const interactionContext=()=>mode==='gallery'?(galleryPlayer?'gallery-walk':'gallery-preview'):mode;
 const pending=createInteractionIntent();
 const targeting={clear:()=>pending.clear(),cancelIntent:()=>pending.clear(),intent:()=>pending.reconcile(galleryScene?.getTarget('prison-door.a'),interactionContext(),true)};
 function createGalleryScene(){
  log.push('scene-create');
  const record={angle:0,publications:0,disposed:false},parts=[{v:[[7,8,0],[9,8,0],[9,8,2],[7,8,2]]}];
  const alive=()=>{if(record.disposed)throw Error('scene disposed');};
  const target=()=>({id:'prison-door.a',kind:'door',parts,approach:{x:8,y:9,z:0}});
  const scene={record,getTarget:id=>{alive();return id==='prison-door.a'?target():null;},getSpawn:()=>({x:8,y:9}),getBounds:()=>({minX:0,maxX:20,minY:0,maxY:20}),getColliders:()=>[],stats:()=>{alive();return{objects:1};},getFrame:()=>{alive();return{parts,targets:[target()],stats:{objects:1},lights:[],floorParts:[]};},setPrisonDoorAngle:angle=>{alive();record.angle=angle;record.publications++;return true;},dispose(){if(!record.disposed){log.push('scene-dispose');record.disposed=true;}}};
  made.push(scene);return scene;
 }
 const createGalleryLayout=()=>({entries:[{id:'prison-door.a',x:8,y:8}]});
 const galleryMotion={},advanceWorldFootContacts=()=>null,galleryRenderRange=()=>16;
 function createGalleryPlayer(template,spawn){
  const s={x:spawn.x,y:spawn.y,cameraX:spawn.x,cameraY:spawn.y,time:0,lamp:100,phase:'playing',moving:false,action:null,interaction:null,dash:null,execution:null,sweepProgress:null,hitReaction:0,motion:{vx:0,vy:0,heading:-Math.PI/2}};
  const actor={steps:0,step(dt){this.steps++;s.time+=dt;},snapshot:()=>structuredClone(s)};
  actors.push(actor);return actor;
 }
 function createGalleryApproach(player){return{step:(...args)=>player.step(...args),snapshot:()=>player.snapshot(),approach:()=>({status:'arrived',targetId:'prison-door.a'}),cancelApproach:reason=>{log.push('player-cancel:'+reason);pending.clear();}};}
 function render(){if(failRender)throw Error('scripted render failure');return{cpuMs:0};}
 `;
 vm.runInContext(angle[0].replace('export ','')+'\n'+runtime.join('\n')+'\n'+seed+'\n'+selected.join('\n')+'\n'+debug[0]+`
 globalThis.probe={owner:()=>galleryPlayer,scene:()=>galleryScene,made:()=>made,actors:()=>actors,log:()=>log,
  request:()=>pending.request(galleryScene.getTarget('prison-door.a'),'gallery-walk'),
  dirty:()=>{keys.add('KeyW');commands.push({kind:'heavy'});aimPoint={x:1,y:2};simLast=10;acc=.5;drawAt=90;},
  fail:value=>failRender=value,failCombat:value=>failCombatCancel=value,
  state:()=>({mode,camera,view,keys:keys.size,commands:commands.length,aimPoint,simLast,acc,drawAt})};
 `,context);
 return{api:context.window.__ASH_GALLERY__,probe:context.probe};
}
const tick=(owner,count)=>{for(let i=0;i<count;i++)owner.step(1/60);};
function launch(h){assert.ok(h.probe.request());const owner=h.probe.owner();owner.step(1/60);assert.ok(owner.interaction());return owner;}
const plain=value=>JSON.parse(JSON.stringify(value));

test('real open/walk/open path is idempotent without replacing a live owner',()=>{const h=harness();h.api.open();const scene=h.probe.scene();h.api.walk();const owner=h.probe.owner();h.api.open();assert.equal(h.probe.scene(),scene);assert.equal(h.probe.owner(),owner);assert.equal(h.probe.actors().length,1);});
test('repeated walk before effect cancels the old action and accepts a fresh action-ID lifetime',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,30);h.api.walk();const next=h.probe.owner();assert.notEqual(next,old);assert.equal(next.doorMotion().status,'closed');tick(old,300);assert.equal(next.doorMotion().status,'closed');launch(h);tick(next,180);assert.equal(next.doorMotion().status,'open');});
test('repeated walk during opening resumes scene motion without a reset or second clock',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,130);const before=old.doorMotion(),scene=h.probe.scene();h.api.walk();const next=h.probe.owner();assert.equal(next.doorMotion(),before);tick(old,50);assert.equal(next.doorMotion(),before);tick(next,100);assert.equal(scene.record.angle,-90);assert.equal(next.doorMotion().status,'open');});
test('camera preview freezes motion and a later walk resumes the same scene',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,130);const before=old.doorMotion(),scene=h.probe.scene(),published=scene.record.publications;h.api.setCamera(10,11);assert.equal(h.probe.owner(),null);tick(old,300);for(let i=0;i<10;i++)h.api.render();assert.equal(scene.record.publications,published);h.api.walk();const next=h.probe.owner();assert.equal(h.probe.scene(),scene);assert.equal(next.doorMotion(),before);tick(next,100);assert.equal(scene.record.angle,-90);});
test('camera switch before effect discards the cancelled action rather than replaying it',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,30);h.api.setCamera(10,10);tick(old,300);h.api.walk();const next=h.probe.owner();tick(next,200);assert.equal(next.doorMotion().status,'closed');assert.equal(h.api.interactionEvents().length,0);});
test('completed open state survives camera focus and player recreation',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,180);const before=old.doorMotion(),scene=h.probe.scene();h.api.focus('prison-door.a');assert.equal(h.probe.owner(),null);h.api.walk();const next=h.probe.owner();assert.equal(next.doorMotion(),before);launch(h);tick(next,180);assert.equal(scene.record.angle,-90);assert.equal(next.doorMotion(),before);});
test('close disposes the owner before the scene and clears app input/timing state',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,130);h.probe.dirty();h.api.close();const log=Array.from(h.probe.log());const playerAt=log.lastIndexOf('player-cancel:scene-closed'),sceneAt=log.lastIndexOf('scene-dispose');assert.ok(playerAt>=0&&sceneAt>=0);assert.ok(playerAt<sceneAt);const state=plain(h.probe.state());assert.equal(state.mode,'game');assert.deepEqual(state.camera,{x:3,y:4});assert.deepEqual(state.view,{zoom:1.2,dx:5,dy:6});assert.equal(state.keys,0);assert.equal(state.commands,0);assert.equal(state.aimPoint,null);assert.equal(state.simLast,null);assert.equal(state.acc,0);assert.equal(h.probe.owner(),null);assert.equal(h.probe.scene(),null);assert.doesNotThrow(()=>tick(old,100));assert.doesNotThrow(()=>h.api.close());});
test('close/open creates a closed new scene, untouched by stale references from the old one',()=>{const h=harness();h.api.walk();const old=launch(h);tick(old,130);const previous=h.probe.scene(),count=previous.record.publications;h.api.close();h.api.walk();const next=h.probe.owner(),scene=h.probe.scene();assert.notEqual(scene,previous);assert.equal(scene.record.angle,0);tick(old,300);old.snapshot();old.interaction();old.finishInteraction(1);assert.equal(previous.record.publications,count);assert.equal(next.doorMotion().status,'closed');launch(h);tick(next,180);assert.equal(scene.record.angle,-90);});
test('invalid camera or focus input leaves the live owner intact',()=>{const h=harness();h.api.walk();const owner=launch(h);tick(owner,130);const before=owner.doorMotion();assert.throws(()=>h.api.setCamera(NaN,1),/Invalid/);assert.throws(()=>h.api.focus('missing'),/Unknown/);assert.equal(h.probe.owner(),owner);assert.equal(owner.doorMotion(),before);tick(owner,100);assert.equal(owner.doorMotion().status,'open');});
test('actual renderGallery/debug reads never advance door motion',()=>{const h=harness();h.api.walk();const owner=launch(h);tick(owner,130);const before=owner.doorMotion(),published=h.probe.scene().record.publications;for(let i=0;i<30;i++){h.api.render();h.api.player();h.api.approach();h.api.interaction();h.api.interactionEvents();h.api.interactionEvents();h.api.stats();h.api.camera();}assert.equal(owner.doorMotion(),before);assert.equal(h.probe.scene().record.publications,published);});
test('initial preview render failure uses the actual openGallery cleanup path',()=>{const h=harness();h.probe.fail(true);assert.throws(()=>h.api.open(),/scripted render failure/);assert.equal(h.probe.state().mode,'game');assert.equal(h.probe.scene(),null);assert.equal(h.probe.owner(),null);assert.equal(h.probe.made()[0].record.disposed,true);h.probe.fail(false);assert.doesNotThrow(()=>h.api.walk());});
test('repeated close/reopen cycles do not let old owners publish into any scene',()=>{const h=harness(),old=[];for(let i=0;i<20;i++){h.api.walk();const owner=launch(h);tick(owner,130);const scene=h.probe.scene();h.api.close();old.push({owner,scene,count:scene.record.publications});for(const entry of old){tick(entry.owner,5);assert.equal(entry.scene.record.publications,entry.count);}}assert.equal(h.probe.made().length,20);assert.equal(h.probe.owner(),null);});
test('entering gallery cancels combat ownership before scene creation and repeated open is a no-op',()=>{const h=harness();h.api.open();const log=Array.from(h.probe.log());assert.deepEqual(log.slice(0,2),['combat-cancel:gallery-open','scene-create']);h.api.open();h.api.walk();assert.equal(Array.from(h.probe.log()).filter(e=>e==='combat-cancel:gallery-open').length,1);});
test('combat cancellation failure propagates before any gallery scene is created',()=>{const h=harness();h.probe.failCombat(true);assert.throws(()=>h.api.open(),/scripted combat cancellation failure/);assert.equal(h.probe.state().mode,'game');assert.equal(h.probe.scene(),null);assert.equal(h.probe.owner(),null);assert.equal(h.probe.made().length,0);h.probe.failCombat(false);assert.doesNotThrow(()=>h.api.walk());});
