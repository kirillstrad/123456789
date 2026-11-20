import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),planned=new Map(),before=new Map();
function read(name){if(planned.has(name))return planned.get(name);const text=fs.readFileSync(path.join(root,name),'utf8').replace(/\r\n/g,'\n');before.set(name,text);return text;}
function edit(name,oldText,newText,count=1){const text=read(name),found=text.split(oldText).length-1;if(found!==count)throw Error(`${name}: expected ${count} source matches, found ${found}`);planned.set(name,text.split(oldText).join(newText));}
function section(name,start,end,replacement){const text=read(name);if(text.split(start).length!==2||text.split(end).length!==2)throw Error(`${name}: ambiguous section`);const a=text.indexOf(start),b=text.indexOf(end,a);if(b<a)throw Error(`${name}: invalid section`);planned.set(name,text.slice(0,a)+replacement+text.slice(b));}
function add(name,text){if(fs.existsSync(path.join(root,name)))throw Error('New file already exists: '+name);planned.set(name,text);}
if(!['--check','--apply'].includes(process.argv[2]))throw Error('Use --check or --apply from the repository root');
if(!fs.existsSync('src/game/combat-world.ts'))throw Error('Run from the repository root');
add('src/combat/bestiary.js',`import {COMBAT} from './config.js';
const profiles={
 'test-warden':{id:'test-warden',name:'Test Warden',maxHp:COMBAT.enemyLife,damage:COMBAT.enemyDamage,radius:.35,speed:COMBAT.enemySpeed,windup:COMBAT.enemyWindup,recover:COMBAT.enemyRecover,reach:COMBAT.enemyReach,cooldown:COMBAT.enemyCooldown,stagger:COMBAT.staggerDuration},
 bonebound:{id:'bonebound',name:'Bonebound',maxHp:36,damage:8,radius:.32,speed:.8,windup:.72,recover:.8,reach:1.15,cooldown:1.35,stagger:.45}
};
export const BESTIARY=Object.freeze(Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,Object.freeze(v)])));
export function enemyDefinition(id='test-warden'){if(!Object.hasOwn(BESTIARY,id))throw Error('Unknown enemy archetype: '+id);return BESTIARY[id];}
export function makeBestiaryEnemy(archetype,id,x,y){const p=enemyDefinition(archetype);if(!Number.isSafeInteger(id)||id<0||![x,y].every(Number.isFinite))throw Error('Invalid enemy spawn');return{id,archetype,name:p.name,maxHp:p.maxHp,radius:p.radius,x,y,fx:0,fy:1,hp:p.maxHp,mode:'wait',timer:0,cooldown:0,walkDistance:0,hitFired:false};}
`);
add('src/combat/bestiary.d.ts',`import type {Enemy} from './types.js';
export interface EnemyDefinition {readonly id:string;readonly name:string;readonly maxHp:number;readonly damage:number;readonly radius:number;readonly speed:number;readonly windup:number;readonly recover:number;readonly reach:number;readonly cooldown:number;readonly stagger:number}
export const BESTIARY:Readonly<Record<string,EnemyDefinition>>;
export function enemyDefinition(id?:string):EnemyDefinition;
export function makeBestiaryEnemy(archetype:string,id:number,x:number,y:number):Enemy;
`);
add('src/combat/enemy-roster.js',`export const enemiesOf=s=>Array.isArray(s.enemies)?s.enemies:(s.enemy?[s.enemy]:[]);
export const aliveEnemies=s=>enemiesOf(s).filter(e=>e.hp>0&&e.mode!=='dead');
export const enemyRadius=e=>e.radius??.35;
export const enemyMaxHp=e=>e.maxHp??70;
export const actorCanOccupy=(s,x,y,r=.24)=>aliveEnemies(s).every(e=>Math.hypot(x-e.x,y-e.y)>=r+enemyRadius(e));
export function cloneEnemyRoster(previous,current,t=1){t=Math.max(0,Math.min(1,t));const old=new Map(enemiesOf(previous).map(e=>[e.id,e]));return enemiesOf(current).map(e=>{const p=old.get(e.id)??e;return{...e,x:p.x+(e.x-p.x)*t,y:p.y+(e.y-p.y)*t};});}
export function stepEnemyGroup(s,dt,map,damage,step,excludeId=null,landing=null){
 const living=aliveEnemies(s).sort((a,b)=>a.id-b.id);let slots=living.filter(e=>e.id!==excludeId&&e.mode==='windup').length;
 const offset=living.length?Math.floor(s.time*2)%living.length:0;
 for(const e of [...living.slice(offset),...living.slice(0,offset)]){
  if(s.phase!=='playing')break;if(e.id===excludeId)continue;
  const local={...map,circles:[...map.circles,...living.filter(o=>o.id!==e.id&&o.hp>0).map(o=>({x:o.x,y:o.y,r:enemyRadius(o)}))]};
  const old={x:e.x,y:e.y,walkDistance:e.walkDistance},was=e.mode==='windup';
  step(e,dt,s,local,damage,was||slots<2);
  if(!was&&e.mode==='windup')slots++;if(was&&e.mode!=='windup')slots--;
  if(landing&&Math.hypot(e.x-landing.x,e.y-landing.y)<Math.max(.66,enemyRadius(e)+.24))Object.assign(e,old);
 }
}
`);
add('src/combat/enemy-roster.d.ts',`import type {Enemy,CombatSnapshot,Obstacles,Point} from './types.js';
type Roster={enemies?:Enemy[];enemy?:Enemy};
export function enemiesOf(s:Roster):Enemy[];
export function aliveEnemies(s:Roster):Enemy[];
export function enemyRadius(e:Enemy):number;
export function enemyMaxHp(e:Enemy):number;
export function actorCanOccupy(s:Roster,x:number,y:number,r?:number):boolean;
export function cloneEnemyRoster(p:Roster,s:Roster,t?:number):Enemy[];
export function stepEnemyGroup(s:CombatSnapshot,dt:number,map:Obstacles,damage:(n:number)=>void,step:(e:Enemy,dt:number,p:Point,map:Obstacles,damage:(n:number)=>void,allowAttack?:boolean)=>void,excludeId?:number|null,landing?:Point|null):void;
`);
edit('src/combat/types.ts','export interface Enemy{id:number;','export interface Enemy{archetype?:string;name?:string;maxHp?:number;radius?:number;id:number;');
edit('src/combat/types.ts','sweepProgress:number|null;enemy:Enemy;','sweepProgress:number|null;enemies?:Enemy[];enemy:Enemy;');
const w='src/game/combat-world.ts';
edit(w,"import type {Point} from '../combat/types.js';","import type {Point,Enemy} from '../combat/types.js';\nimport {enemyDefinition} from '../combat/bestiary.js';\nimport {enemiesOf,aliveEnemies,enemyRadius,enemyMaxHp,actorCanOccupy,cloneEnemyRoster,stepEnemyGroup} from '../combat/enemy-roster.js';");
edit(w,'function initial():CombatSnapshot{return{','function initial():CombatSnapshot{const enemy=makeEnemy();return{');
edit(w,'enemy:makeEnemy(),particles:[]','enemy,enemies:[enemy],particles:[]');
edit(w,'const s=this.current,e=s.enemy,ox=s.x,oy=s.y,actorFree=(x:number,y:number)=>e.hp<=0||Math.hypot(x-e.x,y-e.y)>.59;','const s=this.current,ox=s.x,oy=s.y,actorFree=(x:number,y:number)=>actorCanOccupy(s,x,y);');
section(w,'private hooks():AttackHooks{','beginInteraction(kind:InteractionKind)',`private hooks():AttackHooks{return{position:()=>this.current,facing:()=>({x:this.current.fx,y:this.current.fy}),lunge:(dx,dy)=>{this.move(dx,dy);},hit:a=>{const s=this.current;for(const e of selectStrikeTargets(s,{x:a.fx,y:a.fy},a.kind,enemiesOf(s),this.map,a.hitIds)){a.hitIds.add(e.id);const amount=a.kind==='heavy'?COMBAT.heavyDamage:COMBAT.lightDamage;e.hp=Math.max(0,e.hp-amount);e.mode=e.hp<=0?'dead':'stagger';e.timer=0;this.record({type:'hit',amount,attackId:a.id,targetId:e.id});this.sparks.spawn([e.x,e.y,.5],a.kind==='heavy'?12:6,1.3);if(e.hp<=0)this.record({type:'enemy-dead',targetId:e.id});}if(!aliveEnemies(s).length){s.phase='won';s.note='The nave is silent.';}}};}
setEncounter(enemies:Enemy[]):void{const s=this.current;if(s.interaction||s.execution||s.dash||this.actions.current||this.sweepElapsed!==null)throw Error('Encounter busy');if(!enemies.length)throw Error('Empty encounter');const ids=new Set<number>();for(const e of enemies){enemyDefinition(e.archetype);if(!Number.isSafeInteger(e.id)||e.id<0||ids.has(e.id)||![e.x,e.y,e.hp,enemyMaxHp(e),enemyRadius(e)].every(Number.isFinite)||e.hp<=0||e.hp>enemyMaxHp(e)||enemyRadius(e)<=0)throw Error('Invalid enemy');if(solid(e.x,e.y,this.map,enemyRadius(e))||Math.hypot(e.x-s.x,e.y-s.y)<enemyRadius(e)+.24)throw Error('Blocked spawn');ids.add(e.id);}for(let i=0;i<enemies.length;i++)for(let j=i+1;j<enemies.length;j++)if(Math.hypot(enemies[i]!.x-enemies[j]!.x,enemies[i]!.y-enemies[j]!.y)<enemyRadius(enemies[i]!)+enemyRadius(enemies[j]!))throw Error('Overlapping spawns');s.enemies=enemies.map(e=>({...e}));s.enemy=s.enemies[0]!;s.phase='playing';this.previous=this.snapshot();}
private stepEnemies(dt:number,excludeId:number|null=null,landing:Point|null=null):void{stepEnemyGroup(this.current,dt,this.map,n=>this.damage(n),enemyStep,excludeId,landing);}
`);
section(w,'executionTargetReady():boolean{','dashReady():boolean{',`executionTargetReady():boolean{const s=this.current;return s.phase==='playing'&&!s.interaction&&!s.execution&&enemiesOf(s).some(e=>executionTargetWeak({...e,maxHp:enemyMaxHp(e)}));}
private executionTarget():Enemy|null{const s=this.current;return aliveEnemies(s).filter(e=>canExecute({...s,busy:!!s.interaction||!!s.execution||!!s.dash||!!this.actions.current||this.sweepElapsed!==null||s.hitReaction>0},{...e,maxHp:enemyMaxHp(e)},blocked(s,e,this.map))).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y)||a.id-b.id)[0]??null;}
executionAvailable():boolean{return this.executionTarget()!==null;}
execute():boolean{const s=this.current,target=this.executionTarget();if(!target)return false;const execution=beginExecution({...s,busy:false},{...target,maxHp:enemyMaxHp(target)},blocked(s,target,this.map));if(!execution)return false;s.execution=execution;target.mode='stagger';target.timer=0;this.actions.clear();s.fx=execution.fx;s.fy=execution.fy;s.motion=createMotion(s.fx,s.fy);s.moving=false;s.footContacts=null;s.combatEntry=null;this.record({type:'execution-start',targetId:target.id});this.sync();return true;}
private stepExecution(dt:number):void{const s=this.current,entry=s.execution;if(!entry)return;const target=enemiesOf(s).find(e=>e.id===entry.targetId);if(!target||(!entry.extracted&&(target.hp<=0||Math.hypot(target.x-entry.targetX,target.y-entry.targetY)>.05))){this.record({type:'execution-cancelled',targetId:entry.targetId});s.execution=null;if(!aliveEnemies(s).length)s.phase='won';this.sync();return;}this.stepEnemies(dt,entry.targetId);if(s.phase!=='playing'){this.sync();return;}const result=advanceExecution(entry,dt,s.lamp>0);s.execution=result.state;s.fx=entry.fx;s.fy=entry.fy;for(const event of result.events){this.record({type:'execution-event',targetId:entry.targetId,executionEvent:event});if(event==='extracted'&&s.lamp>0){target.hp=0;target.mode='dead';target.charred=true;target.timer=0;s.lamp=executionLampAfterExtraction(s.lamp);this.record({type:'enemy-dead',targetId:entry.targetId});}if(event==='finished'){this.record({type:'execution-end',targetId:entry.targetId});s.execution=null;if(!aliveEnemies(s).length)s.phase='won';}}finishMotion(s.motion??=createMotion(),dt,s.fx,s.fy,false,true);s.cameraX+=(s.x-s.cameraX)*Math.min(1,dt*6);s.cameraY+=(s.y-s.cameraY)*Math.min(1,dt*6);this.sync();}
`);
edit(w,'enemyStep(s.enemy,dt,s,this.map,n=>this.damage(n));','this.stepEnemies(dt);',3);
edit(w,'if(s.dash){const reservation={...s.dash},enemyBefore={x:s.enemy.x,y:s.enemy.y,walkDistance:s.enemy.walkDistance};','if(s.dash){const reservation={...s.dash};');
edit(w,'const ex=reservation.startX+reservation.fx*reservation.distance,ey=reservation.startY+reservation.fy*reservation.distance;if(s.enemy.hp>0&&Math.hypot(s.enemy.x-ex,s.enemy.y-ey)<DASH.landingClearance)Object.assign(s.enemy,enemyBefore);','');
edit(w,'advanceDash(s,this.map,dt);finishMotion(s.motion??=createMotion(),dt,s.fx,s.fy,false,true);this.stepEnemies(dt);','advanceDash(s,this.map,dt);finishMotion(s.motion??=createMotion(),dt,s.fx,s.fy,false,true);this.stepEnemies(dt,null,{x:reservation.startX+reservation.fx*reservation.distance,y:reservation.startY+reservation.fy*reservation.distance});');
edit(w,'action.progress=m(p.action.progress,action.progress);return{...s,','action.progress=m(p.action.progress,action.progress);const enemies=cloneEnemyRoster(p,s,t);return{...s,');
edit(w,'enemy:{...s.enemy,x:m(p.enemy.x,s.enemy.x),y:m(p.enemy.y,s.enemy.y)},action,','enemies,enemy:enemies.find(e=>e.id===s.enemy.id)??{...s.enemy},action,');
edit(w,"const s=this.current,i=s.interaction,p=this.previewLampCost(cost);if(s.phase!=='playing'","const s=this.current,i=s.interaction;if(i?.kind==='ignite')return false;const p=this.previewLampCost(cost);if(s.phase!=='playing'");
const e='src/combat/enemy.ts';
edit(e,"import {COMBAT} from './config.js';","import {COMBAT} from './config.js';import {enemyDefinition} from './bestiary.js';");
edit(e,'damage:(n:number)=>void):void{if(e.hp<=0',"damage:(n:number)=>void,allowAttack=true):void{const profile=enemyDefinition(e.archetype);if(e.hp<=0");
for(const [a,b] of [['COMBAT.staggerDuration','profile.stagger'],['COMBAT.enemyWindup','profile.windup'],['COMBAT.enemyReach','profile.reach'],['COMBAT.enemyDamage','profile.damage'],['COMBAT.enemyCooldown','profile.cooldown'],['COMBAT.enemyRecover','profile.recover'],['COMBAT.enemySpeed','profile.speed']]){const text=read(e),n=text.split(a).length-1;if(n)edit(e,a,b,n);}
edit(e,'if(d<.98&&e.cooldown<=0)','if(allowAttack&&d<.98&&e.cooldown<=0&&!blocked(e,player,map))');
edit(e,'if(d<4.3)','if(d<4.3&&!blocked(e,player,map))');
edit(e,'solid(x,e.y,map)','solid(x,e.y,map,e.radius??.35)');
edit(e,'solid(e.x,y,map)','solid(e.x,y,map,e.radius??.35)');
const dash='src/combat/ash-dash.ts';
edit(dash,"import {solid} from './geometry.js';","import {solid} from './geometry.js';\nimport {aliveEnemies,enemyRadius} from './enemy-roster.js';");
edit(dash,'s.enemy.hp>0&&Math.hypot(s.x+fx*distance-s.enemy.x,s.y+fy*distance-s.enemy.y)<DASH.landingClearance','aliveEnemies(s).some(e=>Math.hypot(s.x+fx*distance-e.x,s.y+fy*distance-e.y)<Math.max(DASH.landingClearance,enemyRadius(e)+.24))');
const main='src/app/main.js';
edit(main,"import {gameLevel,GAME_LEVELS,applyLevelSpawn} from '../levels/registry.js';","import {gameLevel,GAME_LEVELS,applyLevelSpawn} from '../levels/registry.js';\nimport {enemiesOf} from '../combat/enemy-roster.js';");
edit(main,'...enemyParts(s.enemy,s),','...enemiesOf(s).flatMap(e=>enemyParts(e,s)),');
const rendering='src/render/execution-enemy.js';
edit(rendering,"import {COMBAT} from '../combat/config.js';","import {enemyMaxHp} from '../combat/enemy-roster.js';");
edit(rendering,'maxHp:COMBAT.enemyLife','maxHp:enemyMaxHp(enemy)');
const effects='src/render/execution-effects.js';
edit(effects,"import {EXECUTION,executionPresentation} from '../combat/execution.js';","import {EXECUTION,executionPresentation} from '../combat/execution.js';\nimport {enemiesOf} from '../combat/enemy-roster.js';");
edit(effects,"if(event.type==='execution-start'){this.target={x:s.execution?.targetX??s.enemy.x,y:s.execution?.targetY??s.enemy.y};this.emit=0;continue;}const q=this.target??s.enemy,origin=[q.x,q.y,.3];","const bound=enemiesOf(s).find(e=>e.id===event.targetId);if(event.type==='execution-start'){this.target=s.execution?.targetId===event.targetId?{x:s.execution.targetX,y:s.execution.targetY}:bound?{x:bound.x,y:bound.y}:null;this.emit=0;continue;}const q=this.target??bound;if(!q)continue;const origin=[q.x,q.y,.3];");
const door='src/interaction/combat-door-controller.js';
edit(door,"import {createLightIgnitionController,IGNITION_POLICY} from './light-ignition-controller.js';","import {createLightIgnitionController} from './light-ignition-controller.js';\nimport {aliveEnemies,enemyRadius} from '../combat/enemy-roster.js';");
edit(door,"scene.setActors?.(()=>[{...world.current,radius:.24},...(world.current.enemy.hp>0?[{...world.current.enemy,radius:.35}]:[])]);","scene.setActors?.(()=>[{...world.current,radius:.24},...aliveEnemies(world.current).map(e=>({...e,radius:enemyRadius(e)}))]);");
edit(door,"  if(route.kind==='ignite'&&s.lamp<IGNITION_POLICY.lampCost+IGNITION_POLICY.reserve){s.note='NOT ENOUGH LAMP TO IGNITE';cancel('insufficient-lamp');world.step(dt,{x:0,y:0});return;}\n",'');
edit(door,"   if(intent.kind==='ignite'&&s.lamp<IGNITION_POLICY.lampCost+IGNITION_POLICY.reserve){s.note='NOT ENOUGH LAMP TO IGNITE';cancel('insufficient-lamp');world.step(dt,input);return;}\n",'');
edit(door,"s.note=started.reason==='insufficient-lamp'?'NOT ENOUGH LAMP TO IGNITE':'IGNITION COULD NOT START';","s.note='IGNITION COULD NOT START';");
const ignition='src/interaction/light-ignition-controller.js';
edit(ignition,'lampCost:6,reserve:1','lampCost:0,reserve:0');
edit(ignition," if(actor.lamp<IGNITION_POLICY.lampCost+IGNITION_POLICY.reserve)return{ok:false,reason:'insufficient-lamp',warning:null};\n",'');
edit(ignition,"warning:actor.lamp-IGNITION_POLICY.lampCost<=IGNITION_POLICY.low?'IGNITION ENTERS LOW LAMP':null","warning:null");
section(ignition,'  if(frame.effectDue&&!current.paid&&!current.failed){','  if(frame.complete)',`  if(frame.effectDue&&!current.paid&&!current.failed){
   if(!scene.canIgnite(current.targetId,current.token)){cancel('target-changed');return null;}
   if(!scene.ignite(current.targetId,current.token))throw Error('Ignition commit invariant failed');
   current.paid=true;s.note='THE LIGHT TAKES HOLD';
  }
`);
const files=[...planned.keys()];
console.log(JSON.stringify({mode:process.argv[2],files,status:'WIP; build and tests not run'},null,2));
if(process.argv[2]==='--apply'){
 const backup=path.join(root,'.bestiary-patch-1-backup');if(fs.existsSync(backup))throw Error('Backup already exists; inspect it before retrying');
 fs.mkdirSync(backup);for(const [name,text]of before){const dest=path.join(backup,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);}
 for(const [name,text]of planned){const dest=path.join(root,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);}
 console.log('WIP source patch applied. Rebuild and run all tests before using PLAY.html.');
}
