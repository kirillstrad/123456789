import {createMotion} from '../animation/motion.js';
import {CombatWorld} from '../game/combat-world.js';
import {combatHero} from '../animation/combat-hero.js';
import {makeBestiaryEnemy} from '../combat/bestiary.js';
import {createCombatDoorScene} from '../game/combat-door-scene.js';
import {createCombatDoorEnvironment} from '../render/combat-door-environment.js';
import {createCombatDoorController} from '../interaction/combat-door-controller.js';
import {createRitualBonfire} from '../interaction/ritual-bonfire.js';
import {findCombatLights} from '../game/combat-light-context.js';
import {createLastServiceEntry,LAST_SERVICE_DOOR} from '../levels/last-service-entry.js';
import {createLastServiceSegment} from '../game/last-service-segment.js';
import {createLastServiceRoute} from '../game/last-service-route.js';
import {createLastServiceView} from './last-service-view.js';
import {installManifest} from '../ui/relic.js';
const cv=document.getElementById('game'),view=createLastServiceView(cv);
const {doorScene,env}=createLastServiceEntry(createCombatDoorScene,createCombatDoorEnvironment);
const world=new CombatWorld(doorScene.map,s=>combatHero(s).tip),segment=createLastServiceSegment(),route=createLastServiceRoute(segment.tutorial),keys=new Set(),commands=[];
let paused=false,intent=null,pointer=null,last=null,acc=0,manifest,terminal=false,stopped=false,welcome=true;
const clear=()=>{keys.clear();commands.length=0;intent=null;};
const blocked=()=>paused||document.hidden||segment.snapshot().intro||segment.tutorial.snapshot().blocksWorld||manifest?.blocking();
const nearestDoor=()=>Math.hypot(world.current.x-8,world.current.y-11.5)<2.5?doorScene.getTarget(LAST_SERVICE_DOOR):null;
const targeting={intent:()=>intent,current:nearestDoor,cancelIntent:()=>{intent=null;}};
const controller=createCombatDoorController({world,scene:doorScene,targeting,active:()=>!blocked()}),lighting=findCombatLights(doorScene);
const shrine=createRitualBonfire(world,doorScene.map,{origin:{x:5,y:-25},positions:[[5,-25]]});
manifest=installManifest({canvas:cv,dimensions:()=>({cols:196,rows:168}),active:()=>!paused&&!document.hidden,onModalChange(on){clear();if(!on&&segment.tutorial.snapshot().dialogue)segment.tutorial.dismiss();}});
const bindings={light:'E — искры.',door:'F — подойти к двери и открыть.',attack:'ЛКМ / 1 — лёгкий удар.',combo:'Отдельные нажатия ЛКМ / 1 продолжают серию.',heavy:'ПКМ / 2 — тяжёлый удар.',dodge:'Направление + SHIFT — рывок.',cancel:'Направление + SHIFT во время своей атаки.',execution:'R — доступное добивание. Оно не обязательно.',ritual:'F у алой печати — зажечь костёр; повторно — ритуал.',archer:'Используй каменные опоры как укрытие.'};
function dialogue(lesson){clear();window.__ASH_MANIFEST__.openDialogue({id:lesson.id,speaker:lesson.title,text:lesson.line+'\n\n'+lesson.instruction+'\n\n'+(bindings[lesson.id]??'')});}
function reset(retry=false){
 manifest.dismiss();controller.cancel('reset');doorScene.reset();world.reset();shrine.reset();route.reset();
 Object.assign(world.current,{x:8,y:18.2,cameraX:8,cameraY:18.2,fx:-.6,fy:-.8,motion:createMotion(-.6,-.8),note:'Последняя служба'});
 world.current.enemies=[];world.current.enemy={...world.current.enemy,hp:0,mode:'dead'};world.previous=world.snapshot();welcome=!retry;
 if(retry)segment.retry();else segment.reset();paused=false;terminal=false;clear();last=null;acc=0;
 window.__ASH_MANIFEST__.setObjective({id:'last-service-route',title:'ПОСЛЕДНЯЯ СЛУЖБА',text:'Пройти погребальное крыло до нижней часовни.'});cv.focus();
}
const idle=()=>!world.current.action&&world.current.sweepProgress===null&&!world.current.dash&&!world.current.interaction&&!world.current.execution;
function updateRoute(){
 const s=world.current;route.observe(s);
 // Victory belongs to an encounter, not the entire prologue.
 if(s.phase==='won'){s.phase='playing';world.previous=world.snapshot();}
 if(segment.snapshot().intro||blocked()||s.phase!=='playing'||!idle())return;
 const basic=s.y<14?'door':s.y<17?'light':null;
 if(basic&&segment.tutorial.enter(basic)){dialogue(segment.tutorial.snapshot().dialogue);return;}
 const action=route.next(s);if(!action)return;
 if(action.kind==='lesson'){dialogue(action.lesson);return;}
 if(!idle()||s.hitReaction>0)return;
 const added=action.enemies.map(e=>makeBestiaryEnemy(...e));
 world.setEncounter([...(s.enemies??[]).filter(e=>e.hp>0),...added]);route.commit(action);
}
function step(dt){
 for(const c of commands.splice(0)){
  if(c.kind==='sweep')world.sweep(c.aim);
  else if(c.kind==='execute')world.execute();
  else if(c.kind==='dash'){const cancel=!!world.current.action;if(world.dash(c.direction)){segment.tutorial.record('dodge-started');if(cancel)segment.tutorial.record('attack-cancelled-by-dodge');}}
  else world.attack(c);
 }
 controller.step(dt,{...movement(),aim:view.aim(pointer)});shrine.step();env.step?.(dt);
 if(lighting.getSources().some(s=>s.status==='lit'))segment.tutorial.record('small-light-ignited');
 if(doorScene.snapshot().doors.some(d=>d.status==='open'))segment.tutorial.record('door-opened');
 for(const e of world.events.filter(e=>Math.abs(e.time-world.current.time)<1e-7)){
  if(e.type==='hit'){const a=world.current.action;if(a?.kind==='light')segment.tutorial.record('light-hit');if(a?.kind==='heavy')segment.tutorial.record('heavy-hit');if(a?.stage>0)segment.tutorial.record('combo-hit');}
  if(e.type==='execution-start')segment.tutorial.record('execution-started');
  if(e.type==='lamp-restored')segment.tutorial.record('ritual-completed');
 }
 updateRoute();
}
function movement(){return{x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))};}
function frame(now){
 if(stopped)return;
 try{
  const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;
  if(!paused&&!document.hidden)manifest.advance(now);
  segment.tick(dt,{paused:paused||document.hidden,modal:manifest.blocking()});
  if(!blocked()){
   if(welcome){welcome=false;window.__ASH_MANIFEST__.openDialogue({id:'movement',speaker:'ПОСЛЕДНЯЯ СЛУЖБА',text:'Печать цела. Служба продолжается.\n\nWASD / стрелки — движение. ESC — пауза. Пройди к свечам.'});}
   else updateRoute();
  }
  if(blocked()){acc=0;clear();}else{acc+=dt;for(let i=0;i<6&&acc>=1/60;i++){step(1/60);acc-=1/60;if(blocked())break;}}
  const finished=route.snapshot().finished&&world.current.y<-48&&world.current.phase==='playing';
  if(!terminal&&(world.current.phase==='dead'||finished)){
   terminal=true;clear();window.__ASH_MANIFEST__.openDialogue({id:'route-result',speaker:finished?'НИЖНЯЯ ЧАСОВНЯ':'ОГОНЬ ПОГАС',text:finished?'За проходом движется нечто тяжёлое.\n\nМаршрут второй итерации завершён. Босс появится в третьей.':'Повтори попытку. Прочитанные уроки сохраняются до полного перезапуска.'});
  }
  const s=controller.decorate(world.snapshot());s.interactionAnimation=shrine.frame()??s.interactionAnimation;
  view.paint({s,intro:segment.snapshot(),env,manifest,paused,ready:world.dashReady(),ritual:shrine.art(s,!blocked())});requestAnimationFrame(frame);
 }catch(error){stopped=true;window.__ASH_LAST_SERVICE_ERROR__=String(error.stack??error);document.getElementById('status').textContent='Ошибка: '+error.message;console.error(error);}
}
window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.target?.closest?.('button,input,textarea,select'))return;
 if(e.code==='Escape'){paused=!paused;clear();controller.cancel('pause');last=null;e.preventDefault();return;}
 if(blocked()||e.repeat)return;
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();return;}
 if(e.code==='KeyF'){if(!shrine.press()){const t=nearestDoor();if(t?.availability==='ready')intent={context:'game',kind:'door',targetId:t.id};}}
 else if(e.code==='KeyE')commands.push({kind:'sweep',aim:view.aim(pointer)});
 else if(e.code==='KeyR')commands.push({kind:'execute'});
 else if(e.code==='Digit1'||e.code==='Digit2')commands.push({kind:e.code==='Digit1'?'light':'heavy',aim:view.aim(pointer)});
 else if(e.code.startsWith('Shift'))commands.push({kind:'dash',direction:movement()});else return;
 if(commands.length>8)commands.length=8;e.preventDefault();
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{paused=true;clear();last=null;controller.cancel('blur');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;clear();last=null;}});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();pointer={x:(e.clientX-r.left)*1008/r.width,y:(e.clientY-r.top)*864/r.height};});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{cv.focus();if(e.defaultPrevented||blocked()||![0,2].includes(e.button))return;e.preventDefault();if(commands.length<8)commands.push({kind:e.button===0?'light':'heavy',aim:view.aim(pointer)});});
document.getElementById('retry').addEventListener('click',()=>reset(true));document.getElementById('new-game').addEventListener('click',()=>reset(false));
window.__ASH_LAST_SERVICE__=Object.freeze({state:()=>world.snapshot(),tutorial:()=>segment.tutorial.snapshot(),scene:()=>segment.snapshot(),route:()=>route.snapshot(),doors:()=>doorScene.snapshot(),lights:()=>lighting.snapshot(),retry:()=>reset(true),restart:()=>reset(false)});
reset();requestAnimationFrame(frame);
