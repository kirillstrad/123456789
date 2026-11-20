// Provisional tuning, not final balance.
export const MELEE_UNDEAD=Object.freeze(Object.fromEntries(Object.entries({
 'ossuary-guard':{name:'Ossuary Guard',maxHp:80,damage:14,radius:.38,speed:.62,windup:.95,recover:1.1,reach:1.4,cooldown:1.65,stagger:.45,arc:85},
 gravebearer:{name:'Coffin Bearer',maxHp:96,damage:20,radius:.4,speed:.48,windup:1.45,recover:1.6,reach:2.1,cooldown:2.2,stagger:.55,arc:160},
 'bloated-remnant':{name:'Bloated Remnant',maxHp:110,damage:16,radius:.54,speed:.42,windup:1.1,recover:1.35,reach:1.35,cooldown:1.8,stagger:.55,arc:110},
 ashbound:{name:'Ashbound',maxHp:32,damage:7,radius:.28,speed:1.18,windup:.48,recover:.85,reach:1.05,cooldown:1.15,stagger:.4,arc:70}
}).map(([id,p])=>[id,Object.freeze({id,category:'undead',...p})])));
export function stepMeleeEnemy({enemy:e,dt,player,map,damage,allowAttack=true,solid,blocked}){
 const p=MELEE_UNDEAD[e.archetype];if(!p)return false;
 if(!Number.isFinite(dt)||dt<=0||e.hp<=0||e.mode==='dead')return true;
 e.cooldown=Math.max(0,e.cooldown-dt);const before=e.timer;e.timer+=dt;
 const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);
 if(e.mode==='stagger'){if(e.timer>=p.stagger){e.mode='chase';e.timer=0;}return true;}
 if(e.mode==='windup'){
  if(!e.hitFired&&before<p.windup&&e.timer>=p.windup){
   e.hitFired=true;
   if(d<=p.reach&&(d<1e-8||(dx*e.fx+dy*e.fy)/d>=Math.cos(p.arc*Math.PI/360))&&!blocked(e,player,map))damage(p.damage);
   e.mode='recover';e.timer=0;e.cooldown=p.cooldown;
  }return true;
 }
 if(e.mode==='recover'){if(e.timer>=p.recover){e.mode='chase';e.timer=0;}return true;}
 if(e.mode==='wait'){if(d<5&&!blocked(e,player,map)){e.mode='chase';e.timer=0;}return true;}
 if(e.mode!=='chase')return true;
 if(d>1e-8){e.fx=dx/d;e.fy=dy/d;}
 if(allowAttack&&e.cooldown<=0&&d<=p.reach-.12&&!blocked(e,player,map)){e.mode='windup';e.timer=0;e.hitFired=false;return true;}
 const clearance=p.radius+.24+.03;
 if(d>clearance&&d<8){
  const oldX=e.x,oldY=e.y,step=Math.min(p.speed*dt,d-clearance),x=e.x+e.fx*step,y=e.y+e.fy*step;
  if(!solid(x,e.y,map,p.radius)&&Math.hypot(x-player.x,e.y-player.y)>=clearance)e.x=x;
  if(!solid(e.x,y,map,p.radius)&&Math.hypot(e.x-player.x,y-player.y)>=clearance)e.y=y;
  e.walkDistance+=Math.hypot(e.x-oldX,e.y-oldY);
 }return true;
}
