import {createMotion} from '../animation/motion.js';
import {CombatWorld} from '../game/combat-world.js';
import {combatHero} from '../animation/combat-hero.js';
import {sealInspectionHero} from '../animation/last-service-seal.js';
import {makeBestiaryEnemy} from '../combat/bestiary.js';
import {executionEnemyParts} from '../render/execution-enemy.js';
import {createCombatDoorScene} from '../game/combat-door-scene.js';
import {createCombatDoorEnvironment} from '../render/combat-door-environment.js';
import {createCombatDoorController} from '../interaction/combat-door-controller.js';
import {findCombatLights} from '../game/combat-light-context.js';
import {createLastServiceEntry,LAST_SERVICE_DOOR} from '../levels/last-service-entry.js';
import {createLastServiceSegment} from '../game/last-service-segment.js';
import {installManifest} from '../ui/relic.js';
import {createEngineHudPass} from '../ui/engine-hud-pass.js';
import {paintHeroOverlayLabels} from '../ui/hero-overlay-labels.js';
import {lampLighting} from '../render/lamp-light.js';
import {ASCII} from '../render/ascii.js';
const cv=document.getElementById('game'),out=cv.getContext('2d'),W=1008,H=864,COLS=196,ROWS=168;
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const surface=canvas(W,H),ctx=surface.getContext('2d'),ascii=new ASCII(out),hud=createEngineHudPass(canvas);
const {doorScene,env}=createLastServiceEntry(createCombatDoorScene,createCombatDoorEnvironment);
const world=new CombatWorld(doorScene.map,s=>combatHero(s).tip),segment=createLastServiceSegment(),keys=new Set(),commands=[];
let paused=false,intent=null,pointer=null,last=null,acc=0,manifest,terminal=false,stopped=false,welcome=true,enemyActive=false;
const clear=()=>{keys.clear();commands.length=0;intent=null;};
const blocked=()=>paused||document.hidden||segment.snapshot().intro||segment.tutorial.snapshot().blocksWorld||manifest?.blocking();
const nearestDoor=()=>Math.hypot(world.current.x-8,world.current.y-11.5)<2.5?doorScene.getTarget(LAST_SERVICE_DOOR):null;
const targeting={intent:()=>intent,current:nearestDoor,cancelIntent:()=>{intent=null;}};
const controller=createCombatDoorController({world,scene:doorScene,targeting,active:()=>!blocked()});
const lighting=findCombatLights(doorScene);
manifest=installManifest({canvas:cv,dimensions:()=>({cols:COLS,rows:ROWS}),active:()=>!paused&&!document.hidden,onModalChange(on){clear();if(!on&&segment.tutorial.snapshot().dialogue)segment.tutorial.dismiss();}});
function reset(retry=false){
 manifest.dismiss();controller.cancel('reset');doorScene.reset();world.reset();
 Object.assign(world.current,{x:8,y:18.2,cameraX:8,cameraY:18.2,fx:-.6,fy:-.8,motion:createMotion(-.6,-.8),note:'Последняя служба'});
 world.setEncounter([makeBestiaryEnemy('bonebound',1,8,5.5)]);
 world.current.enemies=[];world.current.enemy={...world.current.enemy,hp:0,mode:'dead'};world.previous=world.snapshot();enemyActive=false;welcome=!retry;
 if(retry)segment.retry();else segment.reset();
 paused=false;terminal=false;clear();last=null;acc=0;
 window.__ASH_MANIFEST__.setObjective({id:'last-service-entry',title:'ПОСЛЕДНЯЯ СЛУЖБА',text:'Войти в часовню. Найти источник движения.'});
 cv.focus();
}
const project=(x,y,z)=>[W/2+((x-world.current.cameraX)-(y-world.current.cameraY))*49.4,430+((x-world.current.cameraX)+(y-world.current.cameraY))*27.95-z*56.55];
function aim(){if(!pointer)return null;const a=(pointer.x-W/2)/49.4,b=(pointer.y-430)/27.95;return{x:world.current.cameraX+(a+b)/2,y:world.current.cameraY+(b-a)/2};}
function renderPart(p){
 const rgb=c=>Array.isArray(c)?`rgb(${c.map(v=>Math.round(Math.max(0,Math.min(255,v))))})`:c;
 ctx.globalAlpha=p.alpha??1;ctx.fillStyle=rgb(p.c);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=p.w??1;ctx.lineCap='round';ctx.lineJoin='round';
 if(p.kind===2){const q=project(...p.v[0]),r=(p.r??0)*65/94;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.85,0,0,7);ctx.fill();return;}
 if(p.kind===3){const q=project(...p.v[0]);ctx.font=`${p.size??10}px monospace`;ctx.textAlign='center';ctx.fillText(p.text,...q);return;}
 ctx.beginPath();p.v.forEach((v,i)=>{const q=project(...v);if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});
 if(p.kind===1)ctx.stroke();else{ctx.closePath();ctx.fill();}
}
function render(){
 const s=controller.decorate(world.snapshot()),intro=segment.snapshot();
 const hero=intro.intro?sealInspectionHero(s,intro.elapsed):combatHero(s);
 const parts=[...env.parts,...(enemyActive?executionEnemyParts(s.enemy,s):[]),...s.particles.map(p=>({kind:2,v:[[p.x,p.y,p.z]],r:2,c:[255,160,64],alpha:Math.min(1,p.life*2),d:p.x+p.y+p.z*.006})),...hero.parts].sort((a,b)=>a.d-b.d);
 ctx.globalAlpha=1;ctx.fillStyle='#020306';ctx.fillRect(0,0,W,H);for(const p of parts)renderPart(p);ctx.globalAlpha=1;
 const data=ascii.read(surface,COLS,ROWS),lamp=project(...hero.lamp),profile=lampLighting(s.lamp,s.phase),radius=170*profile.radiusScale;
 const lights=env.lights.map(l=>({point:project(l.x,l.y,l.groundZ??l.z),r:l.r,power:l.power}));
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const k=(y*COLS+x)*4,px=(x+.5)*W/COLS,py=(y+.5)*H/ROWS;
  let gain=.065+profile.power*Math.exp(-((px-lamp[0])**2+(py-lamp[1])**2)/(2*radius**2));
  for(const l of lights)gain+=l.power*Math.exp(-((px-l.point[0])**2+(py-l.point[1])**2)/(2*l.r*l.r));
  data[k]*=gain;data[k+1]*=gain*.94;data[k+2]*=gain*.82;
 }
 const target=hud.begin(W,H);paintHeroOverlayLabels(target,s,{width:W,height:H,ready:world.dashReady()});
 target.fillStyle='#cdbb9c';target.font='15px monospace';target.textAlign='center';
 if(enemyActive&&s.enemy.hp>0){const p=project(s.enemy.x,s.enemy.y,2);target.fillText(`${s.enemy.hp} / ${s.enemy.maxHp} HP`,p[0],p[1]);}
 if(paused)target.fillText('ПАУЗА — ESC: продолжить',W/2,H/2);
 hud.compose(data,COLS,ROWS);if(!paused)manifest.paint(data,COLS,ROWS);
 out.fillStyle='#000';out.fillRect(0,0,W,H);ascii.paint(data,COLS,ROWS,0,H,false,hud.annotations());
 if(!paused)manifest.text(out,COLS,ROWS,H);
}
function step(dt){
 if(!enemyActive&&segment.tutorial.snapshot().read.includes('attack')&&!world.current.action&&world.current.sweepProgress===null&&!world.current.dash&&!world.current.interaction){world.setEncounter([makeBestiaryEnemy('bonebound',1,8,5.5)]);enemyActive=true;}
 for(const command of commands.splice(0)){
  if(command.kind==='sweep')world.sweep(command.aim);
  else if(command.kind==='dash')world.dash(command.direction);
  else world.attack(command);
 }
 const input={x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),aim:aim()};
 controller.step(dt,input);env.step?.(dt);
 if(lighting?.getSources().some(s=>s.status==='lit'))segment.tutorial.record('small-light-ignited');
 if(doorScene.snapshot().doors.some(d=>d.status==='open'))segment.tutorial.record('door-opened');
 if(world.events.some(e=>e.type==='hit'))segment.tutorial.record('light-hit');
}
function frame(now){
 if(stopped)return;
 try{
  const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;
  if(!paused&&!document.hidden)manifest.advance(now);
  segment.tick(dt,{paused:paused||document.hidden,modal:manifest.blocking()});
  if(!paused&&!document.hidden&&!manifest.blocking()&&!segment.tutorial.snapshot().blocksWorld){
   if(welcome&&!segment.snapshot().intro){welcome=false;window.__ASH_MANIFEST__.openDialogue({id:'last-service-movement',speaker:'ПОСЛЕДНЯЯ СЛУЖБА',text:'Печать ордена ещё цела. За дверью слышно движение.\n\nWASD / стрелки — движение. ESC — пауза. Пройди к свечам.'});}
   const lesson=manifest.blocking()?null:segment.next(world.current);
   if(lesson){clear();window.__ASH_MANIFEST__.openDialogue({id:lesson.id,speaker:lesson.title,text:lesson.line+'\n\n'+lesson.instruction+'\n\n'+({light:'[E] — искры. Направление — к курсору.',door:'[F] — подойти к двери и открыть её.',attack:'[ЛКМ] / [1] — лёгкий удар. Направление — к курсору.'}[lesson.id]??'')});}
  }
  if(blocked()){acc=0;clear();}else{acc+=dt;for(let n=0;acc>=1/60&&n<6;n++){step(1/60);acc-=1/60;if(blocked())break;}}
  if(!terminal&&['dead','won'].includes(world.current.phase)){
   terminal=true;clear();window.__ASH_MANIFEST__.openDialogue({id:'entry-result',speaker:world.current.phase==='won'?'ПЕРВЫЙ УЧАСТОК ПРОЙДЕН':'ОГОНЬ ПОГАС',text:world.current.phase==='won'?'За караульной слышно продолжение службы. Здесь заканчивается первая игровая итерация.':'Повтори попытку кнопкой «Повторить». Прочитанные уроки не будут открываться заново.'});
  }
  render();requestAnimationFrame(frame);
 }catch(error){stopped=true;window.__ASH_LAST_SERVICE_ERROR__=String(error.stack??error);document.getElementById('status').textContent='Ошибка: '+error.message;console.error(error);}
}
window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.target?.closest?.('button,input,textarea,select'))return;
 if(e.code==='Escape'){paused=!paused;clear();controller.cancel('pause');last=null;e.preventDefault();return;}
 if(blocked()||e.repeat)return;
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();return;}
 if(e.code==='KeyF'){const t=nearestDoor();if(t?.availability==='ready')intent={context:'game',kind:'door',targetId:t.id};}
 else if(e.code==='KeyE')commands.push({kind:'sweep',aim:aim()});
 else if(e.code==='Digit1'||e.code==='Digit2')commands.push({kind:e.code==='Digit1'?'light':'heavy',aim:aim()});
 else if(e.code.startsWith('Shift'))commands.push({kind:'dash',direction:{x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'))}});
 else return;
 if(commands.length>8)commands.length=8;e.preventDefault();
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{paused=true;clear();last=null;controller.cancel('blur');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;clear();last=null;}});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();pointer={x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{cv.focus();if(e.defaultPrevented||blocked()||![0,2].includes(e.button))return;e.preventDefault();if(commands.length<8)commands.push({kind:e.button===0?'light':'heavy',aim:aim()});});
document.getElementById('retry').addEventListener('click',()=>reset(true));
document.getElementById('new-game').addEventListener('click',()=>reset(false));
window.__ASH_LAST_SERVICE__=Object.freeze({state:()=>world.snapshot(),tutorial:()=>segment.tutorial.snapshot(),scene:()=>segment.snapshot(),doors:()=>doorScene.snapshot(),lights:()=>lighting?.snapshot(),retry:()=>reset(true),restart:()=>reset(false)});
reset();requestAnimationFrame(frame);
