import type {CombatSnapshot} from '../combat/types.js';
export function comboEdgeStyle(s:CombatSnapshot&{comboEdgeActive?:boolean}):Readonly<{color:string;width:number}>|null;
