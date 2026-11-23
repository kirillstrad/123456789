import {throneMenu} from './bright-throne-menu.js';
import {createSceneHost} from '../app/scene-host.js';
export function makeUI(out,glyph){
 document.documentElement.dataset.ashMenu='throne';
 const live=()=>window.__ASH_ITERATION_2__,previous=window.__ASH_SCENES__;
 const host=createSceneHost({onEnter(){
  const api=live();if(typeof api?.pause!=='function')throw Error('Main game API is not ready');
  const width=out.canvas.width,height=out.canvas.height;api.pause();
  return ()=>{out.canvas.width=width;out.canvas.height=height;window.__ASH_THRONE__?.open?.();const EventClass=window.Event??globalThis.Event;if(typeof window.dispatchEvent==='function'&&typeof EventClass==='function')window.dispatchEvent(new EventClass('resize'));out.canvas.focus?.();};
 }});
 const scenes=Object.freeze({register:host.register,list:host.list,current:host.current,start:id=>host.start(id,{canvas:out.canvas,out}),exit:host.exit});window.__ASH_SCENES__=scenes;
 const menuApi={mode:()=>host.active()?'scene':live().mode(),state:()=>live().state(),start:()=>live().start(),resume:()=>live().resume(),pause:()=>live().pause()};

 const ui=document.createElement('canvas'),hudView=document.createElement('canvas');
 ui.width=1008;ui.height=864;hudView.width=1008;hudView.height=144;
 const u=ui.getContext('2d',{willReadFrequently:true}),h=hudView.getContext('2d');let lampLife=100;
 function uiText(text,x,y,size=15,c='#aaa',align='center'){u.font=size+'px monospace';u.textAlign=align;u.fillStyle=c;u.fillText(text,x,y);}
 function flourish(x,y,w=300){u.save();u.translate(x,y);u.strokeStyle='#aaa';u.lineWidth=10;u.beginPath();u.moveTo(-w/2,0);u.lineTo(-w/3,-17);u.lineTo(-w/4,-5);u.lineTo(-w/8,-27);u.lineTo(0,-12);u.lineTo(w/8,-27);u.lineTo(w/4,-5);u.lineTo(w/3,-17);u.lineTo(w/2,0);u.stroke();u.lineWidth=6;u.beginPath();u.moveTo(0,-12);u.lineTo(0,30);u.moveTo(-20,10);u.lineTo(20,10);u.stroke();u.restore();}
 function drawHUD(){
  u.fillStyle='#000';u.fillRect(0,0,1008,864);u.fillStyle='#626262';u.fillRect(32,22,944,3);u.fillRect(32,120,944,3);
  for(const x of [42,966]){u.fillRect(x,25,4,95);u.fillRect(x-8,60,20,5);}flourish(504,32,190);
  const x=200,width=608,bx=x+56,bw=width-76,by=80;
  u.fillStyle='#0d0d0d';u.fillRect(x,47,width,54);u.strokeStyle='#828282';u.lineWidth=2;u.strokeRect(x,47,width,54);u.strokeStyle='#414141';u.strokeRect(x+5,52,width-10,44);
  u.strokeStyle='#aaa';u.lineWidth=4;u.strokeRect(x+16,65,22,22);u.beginPath();u.moveTo(x+16,65);u.lineTo(x+27,52);u.lineTo(x+38,65);u.stroke();u.fillStyle='#aaa';u.fillRect(x+25,70,5,11);
  uiText('LAMP',bx,68,11,'#aaa','left');uiText(Math.ceil(lampLife)+'/100',x+width-18,68,11,'#aaa','right');
  u.fillStyle='#242424';u.fillRect(bx,by,bw,9);u.fillStyle=lampLife<=1?'#c6c6c6':'#999';u.fillRect(bx,by,bw*lampLife/100,9);
  for(let i=0;i<53;i++){u.fillStyle='#000';u.fillRect(bx+i*10,by,2,9);}
  const warning=lampLife<=0?'THE FLAME IS OUT':lampLife<=1?'LAST EMBER - ONE HIT LEFT':lampLife<=15?'LOW EMBER':'';
  if(warning)uiText(warning,504,113,11,'#bfbfbf');
  h.drawImage(ui,0,0,1008,144,0,0,1008,144);glyph(hudView,196,28,720,144,true,true);
 }
 return{menu(){if(!live())return;if(host.active()){try{host.frame(performance.now());return;}catch(error){window.__ASH_SCENE_ERROR__=String(error.stack??error);const status=document.getElementById('status');if(status)status.textContent='Ошибка сцены: '+error.message;}}throneMenu(out,menuApi);},hud(lamp){lampLife=Number.isFinite(lamp)?Math.max(0,Math.min(100,lamp)):0;drawHUD();},dispose(){try{host.dispose();}finally{if(window.__ASH_SCENES__===scenes){if(previous===undefined)delete window.__ASH_SCENES__;else window.__ASH_SCENES__=previous;}}}};
}
