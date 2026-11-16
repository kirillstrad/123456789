# Door block 4 checkpoint

Base commit: 0233bb38eaf71829769d0cd946eb769e4d941cfc.
Branch: iteration-5b-interaction-completion. Do not modify main.

## Verified during repository inspection

- gallery-interaction.js records interaction-effect once per active action. Events contain id, intentId and targetId.
- Active target validation compares target.parts by reference. Replacing that array during animation can cancel the interaction as target-lost; resolve ownership before live mesh publication.
- prison-door-motion.js exposes snapshot, beginOpening and step. It does not own scene geometry, input or colliders.
- Block 3 is published. Its CI and visual acceptance have not been confirmed in this checkpoint. No new tests or builds were run during this inspection.

## Small implementation checkpoints

1. 4a: deliver an interaction-effect to the matching door/action exactly once. Test wrong targets, repeated delivery and cancellation before effect. Keep live mesh wiring out of this subblock.
2. 4b: own the motion in the scene, advance on simulation ticks, publish leaf geometry without losing stable interaction ownership, and stop updates on disposal. Keep frame and colliders unchanged.
3. 4c: test the complete interaction-to-mesh path and perform browser visual acceptance. Fix the current block before proceeding.

Each implementation checkpoint must include its tests, documentation, a separate commit and an exact next-step record. Distinguish prepared, published, CI verified and visually accepted. Request approval for exact repository writes.

## Exclusions

No new F handler, collision changes, passage unlocking, lamp expenditure, lights, combat-scene integration or gallery renewal. These remain later work. Do not silently change death/interruption rules; verify existing agreements before implementation.

## Resume here

No block 4 implementation has been written or published. Inspect scene ownership, animation event consumers and existing integration tests before implementing 4a. CI status of the base commit must be confirmed before treating block 3 as verified.
