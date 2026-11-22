# Last Service: Russian presentation and dressed prologue candidate

## Scope
One cohesive source patch for the existing prologue. No new combat mechanics,
encounter order, input bindings or story endings. No changes to main, generated
runtime files or automated acceptance reports during patch preparation.

- Embedded Russian alphabet (including Yo), punctuation and carved title styling.
- Existing composeCombatHud wired into Last Service with actual lamp/dash state.
- Russian lamp/dash captions, enemy display names, room names and HTML shell.
- Deterministic burial niches, pointed arches, standards, sarcophagi, benches,
  archive shelves, writing tables, altar, processional cloth and votive lights.
- Furniture footprints are installed before the door controller owns static
  geometry. The previously repaired first doorway is not narrowed.
- Chapel and keeper decoration preserves the collision array object.
- Tall wall/decor faces become translucent only when projected over the hero.
- Browser smoke now checks dialogue glyph coverage and HUD invocation; its
  screenshot remains evidence for manual review, not automatic visual approval.

## Local preparation checks
13 source-level tests pass, covering Cyrillic/punctuation, bitmap output,
determinism/finite geometry, key spawns and interactions, the reserved door sweep,
static route/optional-loop connectivity, environment delegation, localized names,
and view wiring. View wiring uses injected rendering/combat dependencies; it is
not a browser render or a test of the entire real HUD compositor. The unchanged
world-surface helper is tested using its exact repository contents.
The original font fails the new Russian alphabet coverage test.
Syntax checks pass for all 10 changed/new JS and MJS files.

## Still required after integration
npm run typecheck
npm run build:prologue
npm test
node tools/run-last-service-core.mjs
node tools/browser-check-last-service.mjs
npm run test:browser

The full build, compiled-core verifier, existing regression suite and Playwright
have not been executed in this isolated preparation environment. Existing CI
must confirm those results for the actual committed source SHA. Human visual
acceptance remains false. Check both directions of the door, combat sight lines,
optional loop, ritual, normal/finisher boss endings, keeper register, Russian text
pages, HUD scale and legibility at the actual window size. A successful unit test
is not proof that the new room compositions are visually accepted.

The old integration workflows and their auto-commit policies are not changed.
