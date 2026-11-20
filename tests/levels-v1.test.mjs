import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createEnemyHealthRuntime} from '../src/app/enemy-health-runtime.js';
import {GAME_LEVELS,gameLevel,applyLevelSpawn} from '../src/levels/registry.js';
import {createWorldReference} from '../src/levels/world-reference.js';
import {ASHEN_ROOMS,ASHEN_DOORS,ASHEN_LIGHTS,ASHEN_PROPS,ashenWalkable,createAshenPlan} from '../src/levels/ashen-layout.js';

test('legacy levels and the implemented trial are advertised',()=>{
 assert.deepEqual(GAME_LEVELS.map(l=>l.id),['golem-trial','test-chamber','ashen-nave','bonebound-trial','undead-trial','archer-trial']);assert(Object.isFrozen(GAME_LEVELS[0]));assert.throws(()=>gameLevel('crypt'));
});
test('test chamber spawn is unchanged and ashen spawn seeds both interpolation states',()=>{
 const state=()=>({x:99,y:98,cameraX:99,cameraY:98,enemy:{x:1,y:1},motion:{heading:1}}),w={current:state(),previous:state()};applyLevelSpawn(w,'test-chamber');assert.equal(w.current.x,99);applyLevelSpawn(w,'ashen-nave');
 for(const s of [w.current,w.previous]){assert.equal(s.x,8);assert.equal(s.y,12);assert.equal(s.cameraX,8);assert.equal(s.enemy.x,34);assert.equal(s.enemy.y,12);assert.equal(s.motion.heading,0);}
});
const makeWorld=n=>({current:{n},previous:{n},step(){this.current.n++;},snapshot(){return {...this.current};},execute(){this.current.n+=10;return this.current.n;}});
test('world reference keeps captured input consumers attached to the current run',()=>{
 const a=makeWorld(1),b=makeWorld(100),ref=createWorldReference(a),world=ref.proxy,press=()=>world.execute();assert.equal(press(),11);ref.replace(b);assert.equal(press(),110);assert.equal(a.current.n,11);assert.equal(world.current,b.current);world.step();assert.equal(b.current.n,111);
});
test('invalid world replacement is atomic and method this is correct',()=>{
 const a=makeWorld(1),r=createWorldReference(a);assert.throws(()=>r.replace({}));r.proxy.step();assert.equal(a.current.n,2);r.proxy.current={n:4};assert.equal(a.current.n,4);
});
test('plans are fresh and deterministic without shared mutable collision arrays',()=>{
 const a=createAshenPlan(),b=createAshenPlan();assert.deepEqual(a,b);a.obstacles.rects[0].minX=999;assert.notEqual(b.obstacles.rects[0].minX,999);a.lights[0].transform.x=999;assert.notEqual(b.lights[0].transform.x,999);
});
test('porch, nave, chapel, burial wing, warden hall and altar all exist',()=>{
 for(const id of ['porch','nave','chapel','burial-wing','warden-hall','altar'])assert(ASHEN_ROOMS.some(r=>r.id===id));
});
test('all walkable tiles are connected and the lower branch forms a loop',()=>{
 const p=createAshenPlan(),available=new Set(p.tiles.map(t=>t.x+','+t.y)),seen=new Set(['8,12']),queue=[[8,12]];
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=queue[i][0]+dx,y=queue[i][1]+dy,k=x+','+y;if(available.has(k)&&!seen.has(k)){seen.add(k);queue.push([x,y]);}}
 assert.equal(seen.size,available.size);for(const k of ['20,12','20,25','32,26','34,12','34,4'])assert(seen.has(k));
 // Remove the direct main passage: the chapel/burial loop must still reach the hall.
 const reachable=new Set(['8,12']),q=[[8,12]];
 for(let i=0;i<q.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=q[i][0]+dx,y=q[i][1]+dy,k=x+','+y;if(x>=25&&x<29&&y>=10&&y<14)continue;if(available.has(k)&&!reachable.has(k)){reachable.add(k);q.push([x,y]);}}
 assert(reachable.has('34,12'));
});
test('void collision covers every nonfloor cell and never fills a floor cell',()=>{
 const p=createAshenPlan();for(let y=2;y<32;y++)for(let x=2;x<42;x++){const cx=x+.5,cy=y+.5,blocked=p.obstacles.rects.some(r=>cx>r.minX&&cx<r.maxX&&cy>r.minY&&cy<r.maxY);assert.equal(blocked,!ashenWalkable(cx,cy),x+','+y);}
});
test('door centres approaches and light centres lie on authored floor',()=>{
 for(const d of ASHEN_DOORS){assert(ashenWalkable(d.x,d.y));const a=d.yaw*Math.PI/180;for(const side of[-1,1])assert(ashenWalkable(d.x-Math.sin(a)*.72*side,d.y+Math.cos(a)*.72*side));}
 for(const l of ASHEN_LIGHTS){assert(ashenWalkable(l.transform.x,l.transform.y));assert.equal(l.initialStatus,'off');}
});
test('all decorative prop centres lie on floor with unique instance identifiers',()=>{
 assert.equal(new Set(ASHEN_PROPS.map(p=>p.instanceId)).size,ASHEN_PROPS.length);for(const p of ASHEN_PROPS)assert(ashenWalkable(p.x,p.y));
});
function menuHarness(index,{available=true,fail=false}={}){
 const source=fs.readFileSync('src/ui/throne-menu.js','utf8'),helper=source.match(/^function enterGameLevel\(id\)\{[\s\S]*?^\}/m)?.[0],go=source.split('\n').find(l=>l.startsWith('function go(){'));assert(helper&&go);
 const starts=[],context=vm.createContext({__ASH_LEVELS__:available?{start:id=>{if(fail)throw Error('start failed');starts.push(id);}}:undefined});
 vm.runInContext(`const s={page:'levels',selected:${index},hasRun:false},app={notice:''};let gallery=0;const page=p=>{s.page=p;s.selected=0;app.notice='';};function enterGallery(){gallery++;} ${helper}\n${go}\ngo();globalThis.result={s,app,gallery};`,context);
 return {starts,result:context.result};
}
test('levels submenu dispatches both IDs and does not launch the object gallery for a level',()=>{
 for(const [index,id]of [[0,'test-chamber'],[1,'ashen-nave']]){const h=menuHarness(index);assert.deepEqual(h.starts,[id]);assert.equal(h.result.s.hasRun,true);assert.equal(h.result.s.page,'main');assert.equal(h.result.gallery,0);}
});
test('object gallery remains the third choice and back remains nonlaunching',()=>{
 const a=menuHarness(2);assert.equal(a.result.gallery,1);assert.equal(a.starts.length,0);const b=menuHarness(3);assert.equal(b.result.s.page,'main');assert.equal(b.starts.length,0);
});
test('missing level runtime shows a notice instead of starting the wrong scene',()=>{
 const h=menuHarness(1,{available:false});assert.equal(h.result.s.page,'notice');assert.equal(h.result.s.hasRun,false);assert.equal(h.starts.length,0);
});
test('failed launch is not marked as a successful new run',()=>{assert.throws(()=>menuHarness(1,{fail:true}),/start failed/);});
test('level scene wiring opts out of the legacy sentinel only for the new level',()=>{
 const source=fs.readFileSync('src/levels/runtime.js','utf8');assert(source.includes('legacyGate:false'));assert(source.includes('routeBounds:plan.bounds'));assert(source.includes('createDoorScene(baseObstacles)'));
});
test('app rebuilds scene resources before reset and keeps execution input on a stable world',()=>{
 const source=fs.readFileSync('src/app/main.js','utf8');assert(source.includes('world=worldReference.proxy'));assert(source.includes('worldReference.replace(nextWorld)'));assert(source.includes('closeGallery();rebuildSelectedLevel();resetWorld();'));assert(source.includes('world.reset();applyLevelSpawn(world,selectedLevelId);'));assert(source.includes('window.__ASH_LEVELS__=Object.freeze'));
});

function appHarness(){
 const src=fs.readFileSync('src/app/main.js','utf8');
 const rebuild=src.match(/^function rebuildSelectedLevel\(\)\{[\s\S]*?^\}/m)?.[0];
 const funcs=['start','resetWorld','launchLevel'].map(name=>src.split('\n').find(l=>l.startsWith('function '+name+'('))).join('\n');assert(rebuild);
 let healthResets=0;const hp=createEnemyHealthRuntime(),enemyHealth={...hp,reset(){healthResets++;hp.reset();}};
 const ctx=vm.createContext({createWorldReference,applyLevelSpawn,gameLevel,enemyHealth});
 vm.runInContext(`let serial=0,builds=0,cancels=0,mode='menu',selectedLevelId='test-chamber',golemCheckpoint=null,selected=0,menuPage=false,paused=false,frozen=false,endTime=0,simLast=1,acc=1,drawAt=0,aimPoint={x:1,y:1},camera={},view={},fireLighting=null;
 const keys=new Set(['KeyW']),commands=[{kind:'dash'}],report={frames:[1]},dashHud={ready:true,at:1},targeting={clear(){}},manifest={dismiss(){},reset(){}},effects={reset(){}},fireHintLayer={clear(){}},cv={focus(){}},$=()=>({}),OBSTACLES={};
 class CombatWorld{constructor(map){this.map=map;this.serial=++serial;this.reset();}reset(){this.current={x:8,y:12,enemy:{x:10,y:8},motion:{}};this.previous={x:8,y:12,enemy:{x:10,y:8},motion:{}};}step(){}snapshot(){return this.current;}}
 const makeScene=()=>({map:{},reset(){}});let doorScene=makeScene(),env={},ritualBonfire={reset(){}},relicWorld={reset(){}},combatDoor={cancel(){cancels++;}};
 const worldReference=createWorldReference(new CombatWorld(doorScene.map)),world=worldReference.proxy,heldInput=()=>world.serial;
 const combatHero=()=>({tip:{}}),createCombatDoorScene=()=>{},createCombatDoorEnvironment=()=>{};
 const buildLevelScene=()=>{builds++;return {doorScene:makeScene(),env:{}};},findCombatLights=()=>({}),createRitualBonfire=()=>({reset(){}}),createRelicWorld=()=>({reset(){}}),createCombatDoorController=()=>({cancel(){cancels++;}});
 const window={},closeGallery=()=>{mode='menu';};
 ${rebuild}\n${funcs}
 globalThis.p={launch:launchLevel,restart:start,serial:heldInput,state:()=>({selectedLevelId,builds,serial:world.serial,enemyX:world.current.enemy.x,keys:keys.size,commands:commands.length,mode})};`,ctx);
 return Object.assign(ctx.p,{healthResets:()=>healthResets});
}
test('launch restart and switching rebuild fresh worlds while captured input follows the new owner',()=>{
 const p=appHarness(),initial=p.serial();p.launch('ashen-nave');const a=p.state();assert.equal(a.selectedLevelId,'ashen-nave');assert.equal(a.enemyX,34);assert.equal(a.keys,0);assert.equal(a.commands,0);assert.notEqual(p.serial(),initial);
 p.restart();assert.notEqual(p.serial(),a.serial);assert.equal(p.state().enemyX,34);p.launch('test-chamber');assert.equal(p.state().selectedLevelId,'test-chamber');assert.equal(p.state().enemyX,10);assert.equal(p.state().builds,3);
});
test('unknown level request does not rebuild or change selected level',()=>{
 const p=appHarness();assert.throws(()=>p.launch('missing'));assert.equal(p.state().builds,0);assert.equal(p.state().selectedLevelId,'test-chamber');
});

test('captured world methods forward to the new owner after replacement',()=>{
 const a=makeWorld(1),b=makeWorld(100),r=createWorldReference(a),execute=r.proxy.execute;r.replace(b);assert.equal(execute(),110);assert.equal(a.current.n,1);assert.equal(r.proxy.execute,execute);
});
test('door corridors leave four tiles of authored floor for frames and sweep clearance',()=>{
 const main=ASHEN_ROOMS.find(r=>r.id==='main-passage'),back=ASHEN_ROOMS.find(r=>r.id==='return-passage');assert.equal(main.h,4);assert.equal(back.w,4);
});

// HP_HARNESS_V1
test('HP state resets on launch and restart without weakening world assertions',()=>{const p=appHarness();let n=p.healthResets();p.launch('test-chamber');assert.ok(p.healthResets()>n);n=p.healthResets();p.restart();assert.ok(p.healthResets()>n);n=p.healthResets();assert.throws(()=>p.launch('missing'));assert.equal(p.healthResets(),n);});

// GOLEM_53_LEVEL_DISPATCH_REGRESSION
test('golem trial dispatches its own encounter initializer exactly once',()=>{
 let calls=0;
 const world={startGolemTrial(){calls++;}};
 applyLevelSpawn(world,'golem-trial');
 assert.equal(calls,1);
 assert.equal(gameLevel('golem-trial').title,'GOLEM TRIAL');
 assert.equal(new Set(GAME_LEVELS.map(l=>l.id)).size,GAME_LEVELS.length);
});
