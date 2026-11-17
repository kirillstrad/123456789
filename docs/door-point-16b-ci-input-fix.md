# Fix current 16b CI: passage input must follow world coordinates

Failed base: 7d9abdb59c703020202a1d7bf5f3df8620594c1c, iteration-5b-interaction-completion. The user supplied a Node 22.23.4 Chromium-run failure at 'same player did not cross the open doorway'. Do not advance to combat transfer until this block is verified.

## Confirmed defect

The browser scenario incorrectly treated W as world -Y. Actual src/app/movement-input.js maps W to (-sqrt(1/2), -sqrt(1/2)); W+D maps to (0, -sqrt(2)) before game-speed normalization. W therefore steers towards the left frame post/open leaf instead of through the center of this yaw-zero doorway. This is a test-input defect, not a reason to weaken the passage assertion. It does not prove absence of other gameplay defects.

## Change

The runner uses driveDoorPassage: hold W and D simultaneously for the same 1,800 ms, release both through nested finally blocks, then settle for the same 200 ms. Production controls, player, collision code, opening duration and collider geometry are unchanged.

The original y < doorY - .5 crossing threshold is retained. An additional x-drift < .1 assertion prevents accepting a sideways bypass. Before asserting, the runner saves passage-attempt.png and records keys, actual world-input mapping, before/after coordinates, crossing result and lateral drift in report.json. Visual approval remains false/pending.

## Verification actually performed

Local v20.20.1: 7 new tests plus the unchanged 12 evidence-helper tests passed jointly, 19/19; syntax checks passed. Tests use the actual movementInput and collision engine with a synthetic open-door layout, a controlled keyboard/clock and constant normalized speed 1.65. This is not the real player's acceleration/animation or a browser run.

In that reduced fixture the old W-only command ended blocked at approximately (7.3613, 8.3377); W+D reached (8, 5.99), unblocked. These are local fixture coordinates, NOT coordinates from the failed CI run. The reproduction data and TAP log are included in the checkpoint archive.

Runner baseline, unchanged input/collision/scene modules and existing regression test were checked against their GitHub blob SHA-1 values. Full regression, build/typecheck, Node 22 and Chromium have not been rerun here.

Command: node --test tests/door-passage-input.test.mjs tests/door-visual-check.test.mjs

## Acceptance gate

Publish this fix in the same branch and rerun Door Visual Evidence. A successful helper test is not a successful browser passage. Inspect the new report.json and passage-attempt/passed-through frames for that exact commit. If it still fails, use the recorded input/coordinates/revision rather than removing or loosening the crossing check. Point 17 combat transfer remains pending; main is unchanged.
