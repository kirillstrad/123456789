export const GOLEM_PREPARE=1,GOLEM_DEATH=.9;
export function createGolemTrialController(map,bossId){
 if(!Array.isArray(map?.rects)||Object.isFrozen(map.rects))throw Error('Golem requires a mutable collision map');
 const rects=map.rects,gate={minX:6.8,maxX:9.2,minY:14.5,maxY:14.75,golemGate:true};
 let status='waiting',elapsed=0;
 function lock(on){if(map.rects!==rects)throw Error('Golem map ownership changed');const i=rects.indexOf(gate);if(on&&i<0)rects.push(gate);if(!on&&i>=0)rects.splice(i,1);}
 const inRoom=s=>s.x>=2.65&&s.x<=13.35&&s.y>=2.65&&s.y<=14.25;
 const snapshot=s=>({bossId,status,inRoom:inRoom(s),active:['preparing','fighting','finishing','dying'].includes(status),locked:!['waiting','won'].includes(status)});
 return {canFight:()=>status==='fighting',reset(){status='waiting';elapsed=0;lock(false);},snapshot,
 step(dt,s){
  if(!Number.isFinite(dt)||dt<0)throw Error('Invalid golem tick');
  const boss=(s.enemies??[s.enemy]).find(e=>e.id===bossId);if(!boss)throw Error('Golem trial lost its boss');
  if(s.phase==='dead'||s.lamp<=0){status='failed';lock(true);s.bossEncounter=snapshot(s);return;}
  if(status==='waiting'&&inRoom(s)){status='preparing';elapsed=0;lock(true);s.note='The gate closes. Prepare.';}
  else if(status==='preparing'){elapsed+=dt;if(elapsed>=GOLEM_PREPARE-1e-9){status='fighting';s.note='CORPSE GOLEM';}}
  if(s.execution?.kind==='corpse-golem')status='finishing';
  else if(boss.hp<=0&&status!=='won'){
   status='dying';boss.deathElapsed=boss.charred?GOLEM_DEATH:(boss.deathElapsed??0)+dt;
   if(boss.deathElapsed>=GOLEM_DEATH-1e-9){status='won';lock(false);s.note='CORPSE GOLEM DEFEATED';}
  }
  if(status!=='waiting'&&status!=='won'){
   s.x=Math.max(2.65,Math.min(13.35,s.x));s.y=Math.max(2.65,Math.min(14.25,s.y));
  }
  s.bossEncounter=snapshot(s);
 }
 };
}
export function stageGolem(s,boss,map,solid,occupy){
 const dx=boss.x-s.x,dy=boss.y-s.y,d=Math.hypot(dx,dy);if(!Number.isFinite(d)||d<1e-8)return null;
 const goal={x:boss.x-dx/d*1.3,y:boss.y-dy/d*1.3},n=Math.max(1,Math.ceil(Math.hypot(goal.x-s.x,goal.y-s.y)/.02));
 for(let i=0;i<=n;i++){const x=s.x+(goal.x-s.x)*i/n,y=s.y+(goal.y-s.y)*i/n;if(solid(x,y,map,.24)||!occupy(s,x,y))return null;}
 return goal;
}
const transient=new Set('x y fx fy time walkDistance moving motion footContacts combatEntry dash dashCooldown execution interaction cameraX cameraY phase action sweepProgress enemy enemies particles cone arrows hitReaction deathTime note bossEncounter'.split(' '));
export function captureGolemLoadout(s){
 if(!Number.isFinite(s?.lamp)||s.lamp<=0||s.phase==='dead')throw Error('Enter GOLEM TRIAL with a living hero');
 const result={};for(const [k,v] of Object.entries(s))if(!transient.has(k))result[k]=structuredClone(v);
 return result;
}
export function restoreGolemLoadout(s,checkpoint){for(const [k,v]of Object.entries(checkpoint))s[k]=structuredClone(v);}
