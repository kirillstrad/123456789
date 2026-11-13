# Iteration 3A.1 — Motion preview

Scope: bounded acceleration (9 cells/s²) and deceleration (14 cells/s²); unchanged maximum speed 1.65 cells/s; shortest-path visual body turns; gradual breath/walk blending; leg IK preserves bone lengths during blend. All motion state lives in fixed-step world snapshots, not in a render cache. Stationary repeated sampling does not advance animation. Attack direction, damage, timing, combo rules, lamp-life, room geometry, hero vendor and HUD are unchanged. Visual strike heading converges during windup.

This is the first motion patch, not completion of iteration 3. There is no Windows executable yet. Desktop/fullscreen integration belongs to 3B. Full foot locking during sharp turns, perfect foot-contact behavior, weapon inertia and transitions between all combat clips still need visual acceptance; they are not claimed complete here.

16 pure Motion tests (including an explicitly synthetic test rig) were run locally with TypeScript 5.8.2 and zero diagnostics for motion.ts. The full repository tests, tests against the actual hero and browser regressions must run in GitHub Actions before generated runtime is committed. See docs/unit-tests.tap and docs/browser-check.json from that job; local test output is not a full-game performance or visual-quality certificate.

Canvas2D / 196x140 / original hero lamp-left and sword-right retained. No new maps, HUD redesign, enemy types, healing, execution or dash. main and iteration-2-canvas2d are not push targets. The new workflow commits rebuilt runtime/PLAY.html only after tests pass and uploads ASH_IRON_ITERATION_3A_1.zip. Until that CI commit succeeds, the checked-in PLAY.html is still the iteration-2 build.
