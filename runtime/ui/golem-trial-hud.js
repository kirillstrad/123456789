import {paintRenderedEnemyHealth} from './rendered-enemy-health.js';
import {paintStoneHealth} from './stone-health.js';
const center=(s,n)=>{s=String(s).replace(/[\r\n\t]/g,' ').slice(0,n);const left=Math.floor((n-s.length)/2);return' '.repeat(left)+s+' '.repeat(n-s.length-left);};
export function golemHudRows(boss,width=80,{available=false}={}){
 if(!Number.isFinite(boss?.hp)||!Number.isFinite(boss?.maxHp)||boss.maxHp<=0)return[];
 const n=Math.max(32,Math.min(92,Number.isFinite(width)?Math.floor(width):80)),inner=n-4,hp=Math.max(0,Math.min(boss.maxHp,boss.hp)),slots=n-6,fill=hp>0?Math.max(1,Math.round(slots*hp/boss.maxHp)):0;
 const carved=n=>{const a='=<>=';return Array.from({length:n},(_,i)=>a[i%a.length]).join('');};
 return[' /'+carved(n-4)+'\\ ','| '+center('/|\\  CORPSE GOLEM  /|\\',inner)+' |','| '+center('---<+>---{ X }---<+>---',inner)+' |','|<['+'#'.repeat(fill)+':'.repeat(slots-fill)+']>|','| '+center(`${hp} / ${boss.maxHp}`,inner)+' |',' \\'+carved(n-4)+'/ ',center(available?'R — Последний уголь':'',n)].map(s=>s.length<n?s+' '.repeat(n-s.length):s.slice(0,n));
}
export function paintGolemTrialHud(ctx,s,{width,enabled,available}){
 const a=s.bossEncounter;if(!enabled||!a?.inRoom||!a.active||s.phase==='dead')return;
 const boss=(s.enemies??[s.enemy]).find(e=>e.id===a.bossId);if(!boss)return;
 paintRenderedEnemyHealth(ctx,boss,{width,height:864,y:10,boss:true,time:s.time,available:available&&!s.execution});
}
