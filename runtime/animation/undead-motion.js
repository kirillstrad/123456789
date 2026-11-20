import {MELEE_UNDEAD} from '../combat/melee-undead.js';
import {MARROW_ARCHER} from '../combat/marrow-archer.js';
const clamp=x=>Math.max(0,Math.min(1,x));export const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export const UNDEAD_KINDS=Object.freeze(['bonebound','ossuary-guard','marrow-archer','gravebearer','bloated-remnant','ashbound']);
export function undeadProfile(kind){return kind==='marrow-archer'?MARROW_ARCHER:kind==='bonebound'?{windup:.72,recover:.8,stagger:.45}:MELEE_UNDEAD[kind];}
export function updateUndeadMotion(e,dt,before){
 if(!UNDEAD_KINDS.includes(e.archetype)||!(e.hp>0)||e.mode==='dead'||!Number.isFinite(dt)||dt<=0||![e.x,e.y,e.fx,e.fy,before.x,before.y].every(Number.isFinite))return;
 const old=e.undeadMotion,t=(old?.time??0)+dt,target=Math.atan2(e.fy,e.fx),heading=old?old.heading+Math.atan2(Math.sin(target-old.heading),Math.cos(target-old.heading))*(1-Math.exp(-dt*10)):target;
 const speed=(old?.speed??0)+(Math.hypot(e.x-before.x,e.y-before.y)/dt-(old?.speed??0))*(1-Math.exp(-dt*9)),width=e.archetype==='bloated-remnant'?.3:e.archetype==='ossuary-guard'?.21:.16;
 const world=side=>[e.x+Math.sin(heading)*side,e.y-Math.cos(heading)*side],nominal=[world(-width),world(width)];
 let feet=old?old.feet.map(f=>({...f,p:[...f.p],start:[...f.start],goal:[...f.goal]})):nominal.map(p=>({p:[...p],start:[...p],goal:[...p],t:1,lift:0})),next=old?.next??0;
 const dist=i=>Math.hypot(feet[i].p[0]-nominal[i][0],feet[i].p[1]-nominal[i][1]);
 if(!feet.some(f=>f.t<1)&&Math.max(dist(0),dist(1))>(e.archetype==='bloated-remnant'?.22:.17)){
  if(dist(next)<.1)next=1-next;const delta=[e.x-before.x,e.y-before.y],distance=Math.hypot(...delta),lead=Math.min(.14,distance/dt*.16),goal=nominal[next].map((v,i)=>v+delta[i]/Math.max(distance,1e-8)*lead);feet[next]={...feet[next],start:[...feet[next].p],goal,t:0};next=1-next;
 }
 const duration=e.archetype==='ashbound'?.23:e.archetype==='bloated-remnant'?.4:.3;
 feet=feet.map(f=>{if(f.t>=1)return{...f,lift:0};const q=Math.min(1,f.t+dt/duration),u=.5-.5*Math.cos(q*Math.PI);return{...f,t:q,p:f.start.map((v,i)=>v+(f.goal[i]-v)*u),lift:Math.sin(q*Math.PI)*.065};});
 const quiet=speed<.035&&['wait','chase'].includes(e.mode),gestureTarget=quiet?1:0,gesture=(old?.gesture??0)+(gestureTarget-(old?.gesture??0))*(1-Math.exp(-dt*10));
 e.undeadMotion={time:t,heading,speed,feet,next,gesture};
}
export function undeadPose(e){
 const p=undeadProfile(e.archetype);if(!p)return null;
 const m=e.undeadMotion,time=m?.time??0,heading=e.archetype==='marrow-archer'&&e.archerLocked?Math.atan2(e.fy,e.fx):m?.heading??Math.atan2(e.fy,e.fx),width=e.archetype==='bloated-remnant'?.3:e.archetype==='ossuary-guard'?.21:.16;
 const feet=m?m.feet.map(f=>{const dx=f.p[0]-e.x,dy=f.p[1]-e.y;return[Math.sin(heading)*dx-Math.cos(heading)*dy,Math.cos(heading)*dx+Math.sin(heading)*dy,f.lift];}):[[-width,0,0],[width,0,0]];
 const u=e.mode==='windup'?clamp(e.timer/p.windup):0,recover=e.mode==='recover'?ease(e.timer/p.recover):0;
 const raise=ease(u/.72),strike=ease((u-.78)/.22),idle=(m?.gesture??0)*Math.max(0,Math.sin((time+(e.id??0)*1.7)*.65))**6;
 return {time,heading,feet,raise,strike,recover,idle,gestureVariant:(e.id??0)%2,breath:Math.sin(time*1.8+(e.id??0))*.008,hit:e.mode==='stagger'?Math.sin(clamp(e.timer/(p.stagger??.45))*Math.PI)*.07:0};
}
export function archerReady(e){return e.archetype==='marrow-archer'&&e.hp>0&&e.mode==='windup'&&e.archerLocked===true&&!e.hitFired&&Number.isFinite(e.timer)&&e.timer>=MARROW_ARCHER.aimLock;}
export function bossAccentPose(e,time=0){
 if(e.hp<=0)return{head:0,jaw:0,grip:0,shoulder:0};
 const attack=e.mode==='windup',recover=e.mode==='recover';
 return {head:Math.sin(time*.8+(e.id??0))*(attack?.004:.018),jaw:(.5+.5*Math.sin(time*.7))*.012,grip:attack?Math.min(1,e.timer*2):.15+.1*Math.sin(time),shoulder:recover?Math.sin(Math.min(1,e.timer)*Math.PI)*.018:Math.sin(time*1.3)*.006};
}
