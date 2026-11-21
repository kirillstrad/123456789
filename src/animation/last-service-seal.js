import {sealInspectionWeight} from '../game/last-service-segment.js';
export function sealInspectionHero(s,elapsed,module=globalThis.IronPilgrim){
 if(!module)throw Error('Hero module is not loaded');
 const weight=sealInspectionWeight(elapsed),base=module.sample('breath',0,elapsed);
 const mix=(a,b)=>a.map((v,i)=>v+(b[i]-v)*weight);
 const pose={...base,id:'last-service-inspect-seal',root:[...base.root],gait:null,left:mix(base.left,[-.18,.57,1.55]),right:[...base.right],lean:base.lean+.07*weight,head:base.head+.12*weight,twist:(base.twist??0)-.08*weight};
 const rig=module.rig(pose),heading=Math.atan2(s.fy,s.fx),fx=Math.cos(heading),fy=Math.sin(heading);
 const transform=v=>{const x=v[0]-pose.root[0],y=v[1]-pose.root[1];return[s.x+fy*x+fx*y,s.y-fx*x+fy*y,v[2]];};
 const parts=[];
 const push=(kind,v,c,w=1)=>{const points=v.map(transform);parts.push({kind,v:points,c,w,hero:true,d:points.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/points.length+(kind===1?.005:0)});};
 const lamp=module.emit(rig,elapsed,{poly:(v,c)=>push(0,v,c),line:(v,c,w)=>push(1,v,c,w)},{cloth:0,chains:[0,0,0,0]},1);
 return {parts,lamp:transform(lamp),tip:transform(rig.tip),clip:'last-service-inspect-seal'};
}
