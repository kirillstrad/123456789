import type {CombatSnapshot,Obstacles,Point} from './types.js';
import {solid} from './geometry.js';
export const DASH=Object.freeze({dissolve:.16,travel:.42,reform:.22,total:.8,distance:2.4,cooldown:1.2,spacing:.025,landingClearance:.66});
export interface DashState{id:number;elapsed:number;fx:number;fy:number;startX:number;startY:number;distance:number;blocked:boolean}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const smoothDash=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
export function dashVisual(d:DashState){const t=d.elapsed,arrival=DASH.dissolve+DASH.travel;return {visibility:t<DASH.dissolve?1-smoothDash(t/DASH.dissolve):t<arrival?0:smoothDash((t-arrival)/DASH.reform),flare:t<arrival?0:Math.sin(Math.PI*clamp((t-arrival)/DASH.reform)),travel:smoothDash((t-DASH.dissolve)/DASH.travel)};}
export function dashInvulnerable(d:DashState|null|undefined):boolean{return !!d&&d.elapsed>=DASH.dissolve&&d.elapsed<DASH.dissolve+DASH.travel;}
export function planDash(s:CombatSnapshot,map:Obstacles,direction:Point,id:number):DashState|null{
  const n=Math.hypot(direction.x,direction.y);if(!Number.isFinite(n)||n<.001)return null;
  const fx=direction.x/n,fy=direction.y/n,count=Math.ceil(DASH.distance/DASH.spacing);let distance=0;
  for(let i=1;i<=count;i++){const v=DASH.distance*i/count;if(solid(s.x+fx*v,s.y+fy*v,map))break;distance=v;}
  while(distance>0&&s.enemy.hp>0&&Math.hypot(s.x+fx*distance-s.enemy.x,s.y+fy*distance-s.enemy.y)<DASH.landingClearance)distance=Math.max(0,distance-DASH.spacing);
  if(distance<DASH.spacing)return null;
  return {id,elapsed:0,fx,fy,startX:s.x,startY:s.y,distance,blocked:false};
}
/** Check short path segments rather than teleporting to an endpoint. */
export function advanceDash(s:CombatSnapshot,map:Obstacles,dt:number):void{
  const d=s.dash;if(!d||!Number.isFinite(dt)||dt<=0)return;
  d.elapsed=Math.min(DASH.total,d.elapsed+dt);
  if(!d.blocked){const progress=dashVisual(d).travel,tx=d.startX+d.fx*d.distance*progress,ty=d.startY+d.fy*d.distance*progress,ox=s.x,oy=s.y,n=Math.max(1,Math.ceil(Math.hypot(tx-ox,ty-oy)/DASH.spacing));
    for(let i=1;i<=n;i++){const x=ox+(tx-ox)*i/n,y=oy+(ty-oy)*i/n;if(solid(x,y,map)){d.blocked=true;break;}s.x=x;s.y=y;}
  }
  if(d.elapsed>=DASH.total-1e-9){s.dash=null;s.dashCooldown=DASH.cooldown;}
}
