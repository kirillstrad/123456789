import {createGeometry} from '../geometry.js';
import {buildPrisonDoor} from './prison-door.js';
import {buildSetpiece} from './setpieces.js';
export const DOOR_MODELS=Object.freeze(['prison-door.a','prison-door.b','prison-door.c','iron-door.a','iron-door.b','iron-door.c']);
export function buildDoorGeometry({modelId='prison-door.a',angle=0,transform={}}={}){
 if(!DOOR_MODELS.includes(modelId))throw Error('Invalid door model');
 if(!Number.isFinite(angle)||angle>0||angle< -90)throw Error('Invalid door angle');
 if(!transform||typeof transform!=='object'||Array.isArray(transform))throw Error('Invalid door transform');
 const iron=modelId.startsWith('iron-'),variant=modelId.charCodeAt(modelId.length-1)-97;
 const g=createGeometry(transform),expected=['solidBox','solidBox','box'];let calls=0,partSplit=0,colliderSplit=0;
 // Existing authors emit two posts and one lintel first. Capture that boundary,
 // fail closed if authoring changes, and never identify the leaf by collider index.
 const recorder=new Proxy(g,{get(target,key){const value=target[key];if(typeof value!=='function')return value;return(...args)=>{
  if(calls<3){if(key!==expected[calls])throw Error('Door frame authoring changed');if(args.length!==7)throw Error('Invalid frame authoring');}
  const result=value(...args);calls++;
  if(calls===3){partSplit=g.parts.length;colliderSplit=g.colliders.length;}
  return result;
 };}});
 if(iron)buildSetpiece('iron-door',variant,recorder);else buildPrisonDoor(variant,recorder);
 if(calls<4||partSplit!==15||colliderSplit!==2||g.colliders.length!==3)throw Error('Door partition changed');
 const x=transform.x??0,y=transform.y??0,z=transform.z??0,yaw=(transform.yaw??0)*Math.PI/180,hx=iron?-1.1:-.8;
 const hinge=[x+hx*Math.cos(yaw),y+hx*Math.sin(yaw),z],r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
 const rotate=([px,py,pz])=>{const dx=px-hinge[0],dy=py-hinge[1];return[hinge[0]+dx*c-dy*s,hinge[1]+dx*s+dy*c,pz];};
 if(angle!==0){
  for(let i=partSplit;i<g.parts.length;i++){const p=g.parts[i],v=p.v.map(rotate),d=v.reduce((n,q)=>n+q[0]+q[1]+q[2]*.006,0)/v.length+(p.kind===1?.005:p.kind===2?.01:0);g.parts[i]={...p,v,d};}
  for(let i=colliderSplit;i<g.colliders.length;i++){const b=g.colliders[i];g.colliders[i]={...b,points:b.points.map(p=>rotate([...p,0]).slice(0,2))};}
 }
 const mesh=g.finish();
 return{...mesh,modelId,variant,hinge,angle,frameParts:mesh.parts.slice(0,partSplit),leafParts:mesh.parts.slice(partSplit),frameColliders:mesh.colliders.slice(0,colliderSplit),leafColliders:mesh.colliders.slice(colliderSplit)};
}
