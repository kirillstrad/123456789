export function createEnemyHealthModel({linger=2,defaultMaxHp=70}={}){
 let scope,clock=-Infinity,selected=null,until=-Infinity;const seen=new Set();
 function reset(){scope=undefined;clock=-Infinity;selected=null;until=-Infinity;seen.clear();}
 function update({enemies=[],time,worldKey,hoverId=null,visibleIds=[],hits=[],bossId=null,inBossRoom=false,enabled=true}={}){
  if(!Number.isFinite(time)){reset();return{target:null,boss:null};}
  if(scope!==worldKey||time<clock){reset();scope=worldKey;}clock=time;
  const duplicate=new Set(),byId=new Map(),visible=new Set(visibleIds);
  for(const e of enemies){if(!e||!Number.isSafeInteger(e.id))continue;if(byId.has(e.id))duplicate.add(e.id);byId.set(e.id,e);}
  function entry(id){const e=byId.get(id),max=e?.maxHp??defaultMaxHp;if(!e||duplicate.has(id)||!Number.isFinite(e.hp)||e.hp<=0||!Number.isFinite(max)||max<=0)return null;const hp=Math.min(max,e.hp);return{id:e.id,name:e.name??(e.archetype==='bonebound'?'Bonebound':'Test Warden'),hp,maxHp:max,fraction:hp/max};}
  if(!enabled)return{target:null,boss:null};
  const fresh=[];for(const hit of hits){if(hit?.type!=='hit'||!Number.isFinite(hit.time)||hit.time>time||!Number.isSafeInteger(hit.targetId))continue;const key=JSON.stringify([hit.time,hit.attackId??null,hit.targetId]);if(seen.has(key))continue;seen.add(key);if(visible.has(hit.targetId)&&entry(hit.targetId))fresh.push(hit);}
  while(seen.size>512)seen.delete(seen.values().next().value);
  fresh.sort((a,b)=>b.time-a.time||a.targetId-b.targetId);
  if(visible.has(hoverId)&&entry(hoverId)){selected=hoverId;until=time+linger;}
  else if(fresh.length&&time-fresh[0].time<=linger){selected=fresh[0].targetId;until=fresh[0].time+linger;}
  let target=time<=until&&visible.has(selected)?entry(selected):null;if(!target)selected=null;
  const boss=inBossRoom?entry(bossId):null;if(boss&&target?.id===boss.id)target=null;return{target,boss};
 }
 return Object.freeze({update,reset});
}
export {paintAsciiEnemyHealth as paintEnemyHealth} from './enemy-health-ascii.js';
