import type {Enemy} from '../combat/types.js';
import type {Part,Vec3} from '../core/types.js';
import type {ExecutionState} from '../combat/execution.js';
export function golemAttackPose(e:Enemy&{golemAttack?:string}):{right:Vec3;left:Vec3;lean:number};
export function corpseGolemParts(e:Enemy&{golemAttack?:string;deathElapsed?:number},state?:{execution?:(ExecutionState&{kind?:string})|null}):Part[];
