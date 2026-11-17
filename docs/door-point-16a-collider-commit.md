# Point 16a: explicit open-door collider commit

Base: de28de92e7a14c5b7136cdddf5f3f34a6e3db554, iteration-5b-interaction-completion.

## Scope

First checkpoint of point 16. It adds scene-side collision publication, not automatic gameplay passage. The app binding, existing player and browser evidence runner are unchanged and do not invoke the new method. In-game passage therefore remains blocked. Point 15 browser/visual acceptance is not confirmed here.

## API and collision policy

openPrisonDoorPassage(doorSnapshot) returns true only on the first valid commit for prison-door.a. It requires both the published scene angle -90 and a completed motion snapshot with matching door ID, status open, angle -90, progress 1 and a positive safe-integer action ID. Invalid/missing snapshots or door, wrong role, premature calls and repeated commits return false without mutation. The snapshot is a caller-supplied state contract, not an unforgeable capability; 16b must supply the authoritative scene-owned motion snapshot.

Geometry updates alone never change collisions. Until explicit endpoint commit the original closed blocker remains, even while the leaf is visually opening. At commit only the leaf collider is replaced: its footprint rotates by the open angle about the same world hinge as the geometry. The open leaf stays physically solid at its new position, while the central opening is freed. Frame posts and other objects keep their collider objects/values. Collider count, object ID and height range are preserved.

The method compares the current door collider sequence with the canonical closed authoring before replacing anything. Incompatible data throws before any commit. Closure after a collision commit is not implemented: setPrisonDoorAngle rejects angles other than -90 after commit, preventing a closed visual leaf with stale open collisions.

getCollisionRevision() starts at 0 and becomes 1 on the successful commit. Reads, camera culling and repeated commits do not increment it. Both new APIs reject use after scene disposal.

## Verification actually performed

16 new tests and the unchanged 10 gallery-scene-core tests passed together: 26/26 on Node v20.20.1. Syntax checks passed. Scene baseline, seven unchanged production dependencies and existing regression test were checked against GitHub blob SHA-1 values.

The tests use real articulated geometry, timed motion, scene assembly and circle/polygon collision engine, including radius .24 and height 1.8 for ground-level passage. They verify closed/partly-open blocking, endpoint gating, full center passage, transformed placements at 0/37/90/180 degrees yaw, solid posts and open leaf, collider identity/height/ownership, exact-once revision, atomic rejection, scene metadata and disposal. They explicitly demonstrate that a collision world built before commit remains stale, whereas a newly built world sees the passage.

Command: node --test tests/door-passage-colliders.test.mjs tests/gallery-scene-core.test.mjs

This is not an actual-player or browser passage test. Full regression, build/typecheck, supported Node 22 CI, visual acceptance and the new browser workflow result were not verified here.

## Resume: point 16b

1. Confirm pending CI/evidence and point 15 status; do not infer visual acceptance from these tests.
2. Add a safe refresh path for the existing player's collision world. Creating a new scene collider snapshot alone does not update createGalleryPlayer's already-built collision grid. Prefer revision-triggered refresh, not per-frame reconstruction.
3. Connect the authoritative motion-open endpoint to openPrisonDoorPassage and refresh the actor before its next movement step. Keep frame/leaf solid and avoid duplicate commits, position resets or stale scene references.
4. Test actual player approach, opening and traversal, including reversal/near-post movement, scene recreation and stale owners. Handle a pending approach when collision geometry changes explicitly.
5. Update the point 15 browser audit: it currently expects every collider to remain unchanged. In 16b it must expect closed collisions before endpoint and the single correct leaf relocation afterwards; preserve frame/other-object checks. Add real keyboard passage evidence.

Do not enable the commit in the binding without the actor refresh and matching tests. main branch, F, opening speed/direction, light, lamp expenditure, combat integration and gallery renewal are outside this checkpoint.
