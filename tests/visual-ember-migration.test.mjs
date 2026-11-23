import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {reconcileFirePresentation as reconcile} from '../tools/visual-ember-fire-migration.mjs';
const render=(body,core)=>`const part={c:[${body}]};flames.push({...part,c:[${core}]});`;
const legacy=render('255,166,78','255,245,220');
const amber=render('243,161,59','255,208,120');
const current=render('237,204,143','255,235,187');
const old='assert.ok(flames.some(p=>p.kind===2&&p.c[1]===245));';
const warm='assert.ok(flames.every(p=>p.c[0]>p.c[1]&&p.c[1]>p.c[2]));';
const assertion=color=>`assert.ok(flames.some(p=>p.kind===2&&p.c.every((n,i)=>n===[${color}][i])));`;
const amberTest=assertion('255,208,120')+warm,currentTest=assertion('255,235,187')+warm;
for(const [name,renderer,inputTest,expectedRenderer,expectedTest] of [
 ['legacy',legacy,old,amber,amberTest],
 ['amber',amber,amberTest,amber,amberTest],
 ['current',current,currentTest,current,currentTest],
 ['current renderer and legacy test',current,old,current,currentTest],
 ['current renderer and amber test',current,amberTest,current,currentTest],
 ['amber renderer and newer test',amber,currentTest,amber,amberTest]
])test('reconciles '+name+' and is idempotent',()=>{
 const result=reconcile(renderer,inputTest);
 assert.equal(result.renderer,expectedRenderer);assert.equal(result.test,expectedTest);
 assert.deepEqual(reconcile(result.renderer,result.test),result);
});
test('adds the all-flames warm-color assertion once',()=>{
 const r=reconcile(current,assertion('255,235,187'));assert.equal(r.test,currentTest);
});
test('rejects unknown renderer',()=>assert.throws(()=>reconcile(render('1,2,3','4,5,6'),currentTest),/renderer palette/));
test('rejects mixed palettes',()=>assert.throws(()=>reconcile(render('237,204,143','255,208,120'),currentTest),/renderer palette/));
test('rejects duplicate renderer anchors',()=>assert.throws(()=>reconcile(current+'const x={c:[255,235,187]};',currentTest),/duplicate/));
test('rejects unknown test assertions',()=>assert.throws(()=>reconcile(current,'assert.ok(flames.length);'),/presentation test/));
test('rejects duplicate test assertions',()=>assert.throws(()=>reconcile(current,currentTest+old),/duplicate/));
function fixture(t,renderer,inputTest,{legacyHost=false,pendingRepair=false}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'visual-ember-migration-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const files={
  'src/app/main.js':legacyHost?"v:l.power}))\n...(ritualArt?.lights??[])\n,f=0;for(const q of lights){\nl+=Math.exp(-(dx*dx+dy*dy)/(2*q.r*q.r))*q.v;\nif(h)l=Math.max(.3,Math.min(.8,l));\nwarm=Math.min(1,n*lampProfile.warmth+f)\ndata[k]*=base*(1+warm*.19);data[k+1]*=base*(1-warm*.1);data[k+2]*=base*(1-warm*.32);\nimport {createCombatDoorEnvironment} from '../render/combat-door-environment.js';":"// VISUAL_EMBER_ASCII_V1\nimport {createCombatDoorEnvironment,fireWarmthOf} from '../render/combat-door-environment.js';\nfireWarmth:fireWarmthOf(l)",
  'src/ui/enemy-health.js':'export function paintEnemyHealth(ctx,view,{width,height=720}={}){return 1;}',
  'src/render/hero-backdrop.js':'const strength=.13;',
  'src/render/hero-appearance.ts':'return [139,129,117].map((n,i)=>Math.round((n+([200,185,158][i]!-n)*lift)*shade));',
  'src/render/fire-feedback.js':'const p={c:[205,232,255]};',
  'tools/enemy-health-browser-check.mjs':"  const pixel=await page.evaluate(()=>1);await page.screenshot({path:dir+'/hover.png'});",
  'src/render/combat-door-environment.js':'const warmFireLights=new WeakSet();\n...markFireLights(lighting.getFrame().lights),',
  'src/render/fire-presentation.js':renderer,
  'tests/package-two-fire-presentation.test.mjs':inputTest,
  'tests/package-two-fire-feedback.test.mjs':pendingRepair?'one persistent cool wisp and wick remain visible without lantern illumination\np.c[2]>p.c[0]':'one persistent amber wisp and wick remain visible without lantern illumination\np.c[0]>p.c[1]&&p.c[1]>p.c[2]&&p.c.every((n,i)=>n===[243,161,59][i])'
 };
 for(const [name,source]of Object.entries(files)){const p=path.join(dir,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,source);}
 for(const name of ['apply-visual-ember.mjs','visual-ember-fire-migration.mjs'])fs.copyFileSync(new URL('../tools/'+name,import.meta.url),path.join(dir,'tools',name));
 return {dir,files,run:()=>spawnSync(process.execPath,['tools/apply-visual-ember.mjs'],{cwd:dir,encoding:'utf8'}),read:name=>fs.readFileSync(path.join(dir,name),'utf8')};
}
test('actual installer accepts current fixture twice without rewriting any fixture file',t=>{
 const f=fixture(t,current,currentTest);
 for(let i=0;i<2;i++){const result=f.run();assert.equal(result.status,0,result.stderr);for(const [name,source]of Object.entries(f.files))assert.equal(f.read(name),source,name);}
});
test('actual installer migrates original host and legacy palette then runs twice identically',t=>{
 const f=fixture(t,legacy,old,{legacyHost:true,pendingRepair:true}),first=f.run();assert.equal(first.status,0,first.stderr);
 assert.equal(f.read('src/render/fire-presentation.js'),amber);assert.equal(f.read('tests/package-two-fire-presentation.test.mjs'),amberTest);
 const after=Object.fromEntries(Object.keys(f.files).map(name=>[name,f.read(name)]));
 const second=f.run();assert.equal(second.status,0,second.stderr);
 for(const [name,source]of Object.entries(after))assert.equal(f.read(name),source,name);
});
test('actual installer fails before writing queued repairs for unknown assertions',t=>{
 const f=fixture(t,current,'unknown test',{pendingRepair:true}),result=f.run();assert.notEqual(result.status,0);assert.match(result.stderr,/Unexpected fire presentation test/);
 for(const [name,source]of Object.entries(f.files))assert.equal(f.read(name),source,name);
});
