import type {HeroModule,Rig} from '../core/types.js';
import type {ActionView,CombatSnapshot} from '../combat/types.js';
import type {ContactFrame,LegIK} from './foot-contact.js';
export function sampleAttackStep(action:ActionView):{foot:number;travel:number;lift:number;weight:number};
export function applyAttackFootwork(s:CombatSnapshot,rig:Rig,module:HeroModule&{ik?:LegIK},frame:ContactFrame):Rig;
