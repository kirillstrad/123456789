import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {OBSTACLES,solid} from '../runtime/combat/geometry.js';
import {createCombatDoorScene} from '../runtime/game/combat-door-scene.js';
import {createCombatDoorController} from '../runtime/interaction/combat-door-controller.js';
import {createCombatDoorEnvironment} from '../runtime/render/combat-door-environment.js';
function fixture(){
 const scene=createCombatDoorScene(OBSTACLES),world=new CombatWorld(scene.map),target=scene.targets[0];
 Object.assign(world.current,{x:8,y:5.3,cameraX:8,cameraY:5.3});Object.assign(world.previous,{x:8,y:5.3,cameraX:8,cameraY:5.3});Object.assign(world.current.enemy,{x:15,y:15});
 let intent=null;
 const targeting={intent:()=>intent,cancelIntent:()=>intent=null};
 const owner=createCombatDoorController({world,scene,targeting});
 return{scene,world,owner,target,request:()=>intent={id:1,targetId:target.id,kind:'door',context:'game',approach:target.approach},tick(n,input={x:0,y:0}){for(let i=0;i<n;i++)owner.step(1/60,input);}};
}
test('actual authored door keeps target and frame references stable',()=>{const f=fixture(),parts=f.target.parts,first=parts[0];f.scene.open(f.target.id,1);for(let i=0;i<72;i++)f.scene.step(1/60);assert.equal(f.target.parts,parts);assert.equal(parts[0],first);assert.equal(f.scene.snapshot().angle,-90);});
test('actual collision map blocks closed doorway and retains closure during motion',()=>{const f=fixture(),before=JSON.stringify(f.scene.map);assert.ok(solid(8,2.8,f.scene.map));f.scene.open(f.target.id,1);f.scene.step(1/60);assert.equal(JSON.stringify(f.scene.map),before);for(let i=0;i<72;i++)f.scene.step(1/60);assert.equal(solid(8,2.8,f.scene.map),false);assert.ok(solid(7.2,3.6,f.scene.map),'open leaf remains solid');});
test('actual CombatWorld approaches, animates and traverses without replacing player',()=>{const f=fixture(),actor=f.world.current;f.request();let done=false,sawAnimation=false;for(let i=0;i<600;i++){f.tick(1);sawAnimation||=!!f.owner.decorate(f.world.snapshot()).interactionAnimation;if(f.scene.snapshot().status==='open'&&!f.owner.snapshot().interaction){done=true;break;}}assert.ok(done);assert.ok(sawAnimation);assert.equal(f.world.current,actor);assert.equal(f.owner.snapshot().events.filter(e=>e.type==='interaction-effect').length,1);assert.equal(actor.lamp,100);const x=actor.x;assert.ok(actor.y>2.8);f.tick(120,{x:0,y:-1});assert.ok(actor.y<2.3);assert.ok(Math.abs(actor.x-x)<.1);});
test('death before contact never emits opening effect',()=>{const f=fixture();Object.assign(f.world.current,{x:8,y:3.76});f.request();for(let i=0;i<120&&!f.owner.snapshot().interaction;i++)f.tick(1);assert.ok(f.owner.snapshot().interaction);f.world.damage(10000);f.tick(1);assert.equal(f.scene.snapshot().status,'closed');assert.equal(f.owner.snapshot().interaction,null);});
test('queued attack cannot cancel an active interaction lock',()=>{const f=fixture();Object.assign(f.world.current,{x:8,y:3.76});f.request();for(let i=0;i<120&&!f.owner.snapshot().interaction;i++)f.tick(1);assert.ok(f.owner.snapshot().interaction);assert.equal(f.owner.cancel('combat-command'),false);assert.equal(f.world.attack({kind:'light',aim:{x:8,y:2}}),false);});
test('reset restores closed colliders without mutating OBSTACLES template',()=>{const before=JSON.stringify(OBSTACLES),f=fixture(),closed=JSON.stringify(f.scene.map);f.scene.open(f.target.id,1);for(let i=0;i<72;i++)f.scene.step(1/60);f.owner.cancel('reset');f.scene.reset();f.world.reset();assert.equal(JSON.stringify(f.scene.map),closed);assert.equal(JSON.stringify(OBSTACLES),before);assert.equal(f.scene.snapshot().status,'closed');});
test('environment removes only legacy bars and exposes the live door parts',()=>{const f=fixture(),env=createCombatDoorEnvironment(f.scene);assert.equal(env.targets[0],f.target);assert.ok(f.scene.parts.every(p=>env.parts.includes(p)));assert.ok(env.lights.length>0);});
