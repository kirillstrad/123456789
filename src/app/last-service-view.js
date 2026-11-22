// LAST_SERVICE_WORLD_PASS3
// LAST_SERVICE_INTERIOR_PASS2
import {arrowParts} from '../render/marrow-archer.js';
import {combatHero} from '../animation/combat-hero.js';
import {sealInspectionHero} from '../animation/last-service-seal.js';
import {storyHero,awakeningParts} from '../animation/last-service-story.js';
import {executionEnemyParts} from '../render/execution-enemy.js';
import {golemTelegraphs} from '../render/golem-telegraph.js';
import {blocked} from '../combat/geometry.js';
import {paintGolemTrialHud} from '../ui/golem-trial-hud.js';
import {composeCombatHud} from '../ui/combat-hud.js';
import {paintLastServiceLabels,lastServiceEnemyName} from '../ui/last-service-localization.js';
import {DASH} from '../combat/ash-dash.js';
import {relicUnsupportedCharacters} from '../ui/relic-font.js';
import {lampLighting} from '../render/lamp-light.js';
import {ASCII} from '../render/ascii.js';
import {createEngineHudPass} from '../ui/engine-hud-pass.js';
import {createLastServiceWorldPass} from '../ui/last-service-interaction-brand.js';
export function createLastServiceView(cv){
 const worldPass=createLastServiceWorldPass();
 const W=1008,H=864,COLS=196,ROWS=168,out=cv.getContext('2d');
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const surface=canvas(W,H),ctx=surface.getContext('2d'),ascii=new ASCII(out),hud=createEngineHudPass(canvas);let camera={x:8,y:18.2},hudFrames=0,hudOwner={},lastHudTime=-1;
 globalThis.__ASH_LAST_SERVICE_PRESENTATION__=Object.freeze({language:'ru',supportsText:text=>relicUnsupportedCharacters(text).length===0,hudFrames:()=>hudFrames});
 const project=(x,y,z)=>[W/2+((x-camera.x)-(y-camera.y))*49.4,430+((x-camera.x)+(y-camera.y))*27.95-z*56.55];
 return {
 aim(point){if(!point)return null;const a=(point.x-W/2)/49.4,b=(point.y-430)/27.95;return{x:camera.x+(a+b)/2,y:camera.y+(b-a)/2};},
 paint({s,intro,env,manifest,paused,ready,ritual,map,story=null,extra=[],executionReady=false,chapter=null,gate=null}){
  camera={x:s.cameraX,y:s.cameraY};env.setView?.(s,project);const worldFrame=worldPass.frame({s,env,ritual,gate,chapter,project,hidden:manifest.blocking()||paused||!!story||!!intro.intro,width:W,height:H,isBlocked:(a,b)=>map?blocked(a,b,map):false});s={...s,visualLights:env.lights,enemies:(s.enemies??[]).map(e=>({...e,name:lastServiceEnemyName(e)}))};
  const hero=s.phase!=='dead'&&story?storyHero(s,story):intro.intro?sealInspectionHero(s,intro.elapsed):combatHero(s),enemies=s.enemies??[];
  const particles=s.particles.map(p=>({kind:2,v:[[p.x,p.y,p.z]],r:2,c:[255,160,64],alpha:Math.min(1,p.life*2),d:p.x+p.y+p.z*.006}));
  const parts=[...env.parts,...enemies.flatMap(e=>awakeningParts(executionEnemyParts(e,s),e.archetype==='corpse-golem'?story:null)),...(map?golemTelegraphs(s,map,blocked):[]),...particles,...arrowParts(s.arrows??[]),...hero.parts,...ritual.parts,...extra].filter(p=>p.hero||p.v.some(v=>Math.abs(v[0]-s.x)<18&&Math.abs(v[1]-s.y)<18)).sort((a,b)=>a.d-b.d);
  const color=c=>Array.isArray(c)?`rgb(${c.map(v=>Math.round(Math.max(0,Math.min(255,v))))})`:c;
  ctx.globalAlpha=1;ctx.fillStyle='#020306';ctx.fillRect(0,0,W,H);
  for(const p of parts){ctx.globalAlpha=(p.wall||p.occluder)?1:(p.alpha??1);
  ctx.fillStyle=color(p.c);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=p.w??1;ctx.lineCap='round';ctx.lineJoin='round';
   if(p.kind===3){ctx.font=`${p.size??12}px monospace`;ctx.textAlign='center';ctx.fillText(p.text,...project(...p.v[0]));continue;}
   if(p.kind===2){const q=project(...p.v[0]),r=(p.r??0)*65/94;ctx.beginPath();ctx.ellipse(q[0],q[1],r,r*.85,0,0,7);ctx.fill();continue;}
   ctx.beginPath();p.v.forEach((v,i)=>{const q=project(...v);if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});if(p.kind===1)ctx.stroke();else{ctx.closePath();ctx.fill();}
  }
  ctx.globalAlpha=1;const data=ascii.read(surface,COLS,ROWS),lamp=project(...hero.lamp),profile=lampLighting(s.lamp,s.phase),radius=170*profile.radiusScale;
  const lights=worldFrame.lights;
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const k=(y*COLS+x)*4,px=(x+.5)*W/COLS,py=(y+.5)*H/ROWS;let g=.065+profile.power*Math.exp(-((px-lamp[0])**2+(py-lamp[1])**2)/(2*radius**2));for(const l of lights)g+=l.power*Math.exp(-((px-l.p[0])**2+(py-l.p[1])**2)/(2*l.r*l.r));const exposure=worldFrame.exposure(g);data[k]*=exposure;data[k+1]*=exposure*.94;data[k+2]*=exposure*.82;}
  if(s.time<lastHudTime)hudOwner={};lastHudTime=s.time;
  data.set(composeCombatHud(data,COLS,ROWS,ROWS,hudOwner,s,ready,DASH.cooldown));hudFrames++;
  const target=hud.begin(W,H);paintGolemTrialHud(target,s,{width:W,enabled:true,available:executionReady});target.fillStyle='#cdbb9c';target.font='15px monospace';target.textAlign='center';
  for(const e of enemies)if(e.archetype!=='corpse-golem'&&e.hp>0&&Math.hypot(e.x-s.x,e.y-s.y)<7){const p=project(e.x,e.y,2);target.fillText(`${e.hp} / ${e.maxHp} ОЗ`,p[0],p[1]);}
  if(paused)target.fillText('ПАУЗА — ESC: продолжить',W/2,H/2);else if(story)target.fillText('ВВОД / ПРОБЕЛ — пропустить сцену',W/2,728);
  hud.compose(data,COLS,ROWS);if(!paused)manifest.paint(data,COLS,ROWS);out.fillStyle='#000';out.fillRect(0,0,W,H);ascii.paint(data,COLS,ROWS,0,H,false,hud.annotations());paintLastServiceLabels(out,s,{width:W,height:H,ready,chapter,hidden:manifest.blocking()});worldPass.paint(out,worldFrame);if(!paused)manifest.text(out,COLS,ROWS,H);
 }
 };
}
