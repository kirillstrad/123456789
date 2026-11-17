# Step 17: one combat-scene door

Prepared against a420e48c4df9cdb9d6ad716bdb943e8bf50375df on iteration-5b-interaction-completion. This commit directly integrates main.js; no apply-step17 installer is needed.

## Scope

Replace the eight legacy bars at the nave exit (8, 2.8) with prison-door variant A. Retain the stone arch, static scene, light sources and lamp rules. CombatWorld remains the sole actor simulation. The controller supplies approach input, waits for facing, acquires the existing door interaction lock and publishes the existing interaction animation frame. Its contact marker triggers one leaf opening. The shared combat map remains closed during opening, then retains frame and open-leaf colliders. Reset closes the door again.

Combat commands cancel an approach, but cannot use controller cancellation to bypass an active interaction lock. Pause, blur, gallery entry, freeze and reset cancel the owned interaction. Opening already triggered by the contact marker is not undone by later cancellation.

## Verification gate

The earlier draft's 18 isolated tests do not verify this exact revision. No new local full regression, build, typecheck or Chromium result is claimed. Combat Door Verification runs npm test, typecheck/build, seven runtime integration tests using actual CombatWorld and authored geometry, a combat browser scenario, and the existing gallery browser regression.

Review combat-door-reports/report.json and PNGs for the exact commit. automationPassed is separate from visualAccepted, which remains false/pending. The browser uses controlled placement near the door with the enemy far away; it does not verify the route from normal spawn. PLAY.html is uploaded after successful CI, but is not itself exercised by this browser scenario.

The current victory/menu transition is unchanged. New interactions remain limited to the playing phase. Post-victory exit progression, closing, locks and save persistence are not implemented.

## Door expansion after acceptance

1. Separate per-door motion/interaction state from one shared scene collision-map owner. The current scene intentionally owns exactly one nave exit, not a multi-door registry.
2. Register a second same-type instance with a unique ID. Aggregate all closed/open door colliders; opening A must never remove B's colliders.
3. Test independent states, repeated F, restart and two same-player passages.
4. Define approach sides, hinge, opening direction/duration and moving leaf for each model. Validate approach and facing against actual authored geometry.
5. Add articulated prison-door B/C geometry; the current geometry API articulates A only.
6. Inspect iron-door variants and implement their movement adapters rather than assuming identical construction.
7. Cover orientations, path planning, enemy movement, dash and strike occlusion. This patch uses conservative axis-aligned combat colliders and is accepted only for the yaw-zero exit.
8. Add save persistence, closing or locks only as explicitly scoped features.
9. Extend browser evidence per supported type and orientation; keep human visual review distinct from CI success.

Do not mark step 17 complete before the new commit's CI and visual review. The main branch is not a target of this change.
