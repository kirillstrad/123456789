import type {Pose,Rig,HeroModule,Vec3} from '../core/types.js';
import type {GolemExecutionState} from '../combat/corpse-golem.js';
export function golemFinisherTargets(distance:number):{chest:Vec3;lamp:Vec3;burnPoint:Vec3};
export function golemFinisherPose(elapsed:number,distance:number,base:Pose):Pose;
export function golemFinisherRig(state:{execution:GolemExecutionState},module:HeroModule):{pose:Pose;rig:Rig;heading:number;pinGrip:Vec3;pinTip:Vec3;chestContact:Vec3};
