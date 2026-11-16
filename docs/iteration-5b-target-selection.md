# Interaction targeting: patches 1.1 and 1.2

Patch 1.2 base: 408e3036fe8f4653f11e14df63e52e39ad5f24d9, branch iteration-5a-lamp-life. Review artifact only until a commit is approved and published.

## Source integration
- main.js installs the pointer bridge and samples after setting the current camera/view, on each rendered frame.
- Scene frames expose actual cached door-mesh references, never broad layout bounds. Only catalogue role=door objects are eligible; books, bodies, stairs and other decoration are not made interactive.
- Native polygon, stroke and dot geometry is hit-tested in reverse paint order, so foreground scenery and hero geometry block targets. Alpha-zero parts do not block; gaps between bars are not clickable door panels. This is geometric picking, not pixel-identical ASCII-cell picking.
- Existing door meshes in OBJECT GALLERY preview and walk mode provide the first live targets. The main combat environment has no authored F-door or bonfire records yet: no substitute interaction or ritual is invented there. The renderer accepts env.targets for later authored scenes.
- Pointer coordinates use current CSS/backing-canvas dimensions. Stationary pointers are re-evaluated when the camera moves. HUD is excluded.
- Selection resets on leave, blur, hidden document, scene/mode changes, reset, resize and inactive/dead rendering. Cursor switches to pointer over a target. Public debug API target() and report.interactionTarget expose the last rendered hover snapshot, not execution permission.
- Approach anchors are outside the gallery mesh's positive-Y bound; walkability/path planning remains a later block.

No F handler, approach movement, resource spending, door opening, glow/smoke effects or bonfire choreography are added. Availability must be revalidated before later actions.

## Verification
8 new local tests plus 10 unchanged gallery scene-core regressions passed. Existing dependency/source blobs were SHA-verified. An additional actual-main VM smoke run exercised projection, camera movement, reports, gallery open/close, pause/resume, death and blur using stubbed DOM, meshes, ASCII I/O, world and effects.

Checks ran on Node v20.20.1; repository requires Node >=22. Full build/typecheck, supported-runtime run, native-browser visual acceptance and complete CI remain pending until the agreed shared pass. No portable build, main merge or published patch-1.2 commit is claimed by this review artifact.
