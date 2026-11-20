import { attackTiming } from './attack-timing.js';
import { COMBAT, DRAFT_RULES } from './config.js';
import { allowedContinuation, inertiaDelta } from './mechanics-4c.js';
export class ActionMachine {
    current = null;
    queued = null;
    serial = 0;
    chain = '';
    previousClip = null;
    contactFired = false;
    started = 0;
    hits = 0;
    clear() { this.current = null; this.queued = null; this.chain = ''; this.previousClip = null; this.contactFired = false; }
    canContinue(kind) {
        const action = this.current;
        if (!action || this.queued)
            return false;
        const progress = action.elapsed / action.duration;
        const timing = attackTiming(action.kind);
        if (progress < timing.queueStart || progress > timing.queueEnd)
            return false;
        return kind === undefined ? allowedContinuation(this.chain, 'light') || allowedContinuation(this.chain, 'heavy') : allowedContinuation(this.chain, kind);
    }
    request(command, hooks) {
        if (this.current) {
            if (!this.canContinue(command.kind))
                return false;
            this.queued = { kind: command.kind, aim: command.aim ? { ...command.aim } : null };
            return true;
        }
        this.begin(command, 0, hooks);
        return true;
    }
    begin(command, stage, hooks) {
        this.previousClip = stage > 0 && this.current ? (this.current.kind === 'heavy' ? 'heavy' : 'light') + (this.current.stage + 1) : null;
        const p = hooks.position(), f = hooks.facing(), aim = DRAFT_RULES.aim === 'cursor-at-press' ? command.aim : null, dx = aim ? aim.x - p.x : f.x, dy = aim ? aim.y - p.y : f.y, n = Math.hypot(dx, dy), fx = n > .001 ? dx / n : f.x, fy = n > .001 ? dy / n : f.y;
        this.chain = stage === 0 ? (command.kind === 'light' ? 'L' : 'H') : this.chain + (command.kind === 'light' ? 'L' : 'H');
        this.current = { id: ++this.serial, kind: command.kind, stage, elapsed: 0, duration: (command.kind === 'heavy' ? COMBAT.heavyDurations : COMBAT.lightDurations)[stage], fx, fy, hitIds: new Set() };
        this.contactFired = false;
        this.queued = null;
        this.started++;
    }
    step(dt, movingInput, hooks) {
        if (!Number.isFinite(dt) || dt <= 0 || !this.current)
            return;
        const a = this.current, prev = a.elapsed / a.duration;
        a.elapsed = Math.min(a.duration, a.elapsed + dt);
        const t = a.elapsed / a.duration;
        const d = inertiaDelta(a.kind, a.stage, prev, t, a.fx, a.fy);
        hooks.lunge(d.x, d.y);
        const contact = attackTiming(a.kind).contact;
        if (!this.contactFired && prev < contact && t >= contact) {
            this.contactFired = true;
            hooks.hit(a);
        }
        if (movingInput && !this.queued && t >= Math.max(DRAFT_RULES.allowMoveCancelAfter, attackTiming(a.kind).release)) {
            this.clear();
            return;
        }
        if (t >= 1) {
            if (this.queued) {
                const next = this.queued;
                this.begin(next, a.stage + 1, hooks);
            }
            else
                this.clear();
        }
    }
    view() { const a = this.current; return a ? { id: a.id, kind: a.kind, stage: a.stage, progress: a.elapsed / a.duration, fx: a.fx, fy: a.fy, clip: (a.kind === 'heavy' ? 'heavy' : 'light') + (a.stage + 1), previousClip: this.previousClip, animation4C: true, continuation: this.queued?.kind ?? null } : null; }
}
