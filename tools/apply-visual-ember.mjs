import fs from 'node:fs';
import {reconcileFirePresentation} from './visual-ember-fire-migration.mjs';
const main='src/app/main.js',marker='// VISUAL_EMBER_ASCII_V1',pending=new Map(),read=p=>pending.get(p)??fs.readFileSync(p,'utf8');
function edit(p,a,b,count=1){const s=read(p);if(s.split(a).length-1!==count)throw Error('Unexpected visual context: '+p+' / '+a.slice(0,70));pending.set(p,s.split(a).join(b));}
function ensure(p,a,b){if(!read(p).includes(b))edit(p,a,b);}
if(!read(main).includes(marker)){
 const hp='src/ui/enemy-health.js',anchor='export function paintEnemyHealth(ctx,view,{width,height=720}={}){',source=read(hp);
 if(source.split(anchor).length!==2)throw Error('Unexpected HP painter context');pending.set(hp,source.slice(0,source.indexOf(anchor))+"export {paintAsciiEnemyHealth as paintEnemyHealth} from './enemy-health-ascii.js';\n");
 edit('src/render/hero-backdrop.js','strength=.13','strength=.15');
 edit('src/render/hero-appearance.ts','return [139,129,117].map((n,i)=>Math.round((n+([200,185,158][i]!-n)*lift)*shade));','return [148,139,126].map((n,i)=>Math.round((n+([222,208,178][i]!-n)*lift)*shade));');
 edit('src/render/fire-feedback.js','c:[205,232,255]','c:[243,161,59]');
 edit(main,'v:l.power}))','v:l.power,fireWarmth:l.fireWarmth??0}))');
 edit(main,'...(ritualArt?.lights??[])','...(ritualArt?.lights??[]).map(l=>({...l,fireWarmth:1}))');
 edit(main,',f=0;for(const q of lights){',',f=0,fireGlow=0;for(const q of lights){');
 edit(main,'l+=Math.exp(-(dx*dx+dy*dy)/(2*q.r*q.r))*q.v;','const glow=Math.exp(-(dx*dx+dy*dy)/(2*q.r*q.r))*q.v;l+=glow;fireGlow+=glow*(q.fireWarmth??0);');
 edit(main,'if(h)l=Math.max(.3,Math.min(.8,l));','if(h)l=Math.max(.38,Math.min(.82,l));');
 edit(main,'warm=Math.min(1,n*lampProfile.warmth+f)','warm=Math.min(1,n*lampProfile.warmth+f+Math.min(1,fireGlow))');
 edit(main,'data[k]*=base*(1+warm*.19);data[k+1]*=base*(1-warm*.1);data[k+2]*=base*(1-warm*.32);','shadeAmberCell(data,k,base,warm,h);');
 pending.set(main,marker+"\nimport {shadeAmberCell} from '../render/amber-cell.js';\n"+read(main));
 const browser='tools/enemy-health-browser-check.mjs',text=read(browser),start='  const pixel=await page.evaluate(',end="await page.screenshot({path:dir+'/hover.png'});";
 if(text.split(start).length!==2||text.split(end).length!==2)throw Error('Unexpected HP browser pixel assertion');const a=text.indexOf(start),b=text.indexOf(end,a);if(b<a)throw Error('Invalid HP browser assertion bounds');
 pending.set(browser,text.slice(0,a)+"  const painted=await page.evaluate(()=>{const c=document.getElementById('game'),d=c.getContext('2d').getImageData(0,0,c.width,85).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]===182&&d[i+1]===92&&d[i+2]===70)n++;return n;});assert.ok(painted>0,'ASCII health fill glyphs must be painted');"+text.slice(b));
}
const env='src/render/combat-door-environment.js';
if(!read(env).includes('const warmFireLights=new WeakSet();'))edit(env,'function feedback(d){',`const warmFireLights=new WeakSet();
function markFireLights(lights){for(const light of lights)if(light&&typeof light==='object')warmFireLights.add(light);return lights;}
export function fireWarmthOf(light){if(Number.isFinite(light?.fireWarmth))return Math.max(0,Math.min(1,light.fireWarmth));return light&&typeof light==='object'&&warmFireLights.has(light)?1:0;}
function feedback(d){`);
const marked='...markFireLights(lighting.getFrame().lights),';
if(!read(env).includes(marked)){const cloned='...lighting.getFrame().lights.map(l=>({...l,fireWarmth:1})),';edit(env,read(env).includes(cloned)?cloned:'...lighting.getFrame().lights,',marked);}
ensure(main,"import {createCombatDoorEnvironment} from '../render/combat-door-environment.js';","import {createCombatDoorEnvironment,fireWarmthOf} from '../render/combat-door-environment.js';");
ensure(main,'fireWarmth:l.fireWarmth??0','fireWarmth:fireWarmthOf(l)');
const feedback='tests/package-two-fire-feedback.test.mjs';
ensure(feedback,'one persistent cool wisp and wick remain visible without lantern illumination','one persistent amber wisp and wick remain visible without lantern illumination');
ensure(feedback,'p.c[2]>p.c[0]','p.c[0]>p.c[1]&&p.c[1]>p.c[2]&&p.c.every((n,i)=>n===[243,161,59][i])');
const fireSource='src/render/fire-presentation.js',fireTest='tests/package-two-fire-presentation.test.mjs';
const reconciled=reconcileFirePresentation(read(fireSource),read(fireTest));
if(reconciled.renderer!==read(fireSource))pending.set(fireSource,reconciled.renderer);
if(reconciled.test!==read(fireTest))pending.set(fireTest,reconciled.test);
for(const[p,s]of pending)fs.writeFileSync(p,s);
console.log('Visual patch prepared or repaired; light identities preserved and amber assertions updated. Full verification required.');
