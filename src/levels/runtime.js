import {gameLevel} from './registry.js';
import {createAshenPlan} from './ashen-layout.js';
import {createAshenEnvironment} from './ashen-environment.js';
export function buildLevelScene(id,{baseObstacles,createDoorScene,createDoorEnvironment}){
 gameLevel(id);
 if(id==='test-chamber'||id==='bonebound-trial'||id==='undead-trial'||id==='archer-trial'){const doorScene=createDoorScene(baseObstacles);return {doorScene,env:createDoorEnvironment(doorScene)};}
 const plan=createAshenPlan(),art=createAshenEnvironment(plan);
 const base={circles:plan.obstacles.circles,rects:[...plan.obstacles.rects,...art.rects]};
 const doorScene=createDoorScene(base,plan.doors,{bounds:plan.bounds,routeBounds:plan.bounds,lights:plan.lights,legacyGate:false});
 return {doorScene,env:createDoorEnvironment(doorScene,()=>art)};
}
