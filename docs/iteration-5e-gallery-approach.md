# Gallery approach: verification portion 2

Prepared against iteration-5b-interaction-completion commit 50524a14a48a933e72f4952473d13aaadd71bc7c. This portion adds one test suite and this document. No production code, runtime artifact, object model, collider or app wiring changes are included.

## Test contract
Run npm run build before node --test tests/gallery-approach.test.mjs (or before npm test). The suite imports motion functions from runtime/animation/motion.js, as existing project movement tests do. Its first test checks inertia fields to reject the known stale tracked runtime; this is a guard against that known old artifact, not a complete provenance check for every possible runtime build.

The suite runs the actual gallery player, approach controller, route planner, collision implementation and intent manager. Scene/target registries are small deterministic fixtures; authored 171-object scene geometry, DOM events, rendering and foot-contact adaptation are not exercised. Forced planner results and a stuck navigate callback are injected only in explicitly named failure tests.

24 tests cover exact arrival, facing and stopping; capped fixed-step travel; a wall detour with the real collision radius; manual movement and held-key cancellation; target removal/replacement/locking/hiding and moved approach; obstacle/context/permission loss; registry lookup without a visible frame; unreachable, budget, exception and range failures; stuck/path-blocked cancellation; diagnostic reconciliation; new physical requests; stable arrival and finite inertia fields; manual acceleration/braking; invalid input; snapshot isolation; and rejection of non-gallery intentions. Arrival does not launch an interaction, spend lamp, mutate the enemy or open a door.

## Local verification and its limits
24 tests and test-file syntax checks passed on Node v20.20.1. TypeScript, Playwright and the project build toolchain were unavailable in the local execution environment.

The five JavaScript production inputs were verified against their GitHub blob IDs before testing:
- gallery-approach.js: fccef46a95e228e6a6bf44fc53fcba6931eb8346
- player.js: 0e8cac46812ff6050a2e5ebbf98ea05e9eeda556
- approach-route.js: 8ecb42b8bc3479962aaa9b80e0e8a24ed13cc9cc
- collision.js: e77cbcc1a52cce38a733e50b5e91f190b01bd4d7
- intent.js: b1d3f73606209bc12405c038ac58c98916994cdc

For this isolated local run only, motion.ts (ad7eedb33b4c6ab5efcbbea6898bbd58ae49f918) and inertia.ts (8cadeeee348cbe92e73b7d643e909771e8b20853) were verified, then converted to executable JavaScript by explicitly removing type-only declarations and annotations. Their movement/inertia calculations were retained, not replaced with a motion stub. These temporary files and the conversion procedure are NOT project build outputs and are NOT part of this commit. This run is not equivalent to the supported TypeScript build/typecheck.

The tracked runtime blob a501e46a8d6879e17e0a5a55e575e6a4e6fd36a7 lacks the inertia fields present in the current TypeScript source, so it was not used as evidence of current movement behavior.

Required next verification: supported Node >=22, npm run build, this suite with the actual emitted runtime, then a joint run with gate and lifecycle/handoff tests. Full CI, a native browser run and visual acceptance have not been performed for this portion. The earlier successful CI did not contain this new test file.
