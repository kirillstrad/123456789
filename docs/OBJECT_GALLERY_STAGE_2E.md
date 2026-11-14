# Object gallery — final mesh batch 2E

Status: native geometry candidates, NOT a delivered playable gallery.

Adds the final 16 families / 48 references: single-body, shrouds, body-pile; brazier, candlesticks, wall-light; boarded-door, blocked-arch, collapsed-arch, barricade, fallen-portcullis; blood-floor, blood-wall, blood-cloth, blood-table, blood-basin. Dispatcher registration now includes all 57 families / 171 variants, pending full integration verification.

Geometry uses the existing native Part helper and palette. The helper gains light(x,y,z,r,power), translating/rotating positions into world space and preserving native radius/power values like the original environment. Lighting models are LIT snapshots; switches, flame animation and interaction state handling are not implemented here. Brazier bases are solid; small candles and wall fixtures have no additional colliders.

Single bodies and shrouds remain non-solid decor. Body piles and blocked passages are obstacles. Blood on floors/cloth is decor; wall/table/basin variants include physical supports and their colliders. No damage, destruction, loot, corpse interaction, extra combat or stair mechanics are introduced.

Local verification: eight NEW tests pass for the 48 new variants, including 384 orientation configurations, finite Parts/lights/colliders, distinct/deterministic meshes, role preservation, blocked passage coverage, flame/light alignment, light transforms and invalid inputs. Unchanged source fixtures were checked against Git blob SHAs. Changed JS/MJS files pass node --check.

A separate completeness test now requires exact registration of all 57 families and construction of all 171 candidates through the common dispatcher. It is ADDED FOR CI and was NOT run locally in this batch. Previous suites, full project build, browser/Windows builds and visual acceptance were not rerun or confirmed here.

The master registry status remains unchanged; generated models remain native-candidate / visualAcceptance: pending. Main, combat room and menu are unchanged. Next: actual gallery scene, original hero locomotion, collisions, door/light state handling, Level Select entry, complete browser/native tests and visual review. A complete mesh registry does not mean a finished game level.
