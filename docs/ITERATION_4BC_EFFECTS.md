# Execution effects integration candidate

Branch iteration-4-main-4a. Main and combat balance unchanged. This patch follows attack pose commit 1f93f50 (CI passed according to the user) and integrates effects into the actual app scene/mask/lighting, not the standalone HTML demo.

ExecutionEffects is a presentation-only simulation stepped immediately after each fixed CombatWorld step, including the debug advance helper. Births consume deduplicated execution events. Seed resets on restart; blood drops land into capped persistent stains, sparks/embers bounce and expire, soul particles travel visually toward the actual rendered lamp endpoint. Pure frame sampling cannot spawn or age particles. Existing world snapshots and combat logic are not replaced; the report exports the separate owned effect snapshot.

New view projection applies bounded execution zoom/pan/shake to world geometry, mask and particles, not HUD/menu. Its inverse is used for mouse-world coordinates and spark cone lighting. Lamp/environment effect radii scale with zoom. Camera returns to baseline at completion and fades after hero death. F6 toggles camera motion; F7 shake; F8 blood. Web buttons use the existing tools class; desktop may hide tools but hotkeys remain. These are visual options, not gameplay modifiers. Enabling/disabling blood does not stop its underlying simulation.

Particles stop when the app does not step (pause, focus loss, freeze); reset/home clear particles, stains, seed, deduplication and view. After death no new drain particles emit; existing particles decay without restoring lamp. Stains persist until restart/home. Counts are bounded at 384 particles, 180 stains and 2048 remembered event keys. Particle collision is floor-only, not obstacle-aware; performance/occlusion/ASCII readability require real-browser review.

Nine tests exercise event deduplication, floor stains, stream/light, pure rendering, owned snapshots, determinism, death, visual switches and projection inversion. They do not certify hardware performance or artistic quality. CI for this patch is pending.

Next deliverable: real browser input scenarios combining LLL/LLH/HH, R execution, pause/restart/death and dash; source-matched screenshots/reports; refreshed build/provenance labels and rebuilt HTML plus Windows artifacts. An artifact from the latest passing source commit is a unified game preview, not an additional standalone demo. Until that verification and publication are confirmed, do not claim complete 4BC or visual acceptance. 3C.4 remains open and no main merge is authorized.
