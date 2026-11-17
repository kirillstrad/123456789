import type {Pose,Rig,HeroModule,Vec3} from '../core/types.js';
import type {InteractionKind} from '../combat/lamp-life.js';
export interface InteractionAnimationFrame{readonly kind:InteractionKind;readonly clip:string;readonly elapsed:number;readonly duration:number;readonly progress:number;readonly phase:'reach'|'contact'|'recover'|'complete';readonly effectDue:boolean;readonly complete:boolean;readonly doorModelId?:string;readonly doorContact?:{actor:{x:number;y:number;heading:number};points:Vec3[];arms?:number[]}}
export function interactionFrame(kind:InteractionKind,elapsed:number):InteractionAnimationFrame;
export function sampleInteraction(frame:InteractionAnimationFrame,module:HeroModule,time:number):{pose:Pose;rig:Rig;clip:string};
