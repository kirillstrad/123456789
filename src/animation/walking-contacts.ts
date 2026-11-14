import type {Rig,Vec3} from '../core/types.js';
import {advanceFootContacts,cloneFootContacts,footToLocal,footToWorld,FOOT_CONTACT} from './foot-contact.js';
import type {ContactFrame,FootContact,FootContacts} from './foot-contact.js';
export interface GaitContact extends FootContact {mode?:'idle'|'stance'|'swing';step?:number}
export type GaitContacts=GaitContact[];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
const distance=(a:Vec3,b:Vec3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);

/** Matches vendor walk: two foot cycles per .8 cells; left offset .5, stance < .62. */
export function gaitPhase(walkDistance:number,index:number):{q:number;step:number;stance:boolean;support:number} {
  const cycle=walkDistance/.4+(index===0?.5:0),step=Math.floor(cycle),q=cycle-step;
  return {q,step,stance:q<.62,support:q<.62?smooth(q/.1)*(1-smooth((q-.48)/.14)):0};
}
export function advanceWalkingContacts(previous:FootContacts|null,rig:Rig,f:ContactFrame,dt:number,walkDistance:number):GaitContacts|null {
  if(!Number.isFinite(dt)||dt<=0||!Number.isFinite(walkDistance))return cloneFootContacts(previous);
  return rig.legs.map((leg,i):GaitContact=>{
    const phase=gaitPhase(walkDistance,i),old:GaitContact|undefined=previous?.[i],nominal=footToWorld(leg.end,rig.p.root,f);
    if(!phase.stance)return {anchor:nominal,weight:0,releasing:false,mode:'swing',step:phase.step};
    if(!old||old.mode!=='stance'||old.step!==phase.step)return {anchor:nominal,weight:0,releasing:false,mode:'stance',step:phase.step};
    const local=footToLocal(old.anchor,rig.p.root,f),reach=distance(local,leg.base),side=i===0?-1:1;
    const unsafe=distance(nominal,old.anchor)>FOOT_CONTACT.maxOffset||reach>leg.a+leg.b-FOOT_CONTACT.reachMargin||reach<Math.abs(leg.a-leg.b)+FOOT_CONTACT.reachMargin||side*(local[0]-rig.p.root[0])<.025;
    const releasing=old.releasing||unsafe;
    const weight=releasing?Math.max(0,old.weight-FOOT_CONTACT.blendRate*dt):Math.min(phase.support,old.weight+16*dt);
    return {anchor:[...old.anchor] as Vec3,weight:Math.min(phase.support,weight),releasing,mode:'stance',step:phase.step};
  });
}
export function advanceIdleContacts(previous:FootContacts|null,rig:Rig,f:ContactFrame,dt:number):GaitContacts|null {
  const prior:GaitContacts|null=previous;
  const settled=prior?.map((c,i)=>c.mode==='swing'?{anchor:footToWorld(rig.legs[i].end,rig.p.root,f),weight:0,releasing:false}:c)??null;
  return advanceFootContacts(settled,rig,f,dt,true)?.map(c=>({...c,mode:'idle' as const,step:undefined}))??null;
}
/** Render-time bounds are pure: never pin a swinging foot or drag it across the body. */
export function limitGaitContacts(state:FootContacts,rig:Rig,f:ContactFrame,walkDistance:number|null):FootContacts {
  return state.map((c,i)=>{
    const leg=rig.legs[i];
    if(!leg)return {...c,anchor:[...c.anchor] as Vec3,weight:0};
    const anchor=footToLocal(c.anchor,rig.p.root,f),side=i===0?-1:1;
    const nominalSide=side*(leg.end[0]-rig.p.root[0]),anchorSide=side*(anchor[0]-rig.p.root[0]),minimum=Math.min(.025,Math.max(0,nominalSide));
    let weight=clamp(c.weight);
    if(anchorSide<minimum)weight=Math.min(weight,clamp((nominalSide-minimum)/Math.max(1e-9,nominalSide-anchorSide)));
    if(walkDistance!==null)weight=Math.min(weight,gaitPhase(walkDistance,i).support);
    return {...c,anchor:[...c.anchor] as Vec3,weight};
  });
}
