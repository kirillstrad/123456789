import {createLastServiceTransition} from '../game/last-service-transition.js';
import {createLastServiceThresholdRenderer} from '../render/last-service-threshold-renderer.js';
export function createLastServiceLoadingScreen({captureHero,onEnter=()=>{},onClose=()=>{},scope=null}){
 const own=[];let disposed=false;const listen=(target,type,fn,o)=>{let off;if(scope)off=scope.listen(target,type,fn,o);else{target.addEventListener(type,fn,o);off=()=>target.removeEventListener(type,fn,o);}own.push(off);};
 const root=document.createElement('div'),canvas=document.createElement('canvas'),close=document.createElement('button'),error=document.createElement('div');
 root.id='last-service-loading';root.tabIndex=-1;root.setAttribute('aria-modal','true');root.setAttribute('role','dialog');root.setAttribute('aria-label','Переход между локациями');root.hidden=true;
 root.style.cssText='position:fixed;inset:0;z-index:5000;background:#050609;display:none;place-items:center;';
 canvas.width=1008;canvas.height=864;canvas.style.cssText='max-width:100vw;max-height:100vh;width:auto;height:auto;';
 close.textContent='Закрыть просмотр';close.style.cssText='position:absolute;right:20px;top:16px;padding:10px;background:#19191d;color:#e1d0a9;border:1px solid #8d8066;cursor:pointer;';
 error.style.cssText='position:absolute;left:10%;right:10%;bottom:70px;color:#edc9af;background:#151318;padding:12px;white-space:pre-wrap;';error.hidden=true;
 root.append(canvas,close,error);document.body.append(root);if(scope)scope.ownNode(root);
 const renderer=createLastServiceThresholdRenderer(canvas);let hero=null;
 const machine=createLastServiceTransition({onClose(){root.hidden=true;root.style.display='none';hero=null;onClose();}});
 listen(close,'click',()=>machine.close());
 listen(window,'keydown',e=>{if(!machine.active())return;e.stopImmediatePropagation();if(e.code==='Tab'){e.preventDefault();if(!close.hidden)close.focus();return;}if(e.code==='Escape'){e.preventDefault();machine.close();}else if(!e.target?.closest?.('button'))e.preventDefault();},true);
 return {
  active:()=>!disposed&&machine.active(),snapshot:()=>disposed?null:machine.snapshot(),cancel:machine.cancel,
  dispose(){if(disposed)return;disposed=true;try{machine.cancel();}finally{for(const off of own.splice(0))off();root.remove();}},
  start(id,load=()=>{},options={}){
   if(disposed||machine.active())return false;
   if(!machine.start(id,load,options))return false;
   try{hero=captureHero();}catch(e){machine.fail(e);hero=null;}onEnter();root.hidden=false;root.style.display='grid';close.hidden=!options.preview;error.hidden=true;renderer.reset();
   const g=canvas.getContext('2d');g.fillStyle='#050609';g.fillRect(0,0,1008,864);if(options.preview)close.focus();else root.focus();return true;
  },
  paint(now){
   const s=machine.snapshot();if(disposed||!s)return;
   if(s.error){error.hidden=false;error.textContent=s.error;close.hidden=false;close.textContent='Вернуться в игру';return;}
   const status=s.error?'ОШИБКА ПЕРЕХОДА':s.preview?'ПРОСМОТР ЗАСТАВКИ — ESC: ЗАКРЫТЬ':'ПЕРЕХОД...';
   try{const rendered=renderer.paint(s.id,hero,now,status);if(rendered)machine.painted(now);}
   catch(e){machine.fail('Не удалось отрисовать заставку: '+String(e.message??e));}
   const current=machine.snapshot();if(current?.error){error.hidden=false;error.textContent=current.error;close.hidden=false;close.textContent='Вернуться в игру';}
   else close.textContent='Закрыть просмотр';
  }
 };
}
