# Corpse Golem — part 1, isolated core candidate

Includes attack/finisher logic, arena controller, declarations and 29 isolated tests. This is NOT the complete fifth patch. Publishing these modules does not activate the boss in the game or modify existing game integration.

Implemented in the modules: one health-independent slam/sweep/press cycle; provisional 600 HP; per-attack reach and substepped press movement; optional finisher at positive HP <=5%; ordered 6.8-second event timeline and normalized animation channels; waiting/fighting/failed/won arena states; real gate rectangle after complete entry; delayed unlocking until the owner clears a finished execution; reset ownership and stable mutable collision-array validation.

The finisher timeline does not itself mutate actors or award lamp resource. The eventual world owner must apply extraction and restoration events exactly once. Boss-only 5% routing and exclusion from ordinary execution are still integration work.

Run the isolated check from the repository root:

    node --test tests/corpse-golem-core.test.mjs

29 isolated tests passed during preparation. Full-repository TypeScript build, integration, Chromium, full regressions and visual acceptance are not certified by publishing this part. The existing branch CI may evaluate the added files; its actual outcome must be checked.

Next part: complete golem geometry and a distinct hero finisher rig; validate sword/hand and lamp contact, limb lengths, feet, fall direction and deterministic snapshots. Final part: profile registration, owned live collision map, boss scene, world lifecycle, R input, ASCII boss HUD, victory timing, gate artwork and full browser/regression checks.

No incomplete pasted rig or renderer is included. No new statuses, resistances, summons or corpse consumption. Main, BAT files, current palette and existing gameplay sources are not targeted.
