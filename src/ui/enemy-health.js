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
export function paintEnemyHealth(ctx,view,{width,height=720}={}){
 if(!ctx||!Number.isFinite(width)||width<160||height<100)return;
 ctx.save();try{ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.textAlign='center';ctx.textBaseline='middle';
  function bar(e,y,boss){if(!e)return;const w=Math.min(width-32,boss?620:340),x=(width-w)/2,h=boss?15:10;ctx.fillStyle='#111014';ctx.fillRect(x-5,y-5,w+10,h+10);ctx.strokeStyle='#665b4c';ctx.lineWidth=2;ctx.strokeRect(x-4,y-4,w+8,h+8);ctx.fillStyle='#2b1519';ctx.fillRect(x,y,w,h);ctx.fillStyle='#8e2533';ctx.fillRect(x,y,w*Math.max(0,Math.min(1,e.fraction)),h);ctx.fillStyle='#b9a58a';ctx.fillRect(x-8,y-2,5,h+4);ctx.fillRect(x+w+3,y-2,5,h+4);ctx.font=boss?'16px monospace':'13px monospace';ctx.fillStyle='#e2c79f';ctx.fillText(String(e.name).toUpperCase(),width/2,y-18);ctx.font='12px monospace';ctx.fillStyle='#e8dac5';ctx.fillText(String(Number(e.hp.toFixed(1)))+' / '+String(Number(e.maxHp.toFixed(1))),width/2,y+h+17);}
  bar(view?.boss,48,true);bar(view?.target,view?.boss?120:43,false);
 }finally{ctx.restore();}
}
