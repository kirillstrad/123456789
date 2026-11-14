# Iteration 5A: lamp life — implementation status

Branch: iteration-5a-lamp-life. Core commit: 62c42481bce8fcbf3738996ed3a334e44a628ba5.

## Published core
- One-use last-ember protection for explicit door/ignite/campfire interactions.
- A further hit at one HP is fatal; lethal damage cancels the interaction immediately.
- Pure cost preview, one charge per interaction, cumulative campfire recovery credits.
- Stale, completed, reset or dead action tokens cannot grant late recovery.
- Hero commands lock during an interaction; enemy simulation continues.
- Local core checks: 6 policy tests and 11 model contract tests with dependency stubs. Not actual project integration.

## HUD and death-selector package
- A single centered LAMP panel replaces mirrored HEALTH and LAMP panels.
- ASCII warnings: LOW EMBER, LAST EMBER - ONE HIT LEFT, THE FLAME IS OUT.
- The existing throne menu and ASCII glyph callback contract are retained.
- Dead phase takes priority over stale dash, attack, sweep, hit and execution state.
- Cancelled execution metadata cannot override the hero death clip.
- Dead heroes bypass foot-contact/entry bridging and cannot emit lamp flame from stale charge.
- Death sampling uses a clamped death clock; the settled pose does not follow the global clock.
- The former frozen-hero execution regression is updated to expect a progressing death clip. Enemy choreography remains frozen after cancellation.

Local checks: 5 HUD tests with a mocked canvas and 4 death-selector contract tests with dependency stubs passed. The original-vendor execution-render suite is updated but NOT run locally. No visual acceptance is claimed.

## Still pending in iteration 1
- Connect critical lamp intensity/radius to the world renderer.
- Correct the obsolete HEALTH-mirrors-LAMP report note.
- Actual-game integration and visual review, including the transition into death.

F targeting, pathfinding, doors, ignition effects and campfire choreography belong to later blocks. The preview warning API is not yet connected to an F target UI.

Full project typecheck/build, browser tests and complete CI are deferred to the agreed final cross-block pass. A skip is not a passing CI run. No portable/Windows build or main merge is claimed. Original working branches remain untouched.
