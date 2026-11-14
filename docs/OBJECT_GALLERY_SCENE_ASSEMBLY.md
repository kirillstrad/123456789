# OBJECT GALLERY — scene assembly

Status: assembled scene DATA, not a rendered or playable level.

createGalleryScene() joins the actual catalogue layout and native model dispatcher through assembleGalleryScene(). All 171 instances are built once at their world transforms; meshes, lights and colliders remain owned by a separate scene instance. This does not replace the combat environment or reset/change CombatWorld.

getFrame(camera, range=16, lightPadding=6) returns separate floorParts, visible object parts, nearby light records, visible exhibit metadata and counts. Floor tiles use the current environment palette/style. They MUST be drawn before the depth-sorted object/hero pass; do not insert them into the same painter-sort pass. The floor window cache keeps only the latest window. Object geometry is cached across frames. Conservative XY selection is not final camera/frustum validation; the render adapter must choose a range suitable for the actual viewport.

getColliders() returns ALL authored collision records, independent of camera culling. Exhibit reservation boxes do not become colliders. Scene assembly does not yet implement movement or collision resolution. getSpawn()/getBounds() supply world metadata. dispose() drops owned caches and prevents subsequent reads; another scene instance remains independent.

Light selection is independent from visible mesh selection, with a world-space padding margin for nearby offscreen lights. Native x/y/z/r/power fields are preserved. Rendering/projection, pixel-space visibility acceptance, switching light/door states and animation remain later integration work.

Local checks: 10 new scene-core unit tests pass, using THREE SYNTHETIC fixture models to isolate assembly, transforms passed to the builder, caching, culling, global collider retention, native floor geometry, disposal, instance isolation and input errors. This is NOT a local rerun of the real 171-model scene. Two separate integration tests for actual createGalleryScene() and all 171 placements are added for CI; they have NOT been run locally here. All changed JS/MJS files pass node --check. The prior 40 gallery tests passed in the previous verification; full Node 22/project CI remains unconfirmed.

The existing build script already copies/bundles src JavaScript modules. main.js is deliberately unchanged: the new scene is not yet invoked, drawn, or reachable from the menu. No claim of browser/Windows/visual acceptance is made. Registry stage remains layout-only and model visual status remains pending until actual runtime integration.

Next: render adapter in the existing game/ASCII pipeline, then original hero movement and collision handling, door/light state integration, Level Select entry and visual/native acceptance. Main branch, combat room, combat mechanics and existing menus are unchanged by this batch.
