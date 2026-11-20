# Bestiary 3 and Ash and Iron candidate

Target: bestiary-patch-1 only. Four new melee undead, provisional tuning, UNDEAD TRIAL, old browser hover fix, and selective hero material changes. No new statuses, resistances, shield block, poison, explosion or teleport. Lamp gameplay and lighting are unchanged. No BAT files are modified.

The third-patch core previously passed 18 isolated Node tests. Full build, integration tests, Chromium, regressions and visual acceptance are not certified by publishing this candidate. The branch workflow runs completion of patch 1, its hit-phase repair, patch 3 and hero palette migrations before build. Applied source, runtime and PLAY.html are committed only after successful checks. Actual combined results are recorded in docs/bestiary-3-verification.json. Main is never targeted.

Local preparation: npm ci; node tools/complete-bestiary-1.mjs; node tools/fix-bestiary-hit-phase.mjs; node tools/apply-bestiary-3.mjs; node tools/apply-ash-iron-hero.mjs; npm run build. Then run npm test and node tools/enemy-health-browser-check.mjs with installed Chromium. Stop on any error; do not discard local work.
