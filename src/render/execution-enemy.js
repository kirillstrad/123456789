import {enemyParts} from './enemy.js';
import {COMBAT} from '../combat/config.js';
import {EXECUTION,executionTargetWeak,executionPresentation} from '../combat/execution.js';
export function executionEnemyParts(enemy,s){
const e=s.execution?.targetId===enemy.id?s.execution:null;
if(e){const visual=executionPresentation(e),u=visual.pin,fx=e.fx,fy=e.fy,t=e.elapsed,struggle=t>=EXECUTION.pin&&!e.extracted?(1-visual.char*.94):0,original=enemyParts({...enemy,hp:Math.max(1,enemy.hp),mode:'wait',walkDistance:0}).slice(0,-1);return original.map(p=>{const v=p.v.map(([x,y,z])=>{const side=x-enemy.x,forward=(y-enemy.y)*(1-u)+(z-.65)*.75*u,weight=Math.min(1,Math.abs(z-.65)*1.8),shake=Math.sin(t*16+z*9)*.055*struggle*weight;return[enemy.x+fx*forward-fy*(side+shake),enemy.y+fy*forward+fx*(side+shake),Math.max(.025,z*(1-u)+(.12+Math.abs(y-enemy.y)*.08)*u+Math.abs(Math.sin(t*19+z))*struggle*weight*.025)];});const char=enemy.charred?1:visual.char,c=Array.isArray(p.c)?p.c:typeof p.c==='string'&&/^#[0-9a-f]{6}$/i.test(p.c)?[1,3,5].map(i=>parseInt(p.c.slice(i,i+2),16)):[90,70,70];return{...p,v,c:c.map(n=>n*(1-char)+24*char),d:v.reduce((a,q)=>a+q[0]+q[1]+q[2]*.006,0)/v.length+(p.kind===1?.005:0)};});}
let parts=enemyParts(enemy);if(enemy.charred)return parts.map(p=>({...p,c:'#282521'}));
if(s.phase==='playing'&&executionTargetWeak({...enemy,maxHp:COMBAT.enemyLife})){const n=40,z=1.96+Math.sin(s.time*3)*.025;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,v=[[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z],[enemy.x+Math.cos(b)*.27,enemy.y+Math.sin(b)*.27,z]];parts.push({kind:1,v,c:'#ffc477',w:2,hero:false,d:enemy.x+enemy.y+z*.006+.015});}for(let i=0;i<10;i++){const a=i/10*Math.PI*2+s.time*.4,v=[[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z],[enemy.x+Math.cos(a)*.27,enemy.y+Math.sin(a)*.27,z+.06+Math.sin(s.time*7+i)*.03]];parts.push({kind:1,v,c:'#ef973f',w:1.3,hero:false,d:enemy.x+enemy.y+z*.006+.02});}}
return parts;
}
