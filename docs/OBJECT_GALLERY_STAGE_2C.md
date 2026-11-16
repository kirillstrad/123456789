# Object gallery — native setpieces batch 2C

Status: native geometry candidates, not a delivered playable gallery.

Adds 9 families / 27 variants: restraint-frame, iron-table, ceiling-hooks; column, iron-door, weapon-rack; stakes, execution-platform, empty-gallows. The dispatcher now supports 31 families / 93 references; 26 families / 78 references remain pending, without placeholder substitution.

All meshes use the existing native Part builder, project palette, world units and transforms. The dispatcher now registers builders in a Map and rejects duplicate family IDs. Furnishing tests retain exact coverage of their 12 families / 36 variants without treating the earlier global total of 66 as a permanent limit. Common coverage tests validate registry membership, unique registrations and three variants per registered family.

Static models only: no usable torture devices, weapon pickup, hazard damage, climbing, combat changes, rope physics or additional interactions. Iron doors are CLOSED snapshots; their interactive state is not connected. Empty gallows contain no hanging bodies. Stake variants B/C contain stylized body silhouettes, with explicit obstacle colliders. Ordinary decorative chains remain non-solid. Suspended hooks retain the approved obstacle role with individual hanging-footprint colliders, not whole exhibit boxes.

Local verification: 17 model tests pass together, including architecture and furnishings regressions. The common orientation check covers all 93 supported variants at eight angles (744 distinct configurations). It validates Part data, reservation fit, collision transforms, roles and distinct/deterministic meshes. Existing source fixtures were checked against Git blob SHAs. This is not a full project build, browser render, CI result, Windows build or visual acceptance.

Generated geometry remains native-candidate / visualAcceptance: pending. The master registry status is unchanged. Gallery scene rendering, player locomotion, door/light interactions, Level Select entry, complete object coverage and visual review are still required. This batch does not modify main or the combat room.
