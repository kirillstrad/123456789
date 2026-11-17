import {interactionFrame} from '../animation/interaction.js';
import {planApproachRoute} from './approach-route.js';
import {interactionInputAllowed} from './intent.js';
import {createMotion} from '../animation/motion.js';
import {findCombatLights} from '../game/combat-light-context.js';
import {createLightIgnitionController,IGNITION_POLICY} from './light-ignition-controller.js';
import {createSparkIgnitionProcessor} from './fire-rules.js';
export function createCombatDoorController({world,scene,targeting,active=()=>true,plan=planApproachRoute}){
 let route=null,session=null,lastIntent=null,elapsed=0,stalled=0;const events=[],lighting=findCombatLights(scene),ignition=lighting?createLightIgnitionController({world,scene:lighting,allowed:()=>active()&&(typeof document==='undefined'||!document.hidden)}):null,sparks=lighting?createSparkIgnitionProcessor({world,scene:lighting,map:scene.map}):null;
 scene.setActors?.(()=>[{...world.current,radius:.24},...(world.current.enemy.hp>0?[{...world.current.enemy,radius:.35}]:[])]);
 const record=(type,extra={})=>{events.push({type,time:world.current.time,...extra});if(events.length>200)events.shift();};
 const stop=()=>{const s=world.current;s.moving=false;s.motion=createMotion(s.fx,s.fy);s.footContacts=null;s.combatEntry=null;};
 const targetFor=(id,kind)=>kind==='ignite'?lighting?.getTarget(id):scene.getTarget(id);
 function cancel(reason='cancelled'){
  if((session||ignition?.snapshot())&&reason==='combat-command')return false;
  if(route){record('approach-cancelled',{targetId:route.targetId,reason});route=null;stop();}
  if(session){world.finishInteraction(session.id);record('interaction-cancelled',{id:session.id,targetId:session.targetId,reason});session=null;}
  ignition?.cancel(reason);if(reason==='reset')lighting?.reset();targeting.cancelIntent();lastIntent=null;return true;
 }
 function navigate(dt){
  const s=world.current,t=targetFor(route.targetId,route.kind);
  if(!t||t.parts!==route.parts||t.availability!=='ready'||route.revision!==scene.revision()||(route.kind==='ignite'&&route.lightRevision!==lighting.revision())){cancel('scene-changed');world.step(dt,{x:0,y:0});return;}
  if(route.kind==='ignite'&&s.lamp<IGNITION_POLICY.lampCost+IGNITION_POLICY.reserve){s.note='NOT ENOUGH LAMP TO IGNITE';cancel('insufficient-lamp');world.step(dt,{x:0,y:0});return;}
  route.total+=dt;if(route.total>120){cancel('timeout');world.step(dt,{x:0,y:0});return;}
  const goal=route.points[route.index]??route.goal,dx=goal.x-s.x,dy=goal.y-s.y,d=Math.hypot(dx,dy);
  if(d>.025){const x=s.x,y=s.y;world.step(dt,{x:dx/d,y:dy/d});stalled=Math.hypot(s.x-x,s.y-y)<1e-6?stalled+dt:0;if(stalled>.75)cancel('path-blocked');return;}
  stop();stalled=0;if(route.index<route.points.length){route.index++;world.step(dt,{x:0,y:0});return;}
  const face=route.kind==='ignite'?t.facePoint:scene.facePoint(t.id),angle=Math.atan2(face.y-s.y,face.x-s.x),heading=s.motion.heading,delta=Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading));
  const a=heading+Math.sign(delta)*Math.min(Math.abs(delta),dt*4);s.fx=Math.cos(a);s.fy=Math.sin(a);s.motion=createMotion(s.fx,s.fy);world.step(dt,{x:0,y:0});
  if(s.phase!=='playing'||Math.abs(delta)>.02)return;
  if(route.kind==='ignite'){const started=ignition.start(t.id);if(!started.ok){s.note=started.reason==='insufficient-lamp'?'NOT ENOUGH LAMP TO IGNITE':'IGNITION COULD NOT START';cancel('start-rejected');return;}if(started.warning)s.note=started.warning;record('interaction-start',{id:started.id,targetId:t.id,kind:'ignite'});route=null;lastIntent=null;targeting.cancelIntent();return;}
  const id=world.beginInteraction('door');if(id===null){cancel('start-rejected');return;}
  session={id,targetId:t.id,modelId:t.modelId,side:route.side,parts:t.parts,effect:false};elapsed=0;route=null;targeting.cancelIntent();record('interaction-start',{id,targetId:t.id,side:session.side});
 }
 function step(dt,input={x:0,y:0}){
  if(!Number.isFinite(dt)||dt<=0||dt>1/30||![input.x,input.y].every(Number.isFinite))throw Error('Invalid combat door tick');if(!active()){cancel('inactive');return;}const s=world.current;
  try{
   if(ignition?.snapshot()){const before=ignition.snapshot();world.step(dt,{x:0,y:0});scene.step(dt);ignition.step(dt);const after=ignition.snapshot();if(!before.paid&&after?.paid)record('interaction-effect',{id:before.id,targetId:before.targetId,kind:'ignite'});if(!after)record('interaction-end',{id:before.id,targetId:before.targetId,kind:'ignite',result:ignition.result()});return;}
   if(session){
    world.step(dt,{x:0,y:0});if(s.phase!=='playing'||s.interaction?.id!==session.id){cancel('actor-interrupted');scene.step(dt);return;}
    const t=scene.getTarget(session.targetId);if(!t||t.parts!==session.parts){cancel('target-lost');scene.step(dt);return;}
    scene.step(dt);if(!session.effect||!scene.isBlocked?.(session.targetId))elapsed+=dt;const frame=interactionFrame('door',elapsed);
    if(frame.effectDue&&!session.effect){if(!scene.open(session.targetId,session.id,session.side)){cancel('door-obstructed');return;}session.effect=true;record('interaction-effect',{id:session.id,targetId:session.targetId});}
    if(frame.complete&&t.availability==='open'){world.finishInteraction(session.id);record('interaction-end',{id:session.id,targetId:session.targetId});session=null;}return;
   }
   scene.step(dt);if(Math.hypot(input.x,input.y)>.001){cancel('manual');world.step(dt,input);return;}
   if(!interactionInputAllowed({mode:'game',actor:s})){cancel('actor-busy');world.step(dt,input);return;}
   const intent=targeting.intent();if(!intent){if(route)cancel('intent-lost');world.step(dt,input);return;}
   if(intent.context!=='game'||!['door','ignite'].includes(intent.kind)||(intent.kind==='ignite'&&!ignition)){cancel('unsupported-intent');world.step(dt,input);return;}
   const target=targetFor(intent.targetId,intent.kind);if(!target||target.availability!=='ready'){cancel('target-unavailable');world.step(dt,input);return;}
   if(intent.kind==='ignite'&&s.lamp<IGNITION_POLICY.lampCost+IGNITION_POLICY.reserve){s.note='NOT ENOUGH LAMP TO IGNITE';cancel('insufficient-lamp');world.step(dt,input);return;}
   if(intent!==lastIntent){
    if(route){route=null;stop();}stalled=0;let choice=null,result=null;
    const candidates=intent.kind==='ignite'?[{side:1,goal:target.approach}]:(scene.approachCandidates?.(target.id,s)??[{side:1,goal:target.approach}]);
    for(const c of candidates){const r=plan({start:{x:s.x,y:s.y},goal:c.goal,colliders:scene.getColliders(),bounds:scene.getBounds()});if(['ready','arrived'].includes(r.status)){choice=c;result=r;break;}}
    if(!choice){s.note='NO CLEAR PATH TO THE OBJECT';cancel('route-unreachable');world.step(dt,input);return;}
    route={targetId:target.id,kind:intent.kind,parts:target.parts,goal:choice.goal,side:choice.side,points:[...result.waypoints],index:0,revision:scene.revision(),lightRevision:lighting?.revision(),total:0};lastIntent=intent;stop();
   }navigate(dt);
  }finally{
   if(sparks)for(const event of world.events){if(event.type!=='sweep'||Math.abs(event.time-world.current.time)>1e-7)continue;for(const targetId of sparks.release(event))record('spark-ignited',{targetId,kind:'ignite',method:'E'});}
  }
 }
 function decorate(s){scene.highlight?.(session?.targetId??route?.targetId??targeting.current?.()?.id??null);if(ignition?.snapshot())return ignition.decorate(s);if(!session||s.interaction?.id!==session.id)return{...s,interactionAnimation:null};let points=scene.contacts?.(session.targetId)??[];if(points.length===2&&session.side<0)points=[...points].reverse();return{...s,interactionAnimation:{...interactionFrame('door',elapsed),doorModelId:session.modelId,...(points.length?{doorContact:{actor:{x:s.x,y:s.y,heading:s.motion?.heading??Math.atan2(s.fy,s.fx)},points,arms:points.length===1?[session.side>0?0:1]:[1,0]}}:{})}};}
 return Object.freeze({step,cancel,decorate,snapshot:()=>({approach:route?{targetId:route.targetId,kind:route.kind,side:route.side,goal:{...route.goal},waypoint:route.index}:null,interaction:session?{id:session.id,targetId:session.targetId,elapsed,side:session.side}:ignition?.snapshot()??null,lighting:lighting?{states:lighting.snapshot(),lightCount:lighting.getFrame().lights.length}:null,events:events.map(e=>({...e}))})});
}
