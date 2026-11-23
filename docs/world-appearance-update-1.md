# World appearance: update 1

Base: main at bdeff04aace10628bbf9c0ff8d8d5a2cf0208958. Only shared dressing, its compatibility fix and the shared F seal are selected from commits 7366798, dd6498b and d790ddf. No prologue, scene host, loading artwork, menu changes or installer scripts are included.

Map-adapted floor remnants and wall reliefs are cached by createCombatDoorEnvironment. Interactive target clearance is preserved. No collisions, authored lights, enemy placement, lamp costs or input handlers are changed. Scenes that do not use this factory are outside this dressing change.

The main hover path renders the F seal as world polygons through the existing ASCII pass. Existing E hints remain unchanged. This does not add indicators for non-targeted books or ritual interactions.

Validation: build the ordinary game with npm run build, then run npm test and npm run test:browser. The update-specific workflow performs these checks on the isolated branch. Previous CI success in PR 28 does not establish acceptance for this release.

Before merge, visually inspect PLAY.html in the test chamber and Ashen Nave: compare decoration, verify hero and target readability, open doors, ignite supported sources, retry and change levels. Check input behavior and frame performance. Human visual acceptance remains pending until explicitly recorded.
