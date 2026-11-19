import type {AttackKind} from './types.js';

// Normalized phase boundaries. Presentation and damage share contact time.
const LIGHT = Object.freeze({prep:.18,ready:.44,contact:.53,follow:.66,queueStart:.10,queueEnd:.76,release:.92});
const HEAVY = Object.freeze({prep:.25,ready:.51,contact:.61,follow:.74,queueStart:.10,queueEnd:.80,release:.96});

export function attackTiming(kind:AttackKind) {
  return kind === 'heavy' ? HEAVY : LIGHT;
}
