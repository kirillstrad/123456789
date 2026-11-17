# First wall torch visibility correction

The nine-model browser check passed the six floor sources and stopped on wall-light.a before F because its polygon-only surface sampler returned no candidates. Source inspection found placement at x=5.5 beside the decorative arch at x=6. A static projection/painter-order calculation using the authored north wall, arch and torch geometry reproduced zero visible polygon samples there, while a small line segment remained selectable. This is a static reproduction, not a substitute for the live browser report or screenshot.

Only wall-light.a is moved to x=4.6 on the adjacent wall pier; its y=1.55, yaw=180, model, cost and contact metadata rules are preserved. Other eight source transforms remain unchanged. The moved source still needs live hero/scene occlusion and visual attachment acceptance.

The read-only candidate helper retains its original polygon-first order and adds line-interior and dot-center samples, matching geometry kinds already supported by the production picker. Every point must pass that same occlusion-aware picker and the browser must still hover the live target for 250 ms and press physical F. Fully blocked geometry remains rejected. No gameplay picker priority, opacity, collision, ignition or payment checks are relaxed.

Regressions cover line and dot targets, full occlusion, viewport clipping, unchanged polygon priority, visibility of the relocated torch body against the actual static environment and spawn-to-approach planning. Existing nine-model pose/payment tests and browser acceptance run on the next push. New CI success and human visual acceptance are pending; the six successful browser cases from the previous run do not establish acceptance of the three wall variants.
