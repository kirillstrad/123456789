# Point 13: gallery door application binding

Base: 0b4ea572437e5faf36880d98e2c1844ed37ee641, iteration-5b-interaction-completion.

## Connection

The existing app already creates createGalleryInteraction in walkGallery and calls its step on fixed simulation ticks. This patch changes that factory, not src/app/main.js. A scene exposing setPrisonDoorAngle and a door target prison-door.a receives a bound facade; other scenes retain the original behavior. No new F handler is added.

For bound scenes, captureEvents is enabled internally even if omitted/false. The facade is the only delivery consumer; public drainInteractionEvents returns []. Diagnostic interactionEvents remains readable. This deliberately updates the earlier default-off rule only for bound scenes.

Each step runs the real lifecycle, drains fresh events through the 4a bridge, advances previously-started motion and publishes changed angles. The effect tick starts opening at zero; motion starts advancing on the next tick. Snapshot/interaction/finish calls flush events but never advance motion. doorMotion() exposes an immutable diagnostic view; no global browser debug API is added.

## Minimum ownership guards

A WeakMap retains one motion per scene, with a fresh bridge per interaction lifetime. Concurrent owners are rejected. Disposal stops updates, releases ownership and discards pending delivery without resetting the angle. A later owner resumes the retained motion. Without an owner stepping, including camera-only preview, motion is frozen. New scenes start closed.

Disposed scenes fail before either simulation clock advances. Downstream errors detach the owner and propagate without event replay. Invalid dt/input does not detach the owner. Terminal events after effect do not rewind motion; existing hero cancellation/death rules are unchanged. These guards are not completion of point 14's real-app transition matrix.

## Verification

14 new tests passed on Node v20.20.1 with real lifecycle, intent/start gate, animation clock, bridge, timed motion, scene assembler and geometry. Player movement/arrival is scripted, not the real player. Coverage: effect timing, full opening, stable frame/target/approach, unchanged colliders, read-only state access, cancellation, repeated actions, invalid inputs, disposal/rebinding and independent scenes.

A separate local parity comparison against the unchanged producer baseline passed 4,000 ticks over 20 actions across two unbound-scene cases. This is not the existing regression suite. Syntax checks passed for all three JS files. Baseline and 11 unchanged production dependencies were checked against GitHub blob SHA-1 values.

Command: node --test tests/gallery-door-binding.test.mjs

Full regression, build, typecheck, supported Node 22 CI, real movement player, keyboard/DOM, renderer and browser were not tested. Previous CI is not confirmed here. No visual acceptance or keyboard-triggered opening is claimed.

## Status and resume

Point 13 implementation is prepared for publication. The existing app path is connected by the factory change, pending CI/build/browser confirmation. App entry, geometry setter, state/motion/bridge, F, closed colliders, light, lamp cost, combat scene and main branch are unchanged. Passage remains blocked.

Next: publish and confirm CI. Point 14 tests real close/open, repeated walk, camera preview/focus, owner recreation during/after opening and stale references. Point 15 verifies browser contact timing, hinge/direction, speed and intersections. Collision/passability follows separately; lighting and gallery renewal remain outside this patch.
