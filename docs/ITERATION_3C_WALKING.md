# Iteration 3C — walking foot-support preview

One block: gait phase detection, stationary/walking transitions, per-foot world anchors, release on unsafe turns, render safety bounds and real-hero tests. Uses the original vendor walk cycle: two cycles per .8 cells, left offset .5, stance below .62. Support fades before swing; a swinging foot is never pinned. A new cycle captures a new anchor. Unsafe support fades out and waits for the next stance instead of repeatedly replanting mid-step.

State advances only in CombatWorld.step and is deep-copied into snapshots. Rendering reads snapshots without advancing contacts. Contact interpolation does not cross gait-mode, cycle or anchor changes. The first movement tick releases idle support; subsequent ticks acquire walking support. Settling returns both legs to idle support, recapturing the former swing leg. Bone lengths use the original hero IK. Render bounds limit cross-body targets and suppress support during swing.

Attack, sweep, hit reaction, death and victory still disable contacts. Damage, attack windows, combo rules, hero assets, room and maximum speed are unchanged. The existing world and hero integration is retained. Main is not a write target. Existing regression tests remain, including first-tick idle release.

Nine new tests cover vendor phase agreement, steady stance anchors, free swing, corners/reversals, repeated start/stop, skipped cycles, render determinism and snapshot ownership, invalid dt and cross-body bounds. Run the full preflight after this commit. Tests have not been run as part of preparing the patch. CI success does not replace human visual acceptance or user-hardware performance checks.

Limits: flat room only; no slopes, stairs, new turn-step animation, toe/heel roll or full-body balance solver. During sharp turns unsafe support may release and return toward the original gait; this is not a promise of zero sliding or perfect foot contact. Large dt is not subdivided here; the caller must retain its fixed-step simulation. No Windows ZIP or rebuilt PLAY.html is committed by this block; the preflight builds and tests them in CI without publishing a playable artifact.
