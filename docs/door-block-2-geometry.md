# Door block 2: frame and leaf geometry

Base: 31a6949b82eb04d2182a8bdea529f84c3e00e6c1, iteration-5b-interaction-completion.

The prison-door authoring is extracted into a shared module with semantic frame/leaf emission boundaries. The existing furnishing builder delegates only its prison-door case to that module. All catalogue variants still use their original closed geometry; no angle is enabled in the scene.

The explicit buildPrisonDoorGeometry({angle,transform}) API produces only prison-door.a. Angles are degrees in [-90,0]. The candidate hinge is the local vertical axis through [-0.8,0,0]; -90 opens toward local negative Y, away from the existing positive-Y approach side. This hinge/angle still needs visual acceptance.

The result includes frameParts and leafParts covering the same parts array, plus world-space hinge and angle. Bars, straps and lock rotate together; frame geometry does not rotate. Each call builds fresh geometry; input transforms and previous outputs are not mutated. Rotated bounds and depth-sort keys are recalculated. World position/yaw are supported and non-finite output is rejected.

All colliders deliberately remain the original CLOSED colliders, including the leaf blocker, even for an open-angle result. This API is geometry-only and must not be treated as an open physical passage. There is no state wiring, F handler, timer, live scene update, collision refresh, resource cost or gallery renewal. Frame clearances and absence of visual intersections are not accepted by numerical tests alone.

Verification: 11 geometry tests and JavaScript syntax checks passed locally on Node v20.20.1 using the real geometry implementation. A separate local comparison against the verified pre-refactor furnishing source matched all 36 furnishing meshes (12 families x 3 variants). Tests include a pre-extraction prison-door reference for all three closed variants and placement transforms.

Unchanged local inputs were verified by GitHub blob IDs: registry fc849ce15af26c7ea740d51651bfd75e4f442c4c, geometry 105e556c99e8eaaf32c6727b8c7cb8c2bd7e004e, original furnishings eb3f68710c4b035e53681e62f019f0c8a1cb07b6. Temporary baseline copies are not committed. Node 22 full build/regression awaits branch CI; no browser or visual result is claimed.

Next block: time-based leaf movement and exact endpoint stopping, still separate from F and live collision changes.
