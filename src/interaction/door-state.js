// One scene-owned instance per door. No geometry, clock, input or collider ownership.
export function createDoorState(target){
 const id=target?.id;
 if(typeof id!=='string'||!id.trim()||target?.kind!=='door')throw Error('Invalid door identity');
 let state=Object.freeze({id,status:'closed',actionId:null});
 function beginOpening(actionId){
  if(!Number.isSafeInteger(actionId)||actionId<=0||state.status!=='closed')return false;
  state=Object.freeze({id,status:'opening',actionId});return true;
 }
 function finishOpening(actionId){
  if(!Number.isSafeInteger(actionId)||actionId<=0||state.status!=='opening'||state.actionId!==actionId)return false;
  state=Object.freeze({id,status:'open',actionId});return true;
 }
 return Object.freeze({snapshot:()=>state,beginOpening,finishOpening});
}
