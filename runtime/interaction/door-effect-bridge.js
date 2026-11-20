// One bridge per gallery-interaction lifetime; feed new lifecycle events in order.
// No event-history polling, simulation clock, mesh, input or collider ownership.
export function createDoorEffectBridge(motion){
 if(typeof motion?.beginOpening!=='function'||typeof motion?.snapshot!=='function'||motion.snapshot()?.id!=='prison-door.a')throw Error('Invalid prison door motion');
 let active=null,lastId=0,disposed=false;
 const validId=id=>Number.isSafeInteger(id)&&id>0;
 function accept(event){
  if(disposed||!event||event.targetId!=='prison-door.a'||!validId(event.id)||!validId(event.intentId))return false;
  if(event.type==='interaction-start'){
   if(event.id<=lastId)return false;
   lastId=event.id;active={id:event.id,intentId:event.intentId,effectSent:false};return false;
  }
  if(!active||event.id!==active.id||event.intentId!==active.intentId)return false;
  if(event.type==='interaction-end'||event.type==='interaction-cancelled'){active=null;return false;}
  if(event.type!=='interaction-effect'||active.effectSent)return false;
  // Consume before delegation: even a failing dependency must not receive a retry.
  active.effectSent=true;
  return motion.beginOpening(active.id)===true;
 }
 function dispose(){disposed=true;active=null;}
 return Object.freeze({accept,dispose});
}
