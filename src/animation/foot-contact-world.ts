import type {HeroModule,Rig} from '../core/types.js';
import type {CombatSnapshot} from '../combat/types.js';
import {loadedLocomotion} from './weight-transitions.js';
import {cloneFootContacts,solveFootContacts} from './foot-contact.js';
import type {ContactFrame,FootContacts,LegIK} from './foot-contact.js';
import {advanceWalkingContacts,advanceIdleContacts,limitGaitContacts} from './walking-contacts.js';
import type {GaitContact,GaitContacts} from './walking-contacts.js';

export function footContactsEnabled(s:CombatSnapshot):boolean {
  return s.phase==='playing'&&!s.action&&s.sweepProgress===null&&s.hitReaction<=0;
}
export function contactFrame(s:CombatSnapshot):ContactFrame {
  return {x:s.x,y:s.y,heading:s.motion?.heading??Math.atan2(s.fy,s.fx)};
}
function walking(s:CombatSnapshot):boolean {return s.moving||(s.motion?.weight??0)>.001;}
export function advanceWorldFootContacts(s:CombatSnapshot,dt:number,module:HeroModule|undefined=globalThis.IronPilgrim):FootContacts|null {
  if(!footContactsEnabled(s)||!module)return null;
  const previous:GaitContacts|null=s.footContacts??null;
  // Release idle support on the first movement tick, then acquire gait contacts.
  if(s.moving&&previous?.every(c=>c.mode==='idle'))return null;
  const rig=loadedLocomotion(s,module).rig,f=contactFrame(s);
  return walking(s)?advanceWalkingContacts(previous,rig,f,dt,s.walkDistance):advanceIdleContacts(previous,rig,f,dt);
}
export function applyWorldFootContacts(s:CombatSnapshot,rig:Rig,module:HeroModule):Rig {
  if(!footContactsEnabled(s)||!s.footContacts)return rig;
  const ik=(module as HeroModule&{ik?:LegIK}).ik;
  if(typeof ik!=='function')throw Error('Original hero IK is required for foot contacts.');
  const f=contactFrame(s),contacts=limitGaitContacts(s.footContacts,rig,f,walking(s)?s.walkDistance:null);
  return solveFootContacts(rig,f,contacts,ik);
}
export function interpolateFootContacts(a:FootContacts|null|undefined,b:FootContacts|null|undefined,t:number):FootContacts|null {
  const next:GaitContacts|null=cloneFootContacts(b??null);
  if(!next)return null;
  return next.map((contact,i)=>{
    const old:GaitContact|undefined=a?.[i];
    if(!old||old.mode!==contact.mode||old.step!==contact.step||!old.anchor.every((v,j)=>v===contact.anchor[j]))return contact;
    return {...contact,weight:old.weight+(contact.weight-old.weight)*t};
  });
}
