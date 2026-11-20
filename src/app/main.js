// GOLEM_TRIAL_APP_V1
import {captureGolemLoadout,restoreGolemLoadout} from '../game/golem-trial-state.js';
import {paintGolemTrialHud} from '../ui/golem-trial-hud.js';
// VISUAL_EMBER_ASCII_V1
import {shadeAmberCell} from '../render/amber-cell.js';
import {arrowParts} from '../render/marrow-archer.js';
import {gameLevel,GAME_LEVELS,applyLevelSpawn} from '../levels/registry.js';
import {enemiesOf} from '../combat/enemy-roster.js';
import {createEnemyHealthRuntime} from './enemy-health-runtime.js'; // ENEMY_HEALTH_CONNECTED_V2
import {createWorldReference} from '../levels/world-reference.js';
import {buildLevelScene} from '../levels/runtime.js';
import {installManifest} from '../ui/relic.js';
import {createRelicWorld} from '../interaction/relic-world.js';
import {installAttackInput} from './attack-input.js';
import {createGalleryInteraction} from '../interaction/gallery-interaction.js';
import {createGalleryApproach} from '../interaction/gallery-approach.js';
import {interactionInputAllowed} from '../interaction/intent.js';
import {installFrameTargeting,pickFrameTarget} from './frame-targeting.js';
import {lampLighting} from '../render/lamp-light.js';
import {createFireHintParts,createFireHintLayer,sparkFlashProfile} from '../render/fire-feedback.js';
import {applyHeroBackdrop} from '../render/hero-backdrop.js';
import {findCombatLights} from '../game/combat-light-context.js';
import {installViewport,screenPoint,basePoint} from './viewport.js';
import {ExecutionEffects,projectExecution,unprojectExecution} from '../render/execution-effects.js';
import {installExecutionOptions} from './execution-options.js';
import {installExecutionInput} from './execution-input.js';
import {movementInput} from './movement-input.js';
import {DASH,dashVisual} from '../combat/ash-dash.js';
import {createRitualBonfire} from '../interaction/ritual-bonfire.js';
import { composeCombatHud } from '../ui/combat-hud.js';
import {interactionCamera} from '../render/interaction-camera.js';
import {isDesktopMode,desktopItems,installDesktop} from './desktop-mode.js';
const DESKTOP=isDesktopMode();
import {CombatWorld} from '../game/combat-world.js';
import {combatHero} from '../animation/combat-hero.js';
import {OBSTACLES} from '../combat/geometry.js';
import {createCombatDoorScene} from '../game/combat-door-scene.js';
import {createCombatDoorEnvironment,fireWarmthOf} from '../render/combat-door-environment.js';
import {createCombatDoorController} from '../interaction/combat-door-controller.js';
import {executionEnemyParts as enemyParts} from '../render/execution-enemy.js';
import {ASCII} from '../render/ascii.js';
import {makeUI} from '../ui/ornaments.js';
import {createGalleryScene} from '../gallery/scene.js';
import {createGalleryLayout} from '../gallery/layout.js';
import {galleryRenderRange,galleryRenderLayers} from '../gallery/render-frame.js';
import {createGalleryPlayer} from '../gallery/player.js';
import * as galleryMotion from '../animation/motion.js';
import {advanceWorldFootContacts} from '../animation/foot-contact-world.js';
const $=s=>document.getElementById(s),cv=$('game'),out=cv.getContext('2d',{willReadFrequently:true}),H=720,ROWS=140;let W=1008,COLS=196;
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},scene=canvas(W,H),mask=canvas(W,H),sg=scene.getContext('2d',{willReadFrequently:true}),mg=mask.getContext('2d',{willReadFrequently:true});
const ascii=new ASCII(out),maskReader=new ASCII(out),uiASCII=new ASCII(out,1008),ui=makeUI(out,(src,cols,rows,y,h,mono)=>{out.save();out.translate((W-1008)/2,0);uiASCII.paint(src,cols,rows,y,h,mono);out.restore();});
const fireHintLayer=createFireHintLayer(canvas(W,H));
let doorScene=createCombatDoorScene(OBSTACLES),env=createCombatDoorEnvironment(doorScene);
const worldReference=createWorldReference(new CombatWorld(doorScene.map,s=>combatHero(s).tip)),world=worldReference.proxy;
const effects=new ExecutionEffects(),executionOptions=installExecutionOptions(),keys=new Set(),commands=[],report={build:'ASH_IRON_ITERATION_4A',errors:[],frames:[],backend:'Canvas2D / ASCII cell lighting',gpuTime:null};
let fireLighting=findCombatLights(doorScene);
let ritualBonfire=createRitualBonfire(world,doorScene.map);
const dashHud={ready:false,at:-Infinity};
const enemyHealth=createEnemyHealthRuntime({diagnosticsTarget:window});
let mode='menu',selected=0,menuPage=false,time=0,last=0,drawAt=0,simLast=null,acc=0,paused=false,frozen=false,endTime=0,aimPoint=null,camera={x:8,y:12},view={zoom:1,dx:0,dy:0},renderCount=0,fireAt=-1,coneBoost=0;
let manualAdvance=false;
let selectedLevelId='test-chamber';
let golemCheckpoint=null;
let manifest=null;
let relicWorld=typeof createRelicWorld==='function'?createRelicWorld({
 map:doorScene.map,
 openDialogue:value=>window.__ASH_MANIFEST__?.openDialogue(value),
 openReading:value=>window.__ASH_MANIFEST__?.openReading(value),
 setObjective:value=>window.__ASH_MANIFEST__?.setObjective(value),
}):null;
let galleryScene=null,galleryCamera=null,galleryReturn=null,galleryTimings=null,galleryTime=0,galleryPlayer=null;
const interactionContext=()=>mode==='gallery'?(galleryPlayer?'gallery-walk':'gallery-preview'):mode;
const targeting=installFrameTargeting(cv,{enemyTarget:()=>enemyHealth.hoverId(),context:interactionContext,resolve:id=>mode==='gallery'?galleryScene?.getTarget(id):(env.targets??[]).find(t=>t.id===id),canRequest:()=>!manifest?.blocking()&&interactionInputAllowed({mode:interactionContext(),actor:mode==='gallery'?galleryPlayer?.snapshot():world.current,frozen,hidden:document.hidden,queued:commands.length>0})});
let combatDoor=createCombatDoorController({world,scene:doorScene,targeting,active:()=>mode==='game'&&(!frozen||manualAdvance)});
function stepWorld(dt,input){if(manifest?.blocking())return;combatDoor.step(dt,input);ritualBonfire.step();env.step?.(dt);effects.step(dt,world.current,world.events);}
function advanceWorld(seconds){
 if(!Number.isFinite(seconds)||seconds<0||seconds>120)throw Error('Invalid manual advance duration');
 if(mode!=='game'||document.hidden||manifest?.blocking())return false;
 const previous=manualAdvance;manualAdvance=true;
 try{for(let i=0;i<Math.round(seconds*60);i++)stepWorld(1/60);}finally{manualAdvance=previous;simLast=null;acc=0;}
 return true;
}
function resetWorld(){targeting.clear();relicWorld?.reset();manifest?.reset();enemyHealth.reset();combatDoor.cancel('reset');doorScene.reset();world.reset();applyLevelSpawn(world,selectedLevelId);if(selectedLevelId==='golem-trial'&&golemCheckpoint){restoreGolemLoadout(world.current,golemCheckpoint);world.previous=world.snapshot();}ritualBonfire.reset();dashHud.ready=false;dashHud.at=-Infinity;effects.reset();fireHintLayer.clear();view={zoom:1,dx:0,dy:0};}
const fire=canvas(192,165),fg=fire.getContext('2d',{willReadFrequently:true}),fireASCII=new ASCII(out);
const basePr=(x,y,z,cx=camera.x,cy=camera.y)=>[504+((x-cx)-(y-cy))*65*.76,430+((x-cx)+(y-cy))*65*.43-z*65*.87];
const pr=(x,y,z,cx=camera.x,cy=camera.y)=>screenPoint(projectExecution(basePr(x,y,z,cx,cy),view),W);
const unpr=(p)=>{if(!p)return null;const q=unprojectExecution(basePoint([p.x,p.y],W),view),a=(q[0]-504)/(65*.76),b=(q[1]-430)/(65*.43);return{x:camera.x+(a+b)/2,y:camera.y+(b-a)/2};};
const color=c=>Array.isArray(c)?`rgb(${c.map(v=>Math.round(Math.max(0,Math.min(255,v))))})`:c;
function part(ctx,p,s,isMask){if(p.alpha===0)return;const previousAlpha=ctx.globalAlpha;ctx.globalAlpha=Math.max(0,Math.min(1,p.alpha??1));ctx.fillStyle=isMask?(p.hero?'#fff':'#000'):color(p.c);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=(p.w||1)*(s.visualZoom??1);ctx.lineCap='round';ctx.lineJoin='round';if(p.kind===3){const q=pr(...p.v[0],s.cameraX,s.cameraY);ctx.font=`${(p.size??10)*(s.visualZoom??1)}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.text,...q);ctx.globalAlpha=previousAlpha;return;}if(p.kind===2){const q=pr(...p.v[0],s.cameraX,s.cameraY),r=(p.r||0)*65/94*(s.visualZoom??1);ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.85,0,0,7);ctx.fill();ctx.globalAlpha=previousAlpha;return;}ctx.beginPath();p.v.forEach((v,i)=>{const q=pr(...v,s.cameraX,s.cameraY);i?ctx.lineTo(...q):ctx.moveTo(...q);});if(p.kind===1)ctx.stroke();else{ctx.closePath();ctx.fill();if(p.s){ctx.strokeStyle=isMask?ctx.fillStyle:color(p.s);ctx.stroke();}}ctx.globalAlpha=previousAlpha;}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function render(s=world.snapshot(),galleryFrame=null){
 if(!galleryFrame){manifest?.advance(performance.now());manifest?.update(s);}
 const rite=galleryFrame||selectedLevelId==='golem-trial'?null:ritualBonfire.frame();
 const ritualArt=galleryFrame||selectedLevelId==='golem-trial'?null:ritualBonfire.art(s,ritualInputAllowed()&&!targeting.current());
 if(!galleryFrame){
  s=combatDoor.decorate(s);
  s={...s,interactionAnimation:rite??s.interactionAnimation,comboEdgeActive:s.phase==='playing'&&world.actions.canContinue()};
 }
 const start=performance.now(),hero=galleryFrame&&!galleryPlayer?{parts:[],lamp:[s.cameraX,s.cameraY,1.1]}:combatHero(s),visual=galleryFrame?{camera:{focusX:s.cameraX,focusY:s.cameraY,focusZ:0,zoom:1,weight:0,shakeX:0,shakeY:0},parts:[],lights:[]}:effects.frame(s,hero.lamp,executionOptions);
 const doorFrame=s.interactionAnimation;
 const doorPassable=doorFrame?.kind==='door'&&doorScene.snapshot().doors.some(door=>door.actionId===s.interaction?.id&&door.status==='open');
 const v=galleryFrame||rite?visual.camera:interactionCamera(s,visual.camera,doorPassable);
 const focus=basePr(v.focusX,v.focusY,v.focusZ,s.cameraX,s.cameraY);
 camera={x:s.cameraX,y:s.cameraY};view={zoom:v.zoom,dx:(504-focus[0])*(v.zoom-1)+v.weight*(504-focus[0])*.3+v.shakeX,dy:(430-focus[1])*(v.zoom-1)+v.weight*(430-focus[1])*.3+v.shakeY};
 const enemyGroups=galleryFrame?[]:enemyHealth.geometry(s,enemyParts);
 const drawState={...s,visualZoom:view.zoom},galleryDraw=galleryFrame?galleryRenderLayers(galleryFrame):null,parts=galleryDraw?[...galleryDraw.objects,...hero.parts].sort((a,b)=>a.d-b.d):[...env.parts,...enemyGroups.flatMap(g=>g.parts),...arrowParts(s.arrows??[]),...hero.parts,...visual.parts,...(ritualArt?.parts??[])].sort((a,b)=>a.d-b.d);
 if(!galleryFrame&&relicWorld&&selectedLevelId!=='golem-trial'){parts.push(...relicWorld.parts(s));parts.sort((a,b)=>a.d-b.d);}
 targeting.frame({parts,targets:galleryFrame?.targets??env.targets??[],project:pr,zoom:view.zoom,active:(mode==='gallery'&&!galleryPlayer)||((mode==='game'||mode==='gallery')&&s.phase==='playing')});
 const lamp=pr(...hero.lamp),lampProfile=lampLighting(s.lamp,galleryFrame&&!galleryPlayer?'playing':s.phase),radius=146*65/94*1.2*view.zoom*lampProfile.radiusScale,power=lampProfile.power;
 if(!galleryFrame){
  const clean=parts.filter(p=>!p.interactionVapor).map(p=>p.interactionSource??p);parts.splice(0,parts.length,...clean);
  const canHover=aimPoint&&interactionInputAllowed({mode:'game',actor:s,frozen,hidden:document.hidden,queued:commands.length>0}),hover=canHover?pickFrameTarget({parts,targets:[...doorScene.targets,...(fireLighting?.getFrame().targets??[])],point:[aimPoint.x,aimPoint.y],project:pr,zoom:view.zoom,viewport:{width:W,height:H}}):null;
  parts.push(...createFireHintParts({sources:fireLighting?.getSources()??[],hover,time:s.time,project:pr,lamp:{point:lamp,radius,power},reducedMotion:!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches}));parts.sort((a,b)=>a.d-b.d);
 }
 sg.fillStyle='#020306';sg.fillRect(0,0,W,H);mg.fillStyle='#000';mg.fillRect(0,0,W,H);if(galleryDraw)for(const p of galleryDraw.floor)part(sg,p,drawState,false);
 let marked=false;for(const p of parts){if(p.fireHint)continue;part(sg,p,drawState,false);if(p.hero)marked=true;if(marked)part(mg,p,drawState,true);}
 if(!galleryFrame)fireHintLayer.render(parts,(ctx,p)=>part(ctx,p,drawState,false));else fireHintLayer.clear();
 const data=ascii.read(scene,COLS,ROWS),ma=maskReader.read(mask,COLS,ROWS),geometryMs=performance.now()-start,lights=(galleryFrame?galleryFrame.lights:[...env.lights,...(ritualArt?.lights??[]).map(l=>({...l,fireWarmth:1}))]).map(l=>({p:pr(l.x,l.y,l.z),r:l.r*view.zoom,v:l.power,fireWarmth:fireWarmthOf(l)})),sparkFlash=sparkFlashProfile(s.cone);
 for(const p of (sparkFlash.gain>0?s.particles.filter(p=>p.glow&&p.life>.08).slice(0,12):[]))lights.push({p:pr(p.x,p.y,p.z),r:sparkFlash.particleRadius*view.zoom,v:sparkFlash.particlePower*Math.min(1,p.life*2)});
 for(const q of visual.lights)lights.push({p:pr(...q.position),r:q.radius*view.zoom,v:q.power});
 const dashEffect=s.dash?dashVisual(s.dash):{visibility:1,flare:0};if(dashEffect.flare>0)lights.push({p:pr(s.x,s.y,.7),r:115*view.zoom,v:dashEffect.flare*.8});const t=performance.now();coneBoost=0;
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const k=(y*COLS+x)*4,px=(x+.5)*W/COLS,py=(y+.5)*H/ROWS,h=ma[k]>127,n=power>0?Math.exp(-((px-lamp[0])**2+(py-lamp[1])**2)/(2*radius**2)):0;let l=.018+(h?.065:.12)+n*.82*1.6*power*(1+Math.sin(s.time*2.2)*.035),f=0,fireGlow=0;for(const q of lights){const dx=px-q.p[0],dy=py-q.p[1];if(Math.abs(dx)>q.r*3||Math.abs(dy)>q.r*3)continue;const glow=Math.exp(-(dx*dx+dy*dy)/(2*q.r*q.r))*q.v;l+=glow;fireGlow+=glow*(q.fireWarmth??0);}if(!h&&s.cone&&sparkFlash.gain>0){const q=unpr({x:px,y:py}),c=s.cone,dx=q.x-c.x,dy=q.y-c.y,d=Math.hypot(dx,dy),front=(dx*c.fx+dy*c.fy)/Math.max(.01,d),edge=Math.cos(80*Math.PI/180);if(d>.2&&d<sparkFlash.range&&front>edge){f=sparkFlash.gain*smooth((front-edge)/.16)*smooth((d-.2)/.35)*(1-smooth((d-(sparkFlash.range-.5))/.5));l+=f;coneBoost+=f;}}if(h)l=Math.max(.38,Math.min(.82,l));const v=Math.max(.25,1-((px-W/2)/(700*W/1008))**2*.32-((py-360)/600)**2*.2),warm=Math.min(1,n*lampProfile.warmth+f+Math.min(1,fireGlow)),base=l*v*(h?1:1.25);shadeAmberCell(data,k,base,warm,h);}
 if(!galleryFrame)enemyHealth.update({parts,groups:enemyGroups,project:pr,zoom:view.zoom,viewport:{width:W,height:H},cells:{data,cols:COLS,rows:ROWS},pointer:aimPoint?[aimPoint.x,aimPoint.y]:null,state:world.current,events:world.events,enabled:mode==='game'&&!manifest?.blocking()&&!document.hidden&&s.phase==='playing'});
  const heroBackdropCells = galleryFrame
   ? 0
   : applyHeroBackdrop(data, ma, COLS, ROWS);

 const frameHeight = 864;
 const frameRows = Math.round(ROWS * frameHeight / H);
 const frame = galleryFrame
   ? data
   : composeCombatHud(
       data, COLS, ROWS, frameRows,
       dashHud, s, world.dashReady(), DASH.cooldown,
     );

 if(!galleryFrame)manifest?.paint(frame,COLS,frameRows);
 const lightingMs = performance.now() - t;
 const glyphAt = performance.now();

 out.fillStyle = '#000';
 out.fillRect(0, 0, W, frameHeight);
 ascii.paint(
   frame,
   COLS,
   galleryFrame ? ROWS : frameRows,
   0,
   galleryFrame ? H : frameHeight,
 );

 if (!galleryFrame) fireHintLayer.composite(out);

 out.save();
 out.beginPath();
 out.rect(0, 0, W, H);
 out.clip();
 out.textAlign = 'center';
 out.textBaseline = 'middle';
 out.font = `${11 * view.zoom}px monospace`;

 for (const p of s.particles) {
   out.globalAlpha = Math.min(1, p.life * 2.2);
   out.fillStyle = p.life > .55 ? '#fff0c0' : p.life > .28 ? '#ffb04a' : '#d9622c';
   out.fillText(p.glyph, ...pr(p.x, p.y, p.z));
 }

 out.restore();
 if(!galleryFrame&&mode==='game'&&!manifest?.blocking())enemyHealth.paint(out,{width:W,height:H});
 if(!galleryFrame&&selectedLevelId==='golem-trial')paintGolemTrialHud(out,s,{width:W,enabled:mode==='game'&&!manifest?.blocking()&&!document.hidden,available:world.executionAvailable()});
 if(!galleryFrame)manifest?.text(out,COLS,frameRows,frameHeight);
 renderCount++;
 renderCount++;
 return{geometryMs,lightingMs,glyphMs:performance.now()-glyphAt,cpuMs:performance.now()-start,lampLight:{...lampProfile,radiusPixels:radius},coneBoost,sparkFlashGain:sparkFlash.gain,fireHintParts:parts.filter(p=>p.fireHint).length,actionHint:parts.find(p=>p.actionLabel)?.text??null,heroBackdropCells,dashVisibility:dashEffect.visibility,dashFlare:dashEffect.flare,executionCamera:{...view},executionParticles:galleryFrame?0:effects.particles.length,gallery:galleryFrame?{objects:galleryFrame.stats.objects,visibleObjects:galleryFrame.stats.visibleObjects,floorParts:galleryFrame.floorParts.length,objectParts:galleryFrame.parts.length,lights:galleryFrame.lights.length,heroParts:hero.parts.length,heroClip:hero.clip??null}:undefined};
}
function renderGallery(){if(!galleryScene||mode!=='gallery')throw Error('Gallery preview is not open');const walking=galleryPlayer?.snapshot();if(walking)galleryCamera={x:walking.cameraX,y:walking.cameraY};const frame=galleryScene.getFrame(galleryCamera,galleryRenderRange(W,H)),s=walking??{...world.snapshot(),cameraX:galleryCamera.x,cameraY:galleryCamera.y,time:galleryTime,lamp:100,particles:[],cone:null,dash:null};galleryTimings=render(s,frame);$('status').textContent=galleryPlayer?'OBJECT GALLERY / WALK TEST / COLLISIONS ON':'OBJECT GALLERY / RENDER PREVIEW';return galleryTimings;}
function openGallery(){if(mode==='gallery')return galleryScene.stats();enemyHealth.reset();manifest?.dismiss();combatDoor.cancel('gallery-open');targeting.clear();const next=createGalleryScene();galleryReturn={mode,camera:{...camera},view:{...view}};galleryScene=next;galleryCamera=next.getSpawn();galleryTime=0;galleryTimings=null;mode='gallery';keys.clear();commands.length=0;aimPoint=null;simLast=null;acc=0;drawAt=0;cv.focus();try{renderGallery();}catch(error){closeGallery();throw error;}return next.stats();}
function closeGallery(){if(mode!=='gallery')return;targeting.clear();galleryPlayer?.dispose?.();galleryPlayer=null;galleryScene.dispose();galleryScene=null;galleryCamera=null;galleryTimings=null;mode=galleryReturn.mode;camera=galleryReturn.camera;view=galleryReturn.view;galleryReturn=null;keys.clear();commands.length=0;aimPoint=null;simLast=null;acc=0;drawAt=0;$('status').textContent=world.current.note;cv.focus();}
function gallerySetCamera(x,y){if(mode!=='gallery'||![x,y].every(Number.isFinite))throw Error('Invalid gallery camera');if(galleryPlayer){galleryPlayer.dispose?.();targeting.clear();}galleryPlayer=null;keys.clear();acc=0;simLast=null;const b=galleryScene.getBounds();galleryCamera={x:Math.max(b.minX,Math.min(b.maxX,x)),y:Math.max(b.minY,Math.min(b.maxY,y))};return renderGallery();}
function walkGallery(){targeting.clear();galleryPlayer?.dispose?.();openGallery();galleryPlayer=createGalleryInteraction(createGalleryApproach(createGalleryPlayer(world.snapshot(),galleryScene.getSpawn(),galleryScene.getBounds(),{...galleryMotion,contacts:advanceWorldFootContacts,colliders:galleryScene.getColliders()}),galleryScene,targeting,{allowed:()=>mode==='gallery'&&!document.hidden&&!document.activeElement?.isContentEditable&&!document.activeElement?.closest?.('input,select,textarea,button,[contenteditable]'),manualHeld:()=>['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys.has(k))}),galleryScene,targeting,{context:interactionContext});galleryCamera=galleryScene.getSpawn();keys.clear();commands.length=0;simLast=null;acc=0;drawAt=0;return renderGallery();}
window.__ASH_GALLERY__=Object.freeze({open:openGallery,walk:walkGallery,player:()=>galleryPlayer?.snapshot()??null,approach:()=>galleryPlayer?.approach()??null,interaction:()=>galleryPlayer?.interaction()??null,interactionEvents:()=>galleryPlayer?.interactionEvents()??[],close:closeGallery,render:renderGallery,setCamera:gallerySetCamera,camera:()=>galleryCamera?{...galleryCamera}:null,stats:()=>galleryScene?galleryScene.stats():null,focus:id=>{if(mode!=='gallery')throw Error('Gallery preview is not open');const e=createGalleryLayout().entries.find(e=>e.id===id);if(!e)throw Error('Unknown gallery object: '+id);return gallerySetCamera(e.x,e.y);}});
function rebuildSelectedLevel(){
 const next=buildLevelScene(selectedLevelId,{baseObstacles:OBSTACLES,createDoorScene:createCombatDoorScene,createDoorEnvironment:createCombatDoorEnvironment});
 const nextWorld=new CombatWorld(next.doorScene.map,s=>combatHero(s).tip);
 manifest?.dismiss();combatDoor.cancel('level-change');targeting.clear();
 doorScene=next.doorScene;env=next.env;worldReference.replace(nextWorld);enemyHealth.reset();
 fireLighting=findCombatLights(doorScene);ritualBonfire=createRitualBonfire(world,doorScene.map);
 relicWorld=selectedLevelId==='golem-trial'?null:createRelicWorld({map:doorScene.map,openDialogue:value=>window.__ASH_MANIFEST__?.openDialogue(value),openReading:value=>window.__ASH_MANIFEST__?.openReading(value),setObjective:value=>window.__ASH_MANIFEST__?.setObjective(value)});
 combatDoor=createCombatDoorController({world,scene:doorScene,targeting,active:()=>mode==='game'&&(!frozen||manualAdvance)});
 keys.clear();commands.length=0;aimPoint=null;simLast=null;acc=0;drawAt=0;
}
function launchLevel(id){gameLevel(id);const previous=selectedLevelId,oldCheckpoint=golemCheckpoint;if(id==='golem-trial'&&previous!=='golem-trial')golemCheckpoint=captureGolemLoadout(world.current);selectedLevelId=id;try{start();}catch(error){selectedLevelId=previous;golemCheckpoint=oldCheckpoint;throw error;}return {id:selectedLevelId};}
window.__ASH_LEVELS__=Object.freeze({list:()=>GAME_LEVELS.map(l=>({...l})),current:()=>({...gameLevel(selectedLevelId)}),start:launchLevel,menu:()=>window.__ASH_THRONE__?.levels?.()});
function startBoneboundTrial(){return launchLevel('bonebound-trial');}
window.__ASH_BESTIARY__=Object.freeze({startTrial:startBoneboundTrial});
function items(){if(DESKTOP)return desktopItems(mode,{start,resume});return mode==='menu'?[['BEGIN DESCENT',start],['THE EMBER CHAMBER',()=>{$('settings').hidden=!$('settings').hidden;}],['THE RITES',()=>menuPage=true]]:mode==='pause'?[['RESUME',resume],['RESTART NAVE',start],['MAIN MENU',home]]:[['RISE AGAIN',start],['MAIN MENU',home]];}
function drawMenu(){out.fillStyle='#000';out.fillRect(0,0,W,864);if(time-fireAt>.025||fireAt<0){fireAt=time;const a=fg.createImageData(192,165),flow=time,power=+$('power').value/100*($('dim').checked?.6:1),clamp=x=>Math.max(0,Math.min(1,x));for(let y=0;y<165;y++)for(let x=0;x<192;x++){const px=x/192,py=y/165,qx=px*7+Math.sin(py*8-flow*.35)*.8,qy=py*7-flow*.6,v=(Math.sin(qx*1.8+Math.sin(qy*1.5+flow*.11))*Math.sin(qy*1.8)+Math.sin(qx*3.7-qy*.8+flow*.2)*.35+Math.sin((qx+qy)*6+flow*.1)*.13+1.5)/3,etch=1-Math.min(1,Math.abs(Math.sin(v*45+qy*.9))/.5),clear=clamp((Math.hypot((px-.5)*1.05,(py-.55)*1.1)-.18)/.3),f=clamp((v-.25)*1.4)*(.2+.8*etch)*(.12+.88*clear)*power,k=(y*192+x)*4;a.data[k]=220*f;a.data[k+1]=39*f;a.data[k+2]=32*f;a.data[k+3]=255;}fg.putImageData(a,0,0);fireASCII.paint(fire,Math.round(W/5.25),165,0,864);}else{fireASCII.paint(fire,Math.round(W/5.25),165,0,864);}ui.menu(mode,selected,items().map(i=>i[0]),menuPage);}
function start(){targeting.clear();if(mode==='gallery')closeGallery();rebuildSelectedLevel();resetWorld();mode='game';selected=0;menuPage=false;paused=false;frozen=false;endTime=0;keys.clear();commands.length=0;simLast=null;acc=0;report.frames=[];camera={x:8,y:12};$('freeze').textContent='FREEZE FRAME';cv.focus();}
function resume(){targeting.clear();if(mode==='gallery')closeGallery();mode='game';paused=false;keys.clear();commands.length=0;simLast=null;acc=0;cv.focus();}
function home(){targeting.clear();if(mode==='gallery')closeGallery();resetWorld();mode='menu';selected=0;menuPage=false;keys.clear();commands.length=0;}
function pause(){if(mode!=='game')return;enemyHealth.reset();manifest?.dismiss();combatDoor.cancel('pause');targeting.clear();mode='pause';selected=0;keys.clear();commands.length=0;simLast=null;acc=0;}
const point=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*864/r.height};};
const ritualInputAllowed=()=>selectedLevelId!=='golem-trial'&&!manifest?.blocking()&&interactionInputAllowed({mode:interactionContext(),actor:world.current,frozen,hidden:document.hidden,queued:commands.length>0});
window.addEventListener('keydown',event=>{
 if(event.code!=='KeyF'||event.repeat||event.defaultPrevented||mode!=='game'||event.target?.isContentEditable||event.target?.closest?.('input,select,textarea,button,[contenteditable]'))return;
 if(ritualInputAllowed()&&!targeting.current()&&relicWorld?.press(world.current)){event.preventDefault();event.stopImmediatePropagation();return;}
 if(!ritualInputAllowed()||targeting.current()||!ritualBonfire.press())return;
 event.preventDefault();
 event.stopImmediatePropagation();
},true);
window.addEventListener('keydown',e=>{if(e.target?.isContentEditable||e.target?.closest?.('input,select,textarea,button,[contenteditable]'))return;if(mode==='gallery'){if(e.code==='Escape'){closeGallery();e.preventDefault();}else if(galleryPlayer&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){galleryPlayer.cancelApproach('manual');keys.add(e.code);e.preventDefault();}return;}if(mode!=='game'){if(e.code==='Escape'&&menuPage){menuPage=false;e.preventDefault();return;}if(e.code==='Escape'&&mode==='pause'){resume();e.preventDefault();return;}if(e.code==='ArrowDown'||e.code==='ArrowUp'){selected=(selected+(e.code==='ArrowDown'?1:items().length-1))%items().length;e.preventDefault();}if(e.code==='Enter'&&!e.repeat){if(menuPage)menuPage=false;else items()[selected][1]();e.preventDefault();}return;}if(e.code==='Escape'){pause();e.preventDefault();return;}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();}if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat&&!frozen&&!world.current.dash){if(commands.length<8)commands.push({kind:'dash',direction:movementInput(keys)});e.preventDefault();return;}if(e.code==='KeyE'&&!e.repeat&&!frozen&&!world.current.dash){commands.push({kind:'sweep',aim:unpr(aimPoint)});e.preventDefault();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();combatDoor.cancel('blur');});cv.addEventListener('pointermove',e=>{aimPoint=point(e);if(mode!=='game'&&mode!=='gallery'&&!menuPage){const i=Math.round((aimPoint.y-414)/49);if(i>=0&&i<items().length&&aimPoint.x>220&&aimPoint.x<788)selected=i;}});cv.addEventListener('pointerleave',()=>aimPoint=null);cv.addEventListener('pointerdown',e=>{cv.focus();if(mode==='gallery')return;const p=point(e);if(mode!=='game'){if(e.button!==0)return;if(menuPage){menuPage=false;return;}const i=Math.round((p.y-414)/49);if(i>=0&&i<items().length&&p.x>220&&p.x<788)items()[i][1]();return;}if(frozen||world.current.dash||p.y>=720)return;e.preventDefault();const kind=e.button===0?'light':e.button===2?'heavy':e.button===1?'sweep':null;if(kind&&commands.length<8)commands.push({kind,aim:unpr(p)});});cv.addEventListener('contextmenu',e=>e.preventDefault());cv.addEventListener('auxclick',e=>e.preventDefault());document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();simLast=null;});
$('menuButton').onclick=()=>mode==='gallery'?closeGallery():mode==='pause'?resume():pause();$('restart').onclick=start;$('bestiaryTrial').onclick=startBoneboundTrial;$('undeadTrial').onclick=()=>launchLevel('undead-trial');$('archerTrial').onclick=()=>launchLevel('archer-trial');const golemButton=document.createElement('button');golemButton.id='golemTrial';golemButton.textContent='GOLEM TRIAL';golemButton.onclick=()=>launchLevel('golem-trial');$('archerTrial').after(golemButton);$('freeze').onclick=()=>{if(mode!=='game')return;frozen=!frozen;combatDoor.cancel('freeze');keys.clear();commands.length=0;simLast=null;acc=0;$('freeze').textContent=frozen?'RESUME':'FREEZE FRAME';cv.focus();};$('perfToggle').onclick=()=>$('perf').hidden=!$('perf').hidden;$('settingsClose').onclick=()=>$('settings').hidden=true;
function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function getReport(){const a=report.frames.map(f=>f.frameMs).sort((a,b)=>a-b),mean=a.reduce((n,x)=>n+x,0)/Math.max(1,a.length);return{...report,gallery:mode==='gallery'?{stage:galleryPlayer?'walk-test':'render-preview',...galleryScene.stats(),camera:{...galleryCamera},player:galleryPlayer?.snapshot()??null,timings:galleryTimings}:null,summary:{samples:a.length,meanMs:mean,fps:mean?1000/mean:null,p95Ms:a[Math.floor((a.length-1)*.95)]??null},state:combatDoor.decorate(world.snapshot()),combatDoor:{scene:doorScene.snapshot(),...combatDoor.snapshot()},interactionTarget:targeting.current(),interactionIntent:targeting.intent(),interactionApproach:galleryPlayer?.approach()??null,interactionSession:galleryPlayer?.interaction()??null,interactionEvents:galleryPlayer?.interactionEvents()??[],lampLight:lampLighting(world.current.lamp,world.current.phase),events:world.events,executionEffects:effects.snapshot(),executionOptions:{...executionOptions},viewport:window.__ASH_VIEWPORT__?.metrics(),notes:['Only LAMP represents hero life. There is no separate HEALTH pool or bar.','Canvas2D cell lighting is not pixel-identical to the old WebGL pass.','Target 30 FPS is not a hardware performance guarantee.','F6 camera / F7 shake / F8 blood. Partial iteration-4 preview; source commit identifies content.']};}
$('report').onclick=()=>save(new Blob([JSON.stringify(getReport(),null,2)],{type:'application/json'}),'ash-iron-4a-report.json');$('export').onclick=()=>cv.toBlob(b=>b&&save(b,'ash-iron-4a-frame.png'));
window.addEventListener('error',e=>report.errors.push(e.message));window.addEventListener('unhandledrejection',e=>report.errors.push(String(e.reason)));
function tick(now){const real=last?Math.min(.1,(now-last)/1000):0;last=now;if(document.hidden){requestAnimationFrame(tick);return;}if(mode==='gallery'){galleryTime+=real;if(galleryPlayer){if(simLast!==null)acc+=Math.max(0,Math.min(.1,(now-simLast)/1000));let steps=0;const input=movementInput(keys);while(acc+1e-10>=1/60&&steps<6){galleryPlayer.step(1/60,input);acc-=1/60;steps++;}simLast=now;}else{simLast=null;acc=0;}if(now-drawAt>=33){renderGallery();drawAt=now;}requestAnimationFrame(tick);return;}if(mode!=='game'){if(!$('fireFreeze').checked)time+=real*(+$('flow').value/100);if(now-drawAt>33){drawMenu();drawAt=now;}requestAnimationFrame(tick);return;}
const updateAt=performance.now();if(!frozen&&!manifest?.blocking()){if(commands.length)combatDoor.cancel('combat-command');for(const c of commands.splice(0))c.kind==='dash'?world.dash(c.direction):c.kind==='sweep'?world.sweep(c.aim):world.attack(c);if(simLast!==null)acc+=Math.max(0,Math.min(.1,(now-simLast)/1000));const {x,y}=movementInput(keys);let steps=0;while(acc+1e-10>=1/60&&steps<6){stepWorld(1/60,{x,y,aim:unpr(aimPoint)});acc-=1/60;steps++;}}else{keys.clear();commands.length=0;acc=0;}simLast=now;const updateMs=performance.now()-updateAt;
if(now-drawAt>=33){const frameMs=drawAt?now-drawAt:0,t=render(world.snapshot(frozen||manifest?.blocking()?1:Math.max(0,acc*60)));if(!frozen&&frameMs>0&&frameMs<1000){report.frames.push({frameMs,updateMs,...t});if(report.frames.length>1800)report.frames.shift();}drawAt=now;if(renderCount%15===0){const r=getReport();$('perfText').textContent=`CANVAS2D / ${COLS} x 140\nFPS ${r.summary.fps?.toFixed(2)??'--'} / P95 ${r.summary.p95Ms?.toFixed(2)??'--'} ms\nCPU ${t.cpuMs.toFixed(2)} ms / GPU NOT MEASURED\nERRORS ${report.errors.length}`;}$('status').textContent=world.current.note;}
if(world.current.phase!=='playing'&&!frozen){endTime+=real;if(endTime>(world.current.phase==='dead'?2.7:1.5)){targeting.clear();mode=world.current.phase;selected=0;keys.clear();commands.length=0;}}requestAnimationFrame(tick);}
window.__ASH_ITERATION_2__=Object.freeze({build:report.build,start,pause,resume,home,viewport:()=>({width:W,height:864,cols:COLS,rows:ROWS}),project:(x,y,z=0)=>pr(x,y,z),unproject:(x,y)=>unpr({x,y}),state:()=>combatDoor.decorate(world.snapshot()),combatDoor:()=>({scene:doorScene.snapshot(),...combatDoor.snapshot()}),events:()=>world.events.slice(),report:getReport,mode:()=>mode,menuTime:()=>time,target:()=>targeting.current(),intent:()=>targeting.intent(),render:()=>mode==='gallery'?renderGallery():render(),coneBoost:()=>coneBoost,freeze:()=>{frozen=true;combatDoor.cancel('freeze');keys.clear();simLast=null;acc=0;},advance:advanceWorld,place:(x,y,ex,ey)=>{Object.assign(world.current,{x,y,cameraX:x,cameraY:y});Object.assign(world.previous,{x,y,cameraX:x,cameraY:y});camera={x,y};if(ex!==undefined)Object.assign(world.current.enemy,{x:ex,y:ey});},damage:n=>world.damage(n),dash:(x,y)=>world.dash({x,y}),attack:(kind,x,y)=>world.attack({kind,aim:{x,y}}),execute:()=>world.execute(),executionAvailable:()=>world.executionAvailable(),executionEffects:()=>effects.snapshot(),executionOptions:()=>({...executionOptions})});
installExecutionInput({world,keys,commands,isActive:()=>mode==='game'&&!frozen&&!manifest?.blocking(),focus:()=>cv.focus()});
installAttackInput({
 active:()=>mode==='game'&&!frozen&&!manifest?.blocking()&&!document.hidden&&world.current.phase==='playing'&&!world.current.dash,
 commands,
 aim:()=>unpr(aimPoint),
});
installViewport(cv,m=>{targeting.clear();W=m.width;COLS=m.cols;cv.width=W;cv.height=m.height;scene.width=mask.width=W;fireHintLayer.resize(W,H);aimPoint=null;commands.length=0;keys.clear();simLast=null;acc=0;drawAt=0;fireAt=-1;});
manifest=typeof installManifest==='function'?installManifest({
 canvas:cv,
 dimensions:()=>({cols:COLS,rows:Math.round(ROWS*864/H)}),
 onModalChange:blocked=>{targeting.clear();combatDoor.cancel('relic-modal');keys.clear();commands.length=0;acc=0;simLast=null;aimPoint=null;if(!blocked)relicWorld?.cancel();},
 onChoice:event=>relicWorld?.choose(event),
 active:()=>mode==='game'&&!frozen&&!document.hidden&&world.current.phase==='playing',
}):null;
installDesktop(start,pause);
requestAnimationFrame(tick);
