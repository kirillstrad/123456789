import {PALETTE as P} from '../registry.js';
import {createGeometry} from '../geometry.js';
export const PRISON_DOOR_HINGE=Object.freeze([-.8,0,0]);
export const PRISON_DOOR_OPEN_ANGLE=-90;
function frame(g){
 for(const x of[-.95,.8])g.solidBox(x,-.16,0,.15,.32,2.35,P.stone);
 g.box(-.95,-.16,2.25,1.9,.32,.15,P.stoneTrim);
}
function leaf(v,g){
 if(v===1)g.box(-.79,-.05,.05,1.58,.1,2.16,[65,53,60]);
 else for(let i=0;i<9;i++)g.box(-.78+i*.19,-.05,.05,.045,.1,2.16,P.iron);
 for(const z of[.4,1.5])g.box(-.8,-.075,z,1.6,.15,.08,P.iron);
 g.box(.46,-.14,1,.19,.1,.22,P.stoneTrim);
 if(v===2)g.line([[-.65,-.1,.2],[.65,-.1,2.1]],P.iron,4);
}
const block=g=>g.collision(-.8,-.075,0,1.6,.15,2.22);
// Shared closed authoring keeps the existing catalogue geometry unchanged.
export function buildPrisonDoor(v,g){
 if(!Number.isInteger(v)||v<0||v>2)throw Error('Invalid prison door variant');
 frame(g);leaf(v,g);block(g);
}
// Angle is in degrees. This explicit API articulates only prison-door.a.
export function buildPrisonDoorGeometry({angle=0,transform={}}={}){
 if(!Number.isFinite(angle)||angle<PRISON_DOOR_OPEN_ANGLE||angle>0)throw Error('Invalid prison door angle');
 if(!transform||typeof transform!=='object'||Array.isArray(transform))throw Error('Invalid prison door transform');
 const {x=0,y=0,z=0,yaw=0}=transform,g=createGeometry({x,y,z,yaw}),a=yaw*Math.PI/180;
 const h=PRISON_DOOR_HINGE,hinge=[x+h[0]*Math.cos(a)-h[1]*Math.sin(a),y+h[0]*Math.sin(a)+h[1]*Math.cos(a),z+h[2]];
 frame(g);const split=g.parts.length;leaf(0,g);block(g);
 if(angle!==0){
  const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  for(let i=split;i<g.parts.length;i++){
   const part=g.parts[i],v=part.v.map(p=>{const dx=p[0]-hinge[0],dy=p[1]-hinge[1];return[hinge[0]+dx*c-dy*s,hinge[1]+dx*s+dy*c,p[2]];});
   const d=v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length+(part.kind===1?.005:part.kind===2?.01:0);
   g.parts[i]={...part,v,d};
  }
 }
 if(!hinge.every(Number.isFinite)||!g.parts.every(p=>Number.isFinite(p.d)&&p.v.every(v=>v.every(Number.isFinite))))throw Error('Non-finite prison door geometry');
 const mesh=g.finish();
 return{...mesh,objectId:'prison-door.a',familyId:'prison-door',variant:0,role:'door',angle,hinge,frameParts:mesh.parts.slice(0,split),leafParts:mesh.parts.slice(split)};
}
