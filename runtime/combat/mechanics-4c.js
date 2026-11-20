import { COMBAT } from './config.js';
import { inArc, blocked } from './geometry.js';
export const MECHANICS_4C = Object.freeze({ lightArc: 70, heavyArc: 160, lightLimit: 2, lightForward: [.08, .09, .10], heavyForward: [.14, .16, .16], heavySide: [.05, -.06, .06], inertiaStart: .35, inertiaEnd: .65 });
export function allowedContinuation(chain, kind) { return ['LL', 'LLL', 'LLH', 'LH', 'HH', 'HL', 'HLL'].includes(chain + (kind === 'light' ? 'L' : 'H')); }
function displacement(progress) { const t = Math.max(0, Math.min(1, (progress - MECHANICS_4C.inertiaStart) / (MECHANICS_4C.inertiaEnd - MECHANICS_4C.inertiaStart))); return (1 - Math.cos(Math.PI * t)) / 2; }
export function inertiaDelta(kind, stage, from, to, fx, fy) {
    const n = Math.hypot(fx, fy);
    if (n < 1e-8 || to <= from)
        return { x: 0, y: 0 };
    const i = Math.max(0, Math.min(2, stage)), u = displacement(to) - displacement(from), forward = (kind === 'heavy' ? MECHANICS_4C.heavyForward : MECHANICS_4C.lightForward)[i], side = kind === 'heavy' ? MECHANICS_4C.heavySide[i] : 0, x = fx / n, y = fy / n;
    return { x: u * (x * forward - y * side), y: u * (y * forward + x * side) };
}
export function selectStrikeTargets(origin, facing, kind, targets, map, alreadyHit = new Set()) {
    const limit = kind === 'light' ? Math.max(0, MECHANICS_4C.lightLimit - alreadyHit.size) : Infinity;
    return targets.filter(t => t.hp > 0 && !alreadyHit.has(t.id) && inArc(origin, t, facing, COMBAT.reach, kind === 'light' ? MECHANICS_4C.lightArc : MECHANICS_4C.heavyArc) && !blocked(origin, t, map)).sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y) || a.id - b.id).slice(0, limit);
}
