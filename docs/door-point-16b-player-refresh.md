# Point 16b checkpoint 1: safe collision refresh for the existing player

Base: a18241e086b883e84e786abd13d1674a0258ebb3, iteration-5b-interaction-completion. The user reports CI passed for all published work through this base. That is not a result for this new patch, nor visual acceptance.

## Implemented boundary

createGalleryPlayer exposes refreshColliders(source). It builds and validates a replacement collision world with the original captured world bounds and player radius. If the new world overlaps the current player position, it throws. Only after successful validation is the live collision grid replaced. No actor recreation, teleport, time advancement, lamp change, velocity/camera reset or contact callback occurs during refresh. Failed validation leaves the old grid and actor unchanged.

The collision engine already copies source polygons, so subsequent caller mutation does not silently alter the installed grid. Capturing bounds once also prevents a later mutation of the constructor argument from changing the refresh world.

createGalleryApproach exposes a forwarding refreshColliders only when the underlying player supports it. After a successful refresh, an existing planned route is explicitly cancelled as obstacles-changed; a failed refresh leaves the pending route and actor unchanged. With no active route, the intention is retained and can be planned against current geometry. Every successful explicit refresh counts as a geometry-change signal for route cancellation, even if a caller supplies equivalent data. The owner must therefore call it only when collision revision changes, not per frame.

## Verification actually performed

14 new tests passed locally on Node v20.20.1, plus syntax checks. The tests use the actual player, approach, route planner and circle/polygon collision engine. Collider layouts are synthetic fixtures; velocity, heading and foot-contact animation hooks are scripted. The production TypeScript motion/animation module, assembled scene, binding endpoint and browser are not executed by these tests.

Coverage: the same player blocks before refresh and crosses afterwards, traverses both directions, stays blocked by posts/open leaf, preserves state on success and failure, rejects an overlapping replacement, retains the prior successful world after a later failure, copies bounds/source data, keeps players independent and correctly forwards/cancels an active approach.

An additional local comparison against the unchanged player source matched snapshots for 480 no-refresh simulation ticks. This is targeted compatibility evidence, not the existing full regression suite. Both changed source baselines and the unchanged collision/route dependencies were verified against GitHub blob SHA-1 values.

Command: node --test tests/gallery-player-collider-refresh.test.mjs

Full regression, build/typecheck, Node 22 CI, real motion hooks and Chromium were not run here. No new CI/browser/visual result is claimed.

## Not yet activated

This checkpoint changes only player and approach modules. gallery-interaction, gallery-door-binding, scene endpoint commit and the visual runner are unchanged. There is still no automatic call to refreshColliders or openPrisonDoorPassage in the app; gameplay passage remains blocked. The original point 15 browser audit remains valid for this inactive checkpoint.

## Resume within 16b

1. Forward refresh privately through createGalleryInteraction to the door owner. Keep old/scripted players without support fail-closed.
2. Read getCollisionRevision and refresh only when it changes, before movement. Publish the authoritative motion-open snapshot to openPrisonDoorPassage and refresh the same actor after the commit, before its next step.
3. Verify the full producer/real-player/scene chain, normal opening/traversal, pending-route cancellation, stale owners and scene recreation. Preserve fail-stop behavior on a rejected refresh; do not teleport the actor. Consider preflight before scene commit if overlap can occur outside the current canonical placement/interaction path.
4. In the same activation patch, update the browser collider audit to expect exactly the leaf relocation after open and add real keyboard traversal. Do not activate passage while leaving the old unchanged-colliders assertion in place.
5. Confirm new CI and inspect same-commit evidence. Point 15 visual acceptance is still separate.

main branch, F, door speed/direction, lights, lamp expenditure, combat integration and gallery renewal are unchanged.
