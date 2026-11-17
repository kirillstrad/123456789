import type {Color,Rig,Vec3} from '../core/types.js';
const cloth:Readonly<Record<string,string>>=Object.freeze({'#413b3b':'#433b3d','#5b4f4b':'#60514e','#95806e':'#9b8272','#6e5d51':'#755f55'});
const lerp=(a:Vec3,b:Vec3,t:number):Vec3=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const distance=(a:Vec3,b:Vec3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function segmentDistance(p:Vec3,a:Vec3,b:Vec3):number{const d=b.map((v,i)=>v-a[i]),length=d.reduce((s,v)=>s+v*v,0),t=length?Math.max(0,Math.min(1,d.reduce((s,v,i)=>s+(p[i]-a[i])*v,0)/length)):0;return distance(p,lerp(a,b,t));}
export function createHeroAppearance(rig:Rig){
 let seam=0;
 return{
  material(v:Vec3[],c:Color,kind:0|1):Color{
   if(typeof c==='string')return cloth[c]??c;
   if(kind!==0||!v.length||c.length!==3||!c.every(Number.isFinite))return c;
   const [r,g,b]=c;if(g<=0||r/g<1.14||r/g>1.31||b/g<.72||b/g>.9)return c;
   const center=v.reduce<Vec3>((s,p)=>[s[0]+p[0]/v.length,s[1]+p[1]/v.length,s[2]+p[2]/v.length],[0,0,0]);
   const hand=rig.arms.some(a=>distance(center,a.end)<.075),forearm=rig.arms.some(a=>segmentDistance(center,a.joint,a.end)<.065);
   if(!hand&&!forearm)return c;
   const gain=hand?1.18:1.1,bias=hand?[5,3,2]:[3,2,1];return c.map((n,i)=>Math.max(0,Math.min(255,Math.round(n*gain+bias[i]))));
  },
  accent(v:Vec3[],c:Color,kind:0|1):Vec3[]|null{
   if(kind!==1||(c!=='#958575'&&c!=='#c1a88a')||v.length<2)return null;
   if(seam++%3!==0)return null;
   // Short fragments follow existing cloth edges, not a screen-space halo.
   return[lerp(v[0],v[1],.08),lerp(v[0],v[1],.36)];
  }
 };
}
