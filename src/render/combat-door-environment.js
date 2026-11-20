import {createEnvironment} from './environment.js';
import {enableCombatLights} from '../game/combat-light-context.js';
function feedback(d){
 if(d.status!=='opening'||d.elapsed>1.15)return{parts:[],lights:[]};const {x,y,yaw=0}=d.transform,a=yaw*Math.PI/180,t=d.elapsed;
 const point=(u,v,z)=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a),z];
 const part=(kind,v,c,alpha,w=1)=>({kind,v,c,alpha,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length+.01});const parts=[];
 for(let i=0;i<12;i++){const age=t-i*.013;if(age<0||age>.38)continue;const q=i*2.399,u=.55+Math.cos(q)*age*.7,v=Math.sin(q)*age*.6,z=1.1+age*(.5+i%3*.3)-age*age;parts.push(part(1,[point(u,v,z),point(u-.04*Math.cos(q),v-.04*Math.sin(q),z-.06)],[255,163,65],1-age/.38,1.5));}
 for(let i=0;i<7;i++){const age=t-i*.08;if(age<0||age>.65)continue;const u=-.7+i*.22,v=d.side*.12+Math.sin(i)*age*.15,z=.08+age*.7,r=.05+age*.16;parts.push(part(0,[point(u-r,v,z),point(u,v-r,z+r),point(u+r,v,z),point(u,v+r,z-r*.3)],[107,98,110],.24*(1-age/.65)));}
 return{parts,lights:t<.22?[{x,y,z:1.1,r:28,power:.4*(1-t/.22)}]:[]};
}
export function createCombatDoorEnvironment(door){const env=createEnvironment(),baseParts=env.parts.map(p=>p.v.every(q=>q[2]===0)?{...p,d:p.d-10000}:p),lighting=enableCombatLights(door),effects=()=>door.snapshot().doors.map(feedback);return Object.freeze({get parts(){return[...baseParts,...(door.interior?.parts??[]),...door.parts,...lighting.getFrame().parts,...effects().flatMap(e=>e.parts)];},get lights(){return[...lighting.getFrame().lights,...effects().flatMap(e=>e.lights)];},get targets(){return[...door.targets,...lighting.getFrame().targets.filter(t=>t.activation==='lantern')];}});}
