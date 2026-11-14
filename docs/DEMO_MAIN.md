# ASH / IRON - 4BC Demo from main

This workflow rebuilds the actual game from the exact main source commit. It includes 4A smoke dash, 4C attack mechanics and new pose profiles, and 4B execution with halo, character poses, blood/stains, sparks/embers, extraction stream/light and camera.

Artifacts after successful verification/publication:
- ASH_IRON_DEMO_WEB: extract and open PLAY.html in a desktop browser; BUILD_INFO.json and BUILD_PROVENANCE.json identify source.
- ASH_IRON_DEMO_WIN_X64: extract the whole folder once and run ASH_IRON.exe; retain DLLs/locales/resources/licenses.
- ASH_IRON_DEMO_REPORTS_<run>_<attempt>: diagnostics and source-matched screenshots, including on failure.

The checked-in PLAY.html/runtime and Code / Download ZIP are NOT rebuilt by this workflow. Do not confuse them with the new artifacts. No public release or generated-file writeback is performed. Existing branch-specific workflows remain unchanged.

Controls: WASD/arrows movement; LMB light; RMB heavy; LLL/LLH/HH chains; E sparks; Shift with held direction smoke dash; R execution when nearby and facing a weakened living enemy with halo; ESC pause; F11 Windows fullscreen. F6 camera motion / F7 shake / F8 blood. Lamp is life. R does not repeat from holding the key. Visual toggles do not alter gameplay.

Current demo limitations: one enemy; multi-target selection is unit-tested, not a populated crowd. Attack durations remain light .88/.98/1.08 seconds and heavy 1.35/1.48/1.62; queue opens at .14 and closes at .71 normalized progress. Execution drafts: <=30% target life, reach 1.4, facing cone 120 degrees, reward 30 lamp, full cycle 10.8 seconds. Real input browser scenarios use deterministic debug fixture preparation but actual mouse/R/ESC for the actions being checked. Native Windows smoke is a separate check, not native certification of every new input sequence.

Review weight/readability of attacks, combo transitions, feet, pin/hand release/regrip, costume intersections, corpse handoff, blood visibility, fire and camera comfort on your computer. CI does not grant human visual acceptance. 3C.4 remains an open risk. No project publisher certificate, installer or updater; do not disable OS protection. Legacy Electron metadata may retain 3B.1; app build ASH_IRON_DEMO_4BC and source provenance identify this demo.

Main Demo retains full build/typecheck/unit/browser/stability/native smoke and fail-closed Defender/package checks. Unavailable/failed security checks block both playable artifacts. Source-matched combined demo and dash reports are required for staging. A successful run must still be confirmed before claiming these artifacts are ready.
