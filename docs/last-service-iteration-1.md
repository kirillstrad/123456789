# Last Service — first playable segment (review candidate)

This iteration uses a separate entry point. It does not replace the main app or register the complete prologue in level selection.

Build with `npm run build:prologue`. Open the generated `LAST_SERVICE.html`, or serve `runtime/last-service.html` using the existing server. The portable page embeds the hero vendor and game modules.

Scope: entrance seal animation, vestibule candles, physical iron door and a single Bonebound. Tutorial text goes through the existing relic dialogue plate before the corresponding action. The main world, door, spark ignition, enemy and hero renderers are reused. Closing a tutorial starts a short resume delay. Retry retains read lessons; a fresh start clears knowledge and replays the introduction.

The entrance scene is a real sampled pose animation, not a pending scene label. Remaining four narrative scenes are not implemented here. There are no new resistances, statuses, lamp rules, boss or changes to main.

Verification status: review candidate, not browser accepted. The complete repository build, typecheck, regression suite and interactive browser acceptance must be run. Do not treat the existence of this document or its tests as a passed verification report.

Acceptance: intro raises and lowers lamp without teleporting; E lights the candles at normal range without lamp cost; F opens the physical door without crossing closed collision; light lesson appears before first fight; mouse/keyboard attacks damage the Bonebound; its death completes this segment; reading or paused state prevents damage and buffered attacks; retry is usable after death; new game replays lessons and scene; original PLAY remains independently launchable.

Local preparation checks: JavaScript syntax checks passed for six files. Five isolated segment tests passed using the real tutorial controller with minimal lesson fixtures. This is not a full-repository or browser run.
