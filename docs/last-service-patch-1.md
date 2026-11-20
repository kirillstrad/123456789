# Last Service: preparation patch 1

Status: foundation only; not playable, not registered in level selection.

This patch adds immutable lesson and scene definitions and a pure tutorial controller. It does not modify main, existing levels, generated runtime, PLAY.html, BAT files, lamp balance, or the existing golem encounter.

## Integration contract for the next patch

- The host calls enter(lessonId) before activating the associated danger. A false return must not reopen a read or already completed lesson.
- Render snapshot().dialogue inside the existing dialogue plate, not a new HTML overlay. Resolve instruction key labels from actual bindings in the UI adapter.
- While snapshot().blocksWorld is true, block hero actions and world simulation, including projectiles, enemy attacks and resource drain. Continue UI rendering. External pause also hides the dialogue and freezes the resume timer.
- A true dismiss() return means the confirmation input was consumed. The host must also clear buffered attack, interaction and held confirmation inputs; the controller does not own keyboard state.
- Call tick(dt, { paused }) from the UI clock, not from the blocked world clock.
- Record named events only after actual successful gameplay actions, not raw key presses. Record them after the world step and before entering the next lesson.
- retry() closes active dialogue and retains read/completed knowledge for the current session. reset() starts a fresh tutorial session. Neither method restores world state or persists saves.
- The controller does not enforce progression or require completion of all lessons. Normal kills, full lamp at a ritual, and skipped executions must never block exits.
- Scene cues are specifications marked pending, not implemented animations. Add real pose tracks and completion/skip cleanup before marking any scene implemented.

## Still required

Level geometry and collisions; enemy placement and encounter triggers; dialogue renderer binding; actual input consumption and simulation gating; checkpoint/world restoration; five authored animation scenes; final register interaction; level-select registration; build and browser verification.

## Verification

Added Node tests cover uniqueness and immutability, dialogue gating, dismissal grace, pause handling, early actions, retry, reset and invalid input. Tests have not been executed as part of this remote preparation. Run node --test tests/last-service-tutorial.test.mjs and the full project checks before integration. No verification report is marked passed.
