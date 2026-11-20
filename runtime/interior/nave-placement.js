import {interiorCard} from './catalogue.js';
import {NAVE_INTERIOR_LIMITS,NAVE_INTERIOR_PROTECTED,naveInteriorPlacements,NAVE_COMPOSITIONS} from './nave-compositions.js';
const overlap=(a,b,pad=0)=>a.minX<b.maxX+pad&&a.maxX>b.minX-pad&&a.minY<b.maxY+pad&&a.maxY>b.minY-pad;
export function placementBounds(p,card=interiorCard(p.modelId)){
 const {width,depth}=card.dimensions,a=p.yaw*Math.PI/180,rx=(Math.abs(Math.cos(a))*width+Math.abs(Math.sin(a))*depth)/2,ry=(Math.abs(Math.sin(a))*width+Math.abs(Math.cos(a))*depth)/2;
 return {minX:p.x-rx,maxX:p.x+rx,minY:p.y-ry,maxY:p.y+ry};
}
export function validateNaveInterior(placements=naveInteriorPlacements(),{card=interiorCard,circles=[],rects=[]}={}){
 const seen=new Set(),obstacles=[];
 for(const p of placements){
  if(!p||typeof p.instanceId!=='string'||seen.has(p.instanceId)||![p.x,p.y,p.z,p.yaw].every(Number.isFinite))throw Error('Invalid or duplicate interior placement');
  seen.add(p.instanceId);const c=card(p.modelId),b=placementBounds(p,c),margin=.18;
  if(b.minX-margin<NAVE_INTERIOR_LIMITS.minX||b.maxX+margin>NAVE_INTERIOR_LIMITS.maxX||b.minY-margin<NAVE_INTERIOR_LIMITS.minY||b.maxY+margin>NAVE_INTERIOR_LIMITS.maxY)throw Error('Interior outside room: '+p.instanceId);
  for(const zone of NAVE_INTERIOR_PROTECTED)if(overlap(b,zone,margin))throw Error('Interior enters protected zone '+zone.id+': '+p.instanceId);
  if(c.collision!=='none'){
   if(p.yaw%90!==0||p.z!==0)throw Error('Raised or rotated solid requires a dedicated collision model: '+p.instanceId);
   if(rects.some(r=>overlap(b,r)))throw Error('Interior overlaps a static wall: '+p.instanceId);
   if(circles.some(o=>Math.hypot(Math.max(b.minX,Math.min(b.maxX,o.x))-o.x,Math.max(b.minY,Math.min(b.maxY,o.y))-o.y)<o.r+.12))throw Error('Interior overlaps a pillar: '+p.instanceId);
   if(obstacles.some(o=>overlap(b,o)))throw Error('Overlapping interior obstacles: '+p.instanceId);
   obstacles.push(b);
  }
 }
 return {compositions:NAVE_COMPOSITIONS.length,objects:placements.length,obstacles:obstacles.length};
}
