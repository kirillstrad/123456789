import {doorProfile} from './door-motion.js';
import {doorContactToPose,doorContactToWorld,checkDoorHandContact} from './door-contact.js';
import {sampleLightContact} from './light-contact.js';
const specs=Object.freeze({door:Object.freeze({duration:3,clip:'interact-door'}),ignite:Object.freeze({duration:3.2,clip:'interact-ignite'}),campfire:Object.freeze({duration:3.2,clip:'interact-campfire'})});
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function interactionFrame(kind,elapsed){
 const spec=Object.hasOwn(specs,kind)?specs[kind]:null;if(!spec||!Number.isFinite(elapsed)||elapsed<0)throw Error('Invalid interaction animation');
 const time=elapsed>=spec.duration-1e-9?spec.duration:elapsed,progress=time/spec.duration;
 return Object.freeze({kind,clip:spec.clip,elapsed:time,duration:spec.duration,progress,phase:progress>=1?'complete':progress<.35?'reach':progress<.65?'contact':'recover',effectDue:progress+1e-10>=.6,complete:progress>=1});
}
function plantRitualSword(rig,root,weight){
 const {tip,grip}=rig;
 const length=Math.hypot(...tip.map((value,i)=>value-grip[i]));
 if(length<=1e-6||!rig.arms.length)return;
 const ground=[root[0]+.24,root[1]+.45,.015];
 const target=tip.map((value,i)=>value+(ground[i]-value)*weight);
 const axis=tip.map((value,i)=>(value-grip[i])*(1-weight)/length-(i===2?weight:0));
 const norm=Math.hypot(...axis);
 if(norm<=1e-6)return;
 const next=target.map((value,i)=>value-axis[i]*length/norm);
 const distanceToGrip=arm=>Math.hypot(...arm.end.map((value,i)=>value-grip[i]));
 const arm=rig.arms.reduce((a,b)=>distanceToGrip(a)<=distanceToGrip(b)?a:b);
 const offset=next.map((value,i)=>value-arm.base[i]);
 const distance=Math.hypot(...offset);
 if(distance<=Math.max(1e-6,Math.abs(arm.a-arm.b))||distance>arm.a+arm.b)return;
 const unit=offset.map(value=>value/distance);
 const along=(distance**2+arm.a**2-arm.b**2)/(2*distance);
 const joint=arm.joint.map((value,i)=>value-arm.base[i]);
 const projection=joint.reduce((sum,value,i)=>sum+value*unit[i],0);
 const side=joint.map((value,i)=>value-projection*unit[i]);
 const sideLength=Math.hypot(...side);
 if(sideLength<=1e-6)return;
 const bend=Math.sqrt(Math.max(0,arm.a**2-along**2));
 arm.joint=arm.base.map((value,i)=>value+along*unit[i]+bend*side[i]/sideLength);
 arm.end=next;
 rig.grip=next;
 rig.tip=target;
}
export function sampleInteraction(frame,module,time){
 const checked=interactionFrame(frame.kind,frame.elapsed);if(!Number.isFinite(time)||frame.clip!==checked.clip||frame.progress!==checked.progress)throw Error('Invalid interaction animation frame');
 const base=module.sample('breath',(time/5)%1,time),weight=smooth(checked.progress/.18)*(1-smooth((checked.progress-.78)/.22)),mix=(a,b,w=weight)=>a.map((v,i)=>v+(b[i]-v)*w),door=frame.kind==='door',profile=door&&frame.doorModelId?doorProfile(frame.doorModelId):null;
 const pose={...base,id:checked.clip,root:[...base.root],gait:null,right:mix(base.right,door?[.22,.62,1.15]:[.24,.2,1.05]),left:mix(base.left,door?base.left:[-.18,.62,1.3]),lean:base.lean+(profile?.lean??(door?.1:.07))*weight,head:base.head+.08*weight,az:base.az+(profile?-.25:1.2)*weight,twist:(base.twist??0)+(profile?.twist??0)*weight};
 if(frame.kind==='campfire'){
  const progress=checked.progress;
  const rise=1-smooth((progress-.72)/.22);
  const kneelWeight=smooth((progress-.18)/.23)*rise;
  const prayerWeight=smooth((progress-.42)/.17)*rise;
  const hold=smooth(progress/.18)*(1-smooth((progress-.88)/.12));
  pose.root[2]-=.44*kneelWeight;
  pose.right=mix(base.right,[.24,.45,.72],hold);
  pose.left=mix(base.left,[-.10,.37,1.52],prayerWeight);
  pose.lean+=.23*kneelWeight;
  pose.head+=.29*prayerWeight;
  pose.az=base.az-1.3*hold;
  const rig=module.rig(pose);
  const anchor=smooth((progress-.12)/.08)*(1-smooth((progress-.88)/.10));
  if(anchor>0)plantRitualSword(rig,pose.root,anchor);
  return {pose,rig,clip:checked.clip};
 }
 const bind=frame.doorContact;
 if(bind){
  const w=smooth((checked.progress-.25)/.3)*(1-smooth((checked.progress-.61)/.09));
  if(!bind.points?.length||!bind.actor)throw Error('Missing door contact data');
  bind.points.forEach((target,i)=>{const arm=bind.arms?.[i]??(bind.points.length===1?0:i===0?1:0),key=arm===0?'left':'right',local=doorContactToPose(bind.actor,pose.root,target),offset=local.map((v,j)=>v-pose.root[j]);offset[2]=target[2]-pose.root[2];pose[key]=mix(pose[key],offset,w);});
  const rig=module.rig(pose);
  if(checked.progress>=.55&&checked.progress<=.61){bind.points.forEach((target,i)=>{const arm=bind.arms?.[i]??(bind.points.length===1?0:i===0?1:0),actual=doorContactToWorld(bind.actor,pose.root,rig.arms[arm].end),check=checkDoorHandContact(actual,target);if(!check.matches)throw Error('Door hand contact error: '+check.error);});}
  return{pose,rig,clip:'interact-door-'+profile.style};
 }
 if(frame.kind==='ignite'&&frame.lightContact)return sampleLightContact(pose,frame,module);
 return{pose,rig:module.rig(pose),clip:checked.clip};
}
