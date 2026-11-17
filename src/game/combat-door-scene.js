import {buildDoorGeometry,DOOR_MODELS} from '../gallery/models/door-geometry.js';
export const COMBAT_DOORS=Object.freeze([
 {id:'nave.exit-door',modelId:'prison-door.a',x:8,y:2.8},
 {id:'nave.prison-b',modelId:'prison-door.b',x:3.3,y:3.2},
 {id:'nave.prison-c',modelId:'prison-door.c',x:13.8,y:3.2},
 {id:'nave.iron-a',modelId:'iron-door.a',x:3.3,y:11},
 {id:'nave.iron-b',modelId:'iron-door.b',x:14.1,y:12.8},
 {id:'nave.iron-c',modelId:'iron-door.c',x:8,y:14.7}
].map(d=>Object.freeze({...d,yaw:0})));
const rect=c=>({minX:Math.min(...c.points.map(p=>p[0])),maxX:Math.max(...c.points.map(p=>p[0])),minY:Math.min(...c.points.map(p=>p[1])),maxY:Math.max(...c.points.map(p=>p[1]))});
const polygon=r=>({kind:'polygon',points:[[r.minX,r.minY],[r.maxX,r.minY],[r.maxX,r.maxY],[r.minX,r.maxY]],minZ:0,maxZ:3});
export function createCombatDoorScene(base,definitions=COMBAT_DOORS){
 if(!base||!Array.isArray(base.circles)||!Array.isArray(base.rects))throw Error('Invalid combat map');
 if(!Array.isArray(definitions)||!definitions.length)throw Error('Empty door definitions');
 const seen=new Set();
 const doors=definitions.map(d=>{
  if(!d||typeof d.id!=='string'||!d.id||seen.has(d.id)||!DOOR_MODELS.includes(d.modelId)||![d.x,d.y].every(Number.isFinite)||(d.yaw??0)!==0)throw Error('Invalid door definition');
  seen.add(d.id);const transform={x:d.x,y:d.y,yaw:0},closed=buildDoorGeometry({modelId:d.modelId,transform}),opened=buildDoorGeometry({modelId:d.modelId,transform,angle:-90});
  const target={id:d.id,modelId:d.modelId,kind:'door',parts:[...closed.parts],approach:Object.freeze({x:d.x,y:d.y+.96,z:0}),availability:'ready'};
  return{definition:{...d},transform,closed,opened,target,status:'closed',elapsed:0,angle:0,actionId:null};
 });
 const byId=new Map(doors.map(d=>[d.target.id,d])),map={circles:base.circles.map(c=>({...c})),rects:base.rects.map(r=>({...r}))};
 const matches=map.rects.filter(r=>r.minX===7.15&&r.maxX===8.85&&r.minY===2.52&&r.maxY===3.08);
 if(matches.length!==1)throw Error('Nave gate collider changed; review integration');
 const staticRects=map.rects.filter(r=>r!==matches[0]);let revision=0;
 function sync(){map.rects.splice(0,map.rects.length,...staticRects,...doors.flatMap(d=>[...d.closed.frameColliders,...(d.status==='open'?d.opened.leafColliders:d.closed.leafColliders)].map(rect)));}
 function setAngle(d,angle){const mesh=angle===0?d.closed:angle===-90?d.opened:buildDoorGeometry({modelId:d.target.modelId,transform:d.transform,angle});for(let i=d.closed.frameParts.length;i<d.target.parts.length;i++)d.target.parts[i]=mesh.parts[i];d.angle=angle;}
 const snapshotDoor=d=>({id:d.target.id,modelId:d.target.modelId,transform:{...d.transform},status:d.status,angle:d.angle,elapsed:d.elapsed,duration:1.2,actionId:d.actionId,collisionRevision:revision});
 sync();
 return Object.freeze({map,targets:doors.map(d=>d.target),get parts(){return doors.flatMap(d=>d.target.parts);},
  getTarget:id=>byId.get(id)?.target??null,facePoint:id=>{const d=byId.get(id);return d?{x:d.transform.x,y:d.transform.y}:null;},
  getBounds:()=>({minX:1.46,maxX:16.24,minY:1.46,maxY:16.24}),revision:()=>revision,
  getColliders:()=>[...map.rects.map(polygon),...map.circles.map(c=>({kind:'polygon',points:Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,r=c.r/Math.cos(Math.PI/32);return[c.x+r*Math.cos(a),c.y+r*Math.sin(a)];}),minZ:0,maxZ:3}))],
  open(id,owner){const d=byId.get(id);if(!d||d.status!=='closed'||!Number.isSafeInteger(owner)||owner<1)return false;d.status='opening';d.actionId=owner;d.target.availability='busy';return true;},
  step(dt){if(!Number.isFinite(dt)||dt<=0||dt>1/30)throw Error('Invalid combat door tick');let changed=false;for(const d of doors){if(d.status!=='opening')continue;d.elapsed=Math.min(1.2,d.elapsed+dt);if(1.2-d.elapsed<1e-9)d.elapsed=1.2;const p=d.elapsed/1.2;setAngle(d,-90*p*p*(3-2*p));if(p===1){d.status='open';d.target.availability='open';changed=true;}}if(changed){sync();revision++;}},
  reset(){for(const d of doors){d.status='closed';d.elapsed=0;d.actionId=null;d.target.availability='ready';setAngle(d,0);}sync();revision++;},
  snapshot:()=>({...snapshotDoor(byId.get('nave.exit-door')??doors[0]),doors:doors.map(snapshotDoor)})});
}
