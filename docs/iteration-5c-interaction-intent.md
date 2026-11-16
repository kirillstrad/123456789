# Patch 1.3: F input and locked interaction intention

Prepared against published source commit 4fec9feec159a87c01b9d359d809b8feee83ff6d on iteration-5a-lamp-life. Patch 1.2 is published; this 1.3 review artifact is not a published commit.

## Scope
- One physical F press creates at most one immutable pending intention. Duplicate keydown and native repeat cannot queue intentions or replace a pending target.
- F re-picks the current pointer and verifies the live target/mesh instance; stale hover, unavailable and replaced targets fail closed.
- The intention survives cursor movement/leave and camera culling. Gallery getTarget searches the complete scene registry instead of the visible frame list.
- It clears when the target disappears, becomes unavailable, is replaced, the context changes, permission is lost, or the scene/input lifecycle explicitly clears it. Serial IDs are not reused by a clear.
- Pure gallery preview, menu, pause, death, frozen combat, queued combat commands, busy actor and form/contenteditable input block requests. Gallery walk uses its own actor; inherited combat freeze is not applied to gallery walk.
- Live callbacks are injected by main.js. No production dependency on the public debug API is introduced.
- intent() and report.interactionIntent expose the pending snapshot. The initial approach point is data for the later navigation stage, not permission to execute an action.

No movement, world action, lamp spending/restoration, animation, door opening or ritual starts. This is not the later request-consumption/action-commit stage. The existing non-interruptible-action/death policy is unchanged.

## Local checks
12 new tests and 8 unchanged frame-targeting regressions passed. Actual main.js also passed a VM smoke run with stubbed DOM, meshes, world/actor, effects and ASCII I/O: preview blocking, walk-mode capture, offscreen retention, reports, reset, death and frozen combat.

Runtime: Node v20.20.1; project requires Node >=22. Full build/typecheck, supported-runtime tests, browser visual review and complete CI remain deferred. Only isolated local tests were run. main and the original working branch are not publication targets.
