import {createLightRegistry} from '../interaction/light-state.js';
import {buildLightGeometry} from '../gallery/models/light-geometry.js';
// Opt-in scene adapter. No input, clock, resource payment or app placement.
export function createLightScene(definitions=[]){
 if(!Array.isArray(definitions))throw Error('Invalid light scene definitions');
 const registry=createLightRegistry(definitions),entries=new Map(),parts=[],lights=[],targets=[],colliders=[];let revision=0;
 for(const definition of definitions){const transform={...(definition.transform??{})},meshes=new Map();for(const status of ['off','smoldering','igniting','lit'])meshes.set(status,buildLightGeometry({modelId:definition.modelId,status,transform}));entries.set(definition.id,{definition:{...definition,transform},meshes});}
 function publish(){const nextParts=[],nextLights=[],nextTargets=[],nextColliders=[];
  for(const [id,{definition,meshes}]of entries){const state=registry.get(id).snapshot(),mesh=meshes.get(state.status);nextParts.push(...mesh.parts);nextLights.push(...mesh.lights);nextColliders.push(...mesh.colliders);
   if(['off','smoldering'].includes(state.status)&&definition.enabled!==false&&definition.visible!==false)nextTargets.push(Object.freeze({id,kind:'ignite',modelId:state.modelId,availability:'ready',enabled:true,visible:true,removed:false,parts:mesh.parts,approach:mesh.approach,contactPoint:mesh.contactPoint,emissionPoints:mesh.emissionPoints,facePoint:mesh.facePoint}));
  }
  parts.splice(0,parts.length,...nextParts);lights.splice(0,lights.length,...nextLights);targets.splice(0,targets.length,...nextTargets);colliders.splice(0,colliders.length,...nextColliders);revision++;
 }
 function change(id,method,arg){const instance=registry.get(id);if(!instance)return method==='begin'?null:false;const before=instance.snapshot(),result=instance[method](arg);if(instance.snapshot()!==before)publish();return result;}
 publish();
 return Object.freeze({getFrame:()=>({parts,lights,targets,colliders,revision}),revision:()=>revision,snapshot:registry.snapshot,getState:id=>registry.get(id)?.snapshot()??null,getTarget:id=>targets.find(t=>t.id===id)??null,begin:(id,actionId)=>change(id,'begin',actionId),ignite:(id,token)=>change(id,'ignite',token),cancel:(id,token)=>change(id,'cancel',token),reset(){registry.reset();publish();return registry.snapshot();}});
}
