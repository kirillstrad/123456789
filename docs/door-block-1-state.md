# Door block 1: state only

Base: 2f210572c7e203fd0d46c652b55ce745315a7d9c, branch iteration-5b-interaction-completion.

Selected first object: prison-door.a. Its catalogue role is door; buildFurnishing currently emits its frame, barred leaf, lock and blocking collider together. This block does not modify that model.

The standalone createDoorState(target) accepts an interaction identity {id,kind:'door'}, captures the ID, and exposes snapshot(), beginOpening(actionId), finishOpening(actionId). Starts require a positive safe integer and closed state. Only the owning action ID can finish opening. Repeated/competing starts, stale completion and reopening an open door return false without changing the snapshot. Invalid identities throw. Snapshots and the API are frozen.

A future scene adapter must own exactly one state instance for each live door and route commands to that instance by door ID. This factory is not a registry and does not enforce global uniqueness or persistence. It deliberately does not retain mesh references. Removal/replacement validation, cancellation policy, locks, closing, progress, geometry and collider updates belong to later blocks.

No app/scene/interaction wiring, F handling, animation, resource cost or gallery content is changed. The game does not yet open a door as a result of this module. Open in this module is logical state only, not a claim that the physical passage is free.

Verification: all 14 tests and JavaScript syntax checks passed locally on Node v20.20.1. The catalogue input was verified against GitHub blob fc849ce15af26c7ea740d51651bfd75e4f442c4c and is not included in this commit. Full project build/typecheck, regression and Node 22 verification for this patch remain pending CI; no browser or visual result is claimed. The existing branch workflow will run because src/tests change.

Next small block: separate the stationary frame and movable leaf of prison-door.a and verify closed/intermediate/open geometry independently, still without F wiring or collision changes.
