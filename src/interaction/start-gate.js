import {interactionInputAllowed} from './intent.js';

const contexts=new Set(['game','gallery-walk']);
const kinds=new Set(['door','ignite','campfire']);
const point=p=>!!p&&[p.x,p.y,p.z??0].every(Number.isFinite)&&(p.z??0)===0;
const targetReady=t=>!!t&&typeof t.id==='string'&&!!t.id.trim()&&kinds.has(t.kind)&&Array.isArray(t.parts)&&t.parts.length>0&&point(t.approach)&&[t.enabled??true,t.visible??true,t.removed??false].every(v=>typeof v==='boolean')&&t.enabled!==false&&t.visible!==false&&!t.removed&&(t.availability??'ready')==='ready';
const intentReady=i=>!!i&&Number.isSafeInteger(i.id)&&i.id>0&&contexts.has(i.context)&&typeof i.targetId==='string'&&!!i.targetId.trim()&&kinds.has(i.kind)&&point(i.approach);
const samePoint=(a,b)=>a.x===b.x&&a.y===b.y&&(a.z??0)===(b.z??0);
function faceOf(target){
 let x=0,y=0,n=0;
 for(const part of target.parts){if(!part||!Array.isArray(part.v))return null;for(const v of part.v){if(!Array.isArray(v)||v.length<2||!Number.isFinite(v[0])||!Number.isFinite(v[1]))return null;x+=v[0];y+=v[1];n++;}}
 return n&&Number.isFinite(x)&&Number.isFinite(y)?{x:x/n,y:y/n}:null;
}

// Isolated launch boundary. A caller must arm against its live registry first.
// The injected begin callback owns action creation; this module never spends lamp.
export function createInteractionStartGate({begin,getIntent,positionTolerance=.05,speedTolerance=.001,headingTolerance=.03}={}){
 if(typeof begin!=='function'||typeof getIntent!=='function'||![positionTolerance,speedTolerance,headingTolerance].every(v=>Number.isFinite(v)&&v>=0)||positionTolerance>.25||speedTolerance>.01||headingTolerance>.2)throw Error('Invalid interaction start gate');
 let armed=null,last=Object.freeze({status:'idle',reason:null,intentId:null,actionId:null});
 const attempted=new Map();
 const isCurrent=i=>{try{return getIntent()===i;}catch{return false;}};
 function result(status,reason,intentId=null,actionId=null){last=Object.freeze({status,reason,intentId,actionId});return last;}
 function arm(intent,target){
  armed=null;
  if(!isCurrent(intent)||!intentReady(intent)||!targetReady(target)||intent.targetId!==target.id||intent.kind!==target.kind||!samePoint(intent.approach,target.approach)||intent.id<=(attempted.get(intent.context)??0))return false;
  armed={intent,id:intent.id,context:intent.context,targetId:intent.targetId,kind:intent.kind,parts:target.parts,point:{...intent.approach}};return true;
 }
 function cancel(){armed=null;}
 function attempt({intent,target,actor,approach,context,frozen=false,hidden=false,queued=false}={}){
  const a=armed,id=intent?.id??null;
  if(!a||intent!==a.intent)return result('blocked','not-armed',id);
  if(!isCurrent(intent))return result('blocked','intent-lost',id);
  if(!intentReady(intent)||intent.id!==a.id||intent.context!==a.context||context!==a.context||intent.targetId!==a.targetId||intent.kind!==a.kind||!samePoint(intent.approach,a.point))return result('blocked','intent-changed',id);
  if(!targetReady(target)||target.id!==a.targetId||target.kind!==a.kind||target.parts!==a.parts||!samePoint(target.approach,a.point))return result('blocked','target-changed',id);
  if(!interactionInputAllowed({mode:context,actor,frozen,hidden,queued}))return result('blocked','actor-unavailable',id);
  if(!approach||approach.status!=='arrived'||approach.targetId!==a.targetId)return result('blocked','not-arrived',id);
  if(![actor.x,actor.y,actor.motion?.vx,actor.motion?.vy,actor.motion?.heading].every(Number.isFinite)||actor.moving!==false||Math.hypot(actor.motion.vx,actor.motion.vy)>speedTolerance)return result('blocked','not-stopped',id);
  if(Math.hypot(actor.x-a.point.x,actor.y-a.point.y)>positionTolerance)return result('blocked','out-of-reach',id);
  const face=faceOf(target);if(!face||Math.hypot(face.x-actor.x,face.y-actor.y)<1e-8)return result('blocked','invalid-facing',id);
  const desired=Math.atan2(face.y-actor.y,face.x-actor.x),delta=Math.atan2(Math.sin(desired-actor.motion.heading),Math.cos(desired-actor.motion.heading));
  if(Math.abs(delta)>headingTolerance)return result('blocked','not-facing',id);
  // Reserve before invoking user code: synchronous re-entry and errors cannot retry.
  attempted.set(a.context,a.id);armed=null;
  const request=Object.freeze({kind:a.kind,targetId:a.targetId,intentId:a.id,context:a.context});
  try{const actionId=begin(request);return Number.isSafeInteger(actionId)&&actionId>0?result('started',null,a.id,actionId):result('rejected','begin-rejected',a.id);}
  catch{return result('failed','begin-threw',a.id);}
 }
 return Object.freeze({arm,cancel,attempt,current:()=>last});
}
