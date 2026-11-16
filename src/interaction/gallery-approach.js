import {planApproachRoute} from './approach-route.js';

export function createGalleryApproach(player,scene,targeting,{allowed=()=>true,manualHeld=()=>false,plan=planApproachRoute}={}){
 let current=null,route=[],index=0,geometry='',lastPosition=null,stalled=0,total=0;
 let state=Object.freeze({status:'idle',targetId:null,reason:null,waypoint:0,total:0});
 const publish=(status,reason=null)=>state=Object.freeze({status,targetId:current?.targetId??state.targetId,reason,waypoint:index,total:route.length});
 function cancelApproach(reason='cancelled'){
  const active=!!current;current=null;route=[];index=0;lastPosition=null;stalled=0;total=0;
  targeting.cancelIntent();if(active)player.stop();publish('cancelled',reason);
 }
 function identity(t,i){return t&&t.id===i.targetId&&t.kind===i.kind&&t.enabled!==false&&t.visible!==false&&!t.removed&&(t.availability??'ready')==='ready'&&t.approach&&t.approach.x===i.approach.x&&t.approach.y===i.approach.y&&(t.approach.z??0)===i.approach.z;}
 function facePoint(t){
  const vertices=t.parts.flatMap(p=>p.v??[]);if(!vertices.length||!vertices.every(v=>Number.isFinite(v[0])&&Number.isFinite(v[1])))throw Error('Invalid target facing geometry');
  let x=0,y=0;for(const v of vertices){x+=v[0];y+=v[1];}return{x:x/vertices.length,y:y/vertices.length};
 }
 function step(dt,input={x:0,y:0}){
  if(![dt,input.x,input.y].every(Number.isFinite)||dt<=0||dt>1/30)throw Error('Invalid approach step');
  if(manualHeld()||Math.hypot(input.x,input.y)>.001){if(current||targeting.intent())cancelApproach('manual');player.step(dt,input);return;}
  if(!allowed()){if(current||targeting.intent())cancelApproach('input-blocked');player.step(dt,{x:0,y:0});return;}
  const intent=targeting.intent();
  if(intent&&intent.context!=='gallery-walk'){cancelApproach('unsupported-context');player.step(dt,{x:0,y:0});return;}
  if(!intent){if(current)cancelApproach('intent-lost');player.step(dt,input);return;}
  try{
   const target=scene.getTarget(intent.targetId);
   if(!identity(target,intent)){cancelApproach('target-changed');player.step(dt,{x:0,y:0});return;}
   const colliders=scene.getColliders(),bounds=scene.getBounds(),signature=JSON.stringify([bounds,colliders]);
   if(current&&current.id!==intent.id){cancelApproach('intent-replaced');player.step(dt,{x:0,y:0});return;}
   if(current&&signature!==geometry){cancelApproach('obstacles-changed');player.step(dt,{x:0,y:0});return;}
   if(current&&current.parts!==target.parts){cancelApproach('target-replaced');player.step(dt,{x:0,y:0});return;}
   if(!current){
    player.stop();const s=player.snapshot(),g=intent.approach;
    if(Math.abs(s.x-g.x)>112||Math.abs(s.y-g.y)>112){cancelApproach('out-of-range');player.step(dt,{x:0,y:0});return;}
    const local={minX:Math.max(bounds.minX,Math.min(s.x,g.x)-4),maxX:Math.min(bounds.maxX,Math.max(s.x,g.x)+4),minY:Math.max(bounds.minY,Math.min(s.y,g.y)-4),maxY:Math.min(bounds.maxY,Math.max(s.y,g.y)+4)};
    const result=plan({start:{x:s.x,y:s.y},goal:g,colliders,bounds:local});
    if(!['ready','arrived'].includes(result.status)){cancelApproach(result.status);player.step(dt,{x:0,y:0});return;}
    current={...intent,parts:target.parts};route=result.waypoints;index=0;geometry=signature;lastPosition=null;stalled=0;total=0;player.stop();
   }
   if(state.status==='arrived')total=0;total+=dt;if(total>120){cancelApproach('timeout');player.step(dt,{x:0,y:0});return;}
   const face=facePoint(target),destination=route[index]??current.approach;
   const moved=player.navigate(dt,destination,face);
   if(moved.blocked){cancelApproach('path-blocked');return;}
   const s=player.snapshot();
   if(moved.reached&&index<route.length){index++;player.stop();lastPosition=null;stalled=0;}
   else if(lastPosition&&Math.hypot(s.x-lastPosition.x,s.y-lastPosition.y)<1e-6&&index<route.length)stalled+=dt;else stalled=0;
   lastPosition={x:s.x,y:s.y};
   if(stalled>.75){cancelApproach('stuck');return;}
   if(index<route.length)publish('approaching');
   else{
    const angle=Math.atan2(face.y-s.y,face.x-s.x),delta=Math.atan2(Math.sin(angle-s.motion.heading),Math.cos(angle-s.motion.heading));
    publish(Math.abs(delta)<.02?'arrived':'turning');
   }
  }catch(error){cancelApproach('invalid-scene');player.step(dt,{x:0,y:0});}
 }
 function approach(){if(current&&!targeting.intent())cancelApproach('intent-lost');return state;}
 return Object.freeze({step,snapshot:()=>player.snapshot(),approach,cancelApproach});
}
