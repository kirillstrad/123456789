import {createPrisonDoorMotion} from './prison-door-motion.js';
import {createDoorEffectBridge} from './door-effect-bridge.js';

// One persistent motion per scene, one event bridge per interaction lifetime.
const scenes=new WeakMap();
export function bindGalleryDoorInteraction(lifecycle,scene,refreshActor=null){
 let state=scenes.get(scene);
 if(!state){state={motion:createPrisonDoorMotion(),angle:0,owner:null};scenes.set(scene,state);}
 if(state.owner)throw Error('Gallery door already has an interaction owner');
 const token=Symbol('gallery-door-owner'),bridge=createDoorEffectBridge(state.motion);
 let disposed=false;state.owner=token;
 const collisionAware=typeof refreshActor==='function'&&typeof scene.openPrisonDoorPassage==='function'&&typeof scene.getCollisionRevision==='function';
 let actorRevision=null;
 function syncCollisions(){
  if(!collisionAware)return;
  const revision=scene.getCollisionRevision();
  if(!Number.isSafeInteger(revision)||revision<0)throw Error('Invalid scene collision revision');
  if(revision!==actorRevision){if(refreshActor(scene.getColliders())!==true)throw Error('Actor collision refresh rejected');actorRevision=revision;}
 }
 const flush=()=>{for(const event of lifecycle.drainInteractionEvents())bridge.accept(event);};
 function dispose(){
  if(disposed)return;
  disposed=true;bridge.dispose();if(state.owner===token)state.owner=null;
  try{lifecycle.dispose();}finally{lifecycle.drainInteractionEvents();}
 }
 function read(method,...args){
  if(disposed)return lifecycle[method](...args);
  try{const value=lifecycle[method](...args);flush();return value;}
  catch(error){dispose();throw error;}
 }
 function step(dt,input={x:0,y:0}){
  if(![dt,input.x,input.y].every(Number.isFinite)||dt<=0||dt>1/30)throw Error('Invalid gallery interaction step');
  if(disposed)return;
  try{
   // Fail before advancing either clock when the scene has already been disposed.
   scene.getTarget('prison-door.a');syncCollisions();
   const wasOpening=state.motion.snapshot().status==='opening';
   lifecycle.step(dt,input);flush();
   // A newly emitted effect starts at zero; its first motion tick is the next step.
   if(wasOpening)state.motion.step(dt);
   const angle=state.motion.snapshot().angle;
   if(angle!==state.angle){scene.setPrisonDoorAngle(angle);state.angle=angle;}
   if(collisionAware&&state.motion.snapshot().status==='open'){scene.openPrisonDoorPassage(state.motion.snapshot());syncCollisions();}
  }catch(error){dispose();throw error;}
 }
 // Delivery is private to this owner; diagnostic history remains publicly readable.
 return Object.freeze({...lifecycle,step,snapshot:()=>read('snapshot'),interaction:()=>read('interaction'),finishInteraction:id=>read('finishInteraction',id),drainInteractionEvents:()=>[],doorMotion:()=>state.motion.snapshot(),dispose});
}
