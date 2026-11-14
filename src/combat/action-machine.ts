import {COMBAT,DRAFT_RULES} from './config.js';
import {allowedContinuation,inertiaDelta} from './mechanics-4c.js';
import type {AttackCommand,AttackHooks,Strike,ActionView} from './types.js';
export class ActionMachine{
current:Strike|null=null;queued:AttackCommand|null=null;private serial=0;private chain='';private contactFired=false;started=0;hits=0;
clear():void{this.current=null;this.queued=null;this.chain='';this.contactFired=false;}
request(command:AttackCommand,hooks:AttackHooks):boolean{
if(this.current){const progress=this.current.elapsed/this.current.duration;if(progress<COMBAT.queueStart||progress>COMBAT.activeEnd||this.queued||!allowedContinuation(this.chain,command.kind))return false;this.queued={kind:command.kind,aim:command.aim?{...command.aim}:null};return true;}
this.begin(command,0,hooks);return true;
}
private begin(command:AttackCommand,stage:number,hooks:AttackHooks):void{
const p=hooks.position(),f=hooks.facing(),aim=DRAFT_RULES.aim==='cursor-at-press'?command.aim:null,dx=aim?aim.x-p.x:f.x,dy=aim?aim.y-p.y:f.y,n=Math.hypot(dx,dy),fx=n>.001?dx/n:f.x,fy=n>.001?dy/n:f.y;
this.chain=stage===0?(command.kind==='light'?'L':'H'):this.chain+(command.kind==='light'?'L':'H');
this.current={id:++this.serial,kind:command.kind,stage,elapsed:0,duration:(command.kind==='heavy'?COMBAT.heavyDurations:COMBAT.lightDurations)[stage],fx,fy,hitIds:new Set()};this.contactFired=false;this.queued=null;this.started++;
}
step(dt:number,movingInput:boolean,hooks:AttackHooks):void{
if(!Number.isFinite(dt)||dt<=0||!this.current)return;
const a=this.current,prev=a.elapsed/a.duration;a.elapsed=Math.min(a.duration,a.elapsed+dt);const t=a.elapsed/a.duration;
const d=inertiaDelta(a.kind,a.stage,prev,t,a.fx,a.fy);hooks.lunge(d.x,d.y);
const contact=(COMBAT.activeStart+COMBAT.activeEnd)/2;
if(!this.contactFired&&prev<contact&&t>=contact){this.contactFired=true;hooks.hit(a);}
if(movingInput&&!this.queued&&t>=DRAFT_RULES.allowMoveCancelAfter){this.clear();return;}
if(t>=1){if(this.queued){const next=this.queued;this.begin(next,a.stage+1,hooks);}else this.clear();}
}
view():ActionView|null{const a=this.current;return a?{id:a.id,kind:a.kind,stage:a.stage,progress:a.elapsed/a.duration,fx:a.fx,fy:a.fy,clip:(a.kind==='heavy'?'heavy':'light')+(a.stage+1),animation4C:true,continuation:this.queued?.kind??null}:null;}
}
