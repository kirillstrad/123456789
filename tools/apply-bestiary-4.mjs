import fs from 'node:fs';
const w='src/game/combat-world.ts',marker='// MARROW_ARCHER_CONNECTED_V1';
if(fs.readFileSync(w,'utf8').includes(marker)){console.log('Archer already connected; rebuild and test');process.exit(0);}
const pending=new Map(),read=p=>pending.get(p)??fs.readFileSync(p,'utf8');
function edit(p,a,b,count=1){const t=read(p);if(t.split(a).length-1!==count)throw Error('Unexpected archer context: '+p+' / '+a.slice(0,80));pending.set(p,t.split(a).join(b));}
if(!read(w).includes('startUndeadTrial():void'))throw Error('Requires applied and verified patch 3');
edit(w,"import {LAMP_LIFE","import {createArrowSystem,stepMarrowArcher} from '../combat/marrow-archer.js';\nimport {LAMP_LIFE");
edit(w,'private sweepElapsed:number|null=null;','private readonly arrowSystem=createArrowSystem();private arrowVictoryPending=false;private sweepElapsed:number|null=null;');
edit(w,'reset():void{this.current=initial();','reset():void{this.arrowSystem.reset();this.arrowVictoryPending=false;this.current=initial();');
edit(w,'const roster=enemies.map(e=>({...e}));','this.arrowSystem.reset();this.arrowVictoryPending=false;const roster=enemies.map(e=>({...e}));');
edit(w,"phase:'playing',particles:[],cone:null};","phase:'playing',arrows:[],particles:[],cone:null};");
edit(w,"if(struck&&!aliveEnemies(s).length){s.phase='won';s.note='The nave is silent.';}","if(struck&&!aliveEnemies(s).length){this.arrowVictoryPending=this.arrowSystem.snapshot().length>0;if(!this.arrowVictoryPending){s.phase='won';s.note='The nave is silent.';}}");
edit(w,"if(!aliveEnemies(s).length)s.phase='won';","if(!aliveEnemies(s).length){this.arrowVictoryPending=this.arrowSystem.snapshot().length>0;if(!this.arrowVictoryPending)s.phase='won';}",2);
edit(w,'private stepEnemies(dt:number,excludeId:number|null=null,landing:Point|null=null):void{stepEnemyGroup(this.current,dt,this.map,n=>this.damage(n),enemyStep,excludeId,landing);}',`private stepEnemies(dt:number,excludeId:number|null=null,landing:Point|null=null):void{const s=this.current;stepEnemyGroup(s,dt,this.map,n=>this.damage(n),(e,t,p,map,damage,allowAttack)=>{if(e.archetype==='marrow-archer')stepMarrowArcher({enemy:e,dt:t,player:p,map,enemies:enemiesOf(s),allowAttack,solid,shoot:(owner,direction)=>this.arrowSystem.spawn(owner,direction)});else enemyStep(e,t,p,map,damage,allowAttack);},excludeId,landing);const hadShots=this.arrowSystem.snapshot().length>0;this.arrowSystem.step({dt,player:s,previousPlayer:this.previous,map:{bounds:{minX:1.7,maxX:16,minY:1.7,maxY:16},...this.map},enemies:enemiesOf(s),damage:n=>this.damage(n)});if(s.phase!=='playing'){this.arrowSystem.reset();this.arrowVictoryPending=false;}s.arrows=this.arrowSystem.snapshot();if(hadShots&&!aliveEnemies(s).length)this.arrowVictoryPending=true;if(this.arrowVictoryPending&&s.phase==='playing'&&!s.arrows.length&&!aliveEnemies(s).length&&!s.execution&&!s.interaction&&!s.dash){s.phase='won';s.note='The nave is silent.';this.arrowVictoryPending=false;}}`);
edit(w,'dashReady():boolean{',`startArcherTrial():void{this.setEncounter([makeBestiaryEnemy('marrow-archer',1,8.7,6.6),makeBestiaryEnemy('bonebound',2,7,9),makeBestiaryEnemy('ossuary-guard',3,10,9)]);}
dashReady():boolean{`);
edit(w,'return{...s,interaction:s.interaction?', 'return{...s,arrows:(s.arrows??[]).map(a=>({...a,x:m(a.previousX,a.x),y:m(a.previousY,a.y)})),interaction:s.interaction?');
pending.set(w,marker+'\n'+read(w));
edit('src/combat/types.ts','export interface CombatSnapshot extends State{','export interface CombatSnapshot extends State{arrows?:import(\'./marrow-archer.js\').Arrow[];');
edit('src/combat/bestiary.js',"import {COMBAT}","import {MARROW_ARCHER} from './marrow-archer.js';\nimport {COMBAT}");
edit('src/combat/bestiary.js','const profiles={...MELEE_UNDEAD,',"const profiles={...MELEE_UNDEAD,'marrow-archer':MARROW_ARCHER,");
edit('src/render/enemy.js','export function enemyParts(e){',"import {marrowArcherParts} from './marrow-archer.js';\nexport function enemyParts(e){if(e.archetype==='marrow-archer')return marrowArcherParts(e);");
edit('src/app/main.js',"import {gameLevel","import {arrowParts} from '../render/marrow-archer.js';\nimport {gameLevel");
edit('src/app/main.js','...enemyGroups.flatMap(g=>g.parts),...hero.parts','...enemyGroups.flatMap(g=>g.parts),...arrowParts(s.arrows??[]),...hero.parts');
edit('src/app/main.js',"$('undeadTrial').onclick=()=>launchLevel('undead-trial');","$('undeadTrial').onclick=()=>launchLevel('undead-trial');$('archerTrial').onclick=()=>launchLevel('archer-trial');");
edit('src/app/index.html','<button id="undeadTrial">UNDEAD TRIAL</button>','<button id="undeadTrial">UNDEAD TRIAL</button><button id="archerTrial">ARCHER TRIAL</button>');
edit('src/levels/registry.js','];\nexport const GAME_LEVELS'," {id:'archer-trial',title:'ARCHER TRIAL',description:'Marrow Archer with two melee allies. Draft balance.',status:'prototype'},\n];\nexport const GAME_LEVELS");
edit('src/levels/registry.js',"gameLevel(id);if(id==='undead-trial')","gameLevel(id);if(id==='archer-trial'){world.startArcherTrial();return;}if(id==='undead-trial')");
edit('src/levels/runtime.js',"if(id==='test-chamber'||id==='bonebound-trial'||id==='undead-trial'){","if(id==='test-chamber'||id==='bonebound-trial'||id==='undead-trial'||id==='archer-trial'){");
edit('tests/levels-v1.test.mjs',"['test-chamber','ashen-nave','bonebound-trial','undead-trial']","['test-chamber','ashen-nave','bonebound-trial','undead-trial','archer-trial']");
edit('tools/enemy-health-browser-check.mjs',' assert.deepEqual(report.errors,[]);report.ok=true;',` await run('Archer mixed trial renders released arrows and restart clears them',async()=>{await page.locator('#archerTrial').click();await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.freeze();a.render();});let s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.deepEqual(s.enemies.map(e=>e.archetype),['marrow-archer','bonebound','ossuary-guard']);let seen=false;for(let i=0;i<30;i++){await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.advance(.1);a.render();});s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());if(s.arrows?.length){seen=true;break;}}assert.ok(seen,'a real arrow must be released');await page.screenshot({path:dir+'/archer-shot.png'});await page.locator('#restart').click();s=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());assert.equal(s.enemies.length,3);assert.equal((s.arrows??[]).length,0);});
 assert.deepEqual(report.errors,[]);report.ok=true;`);
for(const[p,text]of pending)fs.writeFileSync(p,text);
console.log('Archer integration applied; full checks and visual acceptance required');
