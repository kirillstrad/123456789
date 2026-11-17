# Point 14 checkpoint: app transition contract matrix

Base: d3137b69e4762dbc96ff2464204cafd16f9532c0, iteration-5b-interaction-completion.

## Scope and status

This is the Node contract-test portion of point 14, not full acceptance of that point. Only a test and this documentation are added. Production behavior is unchanged. The previously published point 13 remains subject to CI/build/browser confirmation.

The test reads the actual renderGallery, openGallery, closeGallery, gallerySetCamera, walkGallery functions and __ASH_GALLERY__ declaration from src/app/main.js. It loads actual door state, timed motion, effect bridge, binding, intent, start gate, animation clock and interaction factory source into an isolated VM. Only ESM import/export syntax is removed; app transition bodies and runtime logic are not rewritten. The real open-angle constant is selected from its production declaration. Extraction deliberately fails if the current one-line app declarations change shape.

Scene assembly/geometry, movement player, approach, contact processing, renderer, DOM and input transport are explicit test doubles. Their geometry/collision correctness and keyboard behavior are not tested here. Simulation steps are issued by the test, not by requestAnimationFrame.

## Coverage

12 tests cover:

1. Open/walk/open without duplicate owner creation.
2. Repeated walk before effect: old action cancelled, fresh action can start.
3. Repeated walk during opening: retained scene motion, no second clock.
4. Camera preview freezes motion; walking resumes the same scene.
5. Camera switch before effect does not replay the cancelled action.
6. Open state survives focus and owner recreation.
7. Close disposes player ownership before scene and resets input/timing state.
8. Close/open creates a closed new scene, unaffected by old references.
9. Invalid camera/focus leaves the current owner intact.
10. Actual renderGallery/debug read paths do not advance motion.
11. Initial preview-render failure exercises openGallery cleanup.
12. Twenty close/reopen cycles reject stale publication from all old owners.

## Verification actually performed

12/12 passed locally on Node v20.20.1; syntax check passed. No defect was found in these cases, so no production fix is included. The test reads repository sources when run there.

For the local focused fixture, the exact five app function lines and one debug-API line selected from GitHub blob e8547a7ff85ef376e8e989f6dae5cfc25b70597d were copied without changing their bodies. The rest of main.js was not loaded. Eight complete runtime module copies were verified against GitHub blob SHA-1 values; the open-angle declaration was selected verbatim, not replaced with a test-specific angle. The checkpoint archive records the selected-source fragment/hash and local TAP results. This is not a full-app boot or browser run.

Command: node --test tests/gallery-door-app-lifecycle.test.mjs

Full regression, build, typecheck, Node 22 CI, real movement/approach and browser execution remain unverified. There is no CI result or visual acceptance claimed for this checkpoint.

## Remaining point 14 gates

- Repeat the transition matrix with actual createGalleryPlayer, createGalleryApproach, scene assembler and application tick loop after build. In particular, check spawn/collider validity and interaction reaching the effect without scripted arrival.
- Run browser close/open, repeated walk and camera/focus paths with actual input and renderer, both during opening and after open. Confirm the documented preview-freeze/resume policy.
- Check stale external/debug references and pending events with real player disposal. Extend failure-path coverage beyond initial preview rendering as needed.
- Confirm CI for this checkpoint and the pending previous checkpoints before marking point 14 complete.

Point 15 handles visual contact/hinge/speed acceptance. Collisions/passability, lighting, lamp expenditure, combat integration, main branch and gallery renewal remain outside this checkpoint.
