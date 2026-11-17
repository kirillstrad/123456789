import {sampleInteraction} from './interaction.js';
import type {InteractionAnimationFrame} from './interaction.js';
import {executionRig} from './execution-rig.js';
import {dashVisual} from '../combat/ash-dash.js';
import {ashDashParts} from '../render/ash-dash.js';
import {createHeroAppearance,HERO_ACCENT_COLOR,HERO_GLINT_COLOR} from '../render/hero-appearance.js';
import type {Part,Vec3,HeroModule} from '../core/types.js';import type {CombatSnapshot} from '../combat/types.js';import {loadedLocomotion,transitionPose} from './weight-transitions.js';
import {applyWorldFootContacts} from './foot-contact-world.js';
import {bridgeCombatEntry,combatSecondary} from './combat-entry.js';
export function lampBeat(life:number,time:number):number{if(life<=0)return 0;const w=1-Math.max(0,Math.min(1,life/100)),ph=(time*(60+80*w)/60)%1,d=(x:number)=>Math.min(Math.abs(x),1-Math.abs(x)),pulse=Math.min(1,Math.exp(-(d(ph-.12)**2)/.004)+.55*Math.exp(-(d(ph-.34)**2)/.007));return 1-(.02+.04*w)*(1-pulse)*w;}
export function combatHero(s:CombatSnapshot&{interactionAnimation?:InteractionAnimationFrame|null},module:HeroModule=globalThis.IronPilgrim,secondary={cloth:0,chains:[0,0,0,0]}):{parts:Part[];lamp:Vec3;tip:Vec3;clip:string}{
 if(!module)throw Error('Original vendor/hero.js must be loaded before rendering.');
 const dead=s.phase==='dead',dash=dead?null:s.dash,interaction=!dead&&!dash&&!s.action&&s.sweepProgress===null&&!s.execution&&s.interactionAnimation?sampleInteraction(s.interactionAnimation,module,s.time):null;
 let clip='breath',t=(s.time/5)%1,locomotion=true;
 if(dead){clip='death';t=Math.max(0,Math.min(1,s.deathTime/2.5));locomotion=false;}else if(dash){clip='breath';locomotion=false;}else if(s.action){clip=s.action.clip;t=s.action.progress;locomotion=false;}else if(s.sweepProgress!==null){clip='sweep';t=s.sweepProgress;locomotion=false;}else if(interaction){clip=interaction.clip;locomotion=false;}else if(s.hitReaction>0){clip='hit';t=1-s.hitReaction/.65;locomotion=false;}else if((s.motion?.weight??(s.moving?1:0))>.001)clip='walk';
 const execution=!dead&&s.execution&&s.execution.phase!=='cancelled'?executionRig(s,module):null,sampled=execution??interaction??(locomotion?loadedLocomotion(s,module):transitionPose(dead?{...s,time:t*2.5}:s,module,clip,t)),pose=sampled.pose,rig=execution?execution.rig:dead?sampled.rig:bridgeCombatEntry(s,applyWorldFootContacts(s,sampled.rig,module),module),heading=execution?execution.heading:s.motion?.heading??Math.atan2(s.fy,s.fx),fx=Math.cos(heading),fy=Math.sin(heading),transform=(v:Vec3):Vec3=>{const x=v[0]-pose.root[0],y=v[1]-pose.root[1];return[s.x+fy*x+fx*y,s.y-fx*x+fy*y,v[2]];},parts:Part[]=[],appearance=createHeroAppearance(rig);
 const append=(fragment:Vec3[]|null,c:string,w:number)=>{if(!fragment)return;const edge=fragment.map(transform);parts.push({kind:1,v:edge,c,w,hero:true,d:edge.reduce((d,v)=>d+v[0]+v[1]+v[2]*.006,0)/edge.length+.006});};
 const push=(kind:0|1,v:Vec3[],c:string|number[],w=1)=>{const points=v.map(transform);parts.push({kind,v:points,c:appearance.material(v,c,kind),w,hero:true,d:points.reduce((d,v)=>d+v[0]+v[1]+v[2]*.006,0)/points.length+(kind===1?.005:0)});append(appearance.accent(v,c,kind),HERO_ACCENT_COLOR,1);append(appearance.glint(v,c,kind),HERO_GLINT_COLOR,.75);};
 const renderTime=dead?t*2.5:execution?s.execution!.elapsed:s.time,lamp=module.emit(rig,renderTime,{poly:(v,c)=>push(0,v,c),line:(v,c,w)=>push(1,v,c,w)},execution||dead?{cloth:0,chains:[0,0,0,0]}:combatSecondary(s,secondary),lampBeat(dead?0:s.lamp,renderTime));
 return{parts:dash?[...parts.map(p=>({...p,alpha:dashVisual(dash).visibility})),...ashDashParts(s)]:parts,lamp:transform(lamp),tip:transform(rig.tip),clip:execution?'execution':dash?'ash-dash':clip};
}
