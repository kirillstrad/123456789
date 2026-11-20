import {attackTiming} from '../combat/attack-timing.js';
import {footToLocal} from './foot-contact.js';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

export function sampleAttackStep(action) {
 const t=clamp(action.progress),timing=attackTiming(action.kind);
 const u=clamp((t-.12)/Math.max(.01,timing.ready-.12));
 const moving=u>0&&u<1;
 return {
  foot:action.stage%2,
  travel:smooth(u)*(action.kind==='heavy'?.20:.12),
  lift:moving?Math.sin(Math.PI*u)**2*(action.kind==='heavy'?.085:.055):0,
  weight:smooth((t-.12)/.08)*(action.continuation?1:1-smooth((t-timing.queueEnd)/(timing.release-timing.queueEnd))),
 };
}

export function applyAttackFootwork(s,rig,module,frame) {
 const a=s.action,e=s.combatEntry;
 if(s.phase!=='playing'||s.dash||s.execution||!a?.animation4C||!e||e.actionId!==a.id||e.clip!==a.clip)return rig;
 const step=sampleAttackStep(a);
 if(step.weight<=0)return rig;
 const ik=module.ik;
 if(typeof ik!=='function')throw Error('Original hero IK is required for attack steps.');
 const c=Math.cos(frame.heading),sn=Math.sin(frame.heading);
 return {...rig,legs:rig.legs.map((leg,i)=>{
  const anchor=e.feet[i];if(!anchor||i>1)return leg;
  const moving=i===step.foot;
  const world=[anchor[0]+(moving?c*step.travel:0),anchor[1]+(moving?sn*step.travel:0),anchor[2]+(moving?step.lift:0)];
  const local=footToLocal(world,rig.p.root,frame);
  const target=leg.end.map((n,j)=>n+(local[j]-n)*step.weight);
  target[2]=Math.max(0,target[2]);
  // Stay inside the original leg's IK reach; never stretch its bones.
  const delta=target.map((n,j)=>n-leg.base[j]),length=Math.hypot(...delta);
  const low=Math.abs(leg.a-leg.b)+.003,high=leg.a+leg.b-.003;
  if(high<=low)return leg;
  if(length<1e-9)return leg;
  const reach=Math.max(low,Math.min(high,length));
  const bounded=delta.map((n,j)=>leg.base[j]+n*reach/length);
  return ik.call(module,[...leg.base],bounded,leg.a,leg.b,[...leg.joint]);
 })};
}
