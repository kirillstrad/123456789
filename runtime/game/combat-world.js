import { COMBAT, SPARKS } from '../combat/config.js';
import { ActionMachine } from '../combat/action-machine.js';
import { SparkSystem } from '../combat/sparks.js';
import { makeEnemy, enemyStep } from '../combat/enemy.js';
import { OBSTACLES, solid, blocked, inArc } from '../combat/geometry.js';
function initial() { return { x: 8, y: 12, fx: 0, fy: -1, time: 0, walkDistance: 0, moving: false, lamp: 100, cameraX: 8, cameraY: 12, phase: 'playing', action: null, sweepProgress: null, enemy: makeEnemy(), particles: [], cone: null, hitReaction: 0, deathTime: 0, note: 'Approach the warden. LMB light / RMB heavy / E sparks.' }; }
export class CombatWorld {
    current = initial();
    previous = initial();
    actions = new ActionMachine();
    sparks = new SparkSystem();
    events = [];
    sweepElapsed = null;
    sweepFired = false;
    map;
    tipProvider;
    constructor(map = OBSTACLES, tipProvider = null) { this.map = map; this.tipProvider = tipProvider; }
    reset() { this.current = initial(); this.previous = initial(); this.actions.clear(); this.sparks.clear(); this.events = []; this.sweepElapsed = null; this.sweepFired = false; }
    record(event) { this.events.push({ ...event, time: this.current.time }); if (this.events.length > 400)
        this.events.shift(); }
    move(dx, dy) { const s = this.current, e = s.enemy, ox = s.x, oy = s.y, actorFree = (x, y) => e.hp <= 0 || Math.hypot(x - e.x, y - e.y) > .59; if (!solid(s.x + dx, s.y, this.map) && actorFree(s.x + dx, s.y))
        s.x += dx; if (!solid(s.x, s.y + dy, this.map) && actorFree(s.x, s.y + dy))
        s.y += dy; const distance = Math.hypot(s.x - ox, s.y - oy); s.walkDistance += distance; return distance; }
    hooks() { return { position: () => this.current, facing: () => ({ x: this.current.fx, y: this.current.fy }), lunge: (dx, dy) => { this.move(dx, dy); }, hit: a => { const s = this.current, e = s.enemy; if (e.hp <= 0 || a.hitIds.has(e.id) || !inArc(s, e, { x: a.fx, y: a.fy }, COMBAT.reach, COMBAT.arcDegrees) || blocked(s, e, this.map))
            return; a.hitIds.add(e.id); const amount = a.kind === 'heavy' ? COMBAT.heavyDamage : COMBAT.lightDamage; e.hp = Math.max(0, e.hp - amount); e.mode = e.hp <= 0 ? 'dead' : 'stagger'; e.timer = 0; s.note = e.hp <= 0 ? 'The nave is silent.' : a.kind === 'heavy' ? 'Heavy iron finds its mark.' : 'Iron finds its mark.'; this.record({ type: 'hit', amount, attackId: a.id, targetId: e.id }); this.sparks.spawn([e.x, e.y, .5], a.kind === 'heavy' ? 12 : 6, 1.3); if (e.hp <= 0) {
            s.phase = 'won';
            this.record({ type: 'enemy-dead', targetId: e.id });
        } } }; }
    attack(command) { if (this.current.phase !== 'playing' || this.sweepElapsed !== null)
        return false; const started = this.actions.started, ok = this.actions.request(command, this.hooks()); if (this.actions.started !== started)
        this.record({ type: 'strike-start', attackId: this.actions.current?.id }); this.sync(); return ok; }
    sweep(aim = null) { const s = this.current; if (s.phase !== 'playing' || this.actions.current || this.sweepElapsed !== null)
        return false; if (aim) {
        const dx = aim.x - s.x, dy = aim.y - s.y, d = Math.hypot(dx, dy);
        if (d > .01) {
            s.fx = dx / d;
            s.fy = dy / d;
        }
    } this.sweepElapsed = 0; this.sweepFired = false; s.sweepProgress = 0; s.note = 'Steel across stone. Read the room in sparks.'; return true; }
    damage(n) { const s = this.current; if (s.phase !== 'playing' || n <= 0)
        return; s.lamp = Math.max(0, s.lamp - n); if (!this.actions.current && this.sweepElapsed === null)
        s.hitReaction = .65; this.record({ type: 'damage', amount: n }); s.note = 'The lamp falters.'; if (s.lamp === 0) {
        s.phase = 'dead';
        s.deathTime = 0;
        this.actions.clear();
        this.sweepElapsed = null;
        s.sweepProgress = null;
        s.note = 'The flame has gone out.';
        this.record({ type: 'hero-dead' });
    } this.sync(); }
    sync() { const s = this.current; s.action = this.actions.view(); if (s.action) {
        s.fx = s.action.fx;
        s.fy = s.action.fy;
    } s.particles = this.sparks.particles; s.cone = this.sparks.cone; }
    step(dt, input = { x: 0, y: 0 }) {
        if (!Number.isFinite(dt) || dt <= 0)
            return;
        this.previous = this.snapshot();
        const s = this.current;
        s.time += dt;
        s.hitReaction = Math.max(0, s.hitReaction - dt);
        s.moving = false;
        this.sparks.step(dt);
        if (s.phase === 'dead') {
            s.deathTime += dt;
            this.sync();
            return;
        }
        const oldStarted = this.actions.started;
        if (s.phase === 'won') {
            this.actions.step(dt, false, this.hooks());
            this.sync();
            return;
        }
        if (this.sweepElapsed !== null) {
            this.sweepElapsed += dt;
            s.sweepProgress = Math.min(1, this.sweepElapsed / SPARKS.sweepDuration);
            if (!this.sweepFired && s.sweepProgress >= SPARKS.sweepRelease) {
                this.sweepFired = true;
                this.sparks.sweep(s, { x: s.fx, y: s.fy });
                this.record({ type: 'sweep' });
            }
            if (s.sweepProgress >= 1) {
                this.sweepElapsed = null;
                s.sweepProgress = null;
            }
        }
        else if (this.actions.current)
            this.actions.step(dt, Math.hypot(input.x, input.y) > .001, this.hooks());
        else {
            const n = Math.hypot(input.x, input.y);
            if (n > .001) {
                s.fx = input.x / n;
                s.fy = input.y / n;
                s.moving = this.move(s.fx * dt * 1.65, s.fy * dt * 1.65) > 1e-8;
            }
            else if (input.aim) {
                const dx = input.aim.x - s.x, dy = input.aim.y - s.y, d = Math.hypot(dx, dy);
                if (d > .2) {
                    s.fx = dx / d;
                    s.fy = dy / d;
                }
            }
        }
        if (this.actions.started !== oldStarted)
            this.record({ type: 'strike-start', attackId: this.actions.current?.id });
        this.sync();
        if (this.tipProvider)
            this.sparks.stone(this.tipProvider(s), s.time, { x: s.fx, y: s.fy }, this.sweepElapsed !== null);
        if (s.phase === 'playing')
            enemyStep(s.enemy, dt, s, this.map, n => this.damage(n));
        s.cameraX += (s.x - s.cameraX) * Math.min(1, dt * 6);
        s.cameraY += (s.y - s.cameraY) * Math.min(1, dt * 6);
        this.sync();
    }
    snapshot(alpha = 1) { const s = this.current, p = this.previous, t = Math.max(0, Math.min(1, alpha)), m = (a, b) => a + (b - a) * t, action = s.action ? { ...s.action } : null; if (action && p.action?.id === action.id)
        action.progress = m(p.action.progress, action.progress); return { ...s, x: m(p.x, s.x), y: m(p.y, s.y), time: m(p.time, s.time), walkDistance: m(p.walkDistance, s.walkDistance), cameraX: m(p.cameraX, s.cameraX), cameraY: m(p.cameraY, s.cameraY), enemy: { ...s.enemy, x: m(p.enemy.x, s.enemy.x), y: m(p.enemy.y, s.enemy.y) }, action, particles: s.particles.map(p => ({ ...p })), cone: s.cone ? { ...s.cone } : null }; }
}
