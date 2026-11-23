// LAST_SERVICE_THRESHOLDS_PASS4
// LAST_SERVICE_INTERIOR_PASS2
import {createMotion} from '../animation/motion.js';
import {CombatWorld} from '../game/combat-world.js';
import {combatHero} from '../animation/combat-hero.js';
import {makeBestiaryEnemy} from '../combat/bestiary.js';
import {blocked as occluded} from '../combat/geometry.js';
import {captureGolemLoadout,restoreGolemLoadout} from '../game/golem-trial-state.js';
import {createGolemTrialScene} from '../levels/golem-trial.js';
import {createCombatDoorScene} from '../game/combat-door-scene.js';
import {createCombatDoorEnvironment} from '../render/combat-door-environment.js';
import {createCombatDoorController} from '../interaction/combat-door-controller.js';
import {createRitualBonfire} from '../interaction/ritual-bonfire.js';
import {findCombatLights} from '../game/combat-light-context.js';
import {createLastServiceEntry,LAST_SERVICE_DOOR} from '../levels/last-service-entry.js';
import {createLastServiceSegment} from '../game/last-service-segment.js';
import {createLastServiceRoute} from '../game/last-service-route.js';
import {lastServiceChapelStatus} from '../game/last-service-chapel-entry.js';
import {createLastServiceStory,createKeeperScene,storyBookParts} from '../game/last-service-story.js';
import {createLastServiceFinale} from '../game/last-service-finale.js';
import {dressLastServiceScene} from '../levels/last-service-dressing.js';
import {createLastServiceView} from './last-service-view.js';
import {installManifest} from '../ui/relic.js';
import {createLastServiceLoadingScreen} from '../ui/last-service-loading-screen.js';
import {installLastServiceTestPanel,lastServiceTestEnabled,LAST_SERVICE_TEST_ROOMS} from '../ui/last-service-test-panel.js';
const cv=document.getElementById('game'),view=createLastServiceView(cv);
const {doorScene,env}=createLastServiceEntry(createCombatDoorScene,createCombatDoorEnvironment);
const makeWorld=map=>new CombatWorld(map,s=>combatHero(s).tip);
const world=makeWorld(doorScene.map),segment=createLastServiceSegment(),route=createLastServiceRoute(segment.tutorial),story=createLastServiceStory(),keys=new Set(),commands=[];
let paused=false,intent=null,pointer=null,last=null,acc=0,manifest,terminal=false,stopped=false,welcome=true,finale=null,pendingLesson=null,victoryShown=false,keeperShown=false;
let devRoomMode=false;
const actor=()=>finale?.world??world;
const loading=createLastServiceLoadingScreen({captureHero(){
 const source=actor().snapshot(),s={...source,phase:'playing',lamp:100,action:null,dash:null,execution:null,interaction:null,interactionAnimation:null,sweepProgress:null,hitReaction:0,moving:false,motion:createMotion(0,-1)};
 return {anchor:{x:s.x,y:s.y},frame:combatHero(s)};
},onEnter(){clear();controller.cancel('transition');},onClose(){clear();last=null;acc=0;cv.focus();}});
const clear=()=>{keys.clear();commands.length=0;intent=null;};
const blocked=()=>loading.active()||paused||document.hidden||(!devRoomMode&&segment.snapshot().intro)||!!story.snapshot()||finale?.snapshot().done||(!devRoomMode&&segment.tutorial.snapshot().blocksWorld)||manifest?.blocking();
const nearestDoor=()=>Math.hypot(world.current.x-8,world.current.y-11.5)<2.5?doorScene.getTarget(LAST_SERVICE_DOOR):null;
const targeting={intent:()=>intent,current:nearestDoor,cancelIntent:()=>{intent=null;}};
const controller=createCombatDoorController({world,scene:doorScene,targeting,active:()=>!finale&&!blocked()}),lighting=findCombatLights(doorScene);
const shrine=createRitualBonfire(world,doorScene.map,{origin:{x:5,y:-25},positions:[[5,-25]]});
manifest=installManifest({canvas:cv,dimensions:()=>({cols:196,rows:168}),active:()=>!paused&&!document.hidden,onModalChange(on){clear();if(!on&&segment.tutorial.snapshot().dialogue)segment.tutorial.dismiss();}});
const objective=(id,text)=>window.__ASH_MANIFEST__.setObjective({id,title:'ПОСЛЕДНЯЯ СЛУЖБА',text});
const bindings={light:'E — искры.',door:'F — подойти к двери и открыть.',attack:'ЛКМ / 1 — лёгкий удар.',combo:'Отдельные нажатия ЛКМ / 1 продолжают серию.',heavy:'ПКМ / 2 — тяжёлый удар.',dodge:'Направление + SHIFT — рывок.',cancel:'Направление + SHIFT во время своей атаки.',execution:'R — доступное добивание. Оно не обязательно.',ritual:'F у алой печати — зажечь костёр; повторно — ритуал.',archer:'Используй каменные опоры как укрытие.',boss:'После входа проход закроется. Вернись к костру, если нужно подготовиться.'};
const openLesson=lesson=>window.__ASH_MANIFEST__.openDialogue({id:lesson.id,speaker:lesson.title,text:lesson.line+'\n\n'+lesson.instruction+'\n\n'+(bindings[lesson.id]??'')});
function dialogue(lesson){clear();if(lesson.id==='light'&&!story.hasPlayed('first-spark')){pendingLesson=lesson;story.play('first-spark');}else openLesson(lesson);}
function readLedger(){window.__ASH_MANIFEST__.openReading({id:'sacristy-ledger',title:'РАСПОРЯЖЕНИЕ',text:'До прибытия посланника огонь не гасить. Покойников из службы не исключать.\n\nНа полях перечислены дни, когда помощь не пришла.'});}
function closeRegister(){
 if(!finale?.complete())return;
 objective('last-service-complete','Служба прекращена. Причина молчания не установлена.');
 window.__ASH_MANIFEST__.openReading({id:'last-register',title:'ПОСЛЕДНИЙ РЕЕСТР',text:'Последняя служба проведена в полном составе.\n\nИмена совпадают с надписями на погребальных нишах. В отчёте все они отмечены как очищенные.\n\nСлужба прекращена. Причина молчания не установлена.'});
}
function reset(retry=false,keepLoading=false){
 if(!keepLoading)loading.cancel();devRoomMode=false;
 manifest.dismiss();controller.cancel('reset');doorScene.reset();world.reset();shrine.reset();route.reset();story.reset({keepPlayed:retry});
 finale=null;pendingLesson=null;victoryShown=false;keeperShown=false;
 Object.assign(world.current,{x:8,y:18.2,cameraX:8,cameraY:18.2,fx:-.6,fy:-.8,motion:createMotion(-.6,-.8),note:'Последняя служба'});
 world.current.enemies=[];world.current.enemy={...world.current.enemy,hp:0,mode:'dead'};world.previous=world.snapshot();welcome=!retry;
 if(retry)segment.retry();else segment.reset();paused=false;terminal=false;clear();last=null;acc=0;
 objective('last-service-route','Пройти погребальное крыло до нижней часовни.');cv.focus();
}
const idle=()=>{const s=actor().current;return !s.action&&s.sweepProgress===null&&!s.dash&&!s.interaction&&!s.execution;};
const chapelStatus=()=>lastServiceChapelStatus({s:world.current,route:route.snapshot(),tutorial:segment.tutorial.snapshot(),blocked:blocked(),idle:idle(),hasFinale:!!finale});
function updateRoute(){
 if(devRoomMode){if(!finale&&world.current.phase==='won'){world.current.phase='playing';world.previous=world.snapshot();}return;}
 if(finale)return;
 const s=world.current;route.observe(s);if(s.phase==='won'){s.phase='playing';world.previous=world.snapshot();}
 if(blocked()||s.phase!=='playing'||!idle())return;
 if(route.snapshot().finished&&chapelStatus().near){
  if(segment.tutorial.enter('boss')){dialogue(segment.tutorial.snapshot().dialogue);return;}
  objective('last-service-threshold','F — войти в нижнюю часовню. Можно вернуться к костру.');return;
 }
 const basic=s.y<14?'door':s.y<17?'light':null;
 if(basic&&segment.tutorial.enter(basic)){dialogue(segment.tutorial.snapshot().dialogue);return;}
 const action=route.next(s);if(!action)return;if(action.kind==='lesson'){dialogue(action.lesson);return;}
 if(s.hitReaction>0)return;
 world.setEncounter([...(s.enemies??[]).filter(e=>e.hp>0),...action.enemies.map(e=>makeBestiaryEnemy(...e))]);route.commit(action);
}
function movement(){return{x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))};}
function step(dt){
 const w=actor();
 for(const c of commands.splice(0)){
  if(c.kind==='sweep')w.sweep(c.aim);else if(c.kind==='execute')w.execute();
  else if(c.kind==='dash'){const cancel=!!w.current.action;if(w.dash(c.direction)){segment.tutorial.record('dodge-started');if(cancel)segment.tutorial.record('attack-cancelled-by-dodge');}}else w.attack(c);
 }
 if(finale)finale.step(dt,{...movement(),aim:view.aim(pointer)});
 else{controller.step(dt,{...movement(),aim:view.aim(pointer)});shrine.step();env.step?.(dt);}
 if(!finale){
  if(lighting.getSources().some(s=>s.status==='lit'))segment.tutorial.record('small-light-ignited');
  if(doorScene.snapshot().doors.some(d=>d.status==='open'))segment.tutorial.record('door-opened');
  for(const e of world.events.filter(e=>Math.abs(e.time-world.current.time)<1e-7)){
   if(e.type==='hit'){const a=world.current.action;if(a?.kind==='light')segment.tutorial.record('light-hit');if(a?.kind==='heavy')segment.tutorial.record('heavy-hit');if(a?.stage>0)segment.tutorial.record('combo-hit');}
   if(e.type==='execution-start')segment.tutorial.record('execution-started');if(e.type==='lamp-restored')segment.tutorial.record('ritual-completed');
  }
  updateRoute();
 }
}
function frame(now){
 if(stopped)return;
 try{
  if(loading.active()){last=now;acc=0;clear();loading.paint(now);requestAnimationFrame(frame);return;}
  const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;
  if(!paused&&!document.hidden)manifest.advance(now);
  segment.tick(dt,{paused:paused||document.hidden,modal:manifest.blocking()});story.tick(dt,{paused:paused||document.hidden||manifest.blocking()});
  const ended=!paused&&!document.hidden&&!manifest.blocking()?story.takeFinished():null;
  if(ended==='first-spark'&&pendingLesson){openLesson(pendingLesson);pendingLesson=null;}else if(ended==='ledger')readLedger();else if(ended==='register')closeRegister();
  if(!blocked()){
   if(welcome){welcome=false;window.__ASH_MANIFEST__.openDialogue({id:'movement',speaker:'ПОСЛЕДНЯЯ СЛУЖБА',text:'Печать цела. Служба продолжается.\n\nWASD / стрелки — движение. ESC — пауза. Пройди к свечам.'});}else updateRoute();
  }
  if(blocked()){acc=0;clear();}else{acc+=dt;for(let i=0;i<6&&acc>=1/60;i++){step(1/60);acc-=1/60;if(blocked())break;}}
  if(finale?.world.current.bossEncounter?.status==='won'&&!victoryShown){victoryShown=true;objective('last-service-boss-won','Проход открыт. Вернуться в прихожую часовни.');segment.tutorial.record('golem-defeated');}
  if(finale?.snapshot().chapter==='keeper'&&!keeperShown){keeperShown=true;objective('last-service-register','Осмотреть реестр на пюпитре. F — прочитать.');}
  const current=actor().current;
  if(!terminal&&current.phase==='dead'){terminal=true;clear();window.__ASH_MANIFEST__.openDialogue({id:'death',speaker:'ОГОНЬ ПОГАС',text:'Повтори попытку. Прочитанные уроки сохраняются до полного перезапуска.'});}
  if(finale){const f=finale.frame();view.paint({...f,intro:{intro:false},manifest,paused,ready:actor().dashReady(),executionReady:actor().executionAvailable(),ritual:{parts:[],lights:[],hint:null},story:story.snapshot(),extra:f.chapter==='keeper'?storyBookParts(8,7):[]});}
  else{const s=controller.decorate(world.snapshot());s.interactionAnimation=shrine.frame()??s.interactionAnimation;view.paint({s,intro:devRoomMode?{intro:false}:segment.snapshot(),env,manifest,paused,ready:world.dashReady(),executionReady:world.executionAvailable(),ritual:shrine.art(s,!blocked()),map:doorScene.map,story:story.snapshot(),extra:storyBookParts(8,-25),gate:chapelStatus()});}
  requestAnimationFrame(frame);
 }catch(error){stopped=true;window.__ASH_LAST_SERVICE_ERROR__=String(error.stack??error);document.getElementById('status').textContent='Ошибка: '+error.message;console.error(error);}
}
function enterChapel(){
 const s=world.current;
 const gate=chapelStatus();
 if(!gate.near)return false;
 if(gate.reason==='lesson'){if(segment.tutorial.enter('boss'))dialogue(segment.tutorial.snapshot().dialogue);return true;}
 if(!gate.ready){objective('last-service-threshold-blocked',gate.text);return true;}
 clear();controller.cancel('chapel-entry');
 return loading.start('chapel',()=>{
 finale=createLastServiceFinale(s,{createWorld:makeWorld,createArena:()=>dressLastServiceScene(createGolemTrialScene(),'chapel'),createKeeper:createKeeperScene,capture:captureGolemLoadout,restore:restoreGolemLoadout,transition:(id,load)=>loading.start(id,load)});
 story.play('awakening');objective('last-service-boss','Прекратить службу. Уничтожить трупного голема.');
 });
}
function pressBook(){
 const keeper=finale?.snapshot().chapter==='keeper';if(finale&&!keeper)return false;
 const p={x:8,y:keeper?7:-25},s=actor().current,map=keeper?finale.frame().map:doorScene.map;
 if(!idle()||s.phase!=='playing'||Math.hypot(s.x-p.x,s.y-p.y)>1.5||occluded(s,p,map))return false;
 const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy);if(d>.01){s.fx=dx/d;s.fy=dy/d;s.motion=createMotion(s.fx,s.fy);}
 clear();const id=keeper?'register':'ledger';if(story.hasPlayed(id)){if(keeper)closeRegister();else readLedger();}else story.play(id);return true;
}
window.addEventListener('keydown',e=>{if(!paused&&!document.hidden&&story.snapshot()&&!e.repeat&&['Enter','Space'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();clear();story.skip();}},true);
window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.target?.closest?.('button,input,textarea,select'))return;
 if(e.code==='Escape'){paused=!paused;clear();controller.cancel('pause');last=null;e.preventDefault();return;}
 if(blocked()||e.repeat)return;
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();return;}
 if(e.code==='KeyF'){if(!enterChapel()&&!pressBook()&&!finale&&!shrine.press()){const t=nearestDoor();if(t?.availability==='ready')intent={context:'game',kind:'door',targetId:t.id};}}
 else if(e.code==='KeyE')commands.push({kind:'sweep',aim:view.aim(pointer)});else if(e.code==='KeyR')commands.push({kind:'execute'});
 else if(e.code==='Digit1'||e.code==='Digit2')commands.push({kind:e.code==='Digit1'?'light':'heavy',aim:view.aim(pointer)});
 else if(e.code.startsWith('Shift'))commands.push({kind:'dash',direction:movement()});else return;
 if(commands.length>8)commands.length=8;e.preventDefault();
});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{paused=true;clear();last=null;controller.cancel('blur');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;clear();last=null;}});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();pointer={x:(e.clientX-r.left)*1008/r.width,y:(e.clientY-r.top)*864/r.height};});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{cv.focus();if(e.defaultPrevented||blocked()||![0,2].includes(e.button))return;e.preventDefault();if(commands.length<8)commands.push({kind:e.button===0?'light':'heavy',aim:view.aim(pointer)});});
document.getElementById('retry').addEventListener('click',()=>loading.start('wing',()=>reset(true,true)));document.getElementById('new-game').addEventListener('click',()=>loading.start('wing',()=>reset(false,true)));
window.__ASH_LAST_SERVICE__=Object.freeze({state:()=>actor().snapshot(),tutorial:()=>segment.tutorial.snapshot(),scene:()=>segment.snapshot(),story:()=>story.snapshot(),finale:()=>finale?.snapshot()??null,chapel:chapelStatus,route:()=>route.snapshot(),doors:()=>doorScene.snapshot(),lights:()=>lighting.snapshot(),loading:()=>loading.snapshot(),testMode:()=>devRoomMode,retry:()=>reset(true),restart:()=>reset(false)});
function testJumpRoom(id){
 if(!lastServiceTestEnabled(window.location))return false;
 const target=LAST_SERVICE_TEST_ROOMS[id];if(!target)throw Error('Unknown test room');
 return loading.start(target.art,()=>{
  reset(false,true);devRoomMode=true;welcome=false;pendingLesson=null;terminal=false;victoryShown=true;keeperShown=true;
  if(id==='chapel'||id==='keeper'){
   finale=createLastServiceFinale(world.current,{createWorld:makeWorld,createArena:()=>dressLastServiceScene(createGolemTrialScene(),'chapel'),createKeeper:createKeeperScene,capture:captureGolemLoadout,restore:restoreGolemLoadout,startChapter:id==='chapel'?'boss':'keeper',transition:(name,load)=>loading.start(name,load)});
   if(id==='chapel')story.play('awakening');
  }else{
   Object.assign(world.current,{x:target.x,y:target.y,cameraX:target.x,cameraY:target.y,phase:'playing'});world.previous=world.snapshot();
  }
  objective('last-service-test','ТЕСТОВЫЙ ОСМОТР: '+target.label+'. Для проверки прохождения начни игру заново.');
 });
}
installLastServiceTestPanel({jump:testJumpRoom,preview:id=>loading.start(id,()=>{},{preview:true}),restart:()=>loading.start('wing',()=>reset(false,true))});
reset();loading.start('wing',()=>{});requestAnimationFrame(frame);
