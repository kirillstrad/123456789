// LAST_SERVICE_THRESHOLDS_PASS4
import {paintLastServiceStamp} from './last-service-interaction-stamp.js';
import {lastServiceLocalLights,lightExposure} from '../render/last-service-local-light.js';
export function lastServiceInteractionCandidates({s,env={},ritual={},gate=null,chapter=null,isBlocked=()=>false}){
 if(s.phase!=='playing')return [];
 const candidates=[],idle=!s.action&&s.sweepProgress==null&&!s.dash&&!s.interaction&&!s.execution&&!(s.hitReaction>0);
 const add=c=>{c.priority=c.id==='chapel'?4:c.id==='ledger'||c.id==='register'?3:c.id==='ritual'?2:1;c.distance=Math.hypot(c.x-s.x,c.y-s.y);if(c.distance>7)return;c.actionable=c.distance<=c.range&&c.ready&&idle;if(!idle&&c.distance<=c.range){c.action='ДЕЙСТВИЕ...';c.detail='Заверши текущее действие.';}candidates.push(c);};
 if(!chapter){
  for(const t of env.targets??[]){
   if(t.kind!=='door'||t.availability==='open')continue;
   const v=(t.parts??[]).flatMap(p=>p.v??[]).filter(p=>p.length===3&&p.every(Number.isFinite));if(!v.length)continue;
   const xs=v.map(p=>p[0]),ys=v.map(p=>p[1]),zs=v.map(p=>p[2]);
   const busy=t.availability==='busy',ready=t.availability==='ready';
   add({id:'door:'+t.id,x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2,z:Math.max(...zs)+.12,range:2.5,ready,title:'ПОГРЕБАЛЬНЫЕ ВРАТА',action:busy?'ОТКРЫВАЕТСЯ...':ready?'ОТКРЫТЬ':'ЗАПЕРТО',detail:busy?'Дождись завершения движения.':ready?'Один раз нажми F.':'Проход пока недоступен.'});
  }
  if(gate){const near=gate.near;add({id:'chapel',x:8,y:-50.4,z:3.25,range:3.2,ready:near&&(gate.ready||gate.reason==='lesson'),title:'НИЖНЯЯ ЧАСОВНЯ',action:!near?'ПОДОЙДИ К ПОРОГУ':gate.reason==='lesson'?'ПРОЧИТАТЬ':gate.ready?'ВОЙТИ':'ПЕЧАТЬ ДЕРЖИТСЯ',detail:near?gate.text:'Подойди к порталу нижней часовни.'});}
  if(ritual.parts?.length){
   const ring=ritual.parts.find(p=>p.kind===1&&p.v?.length>20)?.v;
   if(ring){const x=(Math.min(...ring.map(p=>p[0]))+Math.max(...ring.map(p=>p[0])))/2,y=(Math.min(...ring.map(p=>p[1]))+Math.max(...ring.map(p=>p[1])))/2;
    const text=(ritual.hint?.text??'').toUpperCase(),full=text.includes('ПОЛНА');
    if(!isBlocked(s,{x,y}))add({id:'ritual',x,y,z:1.4,range:1.65,ready:!!ritual.hint&&!full,title:'АЛАЯ ПЕЧАТЬ',action:full?'ЛАМПА ПОЛНА':text.includes('ЗАЖЕЧЬ')?'ЗАЖЕЧЬ':'РИТУАЛ',detail:full?'Запас огня восстановлен.':ritual.hint?'Один раз нажми F.':'Подойди к центру печати.'});
   }
  }
 }
 if(!chapter||chapter==='keeper'){
  const keeper=chapter==='keeper',x=8,y=keeper?7:-25;
  if(!isBlocked(s,{x,y}))add({id:keeper?'register':'ledger',x,y,z:1.65,range:1.5,ready:true,title:keeper?'ПОСЛЕДНИЙ РЕЕСТР':'РАСПОРЯЖЕНИЕ',action:'ПРОЧИТАТЬ',detail:keeper?'Завершить последнюю службу.':'Запись на пюпитре.'});
 }
 return candidates;
}
export function selectLastServiceInteraction(candidates,previous=null){
 const ranked=[...candidates].sort((a,b)=>Number(b.actionable)-Number(a.actionable)||(a.actionable&&b.actionable?(b.priority??0)-(a.priority??0):0)||a.distance-b.distance||a.id.localeCompare(b.id));
 if(!ranked.length)return null;
 const best=ranked[0],old=ranked.find(c=>c.id===previous);
 return old&&old.actionable===best.actionable&&(!best.actionable||(old.priority??0)===(best.priority??0))&&old.distance<=best.distance+.55?old:best;
}
export function createLastServiceWorldPass(){
 let previous=null,lastTime=null,lastChapter=null;
 return {
  frame({s,env,ritual,gate,chapter,project,hidden=false,width=1008,height=864,isBlocked}){
   if((lastTime!==null&&s.time<lastTime)||chapter!==lastChapter)previous=null;
   lastTime=s.time;lastChapter=chapter;
   const selected=hidden?null:selectLastServiceInteraction(lastServiceInteractionCandidates({s,env,ritual,gate,chapter,isBlocked}),previous);
   previous=selected?.id??null;
   return {selected,project,width,height,time:s.time??0,lights:lastServiceLocalLights([...(env.lights??[]),...(ritual.lights??[])],project,{width,height}),exposure:lightExposure};
  },
  paint(ctx,frame,options){return paintLastServiceStamp(ctx,frame,options);}
 };
}
