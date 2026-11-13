# Iteration 3A.2 — Transition and load preview

Base: verified 3A.1 commit c5c1441a998b4fa2af708065d01613936d66cdaf.

- Crossfade locomotion into light/heavy windup during progress 0..0.12. Keep the original full pose and rig across the active window 0.46..0.71. Blend back to locomotion during 0.71..0.86, finishing before the existing movement-cancel threshold. Damage, hit rules, timing and locked attack direction are unchanged.
- Sweep release at 0.27 stays full-strength. Hit reactions also ease in/out; death is explicitly excluded from crossfades.
- Interpolate foot and knee targets in root-relative coordinates and solve using the unchanged original hero IK and bone lengths. This addresses foot snapping between poses; it is not persistent world-space foot locking during sharp turns.
- Bounded speed-vs-walk-weight lag adds a small locomotion body response, sword/lamp hand lag and garment/chain offsets. These are snapshot-derived offsets, not an independent physical spring simulation. Active attack arm poses are left exact.
- Sampling has no renderer-owned animation clock, no global pose cache and no mutation of snapshots or caller-provided secondary arrays.

Unchanged: vendor hero, ASCII style, room, HUD, maximum movement speed, game rules. No new maps or mechanics. No Windows build yet; that remains 3B.

Local verification: 9 unit tests on an explicitly synthetic rig and isolated strict TypeScript checks using test interfaces/locomotion harness. This is not full repository verification. Five new actual-hero integration tests plus existing tests and browser regressions must pass in GitHub Actions before runtime/PLAY.html is committed. Human visual acceptance and user-machine performance are still pending.

Workflow is confined to iteration-3-motion-desktop and uploads ASH_IRON_ITERATION_3A_2.zip after checks. Until the verified runtime commit appears, the checked-in PLAY.html remains the previous build. Do not describe this preview as completion of all 3A foot-contact/inertia work.
