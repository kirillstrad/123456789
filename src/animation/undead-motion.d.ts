import type {Enemy} from '../combat/types.js';
export const UNDEAD_KINDS:readonly string[];
export interface UndeadPose {time:number;heading:number;feet:number[][];raise:number;strike:number;recover:number;idle:number;gestureVariant:number;breath:number;hit:number}
export function updateUndeadMotion(e:Enemy,dt:number,before:{x:number;y:number}):void;
export function ease(x:number):number;
export function archerReady(e:Enemy&{archerLocked?:boolean}):boolean;
export function bossAccentPose(e:Enemy,time?:number):{head:number;jaw:number;grip:number;shoulder:number};
export function undeadPose(e:Enemy):UndeadPose|null;
export function undeadProfile(kind:string):{windup:number;recover:number;stagger:number}|undefined;
