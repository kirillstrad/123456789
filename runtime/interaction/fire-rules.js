import {blocked,inArc} from '../combat/geometry.js';
import {lampLighting} from '../render/lamp-light.js';
const sparkFamilies=new Set(['candlesticks','candle','floor-candle','simple-candle']);
const manualFamilies=new Set(['wall-light','wall-candle','brazier','oven','furnace','campfire','lamp']);
export const FIRE_RULES=Object.freeze({manualCost:6,manualReserve:1,sparkExtraCost:0,sparkRange:3.2,sparkArcDegrees:160,requiresRelease:true,heightPrecision:false,cancelEOnMovement:false,cancelEOnOrdinaryDamage:false,burnsUntilReset:true,visibleConeDuration:.18,visibleConeGain:.035});
export function ignitionMethod(modelId){if(typeof modelId!=='string')return null;const family=modelId.split('.')[0];return sparkFamilies.has(family)?'sparks':manualFamilies.has(family)?'lantern':null;}
export function selectSparkSources({actor,targets=[],map}={}){
 if(!actor||actor.phase!=='playing'||!(actor.lamp>0)||![actor.x,actor.y,actor.fx,actor.fy].every(Number.isFinite)||Math.hypot(actor.fx,actor.fy)<1e-8||!map||!Array.isArray(map.circles)||!Array.isArray(map.rects))return[];
 const n=Math.hypot(actor.fx,actor.fy),facing={x:actor.fx/n,y:actor.fy/n},ids=new Set(),selected=[];
 for(const target of targets){
  if(!target||ids.has(target.id)||typeof target.id!=='string'||ignitionMethod(target.modelId)!=='sparks'||target.availability!=='ready'||target.enabled===false||target.visible===false||target.removed)continue;
  const p=target.contactPoint;if(!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite))continue;const point={x:p[0],y:p[1]};
  if(!inArc(actor,point,facing,FIRE_RULES.sparkRange,FIRE_RULES.sparkArcDegrees)||blocked(actor,point,map))continue;
  ids.add(target.id);selected.push(target);
 }
 return selected;
}
// Production simulation integration is a separate remaining step in this patch.
export function createSparkIgnitionProcessor({world,scene,map}={}){
 if(!world||!Array.isArray(world.events)||!scene||!['getFrame','begin','canIgnite','ignite','cancel'].every(k=>typeof scene[k]==='function'))throw Error('Invalid spark ignition dependencies');
 const consumed=new WeakSet();let actionId=Number.MAX_SAFE_INTEGER;
 return Object.freeze({release(event){
  const actor=world.current;
  if(!event||typeof event!=='object'||event.type!=='sweep'||!world.events.includes(event)||consumed.has(event)||!actor||!Number.isFinite(actor.time)||!Number.isFinite(event.time)||Math.abs(actor.time-event.time)>1e-7)return[];
  consumed.add(event);const targets=selectSparkSources({actor,targets:scene.getFrame().targets,map}),ignited=[];
  for(const target of targets){
   if(actionId<1)throw Error('Spark ignition action IDs exhausted');const token=scene.begin(target.id,actionId--);if(!token)continue;
   if(!scene.canIgnite(target.id,token)){scene.cancel(target.id,token);continue;}
   if(!scene.ignite(target.id,token)){scene.cancel(target.id,token);throw Error('Spark ignition ownership invariant failed');}
   ignited.push(target.id);
  }
  return ignited;
 }});
}
const HERO_RADIUS=146*65/94*1.2;
const profiles=Object.freeze({candle:Object.freeze({radius:.35,power:.22,flameScale:1.35}),candelabra:Object.freeze({radius:.62,power:.52,flameScale:1.5}),lamp:Object.freeze({radius:.8,power:.72,flameScale:1.55}),brazier:Object.freeze({radius:.9,power:.86,flameScale:1.8})});
export function fireLightingProfile(kind,{emitters=1}={}){
 if(!Number.isSafeInteger(emitters)||emitters<1)throw Error('Invalid fire emitter count');
 if(['oven','furnace','campfire'].includes(kind))return Object.freeze({radius:HERO_RADIUS,power:lampLighting(70).power*.82*1.6/emitters,flameScale:2,referenceLamp:70});
 const p=profiles[kind];if(!p)throw Error('Unknown fire lighting profile');return Object.freeze({radius:HERO_RADIUS*p.radius,power:p.power/emitters,flameScale:p.flameScale,referenceLamp:null});
}
export function unlitFireHint({status,illumination=0,occluded=false}={}){
 if(occluded||!['off','smoldering','igniting'].includes(status))return null;const t=Number.isFinite(illumination)?Math.max(0,Math.min(1,illumination)):0;
 return Object.freeze({color:Object.freeze([205,232,255]),alpha:.48+.48*t,count:3,emitsLight:false});
}
