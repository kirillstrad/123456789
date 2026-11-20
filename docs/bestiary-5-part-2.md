# Corpse Golem — part 5.2, simple visual candidate

Adds a coarse asymmetric stitched model, three attack poses, kneeling, chest opening, amber seam glow and side collapse. The hero finisher uses the existing sample/rig interface: right hand keeps the sword, left hand lifts the lamp, then the blade is withdrawn. No custom IK solver, elaborate grip changes, particles or cutscene camera.

Nine isolated geometry/pose tests passed during preparation using reviewed part-1 frame/timing exports. Five additional tests importing the actual public/vendor/hero.js are included but have not been run in the preparation environment. The existing branch regression command discovers both test files. Actual CI outcome must be checked after publication. TypeScript build, complete emission/rendering, Chromium and visual acceptance are not certified by this candidate.

Run from the repository root:

    node --test tests/corpse-golem-visual.test.mjs tests/golem-finisher-rig.test.mjs

Requires part 5.1. Does not register or activate the boss, change CombatWorld, existing render dispatch, HP or gates. Those remain part 5.3, including special 5% execution routing, bypassing ordinary enemy deformation, death timing, owned arena collision, R input, ASCII boss HUD and full regression/browser verification.

Only these new modules, declarations, tests and documentation are published. Main, BAT files and existing palette are not targeted. Do not overwrite vendor/hero.js or package.json with a fixture.
