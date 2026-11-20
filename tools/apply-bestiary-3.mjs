import fs from 'node:fs';
const pending=new Map(),read=p=>pending.get(p)??fs.readFileSync(p,'utf8');
function edit(p,a,b){const t=read(p);if(t.includes(b))return;if(t.split(a).length!==2)throw Error('Unexpected patch context: '+p+' / '+a);pending.set(p,t.replace(a,b));}
if(!fs.existsSync('src/combat/bestiary.js'))throw Error('Apply patch 1 and its hit-phase repair first');
edit('src/combat/bestiary.js',"const profiles={","import {MELEE_UNDEAD} from './melee-undead.js';\nconst profiles={...MELEE_UNDEAD,");
edit('src/combat/enemy.ts',"import {COMBAT}","import {stepMeleeEnemy} from './melee-undead.js';\nimport {COMBAT}");
edit('src/combat/enemy.ts','const profile=enemyDefinition(e.archetype);',"if(stepMeleeEnemy({enemy:e,dt,player,map,damage,allowAttack,solid,blocked}))return;const profile=enemyDefinition(e.archetype);");
edit('src/render/enemy.js','export function enemyParts(e){',"import {meleeUndeadParts} from './melee-undead.js';\nexport function enemyParts(e){const undead=meleeUndeadParts(e);if(undead)return undead;");
const w='src/game/combat-world.ts';
edit(w,'private stepEnemies(',`startUndeadTrial():void{const kinds=['bonebound','ossuary-guard','gravebearer','bloated-remnant','ashbound'],positions=[[8.7,8.1],[7,8],[10.1,7.8],[7,10],[10,10]];this.setEncounter(kinds.map((kind,i)=>makeBestiaryEnemy(kind,i+1,positions[i]![0]!,positions[i]![1]!)));}
private stepEnemies(`);
edit('src/levels/registry.js','];\nexport const GAME_LEVELS'," {id:'undead-trial',title:'UNDEAD TRIAL',description:'Five distinct melee undead. Provisional balance.',status:'prototype'},\n];\nexport const GAME_LEVELS");
edit('src/levels/registry.js',"gameLevel(id);if(id==='bonebound-trial')","gameLevel(id);if(id==='undead-trial'){world.startUndeadTrial();return;}if(id==='bonebound-trial')");
edit('src/levels/runtime.js',"if(id==='test-chamber'||id==='bonebound-trial'){","if(id==='test-chamber'||id==='bonebound-trial'||id==='undead-trial'){");
edit('src/app/index.html','<button id="bestiaryTrial">BONEBOUND TRIAL</button>','<button id="bestiaryTrial">BONEBOUND TRIAL</button><button id="undeadTrial">UNDEAD TRIAL</button>');
edit('src/app/main.js',"$('bestiaryTrial').onclick=startBoneboundTrial;","$('bestiaryTrial').onclick=startBoneboundTrial;$('undeadTrial').onclick=()=>launchLevel('undead-trial');");
edit('tests/levels-v1.test.mjs',"['test-chamber','ashen-nave','bonebound-trial']","['test-chamber','ashen-nave','bonebound-trial','undead-trial']");
for(const p of ['tools/fix-bestiary-hit-phase.mjs','tools/enemy-health-browser-check.mjs']){
 edit(p,'const hp=await state();if(!hp.target)continue;',"const hp=await state();if(hp.hoverId===null)continue;assert.ok(hp.target,'hovered enemy must have an HP panel');");
}
const browser='tools/enemy-health-browser-check.mjs',end=' assert.deepEqual(report.errors,[]);report.ok=true;',caseName='mixed melee trial exposes five archetypes and survives restart';
if(!read(browser).includes(caseName))edit(browser,end,` await run('${caseName}',async()=>{
 await page.locator('#undeadTrial').click();await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});
 const check=async()=>{const s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,5);assert.deepEqual(s.enemies.map(e=>e.archetype),['bonebound','ossuary-guard','gravebearer','bloated-remnant','ashbound']);assert.ok(s.enemies.every(e=>e.hp===e.maxHp&&e.hp>0));};
 await check();await page.screenshot({path:dir+'/mixed-undead.png'});await page.locator('#restart').click();await check();
 });
`+end);
for(const[p,t]of pending)fs.writeFileSync(p,t);
console.log('Patch 3 applied locally. Build, all tests, browser and visual acceptance are still required.');
