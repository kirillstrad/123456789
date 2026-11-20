import {GOLEM_ATTACKS} from '../combat/corpse-golem.js';
export function golemTelegraphs(s,map,blocked){
 if(s.phase!=='playing'||s.execution||typeof blocked!=='function')return[];
 const parts=[];
 for(const e of s.enemies??[s.enemy]){
  if(!e||e.archetype!=='corpse-golem'||e.hp<=0||e.mode!=='windup')continue;
  const a=GOLEM_ATTACKS[e.golemAttack];if(!a)continue;
  const norm=Math.hypot(e.fx,e.fy);if(norm<1e-8)continue;
  const heading=Math.atan2(e.fy,e.fx),half=a.arc*Math.PI/360,progress=Math.max(0,Math.min(1,e.timer/a.windup)),count=Math.max(12,Math.ceil(a.arc/5)),points=[];
  for(let i=0;i<=count;i++){
   const angle=heading-half+2*half*i/count,dx=Math.cos(angle),dy=Math.sin(angle);let low=0,high=a.reach;
   if(blocked(e,{x:e.x+dx*high,y:e.y+dy*high},map))for(let k=0;k<10;k++){const mid=(low+high)/2;if(blocked(e,{x:e.x+dx*mid,y:e.y+dy*mid},map))high=mid;else low=mid;}else low=high;
   points.push([e.x+dx*low,e.y+dy*low,.012]);
  }
  const add=(kind,v,c,w,alpha)=>parts.push({kind,v,c,w,alpha,hero:false,golemTelegraph:true,d:-900000+e.x+e.y});
  for(let i=1;i<points.length;i++)add(0,[[e.x,e.y,.012],points[i-1],points[i]],[150,33,48],1,.08+.14*progress);
  add(1,points,[224,72,79],1.5,.45+.5*progress);
  add(1,[points[0],[e.x,e.y,.012],points.at(-1)],[174,48,64],1,.4+.45*progress);
  if(e.golemAttack==='press'){
   // This is a moving current hit sector, not a predicted future hit location.
   for(let i=1;i<=4;i++){const z=.014,x=e.x+Math.cos(heading)*i*.22,y=e.y+Math.sin(heading)*i*.22;add(1,[[x-Math.sin(heading)*.08,y+Math.cos(heading)*.08,z],[x+Math.sin(heading)*.08,y-Math.cos(heading)*.08,z]],[211,87,82],1,.55);}
  }
 }
 return parts;
}
