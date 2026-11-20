import {INTERIOR_CATEGORIES,listInteriorCards,interiorCard} from './catalogue.js';
import {createInteriorLayout} from './layout.js';
import {buildInteriorPreviewModel} from './preview.js';
let request=null,active=null;
export function createRequestedInteriorScene(assemble){
 if(request===null)return null;
 const layout=createInteriorLayout(request),scene=assemble(layout,buildInteriorPreviewModel);
 const dispose=scene.dispose.bind(scene),record={scene,layout};active=record;
 scene.dispose=()=>{try{return dispose();}finally{if(active===record)active=null;}};
 return scene;
}
export function installInteriorCatalogue(root){
 if(!root||typeof root!=='object')throw Error('Invalid interior catalogue host');
 const gallery=()=>{
  const api=root.__ASH_GALLERY__;
  if(!api||typeof api.open!=='function'||typeof api.close!=='function'||typeof api.setCamera!=='function')throw Error('Start the game before opening the interior catalogue');
  return api;
 };
 const open=(category='all')=>{
  listInteriorCards(category);const api=gallery();api.close();request=category;
  try{return api.open();}finally{request=null;}
 };
 const focus=id=>{
  const card=interiorCard(id);
  if(!active||!active.layout.entries.some(e=>e.id===id))open(card.category);
  const entry=active?.layout.entries.find(e=>e.id===id);
  if(!entry)throw Error('Interior scene did not initialize');
  gallery().setCamera(entry.x,entry.y);return JSON.parse(JSON.stringify(card));
 };
 const step=delta=>{
  if(!active){open();return focus(active.layout.entries[0].id);}
  const entries=active.layout.entries,camera=gallery().camera?.();
  const current=camera?entries.reduce((best,e)=>Math.hypot(e.x-camera.x,e.y-camera.y)<Math.hypot(best.x-camera.x,best.y-camera.y)?e:best,entries[0]):entries[0];
  return focus(entries[(entries.indexOf(current)+delta+entries.length)%entries.length].id);
 };
 const api=Object.freeze({
  categories:()=>INTERIOR_CATEGORIES.slice(),
  list:(category='all')=>JSON.parse(JSON.stringify(listInteriorCards(category))),
  open,focus,next:()=>step(1),previous:()=>step(-1),
  walk(category='all'){open(category);if(typeof gallery().walk!=='function')throw Error('Gallery walk is unavailable');return gallery().walk();},
  close(){if(active)gallery().close();},
  info:()=>active?{category:active.layout.category,objects:active.layout.entries.length,name:'INTERIOR CATALOGUE'}:null,
 });
 const previous=root.__ASH_INTERIOR__;root.__ASH_INTERIOR__=api;
 return {api,dispose(){if(root.__ASH_INTERIOR__===api){if(previous===undefined)delete root.__ASH_INTERIOR__;else root.__ASH_INTERIOR__=previous;}}};
}
