import test from 'node:test';import assert from 'node:assert/strict';import '../public/vendor/hero.js';
import {COMBAT_LIGHTS,TEST_BRAZIER,findCombatLights} from '../runtime/game/combat-light-context.js';
import {createCombatDoorScene} from '../runtime/game/combat-door-scene.js';
import {createCombatDoorEnvironment} from '../runtime/render/combat-door-environment.js';
import {createCombatDoorController} from '../runtime/interaction/combat-door-controller.js';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {OBSTACLES,solid} from '../runtime/combat/geometry.js';
import {buildLightGeometry} from '../runtime/gallery/models/light-geometry.js';
import {NATIVE_FIRE_MODELS,buildInteractiveFire} from '../runtime/gallery/models/interactive-fire.js';
import {ignitionMethod} from '../runtime/interaction/fire-rules.js';
import {sampleInteraction,interactionFrame} from '../runtime/animation/interaction.js';
import {doorContactToWorld} from '../runtime/animation/door-contact.js';
import {planApproachRoute} from '../runtime/interaction/approach-route.js';
const hero=globalThis.IronPilgrim,build=definition=>(NATIVE_FIRE_MODELS.includes(definition.modelId)?buildInteractiveFire:buildLightGeometry)({modelId:definition.modelId,status:'lit',transform:definition.transform}),manual=COMBAT_LIGHTS.filter(d=>ignitionMethod(d.modelId)==='lantern');
test('expanded scene preserves all catalogue variants and adds eighteen candles plus oven and campfire',()=>{assert.equal(COMBAT_LIGHTS.length,29);assert.equal(new Set(COMBAT_LIGHTS.map(d=>d.id)).size,29);assert.equal(COMBAT_LIGHTS.filter(d=>!NATIVE_FIRE_MODELS.includes(d.modelId)).length,9);assert.equal(COMBAT_LIGHTS.filter(d=>d.modelId.startsWith('simple-candle.')).length,18);assert.equal(COMBAT_LIGHTS[0],TEST_BRAZIER);assert.deepEqual(TEST_BRAZIER.transform,{x:20,y:11,yaw:0});assert.equal(manual.length,8);});
for(const definition of COMBAT_LIGHTS)test(definition.id+' has reachable metadata and policy-appropriate interaction',()=>{
 const scene=createCombatDoorScene(OBSTACLES),env=createCombatDoorEnvironment(scene),lights=findCombatLights(scene),target=lights.getTarget(definition.id),mesh=build(definition);
 assert.equal(solid(target.approach.x,target.approach.y,scene.map),false);assert.ok(['ready','arrived'].includes(planApproachRoute({start:{x:8,y:12},goal:target.approach,colliders:scene.getColliders(),bounds:scene.getBounds()}).status));assert.ok(mesh.emissionPoints.length>0&&mesh.emissionPoints.flat().every(Number.isFinite));
 if(ignitionMethod(definition.modelId)==='sparks'){assert.equal(env.targets.some(t=>t.id===definition.id),false);return;}
 assert.equal(env.targets.some(t=>t.id===definition.id),true);const actor={x:target.approach.x,y:target.approach.y,heading:Math.atan2(target.facePoint.y-target.approach.y,target.facePoint.x-target.approach.x)};
 for(const progress of [0,.25,.5,.55,.6,.61,.65,.85,1]){const frame={...interactionFrame('ignite',3.2*progress),lightContact:{actor,point:target.contactPoint}},sample=sampleInteraction(frame,hero,2);assert.ok(sample.rig.arms.flatMap(a=>[...a.base,...a.joint,...a.end]).every(Number.isFinite));if(progress>=.5&&progress<=.65){const flame=hero.emit(sample.rig,2,{poly(){},line(){}},{cloth:0,chains:[0,0,0,0]},1),actual=doorContactToWorld(actor,sample.pose.root,flame);assert.ok(Math.hypot(...actual.map((v,i)=>v-target.contactPoint[i]))<.04,definition.id+' lamp contact');}if(progress===0||progress===1)assert.deepEqual(sample.pose,sampleInteraction(interactionFrame('ignite',3.2*progress),hero,2).pose);}
 if(definition.modelId.startsWith('wall-light'))assert.ok(target.approach.y>definition.transform.y);
});
test('all eight manual sources navigate and ignite independently without spending HP',()=>{
 const scene=createCombatDoorScene(OBSTACLES),env=createCombatDoorEnvironment(scene),lights=findCombatLights(scene),world=new CombatWorld(scene.map);world.current.enemy.hp=0;let intent=null,serial=0;const controller=createCombatDoorController({world,scene,targeting:{intent:()=>intent,cancelIntent:()=>intent=null,current:()=>null}});
 for(const definition of manual){const before=world.current.lamp;intent={id:++serial,targetId:definition.id,kind:'ignite',context:'game'};let complete=false;for(let n=0;n<7200;n++){controller.step(1/60);const frame=controller.decorate(world.snapshot()).interactionAnimation;if(frame?.kind==='ignite'&&frame.progress>=.55&&frame.progress<=.61)sampleInteraction(frame,hero,world.current.time);if(lights.getState(definition.id).status==='lit'&&!world.current.interaction){complete=true;break;}}assert.ok(complete,definition.id+JSON.stringify(controller.snapshot()));assert.equal(world.current.lamp,before);assert.equal(env.targets.some(t=>t.id===definition.id),false);}
 assert.equal(world.current.lamp,100);assert.equal(world.events.filter(e=>e.type==='lamp-spent').length,0);assert.equal(lights.getFrame().lights.length,manual.reduce((n,d)=>n+build(d).lights.length,0));for(const state of lights.snapshot().filter(s=>ignitionMethod(s.modelId)==='sparks'))assert.equal(state.status,'off');controller.cancel('reset');scene.reset();world.reset();assert.equal(lights.getFrame().lights.length,0);assert.equal(lights.getFrame().targets.length,29);assert.equal(env.targets.filter(t=>t.kind==='ignite').length,8);
});
