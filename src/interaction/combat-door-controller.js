import {interactionFrame} from '../animation/interaction.js';
import {planApproachRoute} from './approach-route.js';
import {interactionInputAllowed} from './intent.js';
import {createMotion} from '../animation/motion.js';

// The existing CombatWorld remains the only actor and combat simulation.
export function createCombatDoorController({world,scene,targeting,active=()=>true,plan=planApproachRoute}){
 let route=null,session=null,lastIntent=null,elapsed=0,stalled=0;
 const events=[];
 const record=(type,extra={})=>{events.push({type,time:world.current.time,...extra});if(events.length>200)events.shift();};
 const stop=()=>{const s=world.current;s.moving=false;s.motion=createMotion(s.fx,s.fy);s.footContacts=null;s.combatEntry=null;};
 function cancel(reason='cancelled'){
  // Combat commands must not bypass CombatWorld's active-interaction lock.
  if(session&&reason==='combat-command')return false;
  if(route){record('approach-cancelled',{targetId:route.targetId,reason});route=null;stop();}
  if(session){world.finishInteraction(session.id);record('interaction-cancelled',{id:session.id,targetId:session.targetId,reason});session=null;}
  targeting.cancelIntent();lastIntent=null;return true;
 }
 function navigate(dt){
  const s=world.current,t=scene.getTarget(route.targetId);
  if(!t||t.parts!==route.parts||t.availability!=='ready'||route.revision!==scene.revision()){cancel('scene-changed');world.step(dt,{x:0,y:0});return;}
  route.total+=dt;if(route.total>120){cancel('timeout');world.step(dt,{x:0,y:0});return;}
  const goal=route.points[route.index]??t.approach,dx=goal.x-s.x,dy=goal.y-s.y,d=Math.hypot(dx,dy);
  if(d>.055){const x=s.x,y=s.y;world.step(dt,{x:dx/d,y:dy/d});stalled=Math.hypot(s.x-x,s.y-y)<1e-6?stalled+dt:0;if(stalled>.75)cancel('path-blocked');return;}
  stop();stalled=0;
  if(route.index<route.points.length){route.index++;world.step(dt,{x:0,y:0});return;}
  const face=scene.facePoint(t.id),angle=Math.atan2(face.y-s.y,face.x-s.x),heading=s.motion.heading,delta=Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading));
  const a=heading+Math.sign(delta)*Math.min(Math.abs(delta),dt*4);s.fx=Math.cos(a);s.fy=Math.sin(a);s.motion=createMotion(s.fx,s.fy);
  world.step(dt,{x:0,y:0});
  if(s.phase!=='playing'||Math.abs(delta)>.02)return;
  const id=world.beginInteraction('door');if(id===null){cancel('start-rejected');return;}
  session={id,targetId:t.id,parts:t.parts,effect:false};elapsed=0;route=null;targeting.cancelIntent();record('interaction-start',{id,targetId:t.id});
 }
 function step(dt,input={x:0,y:0}){
  if(!Number.isFinite(dt)||dt<=0||dt>1/30||![input.x,input.y].every(Number.isFinite))throw Error('Invalid combat door tick');
  if(!active()){cancel('inactive');return;}
  const s=world.current;
  if(session){
   world.step(dt,{x:0,y:0});
   if(s.phase!=='playing'||s.interaction?.id!==session.id){cancel('actor-interrupted');scene.step(dt);return;}
   const t=scene.getTarget(session.targetId);if(!t||t.parts!==session.parts){cancel('target-lost');scene.step(dt);return;}
   scene.step(dt);elapsed+=dt;const frame=interactionFrame('door',elapsed);
   if(frame.effectDue&&!session.effect){session.effect=true;if(!scene.open(session.targetId,session.id)){cancel('effect-rejected');return;}record('interaction-effect',{id:session.id,targetId:session.targetId});}
   if(frame.complete){world.finishInteraction(session.id);record('interaction-end',{id:session.id,targetId:session.targetId});session=null;}return;
  }
  scene.step(dt);
  if(Math.hypot(input.x,input.y)>.001){cancel('manual');world.step(dt,input);return;}
  if(!interactionInputAllowed({mode:'game',actor:s})){cancel('actor-busy');world.step(dt,input);return;}
  const intent=targeting.intent();if(!intent){if(route)cancel('intent-lost');world.step(dt,input);return;}
  if(intent.context!=='game'||intent.kind!=='door'){cancel('unsupported-intent');world.step(dt,input);return;}
  const target=scene.getTarget(intent.targetId);if(!target||target.availability!=='ready'){cancel('target-unavailable');world.step(dt,input);return;}
  if(intent!==lastIntent){
   if(route){route=null;stop();}stalled=0;
   const result=plan({start:{x:s.x,y:s.y},goal:target.approach,colliders:scene.getColliders(),bounds:scene.getBounds()});
   if(!['ready','arrived'].includes(result.status)){cancel('route-'+result.status);world.step(dt,input);return;}
   route={targetId:target.id,parts:target.parts,points:[...result.waypoints],index:0,revision:scene.revision(),total:0};lastIntent=intent;stop();
  }
  navigate(dt);
 }
 return Object.freeze({step,cancel,decorate:s=>({...s,interactionAnimation:session&&s.interaction?.id===session.id?interactionFrame('door',elapsed):null}),snapshot:()=>({approach:route?{targetId:route.targetId,waypoint:route.index}:null,interaction:session?{id:session.id,targetId:session.targetId,elapsed}:null,events:events.map(e=>({...e}))})});
}
