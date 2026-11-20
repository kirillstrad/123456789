import {createGeometry} from '../gallery/geometry.js';
import {buildInteriorModel} from '../interior/models.js';
import {ASHEN_PROPS,ashenWalkable} from './ashen-layout.js';
import {createAshenDressing} from './ashen-dressing.js';
import {ashenFloorColour,ashenWallOpening} from './ashen-visual-data.js';
export function createAshenEnvironment(plan){
 const g=createGeometry(),parts=[],rects=[],dressing=createAshenDressing(plan,ashenWalkable);
 for(const {x,y}of plan.tiles){
  g.poly([[x+.018,y+.018,0],[x+.982,y+.018,0],[x+.982,y+.982,0],[x+.018,y+.982,0]],ashenFloorColour(x,y));
  if(!ashenWalkable(x+.5,y-.5)){
   if(ashenWallOpening(x,y,'north')){
    g.box(x,y-.16,0,1,.16,.55,[71,72,81]);g.box(x,y-.16,2.1,1,.16,.3,[71,72,81]);
    g.line([[x+.13,y+.015,.55],[x+.27,y+.015,1.75]],[53,53,56],2.5);
   }else g.box(x,y-.16,0,1,.16,2.4,[71,72,81]);
  }
  if(!ashenWalkable(x-.5,y+.5)){
   if(ashenWallOpening(x,y,'west')){
    g.box(x-.16,y,0,.16,1,.55,[75,73,79]);g.box(x-.16,y,2.1,.16,1,.3,[75,73,79]);
    g.line([[x+.015,y+.2,.55],[x+.015,y+.35,1.8]],[53,53,56],2.5);
   }else g.box(x-.16,y,0,.16,1,2.4,[75,73,79]);
  }
  if(!ashenWalkable(x+.5,y+1.5))g.box(x,y+1,0,1,.12,.28,[69,66,65]);
  if(!ashenWalkable(x+1.5,y+.5))g.box(x+1,y,0,.12,1,.28,[69,66,65]);
  if((x*3+y)%17===0)g.line([[x+.17,y+.14,.009],[x+.42,y+.47,.01],[x+.35,y+.74,.01]],[27,28,30],1.2);
 }
 for(const c of plan.obstacles.circles){
  const a=Array.from({length:10},(_,i)=>{const t=i/10*Math.PI*2;return[c.x+Math.cos(t)*c.r,c.y+Math.sin(t)*c.r,0];});
  for(let i=0;i<10;i++){const p=a[i],q=a[(i+1)%10];g.poly([p,q,[q[0],q[1],2.6],[p[0],p[1],2.6]],[80+i%3*5,77+i%3*4,80]);}
 }
 parts.push(...g.finish().parts);
 for(const p of ASHEN_PROPS){
  const m=buildInteriorModel(p.modelId,p);parts.push(...m.parts.map(part=>({...part,levelInstanceId:p.instanceId})));
  for(const c of m.colliders)rects.push({minX:Math.min(...c.points.map(p=>p[0])),maxX:Math.max(...c.points.map(p=>p[0])),minY:Math.min(...c.points.map(p=>p[1])),maxY:Math.max(...c.points.map(p=>p[1]))});
 }
 parts.push(...dressing.parts);rects.push(...dressing.rects);
 return {parts,rects,lights:dressing.lights,step:dressing.step,dynamicParts:dressing.dynamicParts,dressingSnapshot:dressing.snapshot};
}
