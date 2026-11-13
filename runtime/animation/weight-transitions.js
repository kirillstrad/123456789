import { COMBAT } from '../combat/config.js';
import { locomotionPose, angleDelta, MOTION } from './motion.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const vec = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export function transitionWeight(clip, t) { t = clamp(t); if (/^(light|heavy)[123]$/.test(clip))
    return smooth(t / .12) * (1 - smooth((t - COMBAT.activeEnd) / (COMBAT.moveCancelAt - COMBAT.activeEnd))); if (clip === 'sweep')
    return smooth(t / .12) * (1 - smooth((t - .8) / .2)); if (clip === 'hit')
    return smooth(t / .12) * (1 - smooth((t - .7) / .3)); return 1; }
export function blendPose(a, b, t) { const p = { ...b, root: vec(a.root, b.root, t), left: vec(a.left, b.left, t), right: vec(a.right, b.right, t), gait: t < .5 ? (a.gait ? { ...a.gait } : null) : (b.gait ? { ...b.gait } : null) }; for (const k of ['lean', 'twist', 'head', 'look', 'breath', 'down', 'lift', 'visibility', 'ash', 'burn', 'flame'])
    p[k] = a[k] + (b[k] - a[k]) * t; p.az = a.az + angleDelta(a.az, b.az) * t; return p; }
/** Blend foot endpoints in root-relative space, then solve original bone lengths. */
function feet(p, a, b, t, module) { const rig = module.rig(p), ik = module.ik; if (typeof ik !== 'function')
    throw Error('Original hero IK is required for transition foot contacts.'); rig.legs = rig.legs.map((l, i) => { const target = add(vec(sub(a.legs[i].end, a.p.root), sub(b.legs[i].end, b.p.root), t), p.root); const pole = add(vec(sub(a.legs[i].joint, a.p.root), sub(b.legs[i].joint, b.p.root), t), p.root); return ik(l.base, target, l.a, l.b, pole); }); return rig; }
function load(s) { if (!s.motion || s.phase === 'dead')
    return { forward: 0, side: 0 }; return { forward: clamp(s.motion.speed / MOTION.maxSpeed - s.motion.weight, -.25, .25), side: clamp(angleDelta(s.motion.heading, Math.atan2(s.fy, s.fx)), -.5, .5) * clamp(s.motion.weight) }; }
export function loadedLocomotion(s, module) { const base = locomotionPose(s, module), f = load(s); if (Math.abs(f.forward) + Math.abs(f.side) < 1e-9)
    return base; const p = { ...base.pose, left: [...base.pose.left], right: [...base.pose.right], lean: base.pose.lean + .045 * f.forward, twist: base.pose.twist + .025 * f.side, az: base.pose.az + .018 * f.side }; p.left[0] += .012 * f.side; p.left[1] -= .028 * f.forward; p.right[1] -= .018 * f.forward; return { pose: p, rig: feet(p, base.rig, base.rig, 0, module) }; }
export function transitionPose(s, module, clip, t) { const pose = module.sample(clip, clamp(t), s.time), rig = module.rig(pose), weight = transitionWeight(clip, t); if (weight >= 1)
    return { pose, rig }; const base = loadedLocomotion(s, module); if (weight <= 0)
    return base; const p = blendPose(base.pose, pose, weight); return { pose: p, rig: feet(p, base.rig, rig, weight, module) }; }
export function loadSecondary(s, base) { const f = load(s); return { cloth: base.cloth + .018 * f.side, chains: base.chains.map((v, i) => v + .012 * f.forward * (i % 2 ? -1 : 1) + .009 * f.side) }; }
