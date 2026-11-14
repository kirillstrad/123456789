# Object gallery — native geometry batch 2A

Status: native geometry candidates, not a delivered gallery level.

This batch implements 10 of 57 families, three variants each (30 of 171 references): floor fractures, damaged masonry, arches, rubble, straight/L/U/split/iron/broken stairs. The remaining 47 families explicitly throw a pending-model error; no generic placeholder is substituted.

Output uses the project Part format (kind/v/c/w/r/hero/d), existing environment box shading, native palette, world units and depth ordering. Transforms accept x/y/z world translation and yaw in degrees. These modules do not draw a separate HTML renderer.

Collision polygons are authored independently from mesh bounds and carry minZ/maxZ. A plain arch leaves its center open; the barred variant blocks it. Floor cracks have no colliders. Stairs are visual/non-traversable obstacles, not height-navigation surfaces. Actual collision handling in the gallery controller remains to be connected.

Six local Node tests pass, including all 30 variants at eight yaw angles (240 configurations), deterministic/distinct variants, transforms, native Part validity and explicit input errors. No visual approval, browser gallery, native Windows gallery or hardware FPS is confirmed by these tests.

The master registry remains pending-native until the integration/status pass. buildObjectGeometry returns native-candidate and visualAcceptance: pending. Menu integration, player movement, lighting/ASCII scene rendering and complete family coverage remain subsequent work. Main, combat room and gameplay are not modified.
