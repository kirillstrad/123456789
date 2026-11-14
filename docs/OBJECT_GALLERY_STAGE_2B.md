# Object gallery — native furnishing batch 2B

Status: native geometry candidates; not a delivered playable gallery.

Adds 12 families / 36 variants: altar, sarcophagus, pew, burial-niche; lab-workbench, lab-bier, lab-shelf, lab-apparatus; prison-door, cage, chains, prison-cot.

The common dispatcher now covers 22 families / 66 variants. The remaining 35 families / 105 variants still fail explicitly as pending. Geometry uses the existing native Part builder, palette and world-space transforms, not an independent HTML renderer.

Collision polygons remain separate from meshes. Chains are non-solid decoration. Prison doors are CLOSED geometry snapshots with solid leaves: opening/state handling is not implemented here. Cages remain static obstacles. Lab apparatus, containers and furniture gain no interaction, simulation, inventory or active lights. No combat, movement or save logic changes.

Local verification: 11 geometry/furnishing tests pass. All 66 supported variants are tested at eight rotations: 528 configurations total. Tests check native data validity, reservation fit, collision transforms, deterministic/distinct meshes and rejection of unsupported IDs. Existing architecture tests stay scoped to architecture; variant comparisons now compare mesh data rather than differing metadata IDs.

Source fixtures for unchanged geometry, registry and architecture were checked against Git blob SHAs before local tests. This is not a full project build, CI success, browser render or Windows acceptance. The master registry remains pending until the later integration/status pass; generated models remain native-candidate / visualAcceptance: pending.

Still required: remaining family meshes, actual gallery scene and movement, door/light state integration, OBJECT GALLERY in Level Select, browser/native build tests and visual review. Main and the combat room are unchanged by this batch.
