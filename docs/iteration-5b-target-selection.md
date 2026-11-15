# Interaction targeting: patch 1.1 (foundation only)

Base: b528f1a706f34ac2bb3df446964f77c34b4e942a, branch iteration-5a-lamp-life.

## Implemented
- Immutable descriptor: unique id, kind, screen-space polygon, world-space approach point, draw depth, availability and lifecycle flags.
- Pure polygon picking, including boundaries and concave outlines. Larger depth is in front; equal depths use the lexicographically smallest id, independent of array order.
- Hidden, removed and disabled candidates are excluded. Duplicate valid IDs are rejected for selection; malformed descriptors are ignored by the picker and rejected by explicit registration.
- Locked/requires-item targets remain inspectable for a future refusal hint; this is not permission to execute them. Future F handling must validate availability again.
- No hero-distance filter: a distant target must remain selectable for the later approach stage.
- CSS client coordinates convert to backing-canvas pixels; the HUD at y >= 720 is excluded by default. Projection must use the actual current camera and viewport before picking.
- Hover selection can be cleared and re-evaluated with a stationary pointer when geometry changes. It is not a locked F intention.

## Integration boundary
This patch does NOT change main.js, collect live scene targets, subscribe to pointer events, or display hover feedback. No in-game integration or completed point-1 acceptance is claimed. The next patch within point 1 must supply projected polygons/current draw depth from actual eligible objects, update selection every rendered frame, and clear it on scene/mode/reset transitions. Do not use the gallery layout's broad culling bounds as exact click geometry, and do not turn all gallery objects into interactables. Occlusion by non-interactive scenery is not solved by this selector; the scene adapter must supply only visible eligible hit regions.

No F input, navigation, resource spending, actions, animations, door mechanics or bonfire ritual are added. World objects are not mutated; only the optional hover holder maintains local selection state.

## Checks
16 isolated module tests passed under Node v20.20.1. The repository requires Node >=22: these results are not the final supported-runtime run, full project build/typecheck, browser acceptance or full CI. Command: node --test tests/interaction-targeting.test.mjs. Full CI remains deferred to the agreed final cross-block pass.
