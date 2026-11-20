import {corpseGolemParts} from './corpse-golem.js';
import {enemyParts} from './enemy.js';
import {foldUndeadParts} from './undead-execution-fold.js';
import {enemyMaxHp} from '../combat/enemy-roster.js';
import {EXECUTION,executionTargetWeak,executionPresentation} from '../combat/execution.js';
export function executionEnemyParts(enemy,s){
if(enemy.archetype==='corpse-golem')return corpseGolemParts(enemy,s);
const e=s.execution?.targetId===enemy.id?s.execution:null;
if(e){const visual=executionPresentation(e),t=e.elapsed,struggle=t>=EXECUTION.pin&&!e.extracted?(1-visual.char*.94):0,original=enemyParts({...enemy,hp:Math.max(1,enemy.hp),mode:'wait',walkDistance:0,undeadMotion:null,archerLocked:false},s);return foldUndeadParts(original,enemy,e,visual,struggle);}

let parts=enemyParts(enemy,s);if(enemy.charred)return parts.map(p=>({...p,c:'#282521'}));
if(s.phase==='playing'&&executionTargetWeak({...enemy,maxHp:enemyMaxHp(enemy)})){const n=40,z=1.96+Math.sin(s.time*3)*.025;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,v=[[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z],[enemy.x+Math.cos(b)*.27,enemy.y+Math.sin(b)*.27,z]];parts.push({kind:1,v,c:'#ffc477',w:2,hero:false,d:enemy.x+enemy.y+z*.006+.015});}for(let i=0;i<10;i++){const a=i/10*Math.PI*2+s.time*.4,v=[[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z],[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z+.06+Math.sin(s.time*7+i)*.03]];parts.push({kind:1,v,c:'#ef973f',w:1.3,hero:false,d:enemy.x+enemy.y+z*.006+.02});}}
return parts;
}
