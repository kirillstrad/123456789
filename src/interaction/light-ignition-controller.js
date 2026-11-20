import {interactionInputAllowed} from './intent.js';
import {interactionFrame} from '../animation/interaction.js';
export const IGNITION_POLICY=Object.freeze({lampCost:0,reserve:0,low:15,positionTolerance:.15,facingCos:Math.cos(Math.PI/10)});
function aligned(actor,target){
 if(!target?.approach||!target.facePoint||![actor?.x,actor?.y,actor?.fx,actor?.fy,target.approach.x,target.approach.y,target.facePoint.x,target.facePoint.y].every(Number.isFinite))return false;
 if(Math.hypot(actor.x-target.approach.x,actor.y-target.approach.y)>IGNITION_POLICY.positionTolerance)return false;
 const dx=target.facePoint.x-actor.x,dy=target.facePoint.y-actor.y,d=Math.hypot(dx,dy),n=Math.hypot(actor.fx,actor.fy);
 return n>1e-8&&(d<1e-8||(dx*actor.fx+dy*actor.fy)/(d*n)>=IGNITION_POLICY.facingCos);
}
export function ignitionStartGate({actor,target,allowed=false}={}){
 if(allowed!==true)return{ok:false,reason:'inactive',warning:null};
 if(!interactionInputAllowed({mode:'game',actor}))return{ok:false,reason:'actor-busy-or-dead',warning:null};
 if(!target||target.kind!=='ignite'||target.availability!=='ready'||target.enabled===false||target.visible===false||target.removed)return{ok:false,reason:'target-unavailable',warning:null};
 if(!aligned(actor,target))return{ok:false,reason:'not-aligned',warning:null};
 return{ok:true,reason:null,warning:null};
}
// Call step from the simulation owner after its world tick. No wall-clock timer.
// allowed must explicitly supply the app's active/frozen/hidden start gate.
export function createLightIgnitionController({world,scene,allowed=()=>false}={}){
 if(!world||!scene||typeof scene.canIgnite!=='function')throw Error('Ignition controller requires world and owned light scene');
 let session=null,lastResult=null;
 function cancel(reason='cancelled'){
  if(!session)return false;const current=session;session=null;if(!current.paid)scene.cancel(current.targetId,current.token);world.finishInteraction(current.id);lastResult={ok:false,reason};return true;
 }
 function start(targetId){
  if(session)return{ok:false,reason:'already-running',warning:null};
  const target=scene.getTarget(targetId),gate=ignitionStartGate({actor:world.current,target,allowed:allowed()});if(!gate.ok)return gate;
  const id=world.beginInteraction('ignite');if(id===null)return{ok:false,reason:'start-rejected',warning:null};
  const token=scene.begin(targetId,id);if(!token){world.finishInteraction(id);return{ok:false,reason:'target-changed',warning:null};}
  session={id,targetId,token,target,elapsed:0,paid:false,failed:null};lastResult=null;return{...gate,id};
 }
 function step(dt){
  if(!Number.isFinite(dt)||dt<=0||dt>1/30)throw Error('Invalid ignition tick');if(!session)return null;
  const s=world.current,current=session;
  if(s.phase!=='playing'||!Number.isFinite(s.lamp)||s.lamp<=0||s.interaction?.id!==current.id||s.interaction.kind!=='ignite'){cancel('actor-lost');return null;}
  if(!current.paid&&!current.failed&&(!scene.canIgnite(current.targetId,current.token)||!aligned(s,current.target))){cancel('target-or-position-changed');return null;}
  current.elapsed=Math.min(3.2,current.elapsed+dt);const frame=interactionFrame('ignite',current.elapsed);
  if(frame.effectDue&&!current.paid&&!current.failed){
   if(!scene.canIgnite(current.targetId,current.token)){cancel('target-changed');return null;}
   if(!scene.ignite(current.targetId,current.token))throw Error('Ignition commit invariant failed');
   current.paid=true;s.note='THE LIGHT TAKES HOLD';
  }
  if(frame.complete){lastResult={ok:current.paid,reason:current.failed};world.finishInteraction(current.id);session=null;}return frame;
 }
 return Object.freeze({start,step,cancel,snapshot:()=>session?{id:session.id,targetId:session.targetId,elapsed:session.elapsed,paid:session.paid,failed:session.failed}:null,result:()=>lastResult?{...lastResult}:null,decorate(s){return{...s,interactionAnimation:session&&s.interaction?.id===session.id?{...interactionFrame('ignite',session.elapsed),lightContact:{actor:{x:s.x,y:s.y,heading:s.motion?.heading??Math.atan2(s.fy,s.fx)},point:[...session.target.contactPoint]}}:null};}});
}
