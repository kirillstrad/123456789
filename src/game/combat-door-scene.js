import {doorAssembly} from '../gallery/models/articulated-door.js';
import {createNaveInterior} from '../interior/nave-interior.js';
import {checkDoorSweep} from '../interaction/door-sweep.js';
import {ROOM_DOORS,ROOM_WORLD_BOUNDS,ROOM_ROUTE_BOUNDS} from './interaction-room-layout.js';
export const COMBAT_DOORS=ROOM_DOORS;
const rect=c=>({minX:Math.min(...c.points.map(p=>p[0])),maxX:Math.max(...c.points.map(p=>p[0])),minY:Math.min(...c.points.map(p=>p[1])),maxY:Math.max(...c.points.map(p=>p[1]))});
const polygon=r=>({kind:'polygon',points:[[r.minX,r.minY],[r.maxX,r.minY],[r.maxX,r.maxY],[r.minX,r.maxY]],minZ:0,maxZ:3});
export function createCombatDoorScene(base,definitions=COMBAT_DOORS,options={}){
 const worldBounds=options.bounds??ROOM_WORLD_BOUNDS,routeBounds=options.routeBounds??ROOM_ROUTE_BOUNDS;
 for(const b of [worldBounds,routeBounds])if(!['minX','maxX','minY','maxY'].every(k=>Number.isFinite(b[k]))||b.minX>=b.maxX||b.minY>=b.maxY)throw Error('Invalid level bounds');
 if(!base||!Array.isArray(base.circles)||!Array.isArray(base.rects)||!Array.isArray(definitions)||!definitions.length)throw Error('Invalid combat map');
 const interior=definitions===COMBAT_DOORS?createNaveInterior({circles:base.circles,rects:base.rects}):null;
 let revision=0,actors=()=>[];const seen=new Set();
 const doors=definitions.map(d=>{
  if(!d||typeof d.id!=='string'||!d.id||seen.has(d.id)||![d.x,d.y,d.yaw??0].every(Number.isFinite)||(d.yaw??0)%90)throw Error('Invalid door definition');seen.add(d.id);
  const transform={x:d.x,y:d.y,yaw:d.yaw??0},assembly=doorAssembly(d.modelId,transform),closed=assembly.mesh(),normal={x:-Math.sin(transform.yaw*Math.PI/180),y:Math.cos(transform.yaw*Math.PI/180)},offset=0;
  const goal=side=>{const p=assembly.world([offset,side*.72,0]);return{x:p[0],y:p[1],z:0};};
  const target={id:d.id,modelId:d.modelId,kind:'door',parts:[...closed.parts],approach:goal(1),availability:'ready'};
  return{target,transform,assembly,closed,mesh:closed,normal,goal,status:'closed',elapsed:0,progress:0,side:1,actionId:null,blocked:false,reservation:[],colors:new WeakMap()};
 });
 const byId=new Map(doors.map(d=>[d.target.id,d])),matches=base.rects.filter(r=>r.minX===7.15&&r.maxX===8.85&&r.minY===2.52&&r.maxY===3.08);if(options.legacyGate!==false&&matches.length!==1)throw Error('Nave gate collider changed; review integration');
 const staticRects=base.rects.filter(r=>options.legacyGate===false||r!==matches[0]).map(r=>({...r})),map={circles:base.circles.map(c=>({...c})),rects:[],bounds:{...worldBounds}};
 if(interior)staticRects.push(...interior.rects);
 const physical=d=>[...d.mesh.frameColliders,...d.mesh.leafColliders].filter(c=>c.minZ<2.2&&c.maxZ>0);
 function obstacles(d){return[...staticRects.map(polygon),...map.circles.map(c=>({kind:'circle',center:[c.x,c.y],radius:c.r,minZ:0,maxZ:3})),...doors.filter(o=>o!==d).flatMap(physical),...actors().map(a=>({kind:'circle',center:[a.x,a.y],radius:a.radius??.24,minZ:0,maxZ:a.height??2.2}))];}
 function sync(){map.rects.splice(0,map.rects.length,...staticRects,...doors.flatMap(d=>d.status==='opening'?[...d.closed.frameColliders.map(rect),...d.reservation]:physical(d).map(rect)));}
 function shade(d,id){for(const p of d.target.parts){if(!d.colors.has(p))d.colors.set(p,p.c);const c=d.colors.get(p);p.c=d.target.id===id&&d.status!=='open'&&Array.isArray(c)?c.map((v,i)=>Math.min(255,v*1.35+[24,15,5][i])):c;}}
 const snap=d=>({id:d.target.id,modelId:d.target.modelId,transform:{...d.transform},status:d.status,elapsed:d.elapsed,angle:d.assembly.profile.motion==='lift'?0:-90*d.side*d.progress,duration:1.2,actionId:d.actionId,side:d.side,blocked:d.blocked,style:d.assembly.profile.style,motion:d.assembly.profile.motion,collisionRevision:revision});
 function publish(d){d.mesh=d.assembly.mesh(d.progress,d.side);d.target.parts.splice(d.closed.frameParts.length,d.target.parts.length-d.closed.frameParts.length,...d.mesh.leafParts);}
 sync();
 return Object.freeze({map,targets:doors.map(d=>d.target),get parts(){return doors.flatMap(d=>d.target.parts);},
  interior,lightDefinitions:options.lights,
  setActors(provider){if(typeof provider!=='function')throw Error('Invalid door actor provider');actors=provider;},highlight(id){for(const d of doors)shade(d,id);},
  getTarget:id=>byId.get(id)?.target??null,facePoint:id=>{const d=byId.get(id),p=d?.assembly.world([0,0,0]);return p?{x:p[0],y:p[1]}:null;},
  approachCandidates(id,actor){const d=byId.get(id);if(!d)return[];const dot=(actor.x-d.transform.x)*d.normal.x+(actor.y-d.transform.y)*d.normal.y,side=dot<0?-1:1;return[{side,goal:d.goal(side)},{side:-side,goal:d.goal(-side)}];},
  contacts(id){const d=byId.get(id);return d?d.assembly.contacts(d.progress,d.side):[];},isBlocked:id=>byId.get(id)?.blocked??false,
  getBounds:()=>({...routeBounds}),revision:()=>revision,
  getColliders:()=>[...map.rects.map(polygon),...map.circles.map(c=>({kind:'polygon',points:Array.from({length:32},(_,i)=>{const a=i*Math.PI/16,r=c.r/Math.cos(Math.PI/32);return[c.x+r*Math.cos(a),c.y+r*Math.sin(a)];}),minZ:0,maxZ:3}))],
  open(id,owner,side=1){const d=byId.get(id);if(!d||d.status!=='closed'||!Number.isSafeInteger(owner)||owner<1||![1,-1].includes(side))return false;const checked=checkDoorSweep({leaves:d.assembly.sweep(0,1,side),obstacles:obstacles(d)});if(!checked.clear){d.blocked=true;return false;}const poses=Array.from({length:129},(_,i)=>d.assembly.mesh(i/128,side)),count=poses[0].leafColliders.length;
   d.reservation=Array.from({length:count},(_,j)=>{const vertices=poses.flatMap(m=>m.leafColliders[j].points),r=rect({points:vertices});return{minX:r.minX-.03,maxX:r.maxX+.03,minY:r.minY-.03,maxY:r.maxY+.03};});d.side=side;d.actionId=owner;d.status='opening';d.blocked=false;d.target.availability='busy';sync();revision++;return true;},
  step(dt){if(!Number.isFinite(dt)||dt<=0||dt>1/30)throw Error('Invalid combat door tick');let changed=false;for(const d of doors){if(d.status!=='opening')continue;const next=Math.min(1.2,d.elapsed+dt),p=next>=1.2-1e-9?1:next/1.2;const check=checkDoorSweep({leaves:d.assembly.sweep(d.progress,p,d.side),obstacles:obstacles(d)});d.blocked=!check.clear;if(d.blocked)continue;d.elapsed=p===1?1.2:next;d.progress=p;publish(d);if(p===1){d.status='open';d.target.availability='open';d.reservation=[];changed=true;}}if(changed){sync();revision++;}},
  reset(){for(const d of doors){d.status='closed';d.elapsed=0;d.progress=0;d.side=1;d.actionId=null;d.blocked=false;d.reservation=[];d.target.availability='ready';publish(d);shade(d,null);}sync();revision++;},snapshot:()=>({...snap(byId.get('nave.exit-door')??doors[0]),doors:doors.map(snap)})});
}
