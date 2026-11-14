import type {Part,Vec3} from '../core/types.js';
import type {CombatSnapshot} from '../combat/types.js';
import {dashVisual} from '../combat/ash-dash.js';
export type FadedPart=Part&{alpha:number};
const noise=(i:number)=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
/** Snapshot-pure smoke ribbons and sparks. */
export function ashDashParts(s:CombatSnapshot):FadedPart[]{
  const d=s.dash;if(!d)return [];const v=dashVisual(d),smoke=1-v.visibility,t=d.elapsed,parts:FadedPart[]=[],travelled=Math.max(0,(s.x-d.startX)*d.fx+(s.y-d.startY)*d.fy);
  const push=(kind:0|1,points:Vec3[],c:number[],alpha:number,w=1)=>{parts.push({kind,v:points,c,alpha,w,hero:true,d:points.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/points.length+.008});};
  for(let i=0;i<28;i++){const seed=d.id*101+i,a=noise(seed),age=(t*1.4+noise(seed+50))%1,behind=Math.min(travelled,.8)*age,side=Math.sin(t*5+seed)*(.05+.13*a),x=s.x-d.fx*behind-d.fy*side,y=s.y-d.fy*behind+d.fx*side,z=.15+1.35*noise(seed+4)+age*.15,r=.07+.14*age,px=-d.fy*r,py=d.fx*r;
    push(0,[[x-px,y-py,z-r],[x+px,y+py,z-r*.5],[x+px*.7,y+py*.7,z+r],[x-px*.7,y-py*.7,z+r*.5]],[78+35*a,74+29*a,82+30*a],smoke*(.16+.22*(1-age)));
  }
  for(let i=0;i<20;i++){const a=noise(d.id*71+i),phase=(t*2+a)%1,angle=a*Math.PI*2,r=.06+phase*(.25+.28*v.flare),x=s.x+Math.cos(angle)*r-d.fx*Math.min(travelled,.5)*phase,y=s.y+Math.sin(angle)*r-d.fy*Math.min(travelled,.5)*phase,z=.1+phase*(1.2+v.flare);
    push(1,[[x,y,z],[x-d.fx*.025,y-d.fy*.025,z-.045]],[255,145+80*a,45],Math.min(1,smoke+v.flare)*(1-phase),1.3);
  }
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=.15+.15*v.flare,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r;push(1,[[x,y,.1],[x+Math.cos(a)*.08,y+Math.sin(a)*.08,.55+.65*v.flare],[s.x+Math.cos(a)*.08,s.y+Math.sin(a)*.08,1.65]],[255,173,65],v.flare*.65,2);}
  return parts;
}
