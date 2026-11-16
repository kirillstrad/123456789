# Door block 4b.2: scene geometry publication checkpoint

Base: 3deab270458b85160eeb93b317816aea0e94d8bf, iteration-5b-interaction-completion.

This checkpoint implements scene geometry publication, not full 4b.2 application wiring. The new API is not called by the application yet. In-game behavior is unchanged.

## Implemented

assembleGalleryScene exposes setPrisonDoorAngle(angle). It accepts finite numeric degrees from -90 through 0. A missing prison-door.a, a non-door entry or the already-published angle returns false. A changed angle returns true. Invalid angles and calls after scene disposal throw.

The method builds real articulated prison-door geometry using the captured placement transform. It preserves the original target parts array and original frame part objects, replaces only leaf part records, and refreshes render bounds for culling. Mesh length is checked before publication. This API assumes the canonical prison-door.a frame/leaf ordering; it is not a generic arbitrary-mesh articulation API.

Approach coordinates are captured at scene assembly and returned as copies instead of being recalculated from animated render bounds. The target identity and approach therefore remain stable. Scene stats, world bounds, spawn, floor cache, global light data and all closed colliders remain unchanged. No state machine, clock or input handling is added to the scene. This is a geometry API, not authorization to close/reopen a gameplay door.

The setter replaces records in the shared target parts array, so an older target descriptor sees the latest geometry. It does not mutate old leaf part objects; callers needing historical geometry must copy the array rather than retain only the array reference.

## Verification actually performed

14 new tests plus the unchanged 10 gallery-scene-core tests passed together: 24/24 on Node v20.20.1. Syntax checks passed for the changed scene module and new test file. The scene baseline, six existing production dependencies and existing regression test were checked against GitHub blob SHA-1 values.

Tests use the real scene assembler, floor, geometry and timed door motion. They cover transformed placements, frame object identity, stable parts identity, anchored approach, collider values/references, culling of the open leaf, no-op updates, invalid data, incompatible mesh length, cache/metadata stability, disposal and independent scenes. A full 72-tick motion is explicitly published into the scene by the test, not by an application owner.

An initial bounds-extension test used a placement whose frame still defined maxY. It was corrected to a 180-degree placement that actually changes maxY; the approach assertion was retained. Production code did not need a change for this test correction.

Command: node --test tests/door-scene-publication.test.mjs tests/gallery-scene-core.test.mjs

No application/browser test, full regression, build, typecheck or supported Node 22 CI has been run for this checkpoint. Base 4b.1 CI is not confirmed here. No visual acceptance, live F opening or passability is claimed.

## Unchanged boundaries

main branch, src/app/main.js, lifecycle/transport, door clock, input F, collisions, passage, lights, lamp expenditure, combat integration and gallery renewal are unchanged. The door still does not open in gameplay.

## Resume: remaining 4b.2 owner/application integration

The app entry point was inspected at blob e8547a7ff85ef376e8e989f6dae5cfc25b70597d.

- walkGallery creates createGalleryInteraction around approach/player. Enable captureEvents only with an active queue consumer.
- The gallery tick loop calls galleryPlayer.step at 1/60. Own the timed motion there or in a tested wrapper, not in renderGallery. Define whether the first effect tick advances motion or only starts it.
- Drain fresh lifecycle events into the 4a bridge, then publish changed angles through setPrisonDoorAngle. Do not replay interactionEvents history.
- renderGallery, debug APIs and getReport can call snapshot/interaction, which can emit cancellations. Cover those events without advancing the door clock on reads.
- closeGallery disposes the player and scene. gallerySetCamera and walkGallery can dispose/recreate a player without replacing the scene. Decide and test ownership across all three paths: do not accidentally reset an open door, reuse old action-ID ownership, leak a delivery queue or continue a detached clock.
- Test actual lifecycle-to-motion-to-scene behavior, cancellation before effect, stable identity, no duplicate effect and stale updates after disposal before claiming integration.
- Confirm pending CI. Browser visual acceptance remains a separate step. Collision/passability follows separately.
