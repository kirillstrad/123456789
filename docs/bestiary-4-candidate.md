# Bestiary 4 candidate

Marrow Archer: one non-homing arrow, late aim lock, bounded retreat, ally occlusion without friendly damage. Draft tuning only. ARCHER TRIAL adds the archer, Bonebound and Ossuary Guard; UNDEAD TRIAL stays unchanged.

The isolated core previously passed 20 Node tests. The integration migration, game build, integration tests, browser rendering and full regressions are not certified by publication. See docs/bestiary-4-verification.json for actual results. Human visual acceptance remains separate.

This revision requires applied patch 3, now present in the branch. Use node tools/apply-bestiary-4.mjs then npm run build. Do not rerun the older source-migration scripts against patch 4; the workflow now applies only this migration to the verified patch-3 base. Reset and encounter replacement clear arrows. Victory waits for released arrows, routed through world.damage; dash protection stays owned by the existing damage method. The shared group windup budget includes the archer.

Main, BAT files, palette and lamp mechanics are unchanged. No claim that Corpse Golem or the fifth patch is implemented.
