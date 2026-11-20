import {updateGolemMotion} from '../animation/golem-motion.js';
// Provisional balance. There are no health-dependent combat phases.
export const CORPSE_GOLEM = Object.freeze({
  id:'corpse-golem', name:'Corpse Golem', category:'undead', boss:true,
  maxHp:600, damage:20, radius:.85, speed:.5, windup:1.25,
  recover:1.5, reach:2.45, cooldown:1.2, stagger:.45,
});
export const GOLEM_ATTACKS = Object.freeze({
  slam:Object.freeze({windup:1.25,recover:1.5,reach:2.45,arc:75,damage:22}),
  sweep:Object.freeze({windup:1.45,recover:1.7,reach:2.7,arc:170,damage:18}),
  press:Object.freeze({windup:1.05,recover:1.55,reach:1.65,arc:95,damage:16}),
});
export const GOLEM_FINISHER = Object.freeze({
  weakFraction:.05, reach:1.5, duration:6.8, down:1, pin:2.6,
  release:2.85, offer:3.25, extract:4.8, regrip:5.2, pull:6.1,
});
const clamp = x => Math.max(0,Math.min(1,x));
const ramp = (t,a,b) => {
  const x=clamp((t-a)/(b-a));
  return x*x*x*(x*(x*6-15)+10);
};
const finisherTime = e => Number.isFinite(e?.elapsed)
  ? Math.max(0,Math.min(GOLEM_FINISHER.duration,e.elapsed)) : 0;
export function golemExecutionWeak(e){
  return e?.archetype==='corpse-golem' && Number.isFinite(e.hp)
    && Number.isFinite(e.maxHp) && e.maxHp>0 && e.hp>0
    && e.hp<=e.maxHp*GOLEM_FINISHER.weakFraction;
}
export function canFinishGolem(hero,boss,lineBlocked=false){
  if(!golemExecutionWeak(boss)||hero?.phase!=='playing'||hero.busy
    ||lineBlocked||!Number.isFinite(hero.lamp)||hero.lamp<=0
    ||![hero.x,hero.y,hero.fx,hero.fy,boss.x,boss.y].every(Number.isFinite))return false;
  const dx=boss.x-hero.x,dy=boss.y-hero.y,d=Math.hypot(dx,dy),n=Math.hypot(hero.fx,hero.fy);
  return d<=GOLEM_FINISHER.reach && n>1e-8
    && (d<1e-8||(dx*hero.fx+dy*hero.fy)/(d*n)>=.5);
}
export function beginGolemExecution(hero,boss,lineBlocked=false){
  if(!canFinishGolem(hero,boss,lineBlocked))return null;
  const dx=boss.x-hero.x,dy=boss.y-hero.y,d=Math.hypot(dx,dy),n=Math.hypot(hero.fx,hero.fy);
  return {kind:'corpse-golem',targetId:boss.id,elapsed:0,phase:'approach',
    extracted:false,heroX:hero.x,heroY:hero.y,targetX:boss.x,targetY:boss.y,
    fx:d>1e-8?dx/d:hero.fx/n,fy:d>1e-8?dy/d:hero.fy/n};
}
const thresholds=Object.freeze([
  [1,'impact'],[2.6,'pierced'],[2.85,'hand-released'],[3.25,'lamp-offered'],
  [4.8,'extracted'],[5.2,'regripped'],[6.1,'blade-pulled'],[6.8,'finished'],
].map(entry=>Object.freeze(entry)));
export function advanceGolemExecution(input,dt,heroAlive=true){
  const state={...input},events=[];
  if(!Number.isFinite(dt)||dt<=0||state.phase==='done'||state.phase==='cancelled')return {state,events};
  if(!heroAlive){state.phase='cancelled';events.push('cancelled');return {state,events};}
  state.elapsed=Math.min(GOLEM_FINISHER.duration,input.elapsed+dt);
  for(const [time,event] of thresholds){
    if(input.elapsed<time&&state.elapsed>=time){
      if(event==='extracted'){if(state.extracted)continue;state.extracted=true;}
      events.push(event);
    }
  }
  const t=state.elapsed;
  state.phase=t<1?'approach':t<2.6?'pin':t<2.85?'release':t<3.25?'offer':
    t<4.8?'drain':t<5.2?'regrip':t<6.1?'pull':t<6.8?'return':'done';
  return {state,events};
}
export function golemFinisherFrame(e){
  const t=finisherTime(e);
  return {kneel:ramp(t,0,1),open:ramp(t,1,2.6),
    offer:ramp(t,2.85,3.25)*(1-ramp(t,4.8,5.2)),
    burn:ramp(t,3.25,4.8),fall:ramp(t,4.8,5.8),withdraw:ramp(t,6.1,6.8)};
}
export function golemExecutionPresentation(e){
  const t=finisherTime(e),f=golemFinisherFrame(e),focus=ramp(t,0,.8)*(1-ramp(t,6.1,6.8));
  return {pin:f.kneel,release:f.open,offer:f.offer,char:f.burn,
    regrip:ramp(t,4.8,5.2),pull:ramp(t,5.2,6.1),back:f.withdraw,
    cameraZoom:1+.09*focus,cameraShake:0};
}
function stepCorpseGolemCore({enemy:e,dt,player,map,damage,solid,blocked,allowAttack=true}){
  if(e.archetype!=='corpse-golem')return false;
  if(e.hp<=0||e.mode==='dead'||!Number.isFinite(dt)||dt<=0)return true;
  e.cooldown=Math.max(0,e.cooldown-dt);
  const before=e.timer;e.timer+=dt;
  const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);
  if(e.mode==='stagger'){
    if(e.timer>=CORPSE_GOLEM.stagger){e.mode='chase';e.timer=0;}
    return true;
  }
  function move(fx,fy,distance){
    const count=Math.max(1,Math.ceil(distance/.06)),step=distance/count;
    for(let i=0;i<count;i++){
      const x=e.x,y=e.y,X=x+fx*step,Y=y+fy*step,clear=CORPSE_GOLEM.radius+.24+.03;
      if(!solid(X,e.y,map,CORPSE_GOLEM.radius)&&Math.hypot(X-player.x,e.y-player.y)>=clear)e.x=X;
      if(!solid(e.x,Y,map,CORPSE_GOLEM.radius)&&Math.hypot(e.x-player.x,Y-player.y)>=clear)e.y=Y;
      e.walkDistance+=Math.hypot(e.x-x,e.y-y);
    }
  }
  if(e.mode==='windup'){
    const a=GOLEM_ATTACKS[e.golemAttack]??GOLEM_ATTACKS.slam;
    if(e.golemAttack==='press'){
      const elapsed=Math.max(0,Math.min(e.timer,.95)-Math.max(before,.45));
      if(elapsed>0)move(e.fx,e.fy,elapsed*1.6);
    }
    if(!e.hitFired&&before<a.windup&&e.timer>=a.windup){
      e.hitFired=true;
      const X=player.x-e.x,Y=player.y-e.y,D=Math.hypot(X,Y);
      if(D<=a.reach&&(D<1e-8||(X*e.fx+Y*e.fy)/D>=Math.cos(a.arc*Math.PI/360))
        &&!blocked(e,player,map))damage(a.damage);
      e.mode='recover';e.timer=0;e.cooldown=CORPSE_GOLEM.cooldown;
    }
    return true;
  }
  if(e.mode==='recover'){
    const a=GOLEM_ATTACKS[e.golemAttack]??GOLEM_ATTACKS.slam;
    if(e.timer>=a.recover){e.mode='chase';e.timer=0;}
    return true;
  }
  if(e.mode==='wait'){if(d<8){e.mode='chase';e.timer=0;}return true;}
  if(e.mode!=='chase')return true;
  if(d>1e-8){e.fx=dx/d;e.fy=dy/d;}
  const names=['slam','sweep','press'],index=Number.isSafeInteger(e.golemAttackIndex)
    &&e.golemAttackIndex>=0?e.golemAttackIndex:0,name=names[index%3],a=GOLEM_ATTACKS[name];
  const startReach=a.reach+(name==='press'?.8:0)-.1;
  if(allowAttack&&e.cooldown<=0&&d<=startReach&&!blocked(e,player,map)){
    e.golemAttack=name;e.golemAttackIndex=index+1;e.mode='windup';e.timer=0;e.hitFired=false;
    return true;
  }
  if(d>1.3&&d<10)move(e.fx,e.fy,Math.min(CORPSE_GOLEM.speed*dt,d-1.3));
  return true;
}

// GOLEM_MOTION_WRAPPER_V4
export function stepCorpseGolem(args){
 const e=args.enemy,before={x:e.x,y:e.y};
 const handled=stepCorpseGolemCore(args);
 if(handled&&e.archetype==='corpse-golem'&&e.hp>0&&e.mode!=='dead'&&Number.isFinite(args.dt)&&args.dt>0)updateGolemMotion(e,args.dt,before);
 return handled;
}
