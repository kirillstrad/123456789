import {enemyDefinition} from './bestiary.js';
export const enemiesOf=s=>Array.isArray(s.enemies)?s.enemies:(s.enemy?[s.enemy]:[]);
export const aliveEnemies=s=>enemiesOf(s).filter(e=>e.hp>0&&e.mode!=='dead');
export const enemyRadius=e=>e.radius??enemyDefinition(e.archetype).radius;
export const enemyMaxHp=e=>e.maxHp??enemyDefinition(e.archetype).maxHp;
export const actorCanOccupy=(s,x,y,r=.24)=>aliveEnemies(s).every(e=>Math.hypot(x-e.x,y-e.y)>=r+enemyRadius(e));
export function cloneEnemyRoster(previous,current,t=1){t=Math.max(0,Math.min(1,t));const old=new Map(enemiesOf(previous).map(e=>[e.id,e]));return enemiesOf(current).map(e=>{const p=old.get(e.id)??e;return{...e,x:p.x+(e.x-p.x)*t,y:p.y+(e.y-p.y)*t};});}
export function stepEnemyGroup(s,dt,map,damage,step,excludeId=null,landing=null){
 const living=aliveEnemies(s).sort((a,b)=>a.id-b.id);let slots=living.filter(e=>e.id!==excludeId&&e.mode==='windup').length;
 const offset=living.length?Math.floor(s.time*2)%living.length:0;
 for(const e of [...living.slice(offset),...living.slice(0,offset)]){
  if(s.phase!=='playing')break;if(e.id===excludeId)continue;
  const local={...map,circles:[...map.circles,...living.filter(o=>o.id!==e.id&&o.hp>0).map(o=>({x:o.x,y:o.y,r:enemyRadius(o)}))]};
  const old={x:e.x,y:e.y,walkDistance:e.walkDistance},was=e.mode==='windup';
  step(e,dt,s,local,damage,was||slots<2);
  if(!was&&e.mode==='windup')slots++;if(was&&e.mode!=='windup')slots--;
  if(landing&&Math.hypot(e.x-landing.x,e.y-landing.y)<Math.max(.66,enemyRadius(e)+.24))Object.assign(e,old);
 }
}
