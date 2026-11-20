import {fireLightingProfile} from '../interaction/fire-rules.js';
import {LIGHT_TINTS} from './spectral-light.js';
export function fireProfileKind(modelId){
 if(typeof modelId!=='string')throw Error('Invalid fire presentation model');const family=modelId.split('.')[0];
 if(['simple-candle','candle','floor-candle'].includes(family))return'candle';if(family==='candlesticks')return'candelabra';if(['wall-light','wall-candle','lamp'].includes(family))return'lamp';if(['brazier','oven','furnace','campfire'].includes(family))return family;throw Error('Unknown fire presentation model: '+modelId);
}
const depth=p=>p.v.reduce((s,v)=>s+v[0]+v[1]+v[2]*.006,0)/p.v.length+(p.kind===2?.01:p.kind===1?.005:0);
export function presentFireMesh(mesh,modelId,status){
 if(status!=='lit')return{parts:mesh.parts,lights:mesh.lights};
 const points=mesh.emissionPoints;if(!points?.length||!mesh.lights.length)throw Error('Burning source has no emitters');
 const kind=fireProfileKind(modelId),profile=fireLightingProfile(kind,{emitters:mesh.lights.length}),gain=({candle:1.5,candelabra:1.5,lamp:1.2,brazier:1.1})[kind]??1,flames=[];
 for(const source of mesh.flameParts){
  const center=source.v.reduce((s,v)=>s.map((n,i)=>n+v[i]/source.v.length),[0,0,0]),anchor=points.reduce((best,p)=>Math.hypot(...p.map((v,i)=>v-center[i]))<Math.hypot(...best.map((v,i)=>v-center[i]))?p:best,points[0]);
  const part={...source,v:source.v.map(v=>v.map((n,i)=>anchor[i]+(n-anchor[i])*profile.flameScale)),c:[237,204,143],...(source.kind===2?{r:source.r*profile.flameScale}:{})};part.d=depth(part);flames.push(part);
  if(part.kind===2)flames.push({...part,c:[255,235,187],r:part.r*.52,d:part.d+.0001});
 }
 return{parts:[...mesh.bodyParts,...flames],lights:mesh.lights.map(l=>({...l,r:profile.radius,power:profile.power*gain,lightColor:kind==='candle'?LIGHT_TINTS.yellow:kind==='lamp'?LIGHT_TINTS.ivory:LIGHT_TINTS.amber}))};
}
