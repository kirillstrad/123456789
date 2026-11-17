# Lighting patch 2: opt-in controlled light geometry

Adds buildLightGeometry for the nine existing brazier, candlesticks and wall-light variants. Default state is off. Legacy buildRemaining and gallery call sites are unchanged; this patch does not darken existing scenes.

The adapter invokes the original authoring and verifies each existing flame sequence (dot, triangle, light), capturing body/flame membership and emitter positions. Unexpected authoring fails explicitly. Lit output matches catalogue parts, lights, colliders and bounds. Off and igniting expose only body geometry with no lights; smoldering adds dark ember dots but no full flame or scene light. The future contact event must change state to lit. Progressive ignition power and flicker belong to patch 6.

Metadata includes all emissionPoints, the first authored emitter as contactPoint, approach and facePoint. Local approach is negative Y: 1.1 for braziers, 0.85 for candlesticks, 0.95 for wall lights. Wall-light brackets are on local positive Y; approach is on the exposed negative-Y side. Points are transformed with instance translation and yaw. First-emitter contact means a multi-candle object ignites as one gameplay target. Actual hand reach and scene path clearance still need controller/animation/placement verification.

Colliders are preserved from authoring, including the existing absence of colliders on candle and wall-light models. No new physical blockers are invented by this patch. No guarantee of arbitrary-yaw combat collision support is made.

The adapter returns geometry data; it does not attach targets, own an instance clock, connect light state to the combat renderer or implement F. Main, lamp cost, combat controls, doors and catalogue meshes remain unchanged.

Verification: tests/light-geometry.test.mjs covers lit equivalence, legacy isolation, separation and transforms for every variant plus invalid inputs (28 tests). The lighting workflow now runs both state and geometry tests. Full build/regression/browser/visual acceptance is not claimed by those isolated tests.
