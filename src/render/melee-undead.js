import {renderUndead} from './undead-family.js';
const kinds=new Set(['ossuary-guard','gravebearer','bloated-remnant','ashbound']);
export function meleeUndeadParts(e,state={}){return kinds.has(e.archetype)?renderUndead(e,state):null;}
