# Door block 4a: lifecycle-to-motion adapter

Base checkpoint: 7454a387bba362f67a1b5f42f37d797bb5d01dd6, iteration-5b-interaction-completion.

## Implemented boundary

createDoorEffectBridge(motion) accepts a prison-door.a motion dependency exposing snapshot and beginOpening. The frozen API exposes accept(event) and dispose(). A matching interaction-start arms the adapter without opening the door. Only a subsequent interaction-effect with matching positive safe-integer action and intent IDs delegates beginOpening, at most once. accept returns true only when that delegation returns true; start, terminal and ignored events return false.

A matching interaction-cancelled or interaction-end disarms delivery. Old starts cannot rearm a terminated action. Newer action IDs supersede older ones. Wrong targets, malformed IDs and mismatched terminal events do not change the owner. Input event objects are not retained. Disposal rejects all later delivery. Dependency exceptions propagate, but the effect is consumed before delegation so the same action is not retried.

## Delivery contract for 4b

One adapter per gallery-interaction lifetime: action IDs are monotonic only within that lifetime. Feed newly emitted lifecycle events in their original order, including start and terminal events, not isolated effects. Do not repeatedly poll and replay interactionEvents(): it is a bounded diagnostic history, not a reliable event transport. Fresh adapters cannot distinguish old history from live events. Live producer subscription/delivery remains unimplemented in 4a.

This adapter has no clock and does not finish, rewind or cancel an already-started motion. A terminal event only disarms future effect delivery. Scene disposal must separately stop scene-owned simulation updates in 4b. Gameplay death/interruption policy is not added by this module.

## Verification

20 new tests passed locally on Node v20.20.1, including tests against the real door state and real prison-door motion. The five existing production dependencies used locally were checked against their GitHub blob SHA-1 values. They are not changed by this patch. Syntax checks passed for the two new JavaScript files.

Command: node --test tests/door-effect-bridge.test.mjs

This is not a test of the live lifecycle producer, scene wiring, browser rendering or physical passage. Existing regression tests, build, typecheck and supported Node 22 CI were not run for this checkpoint. No CI success or visual acceptance is claimed. The prior block 3 CI is also not confirmed here.

## Exclusions

No changes to existing runtime files, F, scene meshes, stable target ownership, collisions, lamp expenditure, lights, combat-scene integration, main or gallery renewal. In-game behavior is unchanged until scene wiring is added.

## Resume at 4b

1. Confirm base and new CI results before treating checkpoints as verified.
2. Inspect the scene owner and live lifecycle event transport; add ordered delivery without replaying bounded diagnostic history.
3. Give the scene one motion/adapter pair and stop both delivery and simulation updates at disposal.
4. Publish changing leaf geometry without replacing interaction identity by accident: current validation compares target.parts by reference.
5. Add real producer-to-motion integration tests, then scene mesh tests. Keep frame and closed colliders unchanged.
6. Keep visual acceptance separate from automated test success; collision/passability work remains a later block.
