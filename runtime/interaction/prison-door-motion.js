import {createDoorState} from './door-state.js';
import {PRISON_DOOR_OPEN_ANGLE} from '../gallery/models/prison-door.js';

// Explicit simulation clock for prison-door.a; no scene, input or collider ownership.
export function createPrisonDoorMotion({duration=1.2}={}){
 if(!Number.isFinite(duration)||duration<=0||duration>120)throw Error('Invalid door opening duration');
 const door=createDoorState({id:'prison-door.a',kind:'door'});
 let elapsed=0,view;
 function publish(){
  const progress=elapsed/duration,weight=Math.max(0,Math.min(1,progress*progress*(3-2*progress)));
  const angle=progress===0?0:progress===1?PRISON_DOOR_OPEN_ANGLE:PRISON_DOOR_OPEN_ANGLE*weight;
  view=Object.freeze({...door.snapshot(),duration,elapsed,progress,angle});
 }
 function beginOpening(actionId){if(!door.beginOpening(actionId))return false;publish();return true;}
 function step(dt){
  if(!Number.isFinite(dt)||dt<=0||dt>1/30)throw Error('Invalid door motion step');
  if(view.status!=='opening')return false;
  elapsed=Math.min(duration,elapsed+dt);
  if(duration-elapsed<=duration*1e-12)elapsed=duration;
  const completed=elapsed===duration&&door.finishOpening(view.actionId);
  publish();return completed;
 }
 publish();
 return Object.freeze({snapshot:()=>view,beginOpening,step});
}
