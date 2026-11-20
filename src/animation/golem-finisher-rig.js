const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const ramp=(t,a,b)=>smooth((t-a)/(b-a));
const mix=(a,b,t)=>t<=0?[...a]:t>=1?[...b]:a.map((v,i)=>v+(b[i]-v)*t);
const norm=v=>{const n=Math.hypot(...v);return n>1e-9?v.map(x=>x/n):[0,1,0];};
export function golemFinisherTargets(distance){
  if(!Number.isFinite(distance))throw Error('Invalid golem finisher distance');
  const forward=Math.max(.4,distance-.42);
  return {chest:[0,forward,1.25],lamp:[-.12,Math.min(.99,forward),1.33],burnPoint:[-.12,forward,1.25]};
}
export function golemFinisherPose(elapsed,distance,base){
  const t=Number.isFinite(elapsed)?Math.max(0,Math.min(6.8,elapsed)):0;
  const raise=ramp(t,0,1),lever=ramp(t,1,2.6),pull=ramp(t,4.8,6.1),back=ramp(t,6.1,6.8);
  const offer=ramp(t,2.85,3.25)*(1-ramp(t,4.8,5.2)),target=golemFinisherTargets(distance);
  const hand=mix(mix(base.right,[.2,.4,1.24],raise),[.38,.16,1.06],lever);
  return {...base,id:'golem-finisher',root:[...base.root],gait:null,lift:0,breath:0,
    victim:false,burn:0,lean:base.lean+(.15*raise+.06*lever)*(1-back),
    twist:base.twist-.06*lever*(1-back),right:mix(hand,base.right,pull),
    left:mix(base.left,target.lamp,offer)};
}
export function golemFinisherRig(state,module){
  const e=state?.execution;
  if(e?.kind!=='corpse-golem')throw Error('Golem finisher state required');
  if(!module?.sample||!module?.rig)throw Error('Hero module required');
  if(![e.heroX,e.heroY,e.targetX,e.targetY,e.fx,e.fy,e.elapsed].every(Number.isFinite))throw Error('Invalid golem finisher state');
  const distance=Math.hypot(e.targetX-e.heroX,e.targetY-e.heroY),base=module.sample('breath',0,0);
  const pose=golemFinisherPose(e.elapsed,distance,base),rig=module.rig(pose),rest=module.rig(module.sample('breath',0,0));
  const chest=golemFinisherTargets(distance).chest,aim=norm(chest.map((v,i)=>v-rig.grip[i]));
  const weight=ramp(e.elapsed,0,1)*(1-ramp(e.elapsed,4.8,6.1));
  const start=Math.atan2(rest.n[1],rest.n[0]),end=Math.atan2(aim[1],aim[0]);
  const turn=((end-start+Math.PI*3)%(Math.PI*2))-Math.PI;
  const az=start+turn*weight,pitch=Math.asin(Math.max(-1,Math.min(1,rest.n[2])))+
    (Math.asin(Math.max(-1,Math.min(1,aim[2])))-Math.asin(Math.max(-1,Math.min(1,rest.n[2]))))*weight;
  rig.n=[Math.cos(az)*Math.cos(pitch),Math.sin(az)*Math.cos(pitch),Math.sin(pitch)];
  if(rig.grip[2]+rig.n[2]*1.72<.025){
    const z=Math.max(-1,Math.min(1,(.025-rig.grip[2])/1.72)),flat=Math.sqrt(1-z*z);
    rig.n=[Math.cos(az)*flat,Math.sin(az)*flat,z];
  }
  rig.tip=rig.grip.map((v,i)=>v+rig.n[i]*1.72);rig.lamp=rig.arms[0].end;
  return {pose,rig,heading:Math.atan2(e.fy,e.fx),pinGrip:[...rig.grip],pinTip:[...rig.tip],chestContact:chest};
}
