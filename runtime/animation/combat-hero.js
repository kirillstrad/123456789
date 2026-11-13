import { locomotionPose } from './motion.js';
export function lampBeat(life, time) { if (life <= 0)
    return 0; const w = 1 - Math.max(0, Math.min(1, life / 100)), ph = (time * (60 + 80 * w) / 60) % 1, d = (x) => Math.min(Math.abs(x), 1 - Math.abs(x)), pulse = Math.min(1, Math.exp(-(d(ph - .12) ** 2) / .004) + .55 * Math.exp(-(d(ph - .34) ** 2) / .007)); return 1 - (.02 + .04 * w) * (1 - pulse) * w; }
export function combatHero(s, module = globalThis.IronPilgrim, secondary = { cloth: 0, chains: [0, 0, 0, 0] }) { if (!module)
    throw Error('Original vendor/hero.js must be loaded before rendering.'); let clip = 'breath', t = (s.time / 5) % 1, locomotion = true; if (s.phase === 'dead') {
    clip = 'death';
    t = Math.min(1, s.deathTime / 2.5);
    locomotion = false;
}
else if (s.action) {
    clip = s.action.clip;
    t = s.action.progress;
    locomotion = false;
}
else if (s.sweepProgress !== null) {
    clip = 'sweep';
    t = s.sweepProgress;
    locomotion = false;
}
else if (s.hitReaction > 0) {
    clip = 'hit';
    t = 1 - s.hitReaction / .65;
    locomotion = false;
}
else if ((s.motion?.weight ?? (s.moving ? 1 : 0)) > .001)
    clip = 'walk'; const sampled = locomotion ? locomotionPose(s, module) : null, pose = sampled?.pose ?? module.sample(clip, Math.max(0, Math.min(1, t)), s.time), rig = sampled?.rig ?? module.rig(pose), heading = s.motion?.heading ?? Math.atan2(s.fy, s.fx), fx = Math.cos(heading), fy = Math.sin(heading), transform = (v) => { const x = v[0] - pose.root[0], y = v[1] - pose.root[1]; return [s.x + fy * x + fx * y, s.y - fx * x + fy * y, v[2]]; }, parts = [], push = (kind, v, c, w = 1) => { const points = v.map(transform); parts.push({ kind, v: points, c, w, hero: true, d: points.reduce((d, v) => d + v[0] + v[1] + v[2] * .006, 0) / points.length + (kind === 1 ? .005 : 0) }); }; const lamp = module.emit(rig, s.time, { poly: (v, c) => push(0, v, c), line: (v, c, w) => push(1, v, c, w) }, secondary, lampBeat(s.lamp, s.time)); return { parts, lamp: transform(lamp), tip: transform(rig.tip), clip }; }
