import {createRelicState} from './relic-state.js';
import {relicHit,relicTextLayout} from './relic-layout.js';
import {paintRelic,drawRelicText} from './relic-paint.js';
const gameplayKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyF','KeyE','KeyQ','Space','ShiftLeft','ShiftRight','Digit1','Digit2','Numpad1','Numpad2']);
export function installManifest({canvas,dimensions,active,root=window,onModalChange=()=>{},onChoice=()=>{}}){
 const model=createRelicState(),held=new Set(),quarantine=new Set();
 let clock=0,lastPhase=null,reduced=false,disposed=false,modal=false,uiLast=null;
 const preference=root.matchMedia?.('(prefers-reduced-motion: reduce)');
 const notify=()=>{
  const next=model.blocking();if(next===modal)return;
  modal=next;if(next)for(const key of held)quarantine.add(key);
  onModalChange(next);
 };
 const reset=()=>{model.reset();clock=0;lastPhase=null;uiLast=null;model.setObjective({id:'warden',title:'THE WARDEN',text:'Defeat the warden.'});notify();};
 const open=(value,kind)=>{if(disposed||!active())return false;if(kind==='reading')model.openReading(value);else model.openDialogue(value);notify();return true;};
 const api=Object.freeze({setObjective:v=>model.setObjective(v),openDialogue:v=>open(v,'dialogue'),openReading:v=>open(v,'reading'),close:()=>model.close(),reveal:()=>model.reveal(),state:()=>model.view()});
 const previous=root.__ASH_MANIFEST__;root.__ASH_MANIFEST__=api;reset();
 const pages=()=>{const d=dimensions();return relicTextLayout(d.cols,d.rows,canvas.width??1008,canvas.height??864,model.view()).pages.length;};
 const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
 const hit=e=>{
  const r=canvas.getBoundingClientRect(),d=dimensions();if(r.width<=0||r.height<=0)return null;
  return relicHit(d.cols,d.rows,model.view(),(e.clientX-r.left)*d.cols/r.width,(e.clientY-r.top)*d.rows/r.height);
 };
 const pointer=e=>{
  if(disposed||e.target!==canvas||!active())return;
  const target=hit(e);if(!target&&!model.blocking())return;
  consume(e);if(e.button!==0)return;
  if(target?.kind==='gem')model.toggle();
  else if(target?.kind==='choice')model.confirm(target.index);
  else if(target?.kind==='previous')model.turnPage(-1,pages());
  else if(target?.kind==='next')model.turnPage(1,pages());
  else if(target)model.reveal();
  canvas.focus();
 };
 const move=e=>{if(e.target!==canvas||!active())return;const target=hit(e);if(target?.kind==='choice')model.select(target.index);};
 const keydown=e=>{
  if(disposed||!active())return;
  if(e.target?.isContentEditable||e.target?.closest?.('input,select,textarea,button,[contenteditable]'))return;
  if(gameplayKeys.has(e.code))held.add(e.code);
  if(!model.blocking()){
   if(quarantine.has(e.code))consume(e);
   return;
  }
  if(gameplayKeys.has(e.code))quarantine.add(e.code);
  if(!gameplayKeys.has(e.code)&&!['Escape','Enter','PageDown','PageUp'].includes(e.code))return;
  consume(e);if(e.repeat)return;
  if(e.code==='Escape')model.close();
  else if(e.code==='PageDown'||e.code==='ArrowRight')model.turnPage(1,pages());
  else if(e.code==='PageUp'||e.code==='ArrowLeft')model.turnPage(-1,pages());
  else if(e.code==='Enter'){
   const v=model.view();if(v.dialogue?.choices.length)model.confirm(v.selected);else if(v.page<pages()-1)model.turnPage(1,pages());else model.close();
  }else if(e.code==='ArrowDown'||e.code==='ArrowUp'){
   const v=model.view(),count=v.dialogue?.choices.length??0;if(count)model.select((v.selected+(e.code==='ArrowDown'?1:count-1))%count);
  }
 };
 const keyup=e=>{held.delete(e.code);quarantine.delete(e.code);};
 const blur=()=>{held.clear();quarantine.clear();};
 const wheel=e=>{if(e.target===canvas&&active()&&model.blocking()){consume(e);model.turnPage(e.deltaY>0?1:-1,pages());}};
 root.addEventListener('pointerdown',pointer,true);root.addEventListener('pointermove',move,true);
 root.addEventListener('keydown',keydown,true);root.addEventListener('keyup',keyup,true);root.addEventListener('blur',blur);
 root.addEventListener('wheel',wheel,{capture:true,passive:false});
 return {
  reset,blocking:()=>model.blocking(),dismiss(){model.dismiss();notify();},
  update(s){
   if(s.phase!==lastPhase){if(s.phase==='won')model.setObjective({id:'warden-done',title:'OBJECTIVE COMPLETE',text:'The warden has fallen.'});if(s.phase==='dead'){model.dismiss();notify();}lastPhase=s.phase;}
  },
  advance(now){
   if(!Number.isFinite(now))return;const dt=uiLast===null?0:Math.max(0,Math.min(.1,(now-uiLast)/1000));uiLast=now;
   try{reduced=preference?.matches===true||root.localStorage?.getItem?.('ash-manifest-reduced-motion')==='true';}catch{reduced=preference?.matches===true;}
   clock+=dt;model.step(dt,reduced);
   const result=model.takeChoice();
   if(result){
    onChoice(result);
    const EventClass=root.CustomEvent??globalThis.CustomEvent;
    if(typeof EventClass==='function')canvas.dispatchEvent(new EventClass('ash-manifest-choice',{detail:result}));
   }
   notify();
  },
  paint:(frame,cols,rows)=>paintRelic(frame,cols,rows,model.view(),clock,reduced),
  text:(ctx,cols,rows,height)=>drawRelicText(ctx,cols,rows,height,model.view(),clock,reduced),
  dispose(){
   disposed=true;model.dismiss();notify();
   root.removeEventListener('pointerdown',pointer,true);root.removeEventListener('pointermove',move,true);
   root.removeEventListener('keydown',keydown,true);root.removeEventListener('keyup',keyup,true);root.removeEventListener('blur',blur);root.removeEventListener('wheel',wheel,true);
   if(root.__ASH_MANIFEST__===api){if(previous===undefined)delete root.__ASH_MANIFEST__;else root.__ASH_MANIFEST__=previous;}
  },
 };
}
