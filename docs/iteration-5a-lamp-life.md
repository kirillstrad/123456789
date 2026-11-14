# Iteration 5A: lamp life — core package

Base: iteration-5a-lamp-life, 0488b1d7d13d74775d9bbb97719e3c8d3c44c1ee.

Prepared source changes, not a completed or visually accepted iteration.

- One-use last-ember protection applies only to explicit door/ignite/campfire interactions, not ordinary attacks, dash or execution.
- A further hit at one HP is fatal. Lethal damage cancels the active interaction synchronously.
- Preview cost before activation; spending the remainder leaves the last ember. Each interaction pays at most once.
- Campfire recovery API accepts cumulative granted charge, not per-render increments. Repeated or stale callbacks cannot double-heal.
- Reset does not reuse interaction IDs. Dead, completed and invalid tokens cannot restore, spend or finish.
- Interaction entry locks hero commands but continues enemy simulation.

Not in this package: F targeting/pathfinding, real interaction clips, world light effects, HUD removal, lamp dimming, death-render priority, campfire choreography, portable/Windows build.

Tests added: lamp-life.test.mjs, lamp-world.test.mjs. Local result: 6 isolated policy tests and 11 model contract tests with dependency stubs passed. This is not a run against the actual project dependencies; no full project typecheck/build, browser acceptance or complete CI is claimed. Full CI is deferred until all agreed functional blocks are complete. A skipped CI run is not a passing CI run.

No main merge. No existing working branch changes.
