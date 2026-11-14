export const EXECUTION=Object.freeze({weakFraction:.30,reach:1.4,arcDegrees:120,lampReward:30,duration:10.8,down:1.45,pin:2.25,release:2.8,offer:3.8,extract:6.5,regrip:7.3,pull:8.25,back:10.25});
export interface ExecutionActor{x:number;y:number;fx:number;fy:number;lamp:number;phase:'playing'|'won'|'dead';busy:boolean}
export interface ExecutionTarget{id:number;x:number;y:number;hp:number;maxHp:number}
export type ExecutionPhase='approach'|'pin'|'release'|'offer'|'drain'|'regrip'|'pull'|'return'|'settle'|'done'|'cancelled';
export type ExecutionEvent='impact'|'pierced'|'hand-released'|'lamp-offered'|'extracted'|'regripped'|'blade-pulled'|'finished'|'cancelled';
export interface ExecutionState{targetId:number;elapsed:number;phase:ExecutionPhase;extracted:boolean;heroX:number;heroY:number;targetX:number;targetY:number;fx:number;fy:number}
export function executionTargetWeak(target:ExecutionTarget):boolean{return Number.isFinite(target.hp)&&Number.isFinite(target.maxHp)&&target.maxHp>0&&target.hp>0&&target.hp<=target.maxHp*EXECUTION.weakFraction;}
export function canExecute(hero:ExecutionActor,target:ExecutionTarget,lineBlocked=false):boolean{
if(hero.phase!=='playing'||!Number.isFinite(hero.lamp)||hero.lamp<=0||hero.busy||lineBlocked||!executionTargetWeak(target))return false;
if(![hero.x,hero.y,hero.fx,hero.fy,target.x,target.y].every(Number.isFinite))return false;
const dx=target.x-hero.x,dy=target.y-hero.y,d=Math.hypot(dx,dy),n=Math.hypot(hero.fx,hero.fy);
return d<=EXECUTION.reach&&n>1e-8&&(d<1e-8||(dx*hero.fx+dy*hero.fy)/(d*n)>=Math.cos(EXECUTION.arcDegrees*.5*Math.PI/180));
}
export function beginExecution(hero:ExecutionActor,target:ExecutionTarget,lineBlocked=false):ExecutionState|null{
if(!canExecute(hero,target,lineBlocked))return null;const dx=target.x-hero.x,dy=target.y-hero.y,d=Math.hypot(dx,dy),n=Math.hypot(hero.fx,hero.fy);
return{targetId:target.id,elapsed:0,phase:'approach',extracted:false,heroX:hero.x,heroY:hero.y,targetX:target.x,targetY:target.y,fx:d>1e-8?dx/d:hero.fx/n,fy:d>1e-8?dy/d:hero.fy/n};
}
function phaseAt(t:number):ExecutionPhase{return t<EXECUTION.down?'approach':t<EXECUTION.pin?'pin':t<EXECUTION.release?'release':t<EXECUTION.offer?'offer':t<EXECUTION.extract?'drain':t<EXECUTION.regrip?'regrip':t<EXECUTION.pull?'pull':t<EXECUTION.back?'return':t<EXECUTION.duration?'settle':'done';}
const thresholds:readonly (readonly [number,ExecutionEvent])[]=[[EXECUTION.down,'impact'],[EXECUTION.pin,'pierced'],[EXECUTION.release,'hand-released'],[EXECUTION.offer,'lamp-offered'],[EXECUTION.extract,'extracted'],[EXECUTION.regrip,'regripped'],[EXECUTION.pull,'blade-pulled'],[EXECUTION.duration,'finished']];
export function advanceExecution(input:ExecutionState,dt:number,heroAlive=true):{state:ExecutionState;events:ExecutionEvent[]}{
const state={...input},events:ExecutionEvent[]=[];if(!Number.isFinite(dt)||dt<=0||state.phase==='done'||state.phase==='cancelled')return{state,events};
if(!heroAlive){state.phase='cancelled';events.push('cancelled');return{state,events};}
state.elapsed=Math.min(EXECUTION.duration,input.elapsed+dt);for(const [time,event]of thresholds)if(input.elapsed<time&&state.elapsed>=time){if(event==='extracted'){if(state.extracted)continue;state.extracted=true;}events.push(event);}
state.phase=phaseAt(state.elapsed);return{state,events};
}
export function executionLampAfterExtraction(lamp:number):number{return Number.isFinite(lamp)&&lamp>0?Math.min(100,lamp+EXECUTION.lampReward):0;}
function smooth(t:number):number{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);}
function ramp(t:number,a:number,b:number):number{return smooth((t-a)/(b-a));}
export function executionPresentation(s:ExecutionState):{pin:number;release:number;offer:number;char:number;regrip:number;pull:number;back:number;cameraZoom:number;cameraShake:number}{
const t=s.elapsed,focus=ramp(t,.4,2.4)*(1-ramp(t,7.3,10.8)),burnFocus=ramp(t,3,4)*(1-ramp(t,6.5,8)),impulse=(at:number)=>{const d=t-at;return d>=0&&d<.4?Math.exp(-d*12)*Math.sin(d*90):0;};
return{pin:ramp(t,0,EXECUTION.pin),release:ramp(t,EXECUTION.pin,EXECUTION.release),offer:ramp(t,EXECUTION.release,EXECUTION.offer),char:ramp(t,EXECUTION.offer,EXECUTION.extract),regrip:ramp(t,EXECUTION.extract,EXECUTION.regrip),pull:ramp(t,EXECUTION.regrip,EXECUTION.pull),back:ramp(t,EXECUTION.pull,EXECUTION.duration),cameraZoom:1+.13*focus+.04*burnFocus,cameraShake:5*impulse(EXECUTION.down)+8*impulse(EXECUTION.pin)+3*impulse(EXECUTION.pull)};
}
