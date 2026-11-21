# Last Service iteration 2 — review candidate

Scope: route from vestibule to the lower-chapel threshold; seven mandatory encounters, all six undead archetypes including an optional Bloated Remnant, combo/heavy/dodge/archer/cancel/execution/ritual dialogue lessons, two gallery cover blocks, side storage and return loop. The existing boss and remaining narrative animations are not added here.

The standalone HTML entry and build:prologue command from iteration 1 remain. The HTML title still labels the original iteration; menu integration and presentation cleanup remain pending. Scene descriptions in last-service-script.js are not treated as completed animations.

A mandatory encounter advances on its own enemy IDs, not global victory. Optional enemies remain in the roster when a subsequent encounter begins; ignoring the optional room does not prevent route completion. Wait for flying arrows and active executions before transitioning. Normal kills satisfy progression; full lamp and skipped rituals never lock exits.

Ritual placement now accepts optional origin/positions while keeping the default placement for existing callers. Existing restoration values and interactions are unchanged. Retry restarts the route while retaining read lessons, not a persistent save or room checkpoint. The endpoint only reports that the second-iteration route is complete; no boss is spawned.

Verification: pending full repository build, typecheck, regression and browser run. Pure route tests and syntax checks are preparation checks only. Verify door sweep, every spawn, optional bypass, side-loop traversal, arrow collisions, actual combos and R execution, ritual with full/depleted lamp, death/retry and original levels before acceptance.

Prepared locally: syntax checks and five pure route tests with a mocked tutorial passed. Browser smoke script is included but was not run here. After build:prologue, run `node tools/browser-check-last-service.mjs`; its result covers introduction and the first dialogue, not the full route.
