import {relicLetters,relicMeasure} from './relic-font.js';
import {heroHudBounds} from '../app/world-surface.js';
const names=Object.freeze({bonebound:'Костяной служитель','marrow-archer':'Костяной стрелок',ashbound:'Пепельник','ossuary-guard':'Страж костницы',gravebearer:'Гробоносец','bloated-remnant':'Вздувшийся останок','corpse-golem':'Трупный голем','test-warden':'Смотритель'});
export const lastServiceEnemyName=enemy=>names[enemy?.archetype]??'Неупокоенный';
export function lastServiceRoom(s,chapter=null){
 if(chapter==='keeper')return 'ПОКОИ ХРАНИТЕЛЯ';if(chapter==='boss')return 'НИЖНЯЯ ЧАСОВНЯ';
 if(s.x>14&&s.y<-23&&s.y>-39)return 'БОКОВАЯ УСЫПАЛЬНИЦА';
 return s.y>11.5?'ПРИТВОР':s.y>1?'КАРАУЛЬНАЯ':s.y>-22?'ПОГРЕБАЛЬНАЯ ГАЛЕРЕЯ':s.y>-33?'РИЗНИЦА':s.y>-41?'КОСТНИЦА':'ПРЕДДВЕРИЕ ЧАСОВНИ';
}
export function paintLastServiceLabels(ctx,s,{width,height,ready,chapter=null,hidden=false}={}){
 if(hidden)return;
 const label=(text,x,y,scale=1.2,title=false,center=true)=>{
  ctx.fillStyle='#050405';relicLetters(ctx,text,x-(center?relicMeasure(text,scale)/2:0)+1,y+1,scale,title);
  ctx.fillStyle='#d2b991';relicLetters(ctx,text,x-(center?relicMeasure(text,scale)/2:0),y,scale,title);
 };
 ctx.save();try{
  const r=heroHudBounds(width,height),life=Math.ceil(Math.max(0,Math.min(100,s.lamp)));
  label(lastServiceRoom(s,chapter),18,18,1.05,true,false);
  label(`ЛАМПА ${life}/100`,r.x+r.width*.15,r.y+r.height*.86,1.1);
  label(ready?'РЫВОК ГОТОВ':'РЫВОК',r.x+r.width*.85,r.y+r.height*.86,1.1);
  if(life<=15)label(life<=0?'ОГОНЬ ПОГАС':life<=1?'ПОСЛЕДНИЙ УГОЛЬ':'ОГОНЬ МЕРКНЕТ',width/2,r.y+r.height*.65,1.1);
 }finally{ctx.restore();}
}
