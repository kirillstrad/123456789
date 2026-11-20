export function interactionInputAllowed({mode,actor,frozen=false,hidden=false,queued=false}){
 return !hidden&&!queued&&(mode==='game'||mode==='gallery-walk')&&!(mode==='game'&&frozen)&&!!actor&&actor.phase==='playing'&&Number.isFinite(actor.lamp)&&actor.lamp>0&&!actor.action&&!actor.dash&&!actor.execution&&!actor.interaction&&actor.sweepProgress===null&&actor.hitReaction<=0;
}
function eligible(t){return !!t&&typeof t.id==='string'&&!!t.id.trim()&&typeof t.kind==='string'&&!!t.kind.trim()&&Array.isArray(t.parts)&&t.parts.length>0&&[t.enabled??true,t.visible??true,t.removed??false].every(v=>typeof v==='boolean')&&t.enabled!==false&&t.visible!==false&&!t.removed&&(t.availability??'ready')==='ready'&&!!t.approach&&[t.approach.x,t.approach.y,t.approach.z??0].every(Number.isFinite);}
export function createInteractionIntent(){
 let value=null,owner=null,serial=0;const clear=()=>{value=null;owner=null;};
 return Object.freeze({current:()=>value,clear,request(t,context){if(value||!eligible(t)||typeof context!=='string'||!context)return false;owner=t.parts;value=Object.freeze({id:++serial,targetId:t.id,kind:t.kind,approach:Object.freeze({x:t.approach.x,y:t.approach.y,z:t.approach.z??0}),context});return true;},reconcile(t,context,allowed){if(value&&(!allowed||!eligible(t)||t.id!==value.targetId||t.parts!==owner||context!==value.context))clear();return value;}});
}
