import {createLightRegistry} from '../interaction/light-state.js';
import {buildLightGeometry} from '../gallery/models/light-geometry.js';
import {NATIVE_FIRE_MODELS,buildInteractiveFire} from '../gallery/models/interactive-fire.js';
import {ignitionMethod} from '../interaction/fire-rules.js';
import {presentFireMesh} from '../render/fire-presentation.js';
export function createLightScene(definitions=[]){
 if(!Array.isArray(definitions))throw Error('Invalid light scene definitions');
 const registry=createLightRegistry(definitions),entries=new Map(),owners=new Map(),parts=[],lights=[],targets=[],colliders=[];let revision=0;
 for(const definition of definitions){const transform={...(definition.transform??{})},meshes=new Map(),build=NATIVE_FIRE_MODELS.includes(definition.modelId)?buildInteractiveFire:buildLightGeometry;for(const status of ['off','smoldering','igniting','lit'])meshes.set(status,build({modelId:definition.modelId,status,transform}));entries.set(definition.id,{definition:{...definition,transform},meshes});}
 function publish(){const nextParts=[],nextLights=[],nextTargets=[],nextColliders=[];
  for(const [id,{definition,meshes}]of entries){const state=registry.get(id).snapshot(),mesh=meshes.get(state.status),visual=presentFireMesh(mesh,state.modelId,state.status);nextParts.push(...visual.parts);nextLights.push(...visual.lights);nextColliders.push(...mesh.colliders);
   if(['off','smoldering'].includes(state.status)&&definition.enabled!==false&&definition.visible!==false)nextTargets.push(Object.freeze({id,kind:'ignite',modelId:state.modelId,activation:ignitionMethod(state.modelId),row:definition.row??null,availability:'ready',enabled:true,visible:true,removed:false,parts:mesh.parts,approach:mesh.approach,contactPoint:mesh.contactPoint,emissionPoints:mesh.emissionPoints,facePoint:mesh.facePoint}));
  }
  parts.splice(0,parts.length,...nextParts);lights.splice(0,lights.length,...nextLights);targets.splice(0,targets.length,...nextTargets);colliders.splice(0,colliders.length,...nextColliders);revision++;
 }
 function change(id,method,arg){const instance=registry.get(id);if(!instance)return method==='begin'?null:false;const before=instance.snapshot(),result=instance[method](arg);if(method==='begin'&&result)owners.set(id,result);else if(result&&(method==='ignite'||method==='cancel'))owners.delete(id);if(instance.snapshot()!==before)publish();return result;}
 function canIgnite(id,token){const state=registry.get(id)?.snapshot();return !!token&&owners.get(id)===token&&state?.status==='igniting'&&state.epoch===token.epoch&&state.actionId===token.actionId;}
 function getSources(){return[...entries].map(([id,{definition,meshes}])=>{const state=registry.get(id).snapshot(),mesh=meshes.get(state.status);return{id,modelId:state.modelId,status:state.status,enabled:definition.enabled!==false,visible:definition.visible!==false,contactPoint:[...mesh.contactPoint],parts:mesh.parts};});}
 publish();
 return Object.freeze({getFrame:()=>({parts,lights,targets,colliders,revision}),getSources,revision:()=>revision,snapshot:registry.snapshot,getState:id=>registry.get(id)?.snapshot()??null,getTarget:id=>targets.find(t=>t.id===id)??null,canIgnite,begin:(id,actionId)=>change(id,'begin',actionId),ignite:(id,token)=>change(id,'ignite',token),cancel:(id,token)=>change(id,'cancel',token),reset(){owners.clear();registry.reset();publish();return registry.snapshot();}});
}
