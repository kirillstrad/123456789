import type {Bone,Rig,Vec3} from '../core/types.js';

export interface ContactFrame {x:number;y:number;heading:number}
export interface FootContact {anchor:Vec3;weight:number;releasing:boolean}
export type FootContacts=FootContact[];
export type LegIK=(base:Vec3,target:Vec3,a:number,b:number,pole:Vec3)=>Bone;
export const FOOT_CONTACT=Object.freeze({blendRate:8,maxOffset:.16,reachMargin:.002});

export function footToWorld(point:Vec3,root:Vec3,f:ContactFrame):Vec3 {
  const x=point[0]-root[0],y=point[1]-root[1],c=Math.cos(f.heading),s=Math.sin(f.heading);
  return [f.x+s*x+c*y,f.y-c*x+s*y,point[2]];
}
export function footToLocal(point:Vec3,root:Vec3,f:ContactFrame):Vec3 {
  const x=point[0]-f.x,y=point[1]-f.y,c=Math.cos(f.heading),s=Math.sin(f.heading);
  return [root[0]+s*x-c*y,root[1]+c*x+s*y,point[2]];
}
export function cloneFootContacts(state:FootContacts|null):FootContacts|null {
  return state?.map(c=>({...c,anchor:[...c.anchor] as Vec3}))??null;
}
const distance=(a:Vec3,b:Vec3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

/** Advance only from a simulation tick. No renderer cache or hidden clock.
 * First preview: stationary support only; caller disables it for steps/combat. */
export function advanceFootContacts(previous:FootContacts|null,rig:Rig,f:ContactFrame,dt:number,enabled:boolean):FootContacts|null {
  if(!enabled)return null;
  if(!Number.isFinite(dt)||dt<=0)return cloneFootContacts(previous);
  const step=FOOT_CONTACT.blendRate*dt;
  return rig.legs.map((leg,i)=>{
    const nominal=footToWorld(leg.end,rig.p.root,f),old=previous?.[i];
    if(!old||(old.releasing&&old.weight<=0))return {anchor:nominal,weight:0,releasing:false};
    const target=footToLocal(old.anchor,rig.p.root,f),reach=distance(target,leg.base);
    const invalid=distance(nominal,old.anchor)>FOOT_CONTACT.maxOffset||reach>leg.a+leg.b-FOOT_CONTACT.reachMargin||reach<Math.abs(leg.a-leg.b)+FOOT_CONTACT.reachMargin;
    const releasing=old.releasing||invalid;
    return {anchor:[...old.anchor] as Vec3,weight:Math.max(0,Math.min(1,old.weight+(releasing?-step:step))),releasing};
  });
}

/** Pure pose correction using the original hero IK and original bone lengths. */
export function solveFootContacts(rig:Rig,f:ContactFrame,state:FootContacts|null,ik:LegIK):Rig {
  if(!state)return rig;
  return {...rig,legs:rig.legs.map((leg,i)=>{
    const contact=state[i];
    if(!contact||contact.weight<=0)return leg;
    const anchor=footToLocal(contact.anchor,rig.p.root,f),w=Math.max(0,Math.min(1,contact.weight));
    const target:Vec3=[leg.end[0]+(anchor[0]-leg.end[0])*w,leg.end[1]+(anchor[1]-leg.end[1])*w,leg.end[2]+(anchor[2]-leg.end[2])*w];
    return ik([...leg.base] as Vec3,target,leg.a,leg.b,[...leg.joint] as Vec3);
  })};
}
