import {lampLighting} from './lamp-light.js';
export function sculptLighting(position,normal,material,state={}){
 const len=Math.hypot(...normal),n=len>1e-8?normal.map(v=>v/len):[0,0,1];
 const lamp=lampLighting(state.lamp??0,state.phase??'playing');
 const sources=[...(state.visualLights??[])];
 if(lamp.power>0&&Number.isFinite(state.x)&&Number.isFinite(state.y))sources.push({x:state.x,y:state.y,z:1.1,r:145*lamp.radiusScale*1.3,power:lamp.power*1.3,fireWarmth:.8});
 let diffuse=0,warm=0;
 for(const l of sources){
  if(![l.x,l.y,l.z,l.r,l.power].every(Number.isFinite)||l.r<=0||l.power<=0)continue;
  const v=[l.x-position[0],l.y-position[1],l.z-position[2]],d=Math.hypot(...v),dot=d>1e-8?Math.max(0,n.reduce((a,c,i)=>a+c*v[i]/d,0)):1;
  const energy=l.power*(.12+.88*dot)/(1+(d/(l.r/48))**2);diffuse+=energy;warm+=energy*(l.fireWarmth??.6);
 }
 const exposure=1-Math.exp(-diffuse),t=diffuse>0?Math.min(1,warm/diffuse):0;
 const lift=.62+.57*exposure,shade=1-exposure;
 return material.map((v,i)=>Math.max(0,Math.min(245,v*lift*([1-.08*shade+.045*t,1-.025*shade+.012*t,1+.08*shade-.045*t][i]))));
}
