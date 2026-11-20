import {paintRenderedEnemyHealth} from './rendered-enemy-health.js';
import {paintStoneHealth} from './stone-health.js';
const ascii=s=>String(s).replace(/[^\x20-\x7e]/g,'?');
export function enemyHealthRows(e,cols=42){
 if(!e||![e.hp,e.maxHp].every(Number.isFinite)||e.hp<=0||e.maxHp<=0)return [];
 cols=Math.max(18,Math.min(90,Math.floor(cols)));const inner=cols-2,slots=cols-6,hp=Math.min(e.hp,e.maxHp),count=Math.max(1,Math.min(slots,Math.floor(hp/e.maxHp*slots)));
 const center=s=>{s=ascii(s).slice(0,inner);const left=Math.floor((inner-s.length)/2);return ' '.repeat(left)+s+' '.repeat(inner-s.length-left);};
 const name='[ '+ascii(e.name??'UNDEAD').toUpperCase().slice(0,cols-10)+' ]',left=Math.floor((inner-name.length)/2),numbers=String(Number(hp.toFixed(1)))+' / '+String(Number(e.maxHp.toFixed(1)));
 return ['+'+'-'.repeat(left)+name+'-'.repeat(inner-name.length-left)+'+','| ['+'#'.repeat(count)+':'.repeat(slots-count)+'] |','|'+center(numbers)+'|','+'+'='.repeat(inner)+'+'];
}
export function paintAsciiEnemyHealth(ctx,view,{width,height=864}={}){
 if(!ctx||!Number.isFinite(width)||!Number.isFinite(height)||width<120||height<100)return;
 if(view?.boss)paintRenderedEnemyHealth(ctx,view.boss,{width,height,y:10,boss:true});
 if(view?.target)paintRenderedEnemyHealth(ctx,view.target,{width,height,y:view?.boss?105:10});
}
