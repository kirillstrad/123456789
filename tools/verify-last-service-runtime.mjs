import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {createMotion} from '../runtime/animation/motion.js';
import {makeBestiaryEnemy,enemyDefinition} from '../runtime/combat/bestiary.js';
import {solid} from '../runtime/combat/geometry.js';
import {LAMP_LIFE} from '../runtime/combat/lamp-life.js';
import {createLastServiceEntry,LAST_SERVICE_DOOR} from '../runtime/levels/last-service-entry.js';
import {createCombatDoorScene} from '../runtime/game/combat-door-scene.js';
import {enableCombatLights} from '../runtime/game/combat-light-context.js';
import {createRitualBonfire} from '../runtime/interaction/ritual-bonfire.js';
import {LAST_SERVICE_ENCOUNTERS,LAST_SERVICE_SPAWN_RADIUS} from '../runtime/game/last-service-route.js';
import {golemArenaMap} from '../runtime/game/golem-arena.js';
import {captureGolemLoadout,restoreGolemLoadout} from '../runtime/game/golem-trial-state.js';
import {createLastServiceFinale} from '../runtime/game/last-service-finale.js';
import {createKeeperScene} from '../runtime/game/last-service-story.js';
const report={status:'running',scope:'actual compiled core, collision map, attacks, ritual and scripted boss endings; not full-route human gameplay or visual acceptance',checks:[],humanVisualAcceptance:false};
const tick=(w,count,input={x:0,y:0})=>{for(let i=0;i<count;i++)w.step(1/60,input);};
const empty=w=>{w.current.enemies=[];w.current.enemy={...w.current.enemy,hp:0,mode:'dead'};w.previous=w.snapshot();};
try{
 const {doorScene}=createLastServiceEntry(createCombatDoorScene,()=>({parts:[],lights:[]}));enableCombatLights(doorScene);
 for(const tuple of [...LAST_SERVICE_ENCOUNTERS.flatMap(e=>e.enemies),['bloated-remnant',190,18.5,-35.5]]){const e=makeBestiaryEnemy(...tuple);assert.ok(enemyDefinition(tuple[0]).radius<=LAST_SERVICE_SPAWN_RADIUS);assert.equal(solid(e.x,e.y,doorScene.map,e.radius),false,'Blocked enemy '+e.id);}
 report.checks.push('spawn geometry and conservative radius ceiling');
 assert.equal(doorScene.open(LAST_SERVICE_DOOR,1,1),true,'Door sweep is blocked');for(let i=0;i<100;i++)doorScene.step(1/60);assert.equal(doorScene.snapshot().doors[0].status,'open');
 const b=doorScene.map.bounds,h=.25,nx=Math.round((b.maxX-b.minX)/h)+1,ny=Math.round((b.maxY-b.minY)/h)+1;
 const cell=(x,y)=>Math.round((y-b.minY)/h)*nx+Math.round((x-b.minX)/h),queue=[cell(8,18.2)],seen=new Set(queue);
 for(let k=0;k<queue.length;k++){const id=queue[k],x=id%nx,y=Math.floor(id/nx);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,q=Y*nx+X;if(X<0||X>=nx||Y<0||Y>=ny||seen.has(q)||solid(b.minX+X*h,b.minY+Y*h,doorScene.map))continue;seen.add(q);queue.push(q);}}
 for(const [x,y]of [[8,4],[8,-15],[5,-25],[18.5,-35.5],[8,-49]])assert.ok(seen.has(cell(x,y)),'Unreachable route point '+[x,y]);
 report.checks.push('physical door opening and grid connectivity including optional loop');
 const w=new CombatWorld(doorScene.map);Object.assign(w.current,{x:8,y:7.2,fx:0,fy:-1,motion:createMotion(0,-1)});w.setEncounter([makeBestiaryEnemy('bonebound',300,8,6)]);const hp=w.current.enemy.hp;assert.equal(w.attack({kind:'light',aim:{x:8,y:6}}),true);tick(w,90);assert.ok(w.current.enemy.hp<hp,'Real attack did not hit');
 report.checks.push('real light attack damages Bonebound');
 w.reset();empty(w);Object.assign(w.current,{x:5,y:-24.2,lamp:31});const shrine=createRitualBonfire(w,doorScene.map,{origin:{x:5,y:-25},positions:[[5,-25]]});
 assert.equal(shrine.press(),true);for(let i=0;i<210;i++){w.step(1/60);shrine.step();}assert.equal(w.current.lamp,31,'Ignition spent lamp');assert.equal(shrine.press(),true);for(let i=0;i<210;i++){w.step(1/60);shrine.step();}assert.equal(w.current.lamp,LAMP_LIFE.max);assert.equal(shrine.press(),false);
 report.checks.push('ritual ignition, restoration and full-lamp rejection');
 const dependencies={createWorld:map=>new CombatWorld(map),createArena:()=>({doorScene:{map:golemArenaMap()},env:{}}),createKeeper:createKeeperScene,capture:captureGolemLoadout,restore:restoreGolemLoadout};
 for(const ending of ['normal','execution']){
  const f=createLastServiceFinale({...new CombatWorld().current,lamp:37},dependencies),a=f.world;
  assert.equal(a.current.lamp,37);assert.equal(a.current.bossEncounter.locked,true);tick(a,65);assert.equal(a.current.bossEncounter.status,'fighting');
  a.current.y=17;a.step(1/60);assert.ok(a.current.y<=14.25,'Locked exit allowed escape');
  const boss=a.current.enemies[0];Object.assign(a.current,{x:boss.x,y:boss.y+1.3,fx:0,fy:-1,motion:createMotion(0,-1),hitReaction:0});a.previous=a.snapshot();
  boss.hp=ending==='normal'?1:boss.maxHp*.04;
  if(ending==='execution'){assert.equal(a.executionAvailable(),true);assert.equal(a.execute(),true);tick(a,480);assert.equal(boss.charred,true);}else{assert.equal(a.attack({kind:'light',aim:{x:boss.x,y:boss.y}}),true);tick(a,150);}
  assert.equal(boss.hp,0);assert.equal(a.current.execution,null);assert.equal(a.current.bossEncounter.status,'won');const remaining=a.current.lamp;
  for(let i=0;i<900&&f.snapshot().chapter==='boss';i++)f.step(1/60,{x:0,y:1});
  assert.equal(f.snapshot().chapter,'keeper','Reopened exit not traversable');assert.equal(f.world.current.lamp,remaining);assert.equal(f.complete(),true);assert.equal(f.snapshot().done,true);
  report.checks.push('scripted '+ending+' boss ending, arena lock and carried lamp');
 }
 report.status='compiled-core-checks-passed';
}catch(error){report.status='failed';report.error=String(error.stack??error);process.exitCode=1;}
finally{fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/last-service-runtime-verification.json',JSON.stringify(report,null,2));}
