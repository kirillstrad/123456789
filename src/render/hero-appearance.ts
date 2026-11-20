import type {Color,Rig,Vec3} from '../core/types.js';
export const HERO_ACCENT_COLOR='#873b3b';
export const HERO_GLINT_COLOR='#c0c6cb';
const cloth:Readonly<Record<string,string>>=Object.freeze({'#413b3b':'#29262b','#5b4f4b':'#373139','#95806e':'#514741','#6e5d51':'#403832'});
const metal:Readonly<Record<string,string>>=Object.freeze({'#b4a087':'#858b93','#efd3a2':'#a8adb3','#d4ae75':'#8f959d','#e0c69c':'#999fa6','#937554':'#626771','#eed7ad':'#a8adb3'});
const lerp=(a:Vec3,b:Vec3,t:number):Vec3=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const distance=(a:Vec3,b:Vec3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
function segmentDistance(p:Vec3,a:Vec3,b:Vec3):number{const d=b.map((v,i)=>v-a[i]),length=d.reduce((s,v)=>s+v*v,0),t=length?Math.max(0,Math.min(1,d.reduce((s,v,i)=>s+(p[i]-a[i])*v,0)/length)):0;return distance(p,lerp(a,b,t));}
function fragment(v:Vec3[],i:number,a:number,b:number):Vec3[]|null{return v.length>i+1?[lerp(v[i]!,v[i+1]!,a),lerp(v[i]!,v[i+1]!,b)]:null;}
export function createHeroAppearance(rig:Rig){
 let seam=0,hem=0,sword=0,chain=0;
 return{
  material(v:Vec3[],c:Color,kind:0|1):Color{
   if(typeof c==='string')return metal[c]??cloth[c]??c;
   if(kind!==0||!v.length||c.length!==3||!c.every(Number.isFinite))return c;
   const [r,g,b]=c;if(g!<=0||r!/g!<1.14||r!/g!>1.31||b!/g!<.72||b!/g!>.9)return c;
   const center=v.reduce<Vec3>((s,p)=>[s[0]+p[0]/v.length,s[1]+p[1]/v.length,s[2]+p[2]/v.length],[0,0,0]),hand=rig.arms.some(a=>distance(center,a.end)<.075),forearm=rig.arms.some(a=>segmentDistance(center,a.joint,a.end)<.065),gain=hand?1.18:forearm?1.1:1,bias=hand?[5,3,2]:forearm?[3,2,1]:[0,0,0],warm=c.map((n,i)=>n*gain+bias[i]!),luma=warm[0]!*.2126+warm[1]!*.7152+warm[2]!*.0722;
   const lift=hand?1:forearm?.55:center[2]>1.3?.8:0,shade=.65+.35*Math.max(0,Math.min(1,luma/120));return [148,139,126].map((n,i)=>Math.round((n+([222,208,178][i]!-n)*lift)*shade));
  },
  accent(v:Vec3[],c:Color,kind:0|1):Vec3[]|null{
   if(kind!==1||v.length<2)return null;
   if(c==='#958575'){const n=seam++;if(n===0)return fragment(v,0,.06,.26);if(n===3)return fragment(v,0,.74,.96);}
   if(c==='#c1a88a'&&hem++===0)return fragment(v,v.length>=3?1:0,.52,.9);
   return null;
  },
  glint(v:Vec3[],c:Color,kind:0|1):Vec3[]|null{
   if(kind!==1||v.length<2)return null;
   if(c==='#efd3a2'&&sword++===0)return fragment(v,v.length>=3?1:0,.1,.45);
   if(c==='#eed7ad'&&chain++%7===2)return fragment(v,0,.1,.7);
   return null;
  }
 };
}
