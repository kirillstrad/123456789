import test from 'node:test';import assert from 'node:assert/strict';
import '../public/vendor/hero.js';
import {COMBAT_LIGHTS,TEST_BRAZIER,findCombatLights} from '../runtime/game/combat-light-context.js';
import {createCombatDoorScene} from '../runtime/game/combat-door-scene.js';
import {createCombatDoorEnvironment} from '../runtime/render/combat-door-environment.js';
import {createCombatDoorController} from '../runtime/interaction/combat-door-controller.js';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {OBSTACLES,solid} from '../runtime/combat/geometry.js';
import {buildLightGeometry} from '../runtime/gallery/models/light-geometry.js';
import {sampleInteraction,interactionFrame} from '../runtime/animation/interaction.js';
import {doorContactToWorld} from '../runtime/animation/door-contact.js';
import {planApproachRoute} from '../runtime/interaction/approach-route.js';
const hero=globalThis.IronPilgrim;
test('nine unique scene models preserve the established test brazier',()=>{assert.equal(COMBAT_LIGHTS.length,9);assert.equal(new Set(COMBAT_LIGHTS.map(d=>d.modelId)).size,9);assert.equal(new Set(COMBAT_LIGHTS.map(d=>d.id)).size,9);assert.equal(COMBAT_LIGHTS[0],TEST_BRAZIER);assert.deepEqual(TEST_BRAZIER.transform,{x:6.8,y:10.8,yaw:0});});
for(const definition of COMBAT_LIGHTS)test(definition.modelId+' has a clear approach and real lamp contact at the effect marker',()=>{
 const scene=createCombatDoorScene(OBSTACLES);createCombatDoorEnvironment(scene);const lights=findCombatLights(scene),target=lights.getTarget(definition.id),mesh=buildLightGeometry({modelId:definition.modelId,transform:definition.transform});
 assert.equal(solid(target.approach.x,target.approach.y,scene.map),false);assert.ok(['ready','arrived'].includes(planApproachRoute({start:{x:8,y:12},goal:target.approach,colliders:scene.getColliders(),bounds:scene.getBounds()}).status));
 const actor={x:target.approach.x,y:target.approach.y,heading:Math.atan2(target.facePoint.y-target.approach.y,target.facePoint.x-target.approach.x)};
 for(const progress of [0,.25,.5,.55,.6,.61,.65,.85,1]){const frame={...interactionFrame('ignite',3.2*progress),lightContact:{actor,point:target.contactPoint}},sample=sampleInteraction(frame,hero,2);assert.ok(sample.rig.arms.flatMap(a=>[...a.base,...a.joint,...a.end]).every(Number.isFinite));if(progress>=.5&&progress<=.65){const flame=hero.emit(sample.rig,2,{poly(){},line(){}},{cloth:0,chains:[0,0,0,0]},1),actual=doorContactToWorld(actor,sample.pose.root,flame);assert.ok(Math.hypot(...actual.map((v,i)=>v-target.contactPoint[i]))<.04,definition.modelId+' lamp must reach its authored emission point');}if(progress===0||progress===1){const plain=sampleInteraction(interactionFrame('ignite',3.2*progress),hero,2);assert.deepEqual(sample.pose,plain.pose);}}
 if(definition.modelId.startsWith('wall-light'))assert.ok(target.approach.y>definition.transform.y,'wall approach must face the nave interior');assert.equal(mesh.emissionPoints.length>0,true);
});
test('all nine live targets navigate and ignite independently for six LAMP each',()=>{
 const scene=createCombatDoorScene(OBSTACLES),env=createCombatDoorEnvironment(scene),lights=findCombatLights(scene),world=new CombatWorld(scene.map);world.current.enemy.hp=0;let intent=null,serial=0;const targeting={intent:()=>intent,cancelIntent:()=>intent=null,current:()=>null},controller=createCombatDoorController({world,scene,targeting});
 for(const definition of COMBAT_LIGHTS){const before=world.current.lamp;intent={id:++serial,targetId:definition.id,kind:'ignite',context:'game'};let complete=false;for(let n=0;n<7200;n++){controller.step(1/60);const s=controller.decorate(world.snapshot()),frame=s.interactionAnimation;if(frame?.kind==='ignite'&&frame.progress>=.55&&frame.progress<=.61)sampleInteraction(frame,hero,s.time);if(lights.getState(definition.id).status==='lit'&&!world.current.interaction){complete=true;break;}}assert.ok(complete,definition.id+JSON.stringify(controller.snapshot()));assert.equal(world.current.lamp,before-6);assert.equal(env.targets.some(t=>t.id===definition.id),false);}
 assert.equal(world.current.lamp,46);assert.equal(world.events.filter(e=>e.type==='lamp-spent').length,9);const expected=COMBAT_LIGHTS.reduce((n,d)=>n+buildLightGeometry({modelId:d.modelId,status:'lit',transform:d.transform}).lights.length,0);assert.equal(lights.getFrame().lights.length,expected);controller.cancel('reset');scene.reset();world.reset();assert.equal(lights.getFrame().lights.length,0);assert.equal(lights.getFrame().targets.length,9);
});
