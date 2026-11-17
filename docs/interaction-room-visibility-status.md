# Combined patch: packages 1 and 2 in progress

Work branch: iteration-5j-interaction-room-visibility. Main remains unchanged. Per user instruction, do not run tests or CI until all three packages are published. Commits for packages 1 and 2 use [skip ci].

Package 1 is published as a candidate: the default 44 by 26 room, six doors in a row, 29 stateful light instances including eighteen ordinary candles and native oven/campfire candidates, expanded movement/navigation bounds, and floor sources removed from the production F target list. Validation is deferred.

This first package-2 commit connects permanent-light and flame presentation to light-scene publication, which is already consumed by the real game environment. Burning meshes receive larger flame geometry, warm outer flames and light cores. Body geometry, colliders, contact points and unlit target identities are unchanged. Light radius and per-emitter power use source classes with normalized total power. Candle/candelabra/lamp/brazier presentation gains are 1.5/1.5/1.2/1.1 over the policy power; oven and campfire use the unmodified fixed 70-LAMP reference. These are tuning candidates, not accepted visual balance. Scene source metadata is exposed read-only-by-contract for the upcoming hint renderer.

Package 2 is NOT complete: the independent-brightness blue-white wisp, wick accent, short pulse, hovered E/F glyph, per-pixel occlusion and faint E flash still require screen-render integration. This commit does not claim to implement those effects. Tests are written but not run. Older layout/geometry/browser fixtures still need migration before final CI.

Package 3 remains pending: hero scarlet cloth landmarks, subtle background contrast, sparse cool metal glints, all fixture migrations and final combined verification. Do not merge intermediate commits into main.
