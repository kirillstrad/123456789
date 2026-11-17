# Door expansion: stage 1 technical contract

Status: specification only. No additional playable door is delivered by this document.
Branch: iteration-5b-interaction-completion. Do not change main, lighting or lamp rules.

## Scope and source of truth

Support prison-door.a/b/c and iron-door.a/b/c in the combat scene with the existing CombatWorld actor and one-press F interaction. Preserve catalogue appearance. Blocked passages are not interactive doors. Closing, locks, saves and post-victory progression are excluded.

Source files: src/gallery/models/prison-door.js, src/gallery/models/setpieces.js (iron-door case), src/gallery/geometry.js, src/game/combat-door-scene.js, src/interaction/combat-door-controller.js. Preserve the cancellation and verification limitations documented in docs/step17-combat-door-integration.md.

## Model contracts (local coordinates, degrees)

| Model | Fixed geometry | Moving geometry | Hinge | Closed/open angle | Closed leaf footprint | Approach |
| --- | --- | --- | --- | --- | --- | --- |
| prison-door.a | frame | bars, rails, handle | (-0.8,0,0) | 0/-90 | X [-0.8,0.8], Y [-0.075,0.075] | (0,0.96,0) |
| prison-door.b | frame | solid panel, rails, handle | (-0.8,0,0) | 0/-90 | X [-0.8,0.8], Y [-0.075,0.075] | (0,0.96,0) |
| prison-door.c | frame | bars, rails, handle, diagonal | (-0.8,0,0) | 0/-90 | X [-0.8,0.8], Y [-0.075,0.075] | (0,0.96,0) |
| iron-door.a | posts and lintel | both panels, cross rails, rivets, handle | (-1.1,0,0) | 0/-90 | X [-1.1,1.1], Y [-0.1,0.1] | (0,0.96,0) |
| iron-door.b | posts and lintel | lower panel, upper bars, cross rails, rivets, handle | (-1.1,0,0) | 0/-90 | X [-1.1,1.1], Y [-0.1,0.1] | (0,0.96,0) |
| iron-door.c | posts and lintel | both panels, cross rails, rivets, handle, diagonal | (-1.1,0,0) | 0/-90 | X [-1.1,1.1], Y [-0.1,0.1] | (0,0.96,0) |

Iron hinges and articulation are implementation decisions, not pre-existing model behaviour. Treat iron panels as one rigid leaf: rails and the current collision footprint span the full opening. Do not silently introduce independently moving halves. Preserve original closed geometry exactly, including existing asymmetries. Closed footprint is the existing gameplay blocker, not the full visual bounds of handles or decorations.

## Motion, transforms and collision

Retain duration 1.2 seconds and smoothstep interpolation p*p*(3-2*p). Transform the local hinge, approach and facing point with each instance transform. Face the doorway centre. Initial interaction side is local +Y; leaf swings toward local -Y. Two-sided approach is excluded from this block.

Separate frame parts/colliders from leaf parts/colliders explicitly; do not infer the leaf from the last collider index. Keep frame geometry fixed. At angle zero, articulated output must match the catalogue builder. Render and collider rotation must use the same hinge and angle.

Keep the closed doorway blocker during movement. On completion replace only that instance's leaf blocker with its open blocker. Never remove another door or static obstacle. Local open leaf footprints: prison X [-0.875,-0.725], Y [-1.6,0]; iron X [-1.2,-1.0], Y [-2.2,0]. Frame colliders remain. Reset restores every closed blocker without mutating OBSTACLES.

The existing combat map uses conservative axis-aligned rectangles. Initial playable placement is yaw 0; additional orientations are unsupported until explicitly tested. Do not claim arbitrary-yaw collision support from transformed render geometry. Approach clearance and open-leaf overlap must be checked against actual actor radius and scene obstacles before placement is accepted.

## Instance and lifecycle contract

Distinguish catalogue model ID from unique scene instance ID. Preserve nave.exit-door. Each instance owns model variant, transform, stable target/parts array, status, elapsed time, action ID and availability. One scene owner aggregates static and all instance colliders into the shared map.

Preserve closed -> opening -> open, idempotent activation and no repeated effect. A contact marker opens only its target. Existing CombatWorld owns the actor and interaction lock. Combat commands may cancel approach but not bypass active interaction lock. Preserve pause/blur/gallery/freeze/reset cancellation. Opening triggered before cancellation continues according to existing semantics; death before contact must not open the door. Preserve last-ember protection.

## Required checks in subsequent stages

- All six angle-zero models match catalogue geometry; frames stay fixed and moving parts rotate correctly.
- Invalid variant/angle/transform fails explicitly; all produced vertices and colliders are finite.
- Two same-type instances first: opening A leaves B state and colliders intact. Then repeat with mixed variants.
- Closed, moving and open collision states; real-player approach, facing and passage; repeated F and sequential targets.
- First lethal hit during interaction preserves last ember; second pre-contact hit kills and produces no opening effect.
- Restart, stale references, gallery regression, enemy movement, dash and strike occlusion.
- Placement from normal spawn without console commands, inaccessible approaches or leaf/wall intersections.

## Delivery gates

Stage 1 delivers this contract, not playable functionality. Next: articulated prison B/C, iron adapters, multi-instance scene, controller integration, placement, tests and browser evidence. Exact ordering may put two-instance aggregation before adding more variants to isolate regressions.

Final acceptance requires all six variants in the combat scene, successful typecheck/build/tests/integration/browser checks for the exact commit, per-variant evidence and a downloadable PLAY.html artifact. CI success is not human visual acceptance. Browser controlled placement is not proof of the normal-spawn route, and generated PLAY.html is not browser-tested unless explicitly exercised. No new CI or runtime success is claimed by this document.
