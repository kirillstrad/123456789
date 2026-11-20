import {ASHEN_DRESSING,ASHEN_ACCENT_LIGHTS,ashenWallOpening} from './ashen-visual-data.js';
import {DRESSING_FOOTPRINTS,buildAshenDressModel} from './ashen-dress-models.js';
import {buildAshenWallDress} from './ashen-wall-dress.js';
import {buildAshenBackdrop} from './ashen-backdrop.js';
import {ashenMotionParts} from './ashen-ambient-motion.js';
const clone=x=>JSON.parse(JSON.stringify(x));
export function createAshenDressing(plan,walkable,{reducedMotion=()=>typeof globalThis.matchMedia==='function'&&globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
 if(!plan||!Array.isArray(plan.tiles)||!Array.isArray(plan.doors)||typeof walkable!=='function')throw Error('Invalid dressing plan');
 const parts=[],rects=[],records=[];
 for(const p of ASHEN_DRESSING){
  if(!walkable(p.x,p.y))throw Error('Dressing off floor: '+p.id);
  const mesh=buildAshenDressModel(p);
  for(const collider of mesh.colliders){
   const b={minX:Math.min(...collider.points.map(p=>p[0])),maxX:Math.max(...collider.points.map(p=>p[0])),minY:Math.min(...collider.points.map(p=>p[1])),maxY:Math.max(...collider.points.map(p=>p[1])),levelInstanceId:p.id};
   for(const x of[b.minX+.01,b.maxX-.01])for(const y of[b.minY+.01,b.maxY-.01])if(!walkable(x,y))throw Error('Solid dressing crosses a floor edge: '+p.id);
   if(plan.doors.some(d=>d.x>b.minX-2.1&&d.x<b.maxX+2.1&&d.y>b.minY-2.1&&d.y<b.maxY+2.1))throw Error('Dressing enters door clearance: '+p.id);
   if(plan.lights.some(l=>{const x=l.transform.x,y=l.transform.y;return Math.hypot(x-Math.max(b.minX,Math.min(b.maxX,x)),y-Math.max(b.minY,Math.min(b.maxY,y)))<.55;}))throw Error('Dressing overlaps light source: '+p.id);
   if(rects.some(r=>b.minX<r.maxX&&b.maxX>r.minX&&b.minY<r.maxY&&b.maxY>r.minY))throw Error('Overlapping solid dressing: '+p.id);
   rects.push(b);
  }
  parts.push(...mesh.parts);records.push({...p,bounds:mesh.bounds,role:DRESSING_FOOTPRINTS[p.type]?'decorative-obstacle':'decor'});
 }
 const walls=buildAshenWallDress(plan,walkable),background=buildAshenBackdrop(walkable);
 let time=0,reduced=Boolean(reducedMotion()),dynamic=ashenMotionParts(0,walls.banners,reduced),lastMotion=-Infinity;
 return {
  parts:[...background.parts,...parts,...walls.parts],rects,lights:ASHEN_ACCENT_LIGHTS.map(x=>({...x})),
  step(dt){
   if(!Number.isFinite(dt)||dt<=0||dt>.1)throw Error('Invalid dressing timestep');time+=dt;
   const next=Boolean(reducedMotion());
   if(time-lastMotion+1e-9>=1/30||next!==reduced){reduced=next;dynamic=ashenMotionParts(time,walls.banners,reduced);lastMotion=time;}
  },
  dynamicParts:()=>dynamic,
  snapshot:()=>({time,props:clone(records),walls:clone(walls.records),banners:walls.banners.length,background:clone(background.records),parts:background.parts.length+parts.length+walls.parts.length,colliders:rects.length}),
 };
}
