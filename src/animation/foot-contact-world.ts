import type {HeroModule,Rig} from '../core/types.js';
import type {CombatSnapshot} from '../combat/types.js';
import {loadedLocomotion} from './weight-transitions.js';
import {advanceFootContacts,cloneFootContacts,solveFootContacts} from './foot-contact.js';
import type {ContactFrame,FootContacts,LegIK} from './foot-contact.js';

export function footContactsEnabled(s:CombatSnapshot):boolean {
  return s.phase==='playing'&&!s.moving&&(s.motion?.weight??0)<=.001&&!s.action&&s.sweepProgress===null&&s.hitReaction<=0;
}
export function contactFrame(s:CombatSnapshot):ContactFrame {
  return {x:s.x,y:s.y,heading:s.motion?.heading??Math.atan2(s.fy,s.fx)};
}
export function advanceWorldFootContacts(s:CombatSnapshot,dt:number,module:HeroModule|undefined=globalThis.IronPilgrim):FootContacts|null {
  if(!footContactsEnabled(s)||!module)return null;
  return advanceFootContacts(s.footContacts??null,loadedLocomotion(s,module).rig,contactFrame(s),dt,true);
}
export function applyWorldFootContacts(s:CombatSnapshot,rig:Rig,module:HeroModule):Rig {
  if(!footContactsEnabled(s)||!s.footContacts)return rig;
  const ik=(module as HeroModule&{ik?:LegIK}).ik;
  if(typeof ik!=='function')throw Error('Original hero IK is required for foot contacts.');
  return solveFootContacts(rig,contactFrame(s),s.footContacts,ik);
}
export function interpolateFootContacts(a:FootContacts|null|undefined,b:FootContacts|null|undefined,t:number):FootContacts|null {
  const next=cloneFootContacts(b??null);
  if(!next)return null;
  return next.map((contact,i)=>{
    const old=a?.[i];
    if(!old||!old.anchor.every((v,j)=>v===contact.anchor[j]))return contact;
    return {...contact,weight:old.weight+(contact.weight-old.weight)*t};
  });
}
