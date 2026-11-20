import {createManifestState} from './manifest-state.js';
import {manifestHit} from './manifest-layout.js';
import {paintManifest,drawManifestText} from './manifest-paint.js';

export function installManifest({canvas,dimensions,active,root=window}){
 const model=createManifestState();
 let clock=null,lastPhase=null,reduced=false,disposed=false;
 const preference=root.matchMedia?.('(prefers-reduced-motion: reduce)');
 const readReduced=()=>preference?.matches===true||root.localStorage?.getItem?.('ash-manifest-reduced-motion')==='true';
 const reset=()=>{model.reset();clock=null;lastPhase=null;model.setObjective({id:'warden',title:'СТРАЖ',text:'Одолей стража.'});};
 reset();
 const api=Object.freeze({
  setObjective:value=>model.setObjective(value),
  openDialogue:value=>model.openDialogue(value),
  close:()=>model.close(),
  reveal:()=>model.reveal(),
  state:()=>model.view(),
 });
 const previous=root.__ASH_MANIFEST__;
 root.__ASH_MANIFEST__=api;
 const point=event=>{
  const r=canvas.getBoundingClientRect(),d=dimensions();
  if(r.width<=0||r.height<=0)return null;
  return {x:(event.clientX-r.left)*d.cols/r.width,y:(event.clientY-r.top)*d.rows/r.height,d};
 };
 const hitEvent=event=>{
  if(disposed||event.target!==canvas||!active())return null;
  const p=point(event);return p?manifestHit(p.d.cols,p.d.rows,model.view(),p.x,p.y):null;
 };
 const down=event=>{
  const hit=hitEvent(event);if(!hit)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.button!==0)return;
  if(hit.kind==='gem')model.toggle();
  else if(hit.kind==='choice'){
   const result=model.choose(hit.index);
   if(result)canvas.dispatchEvent(new CustomEvent('ash-manifest-choice',{detail:result}));
  }else model.reveal();
  canvas.focus();
 };
 const move=event=>{const hit=hitEvent(event);if(hit?.kind==='choice')model.select(hit.index);};
 root.addEventListener('pointerdown',down,true);
 root.addEventListener('pointermove',move,true);
 return {
  reset,
  update(s){
   let dt=0;
   if(clock!==null&&Number.isFinite(s.time)&&s.time>=clock)dt=Math.min(.1,s.time-clock);
   clock=Number.isFinite(s.time)?s.time:null;
   try{reduced=readReduced();}catch{reduced=preference?.matches===true;}
   if(s.phase!==lastPhase){
    if(s.phase==='won')model.setObjective({id:'warden-done',title:'ЦЕЛЬ ВЫПОЛНЕНА',text:'Страж повержен.'});
    if(s.phase==='dead')model.close();
    lastPhase=s.phase;
   }
   model.step(dt,reduced);
  },
  paint(frame,cols,rows){paintManifest(frame,cols,rows,model.view(),clock??0,reduced);},
  text(ctx,cols,rows,height){drawManifestText(ctx,cols,rows,height,model.view(),clock??0,reduced);},
  dispose(){
   disposed=true;root.removeEventListener('pointerdown',down,true);root.removeEventListener('pointermove',move,true);
   if(root.__ASH_MANIFEST__===api){if(previous===undefined)delete root.__ASH_MANIFEST__;else root.__ASH_MANIFEST__=previous;}
  },
 };
}
