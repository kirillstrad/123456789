# Interaction lifecycle: verification portion 3

Base: iteration-5b-interaction-completion at fe45e239e432dd94a1ca3a96725b4488ca728d3f.

## Scope
20 contract integration tests combine the real gallery-interaction lifecycle, interaction start gate and intent manager. The approach/player facade and scene registry are explicit deterministic test doubles. This does NOT execute the real approach controller, route planner, player physics, authored animations, renderer, DOM input handlers or the full game scene.

The tests cover ownership transfer after a reported arrival, single launch, cancellation before arrival, non-interruption by manual input or nonfatal damage after launch, matching completion IDs, stale completion rejection, input ownership return, death before/within a step, context/target loss, registry exceptions, disposal, immutable diagnostic copies, shared launch behavior for door/ignite/campfire, busy-input policy, target replacement during the delegated step, invalid steps and one remaining ember.

No production behavior or gallery content is changed. The current awaiting-animation assertions describe the existing development scaffold, not the finished feature; update them deliberately when adding the authored animation driver. No door effect, ignition effect or lamp cost is applied by this portion.

## Verification
All 20 tests and test-file syntax checks passed locally on Node v20.20.1. The three production files used for this isolated run were verified against their GitHub blob IDs:
- gallery-interaction.js: a2d5af9d7a644c2a8f32755b4ef735c0e0abe997
- start-gate.js: 0d9517d01ea6db175c99cc23e7f0a0ae089dc052
- intent.js: b1d3f73606209bc12405c038ac58c98916994cdc

No TypeScript conversion or motion stub was needed because this suite stops at the scripted approach interface. This does not replace the earlier movement suite or prove the full movement-to-action path.

Pending: supported Node >=22 build/typecheck, joint execution with the gate and real movement suites, and a real-player handoff test. This portion alone does not close iteration 1 or claim CI/browser/visual acceptance.

## Next implementation boundary
After the remaining real-player handoff and supported-build verification, connect the authored action driver with matching-ID completion and explicit failure handling; then implement one door and its actual collision update. Gallery renewal is separately deferred in BACKLOG.md and is not a prerequisite for these tasks.
