# Iteration 3C - visual acceptance

This is a preview, not a claim that all iteration 3 motion work is complete. Record the source_commit from BUILD_PROVENANCE.json (Windows artifact). Automated CI, Windows smoke checks, visual acceptance and performance on the user's computer are separate checks.

## Launch

Download ASH_IRON_3C_WIN_X64 from the successful run's Artifacts, not Code / Download ZIP. Extract the artifact once. ASH_IRON.exe should be at the root alongside DLLs, locales and resources. Keep the full folder together. If files are missing or Windows shows a warning, capture it; do not disable OS protection. The WEB_PREVIEW artifact is a separate browser build, not a substitute for Windows smoke or desktop acceptance.

## Motion scenarios

1. Stand still for two seconds; inspect both feet and idle breathing.
2. Walk straight for several steps, then stop. Repeat three times, including a short tap.
3. Change direction by 90 degrees while walking, then reverse by 180 degrees.
4. Walk diagonally and change between diagonal and cardinal directions.
5. Walk into a wall or column, then move away. There must be no accumulated displacement after stopping.
6. From walking and from rest, perform light/heavy attacks and E sparks. Inspect pose transitions and feet; attack rules must remain familiar.
7. Take damage, die/retry, and reach victory if possible. No old foot anchor should survive into a new attempt.
8. ESC pause/resume; switch away and return; F11 fullscreen/windowed. Inspect resumption for jumps.

## What to report

Send a short clip showing start/stop, a corner, a reversal and an attack. Note boot sliding, foot jumps, legs crossing, knee flips, feet below the floor, delayed input, image stretching or stutter. Include Windows version, CPU/GPU, display resolution and observed FPS only if measured. A corner may release unsafe support: the preview does not include a new turn-step animation or a full-body balance solver. Slopes, stairs, toe/heel roll and perfect zero-sliding contact are not claimed.

Visual acceptance remains pending until these scenarios are reviewed. Do not merge this branch into main solely because CI is green. The CI workflow publishes artifacts but does not commit rebuilt PLAY.html/runtime or binaries to the repository.
