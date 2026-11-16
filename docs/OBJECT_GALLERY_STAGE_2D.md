# Object gallery — native library and textiles batch 2D

Status: native geometry candidates, not a delivered playable gallery.

Adds 10 families / 30 variants: bookcase, wall-bookshelves, single-books, book-stacks, scattered-books, lectern, writing-desk, scrolls, tapestries, banners. Registration extends the dispatcher from 31 families / 93 references to 41 families / 123 references. The remaining 16 families / 48 references are still pending; no placeholder fallback is added.

Native Part geometry only: project palette, existing face shading, world-space translation and yaw. Closed books include page blocks and covers; open books use folded page planes. Stacks and scattered books vary placement and rotation. Shelf variants vary load, levels and damage. Textile folds and tears are static geometry, not cloth physics.

Books, stacks, scattered books, scrolls, tapestries and banners retain the approved non-solid decor role, including visible banner poles. Bookcases, wall shelves, lecterns and writing desks retain authored obstacle colliders. No reading, pickup, inventory, destruction, active lights or other interaction is added.

Local verification: six NEW library/textile unit tests pass, covering all 30 new variants at eight angles (240 configurations), valid native data, fit inside exhibit reservations, rotations and collision transforms, distinct/deterministic meshes, roles and input errors. These tests invoke the new builder with the real registry and native geometry helper; they do NOT represent a rerun of all previous suites or a full dispatcher/browser/Windows integration test. Changed JS/MJS files pass node --check. Source fixtures were checked against Git blob SHAs.

The architecture regression now expects bookcase.a to produce geometry rather than the obsolete pending-model error. The common dispatcher coverage/orientation tests remain in the existing suites for CI; their new result is unconfirmed.

All models remain native-candidate / visualAcceptance: pending. The master registry status, main, combat room, menu and gameplay are unchanged. Complete object coverage, actual gallery scene, movement, door/light state handling, Level Select entry and visual acceptance are still required.
