import {createLastServiceTutorial} from './last-service-tutorial.js';
export const SEAL_DURATION=3.2;
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function sealInspectionWeight(elapsed){
 if(!Number.isFinite(elapsed)||elapsed<0)throw Error('Invalid seal animation time');
 return smooth(elapsed/.9)*(1-smooth((elapsed-2.15)/1.05));
}
export function createLastServiceSegment(){
 const tutorial=createLastServiceTutorial();let elapsed=0;
 return {
 tutorial,
 snapshot:()=>({elapsed,intro:elapsed<SEAL_DURATION,weight:sealInspectionWeight(elapsed)}),
 tick(dt,{paused=false,modal=false}={}){
  if(!Number.isFinite(dt)||dt<0)throw Error('Invalid segment tick');
  if(paused)return;
  if(!modal)elapsed=Math.min(SEAL_DURATION,elapsed+dt);
  tutorial.tick(dt,{paused:modal});
 },
 next(s){
  if(elapsed<SEAL_DURATION||s.phase!=='playing')return null;
  const id=s.y<10.9?'attack':s.y<14?'door':s.y<17?'light':null;
  return id&&tutorial.enter(id)?tutorial.snapshot().dialogue:null;
 },
 retry(){elapsed=SEAL_DURATION;tutorial.retry();},
 reset(){elapsed=0;tutorial.reset();}
 };
}
