/** Draft gameplay choices; not yet approved as final balance. */
export const COMBAT = Object.freeze({ lightDamage: 18, heavyDamage: 34, reach: 2.35, arcDegrees: 160, lightDurations: [.88, .98, 1.08], heavyDurations: [1.35, 1.48, 1.62], activeStart: .46, activeEnd: .71, queueStart: .14, moveCancelAt: .86, maxChain: 3, enemyLife: 70, enemyDamage: 12, enemySpeed: .78, enemyWindup: .55, enemyRecover: .7, enemyReach: 1.15, enemyCooldown: 1.3, staggerDuration: .45 });
export const DRAFT_RULES = Object.freeze({ aim: 'cursor-at-press', lockDirectionDuringStrike: true, damageInterruptsAttack: false, allowMoveCancelAfter: .86 });
export const SPARKS = Object.freeze({ arcDegrees: 160, reach: 5.3, coneDuration: 2.5, sweepDuration: 1.55, sweepRelease: .27, lampCost: 0, maxParticles: 180 });
export const MENU_PROFILE = Object.freeze({ flow: .32, power: .86, density: 192, ascii: true, dim: true, frozen: false });
