import type {HeroModule,Rig,Vec3} from '../core/types.js';
import type {CombatSnapshot,CombatFootEntry} from '../combat/types.js';
import {loadedLocomotion,transitionPose,transitionWeight,loadSecondary} from './weight-transitions.js';
import {applyWorldFootContacts,contactFrame} from './foot-contact-world.js';
import {footToWorld,solveFootContacts} from './foot-contact.js';
import type {LegIK} from './foot-contact.js';
import {limitGaitContacts} from './walking-contacts.js';
const smooth=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function key(s:CombatSnapshot):{clip:string;id:number|null;t:number}|null {
  if(s.phase!=='playing')return null;
  if(s.action)return {clip:s.action.clip,id:s.action.id,t:s.action.progress};
  if(s.sweepProgress!==null)return {clip:'sweep',id:null,t:s.sweepProgress};
  if(s.hitReaction>0)return {clip:'hit',id:null,t:1-s.hitReaction/.65};
  return null;
}
export function entryMatches(s:CombatSnapshot):boolean {
  const k=key(s),e=s.combatEntry;return !!k&&!!e&&e.clip===k.clip&&e.actionId===k.id;
}
export function bindCombatEntry(feet:Vec3[]|null,s:CombatSnapshot):CombatFootEntry|null {
  const k=key(s);return feet&&k?{clip:k.clip,actionId:k.id,feet:feet.map(p=>[...p] as Vec3)}:null;
}
export function cloneCombatEntry(e:CombatFootEntry|null|undefined):CombatFootEntry|null {
  return e?{...e,feet:e.feet.map(p=>[...p] as Vec3)}:null;
}
/** Only windup feet are bridged; the active rig and weapon are untouched. */
export function bridgeCombatEntry(s:CombatSnapshot,rig:Rig,module:HeroModule):Rig {
  const k=key(s),e=s.combatEntry;
  if(!k||!e||!entryMatches(s)||k.t>=.12)return rig;
  const ik=(module as HeroModule&{ik?:LegIK}).ik;
  if(typeof ik!=='function')throw Error('Original hero IK is required for combat entry.');
  const f=contactFrame(s),weight=1-smooth(k.t/.12);
  const contacts=e.feet.map(anchor=>({anchor:[...anchor] as Vec3,weight,releasing:true}));
  return solveFootContacts(rig,f,limitGaitContacts(contacts,rig,f,null),ik);
}
export function captureCombatFeet(s:CombatSnapshot,module:HeroModule|undefined=globalThis.IronPilgrim):Vec3[]|null {
  if(!module||s.phase!=='playing')return null;
  const k=key(s),sampled=k?transitionPose(s,module,k.clip,k.t):loadedLocomotion(s,module);
  const rig=bridgeCombatEntry(s,applyWorldFootContacts(s,sampled.rig,module),module),f=contactFrame(s);
  return rig.legs.map(l=>footToWorld(l.end,rig.p.root,f));
}
/** Existing secondary offsets fade out as authored combat poses take over. */
export function combatSecondary(s:CombatSnapshot,base:{cloth:number;chains:number[]}):{cloth:number;chains:number[]} {
  const loaded=loadSecondary(s,base),k=key(s),w=s.phase==='playing'?(k?1-transitionWeight(k.clip,k.t):1):0;
  return {cloth:base.cloth+(loaded.cloth-base.cloth)*w,chains:base.chains.map((v,i)=>v+(loaded.chains[i]-v)*w)};
}
