import type {Pose,Rig,HeroModule} from '../core/types.js';
import type {InteractionKind} from '../combat/lamp-life.js';
export interface InteractionAnimationFrame{readonly kind:InteractionKind;readonly clip:string;readonly elapsed:number;readonly duration:number;readonly progress:number;readonly phase:'reach'|'contact'|'recover'|'complete';readonly effectDue:boolean;readonly complete:boolean}
export function interactionFrame(kind:InteractionKind,elapsed:number):InteractionAnimationFrame;
export function sampleInteraction(frame:InteractionAnimationFrame,module:HeroModule,time:number):{pose:Pose;rig:Rig;clip:string};
