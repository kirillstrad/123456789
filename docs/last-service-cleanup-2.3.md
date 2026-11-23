# Last Service cleanup 2.3

The prologue now has one runtime implementation: src/app/last-service-mounted.js. LAST_SERVICE.html boots it through last-service-standalone.js, and the main game starts it from the level-select menu through the scene host.

Removed: the legacy src/app/last-service.js entry, the temporary hosted test entry and its LAST_SERVICE_HOSTED_TEST.html build, and the one-off installers and patch files in the repository root. The two source-reading tests now read the mounted module.

Known remnant: tools/portable-last-service.mjs still names app/last-service.js as the default bundle entry; every real build passes an explicit entry.
