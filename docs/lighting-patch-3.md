# Lighting patch 3: opt-in scene binding and readability

createLightScene binds the existing light registry to controlled geometry for all nine models. Scene part/light/target/collider arrays keep their identities while contents are republished on successful state changes. Invalid or repeated ownership tokens do not republish. Off and smoldering instances expose ready ignite targets with stable per-state part ownership, approach, contact, emission and face points. Igniting and lit instances expose no ready target. Lit geometry and world lights remain until reset; reset invalidates old tokens. Independent instances retain independent state.

The adapter is opt-in: this patch does not place light instances into combat/gallery scenes or connect the F controller. ignite(id, token) remains an effect-commit API for a future animation/resource owner, not a public gameplay shortcut. It does not enforce elapsed time, actor life, reach, route validity or payment. Lamp cost remains null and no resource is spent. These gates must be implemented before playable ignition is enabled.

Existing proximity feedback now uses three wider smoke wisps and up to two brighter sparks per target within the prior five-part cap. A light contact point is used where available, otherwise the approach point is retained. Feedback remains distance-dependent, non-pickable and not a world light. Existing eligibility and reduced-motion behavior are preserved. No claim of route reachability or pixel-perfect geometry occlusion is made by these tests.

Menu-only paint remapping brightens carved lettering and gold/amber ornaments while retaining dark glyph edges and a stronger selected-row separation. Original fire rendering, prayer timing, saved brightness, font geometry, hitboxes, HUD and gameplay lighting are unchanged. No full-screen white wash or CSS filter is added.

CI runs typecheck, build and all unit tests on Ubuntu and Windows. Browser evidence, performance measurements and human visual acceptance are pending. In particular, visibility of smoke/sparks after ASCII conversion and actual browser Canvas context behavior must be verified before claiming visual completion.
