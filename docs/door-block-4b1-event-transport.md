# Door block 4b.1: ordered lifecycle event transport

Base: 226e998443e82eb097065cf4df566019103dc5d1, iteration-5b-interaction-completion.

This is the first saved part of 4b, not completion of scene integration.

## Change

createGalleryInteraction accepts captureEvents=false in its existing options object. The option must be boolean. When explicitly enabled, every recorded lifecycle event is appended to a separate delivery queue. drainInteractionEvents() transfers the pending batch in emission order and empties that queue. Records are frozen; the returned array belongs to the caller.

The existing interactionEvents() diagnostic history remains capped at 200 and continues to return mutable copies. Reading history does not consume delivery or enqueue replay. The transport is disabled by default, so existing app callers do not accumulate an unconsumed delivery queue.

No synchronous observer callbacks are introduced; downstream code cannot re-enter the lifecycle while a record is being emitted. Draining never advances simulation or validates snapshots. Snapshot/interaction reads may already emit cancellation through existing target/death validation; those events are captured too. dispose retains the final cancellation, if any, for a final drain. Later drains are empty unless another event was recorded before disposal.

## Owner contract for the next part

- One consumer per lifecycle. Each drain transfers ownership; there is no acknowledgement or automatic retry. If downstream delivery throws, the owner must handle the remaining local batch explicitly rather than replaying diagnostic history.
- Enable capture only when an owner will regularly drain after lifecycle operations, including step, state validation reads, explicit completion and final disposal.
- Unlike diagnostic history, pending transport is not truncated. A stalled consumer can grow memory usage; keep capture disabled without an active consumer and drain each simulation cycle.
- Create a new bridge when creating a new lifecycle. Do not feed history to a fresh bridge.
- Drain and handle the final terminal event before releasing the owner, or deliberately discard the final batch while disposing the bridge. This patch does not change death/interruption policy.

## Tests actually run

Node v20.20.1: 18 new transport tests plus the unchanged 20 interaction-lifecycle tests passed, 38/38 total. Syntax checks passed for the changed producer and new test file. The producer baseline, five production dependencies and unchanged regression test were checked against their GitHub blob SHA-1 values before testing.

The new integration tests use the real lifecycle producer, start gate, intent manager, animation clock, 4a adapter and door state. Movement/player and the scene registry are scripted boundaries. The tests verify the actual effect threshold, cancellation, early completion, old action IDs, wrong targets, disposal, default compatibility, immutable records, read-only drains, and delivery of 502 events despite diagnostic trimming at 200.

Command: node --test tests/interaction-event-transport.test.mjs tests/interaction-lifecycle.test.mjs

These tests do not exercise the real movement player, timed door motion, assembled scene, renderer or browser. No full regression, build, typecheck or Node 22 CI was run for this patch. Base block 3/4a CI has not been confirmed in this checkpoint. No CI success or visual acceptance is claimed.

## Boundaries

No app wiring, mesh update, F changes, new collision logic, passage unlocking, light, lamp cost, combat scene or main changes. In-game behavior remains unchanged. The bridge and timed motion modules are unchanged.

## Resume: 4b.2, scene owner and geometry

1. Confirm CI before treating pending checkpoints as verified.
2. Find the app owner creating createGalleryInteraction and the assembled scene; activate transport only together with a consumer.
3. Own one timed motion and 4a bridge per prison-door.a/lifecycle instance. Advance motion on simulation ticks and specify whether a newly started motion advances in that same tick.
4. Preserve interaction identity: gallery-interaction, intent reconciliation and the start gate compare parts array references. Current scene-core describe also derives approach.y from mesh.bounds.maxY, so do not accidentally move the approach point while publishing a swinging leaf. Plan stable approach/identity separately from animated bounds.
5. Publish only leaf changes. Preserve the frame and all closed colliders. Dispose delivery, clock updates and scene ownership together.
6. Test the real producer-to-motion path, stable ownership/approach, frame and collider invariance, and disposal before claiming live scene integration. Browser/visual acceptance is a separate gate.

Later: collision/passability, lighting, lamp expenditure, combat integration. Gallery renewal stays in BACKLOG.
