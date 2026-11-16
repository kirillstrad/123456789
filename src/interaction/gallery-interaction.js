import {createInteractionStartGate} from './start-gate.js';

// Development lifecycle: action creation is real, an authored clip driver is not.
export function createGalleryInteraction(player,scene,targeting,{context=()=> 'gallery-walk'}={}){
 for(const name of ['step','snapshot','approach','cancelApproach'])if(typeof player?.[name]!=='function')throw Error('Invalid gallery approach player');
 if(typeof scene?.getTarget!=='function'||typeof targeting?.intent!=='function'||typeof targeting?.cancelIntent!=='function'||typeof context!=='function')throw Error('Invalid gallery interaction dependencies');
 let active=null,owner=null,boundParts=null,observed=null,armed=false,serial=0,disposed=false;
 const events=[];
 const record=(type,reason=null)=>{events.push(Object.freeze({type,id:active?.id??null,intentId:active?.intentId??null,targetId:active?.targetId??null,reason}));if(events.length>200)events.shift();};
 function abort(reason){if(!active)return false;record('interaction-cancelled',reason);active=null;owner=null;gate.cancel();return true;}
 function validateActive(){
  if(!active)return false;
  const actor=player.snapshot();
  if(actor.phase!=='playing'||!Number.isFinite(actor.lamp)||actor.lamp<=0){abort('actor-dead');return false;}
  if(context()!==active.context){abort('context-changed');return false;}
  const target=scene.getTarget(active.targetId);
  if(!target||target.parts!==owner||target.id!==active.targetId||target.kind!==active.kind||target.removed||target.enabled===false||target.visible===false||(target.availability??'ready')!=='ready'){abort('target-lost');return false;}
  return true;
 }
 function begin(request){
  if(disposed||active||request.context!=='gallery-walk'||context()!==request.context)return null;
  const target=scene.getTarget(request.targetId),actor=player.snapshot();
  if(!target||target.parts!==boundParts||target.id!==request.targetId||target.kind!==request.kind||target.removed||target.enabled===false||target.visible===false||(target.availability??'ready')!=='ready'||actor.phase!=='playing'||!Number.isFinite(actor.lamp)||actor.lamp<=0||actor.interaction)return null;
  // The gate already reserved this request. Stop navigation before taking ownership.
  player.cancelApproach('interaction-start');targeting.cancelIntent();
  active=Object.freeze({id:++serial,intentId:request.intentId,targetId:request.targetId,kind:request.kind,context:request.context,phase:'awaiting-animation',elapsed:0});
  owner=target.parts;record('interaction-start');return active.id;
 }
 const gate=createInteractionStartGate({getIntent:()=>targeting.intent(),begin});
 function step(dt,input={x:0,y:0}){
  if(![dt,input.x,input.y].every(Number.isFinite)||dt<=0||dt>1/30)throw Error('Invalid gallery interaction step');
  if(disposed)return;
  if(active){
   try{validateActive();}catch{abort('invalid-scene');}
   if(active){player.step(dt,{x:0,y:0});try{if(validateActive())active=Object.freeze({...active,elapsed:active.elapsed+dt});}catch{abort('invalid-scene');}return;}
   player.step(dt,{x:0,y:0});return;
  }
  let intent;
  try{
   intent=targeting.intent();
   if(intent!==observed){observed=intent;armed=false;gate.cancel();if(intent){const t=scene.getTarget(intent.targetId);armed=gate.arm(intent,t);boundParts=armed?t.parts:null;}}
  }catch{player.cancelApproach('invalid-scene');return;}
  player.step(dt,input);
  if(!armed||!intent||context()!=='gallery-walk')return;
  const approach=player.approach();if(approach.status!=='arrived')return;
  try{
   const result=gate.attempt({intent,target:scene.getTarget(intent.targetId),actor:player.snapshot(),approach,context:context()});
   if(['started','rejected','failed'].includes(result.status)){
    armed=false;
    if(result.status!=='started')player.cancelApproach('interaction-'+result.reason);
   }
  }catch{armed=false;gate.cancel();player.cancelApproach('invalid-scene');}
 }
 function snapshot(){if(active)try{validateActive();}catch{abort('invalid-scene');}const s=player.snapshot();return{...s,interaction:active?{...active}:s.interaction??null};}
 function interaction(){snapshot();return active?{...active}:null;}
 function finishInteraction(id){
  if(disposed||!active||active.id!==id)return false;
  try{if(!validateActive())return false;}catch{abort('invalid-scene');return false;}
  record('interaction-end');active=null;owner=null;return true;
 }
 function cancelApproach(reason='manual'){if(active)return false;armed=false;gate.cancel();player.cancelApproach(reason);return true;}
 function dispose(){if(disposed)return;disposed=true;abort('scene-closed');gate.cancel();player.cancelApproach('scene-closed');observed=null;armed=false;}
 return Object.freeze({step,snapshot,approach:()=>player.approach(),cancelApproach,interaction,interactionEvents:()=>events.map(e=>({...e})),finishInteraction,dispose});
}
