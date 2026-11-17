import {buildPrisonDoorGeometry} from '../gallery/models/prison-door.js';
const rect=c=>({minX:Math.min(...c.points.map(p=>p[0])),maxX:Math.max(...c.points.map(p=>p[0])),minY:Math.min(...c.points.map(p=>p[1])),maxY:Math.max(...c.points.map(p=>p[1]))});
const polygon=r=>({kind:'polygon',points:[[r.minX,r.minY],[r.maxX,r.minY],[r.maxX,r.maxY],[r.minX,r.maxY]],minZ:0,maxZ:3});
// One nave exit instance. Multi-door aggregation is intentionally not claimed here.
export function createCombatDoorScene(base){
 if(!base||!Array.isArray(base.circles)||!Array.isArray(base.rects))throw Error('Invalid combat map');
 const id='nave.exit-door',transform={x:8,y:2.8,yaw:0},duration=1.2;
 const closed=buildPrisonDoorGeometry({transform}),parts=[...closed.parts],split=closed.frameParts.length;
 const blockers=closed.colliders.map(c=>({...c,points:c.points.map(p=>[...p])}));
 const map={circles:base.circles.map(c=>({...c})),rects:base.rects.map(r=>({...r}))};
 const matches=map.rects.filter(r=>r.minX===7.15&&r.maxX===8.85&&r.minY===2.52&&r.maxY===3.08);
 if(matches.length!==1)throw Error('Nave gate collider changed; review integration');
 const staticRects=map.rects.filter(r=>r!==matches[0]);
 let status='closed',elapsed=0,angle=0,actionId=null,revision=0;
 const target={id,kind:'door',parts,approach:Object.freeze({x:8,y:3.76,z:0}),availability:'ready'};
 function sync(open=false){
  const colliders=blockers.map((c,i)=>{
   if(!open||i!==blockers.length-1)return c;
   const h=closed.hinge;
   return{...c,points:c.points.map(([x,y])=>[h[0]+y-h[1],h[1]-(x-h[0])])};
  });
  map.rects.splice(0,map.rects.length,...staticRects,...colliders.map(rect));
 }
 function setAngle(next){const mesh=buildPrisonDoorGeometry({transform,angle:next});for(let i=split;i<parts.length;i++)parts[i]=mesh.parts[i];angle=next;}
 function reset(){status='closed';elapsed=0;actionId=null;target.availability='ready';setAngle(0);sync();revision++;}
 sync();
 return Object.freeze({map,parts,targets:[target],getTarget:key=>key===id?target:null,facePoint:key=>key===id?{x:8,y:2.8}:null,
  getBounds:()=>({minX:1.46,maxX:16.24,minY:1.46,maxY:16.24}),revision:()=>revision,
  getColliders:()=>[...map.rects.map(polygon),...map.circles.map(c=>({kind:'polygon',points:Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,r=c.r/Math.cos(Math.PI/32);return[c.x+r*Math.cos(a),c.y+r*Math.sin(a)];}),minZ:0,maxZ:3}))],
  open(key,owner){if(key!==id||status!=='closed'||!Number.isSafeInteger(owner)||owner<1)return false;status='opening';actionId=owner;target.availability='busy';return true;},
  step(dt){if(!Number.isFinite(dt)||dt<=0||dt>1/30)throw Error('Invalid combat door tick');if(status!=='opening')return;elapsed=Math.min(duration,elapsed+dt);if(duration-elapsed<1e-9)elapsed=duration;const p=elapsed/duration;setAngle(-90*p*p*(3-2*p));if(p===1){status='open';target.availability='open';sync(true);revision++;}},
  reset,snapshot:()=>({id,status,angle,elapsed,duration,actionId,collisionRevision:revision})});
}
