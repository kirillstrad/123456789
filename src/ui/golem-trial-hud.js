export function paintGolemTrialHud(ctx,s,{width,enabled,available}){
 const a=s.bossEncounter;if(!enabled||!a?.inRoom||!a.active||s.phase==='dead')return;
 const boss=(s.enemies??[s.enemy]).find(e=>e.id===a.bossId);if(!boss)return;
 const hp=Math.max(0,boss.hp),max=boss.maxHp??600,n=Math.max(16,Math.min(70,Math.floor(width/12)-6)),filled=Math.round(n*Math.max(0,Math.min(1,hp/max)));
 ctx.save();ctx.font='14px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(width*.08,12,width*.84,82);
 ctx.fillStyle='#e5bf82';ctx.fillText('CORPSE GOLEM',width/2,30);
 ctx.fillStyle='#c99c5b';ctx.fillText('['+'#'.repeat(filled)+'-'.repeat(n-filled)+']',width/2,52);
 ctx.fillStyle='#e5d5b9';ctx.fillText(`${hp} / ${max}`,width/2,74);
 if(available&&!s.execution){ctx.fillStyle='#ffcb77';ctx.fillText('R — Последний уголь',width/2,116);}
 ctx.restore();
}
