import { stepMeleeEnemy } from './melee-undead.js';
import { COMBAT } from './config.js';
import { enemyDefinition } from './bestiary.js';
import { blocked, solid } from './geometry.js';
export function makeEnemy() { return { id: 0, x: 8.7, y: 8.1, fx: 0, fy: 1, hp: COMBAT.enemyLife, mode: 'wait', timer: 0, cooldown: 0, walkDistance: 0, hitFired: false }; }
export function enemyStep(e, dt, player, map, damage, allowAttack = true) { if (stepMeleeEnemy({ enemy: e, dt, player, map, damage, allowAttack, solid, blocked }))
    return; const profile = enemyDefinition(e.archetype); if (e.hp <= 0 || e.mode === 'dead')
    return; e.cooldown = Math.max(0, e.cooldown - dt); const previous = e.timer; e.timer += dt; const dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy); if (e.mode === 'wait') {
    if (d < 4.3 && !blocked(e, player, map)) {
        e.mode = 'chase';
        e.timer = 0;
    }
    return;
} if (e.mode === 'stagger') {
    if (e.timer >= profile.stagger) {
        e.mode = 'chase';
        e.timer = 0;
    }
    return;
} if (e.mode === 'windup') {
    if (!e.hitFired && previous < profile.windup && e.timer >= profile.windup) {
        e.hitFired = true;
        if (d < profile.reach && (dx * e.fx + dy * e.fy) / Math.max(.01, d) > .2 && !blocked(e, player, map))
            damage(profile.damage);
        e.mode = 'recover';
        e.timer = 0;
        e.cooldown = profile.cooldown;
    }
    return;
} if (e.mode === 'recover') {
    if (e.timer >= profile.recover) {
        e.mode = 'chase';
        e.timer = 0;
    }
    return;
} if (allowAttack && d < .98 && e.cooldown <= 0 && !blocked(e, player, map)) {
    e.fx = dx / Math.max(.001, d);
    e.fy = dy / Math.max(.001, d);
    e.mode = 'windup';
    e.timer = 0;
    e.hitFired = false;
    return;
} if (d > .85 && d < 7) {
    e.fx = dx / d;
    e.fy = dy / d;
    const old = { x: e.x, y: e.y }, x = e.x + e.fx * profile.speed * dt, y = e.y + e.fy * profile.speed * dt;
    if (!solid(x, e.y, map, e.radius ?? .35) && Math.hypot(x - player.x, e.y - player.y) > .65)
        e.x = x;
    if (!solid(e.x, y, map, e.radius ?? .35) && Math.hypot(e.x - player.x, y - player.y) > .65)
        e.y = y;
    e.walkDistance += Math.hypot(e.x - old.x, e.y - old.y);
} }
