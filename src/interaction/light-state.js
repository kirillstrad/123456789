import {interactionFrame} from '../animation/interaction.js';
import {NATIVE_FIRE_MODELS} from '../gallery/models/interactive-fire.js';
export const IGNITION_MODELS=Object.freeze(['brazier.a','brazier.b','brazier.c','candlesticks.a','candlesticks.b','candlesticks.c','wall-light.a','wall-light.b','wall-light.c',...NATIVE_FIRE_MODELS]);
export const IGNITION_RULES=Object.freeze({duration:interactionFrame('ignite',0).duration,effectAt:1.92,lampCost:null,burnsUntilReset:true});
export function requireIgnitionCost(cost=IGNITION_RULES.lampCost){if(!Number.isFinite(cost)||cost<0)throw Error('Ignition lamp cost must be explicitly configured');return cost;}
export function createLightState({id,modelId,initialStatus='off'}={}){
 if(typeof id!=='string'||!id.trim()||!IGNITION_MODELS.includes(modelId)||!['off','smoldering'].includes(initialStatus))throw Error('Invalid light definition');
 let epoch=0,serial=0,owner=null;const usedActions=new Set();let state=Object.freeze({id,modelId,status:initialStatus,epoch,actionId:null});
 const publish=(status,actionId=null)=>state=Object.freeze({id,modelId,status,epoch,actionId});
 function begin(actionId){if(!Number.isSafeInteger(actionId)||actionId<=0||!['off','smoldering'].includes(state.status)||usedActions.has(actionId))return null;usedActions.add(actionId);owner=Object.freeze({id,modelId,epoch,serial:++serial,actionId});publish('igniting',actionId);return owner;}
 function ignite(token){if(state.status!=='igniting'||!owner||token!==owner)return false;publish('lit',owner.actionId);owner=null;return true;}
 function cancel(token){if(state.status!=='igniting'||!owner||token!==owner)return false;owner=null;publish(initialStatus);return true;}
 function reset(){epoch++;usedActions.clear();owner=null;publish(initialStatus);return state;}
 return Object.freeze({snapshot:()=>state,begin,ignite,cancel,reset});
}
export function createLightRegistry(definitions){if(!Array.isArray(definitions))throw Error('Invalid light definitions');const instances=new Map();for(const definition of definitions){const instance=createLightState(definition),id=instance.snapshot().id;if(instances.has(id))throw Error('Duplicate light identity: '+id);instances.set(id,instance);}return Object.freeze({get:id=>instances.get(id)??null,snapshot:()=>Object.freeze([...instances.values()].map(i=>i.snapshot())),reset:()=>{for(const instance of instances.values())instance.reset();}});}
