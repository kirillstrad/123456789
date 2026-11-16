# Real-player interaction handoff and branch verification

Base: iteration-5b-interaction-completion at 2d396fb68f8148770c59549cb72a0d643ea52036.

## Scope
13 tests import the emitted runtime player, collision world, route planner through the approach controller, lifecycle, start gate, intent manager and production motion/inertia functions. No player, movement, approach, planner or motion-math substitutes are supplied. A small deterministic target/collider registry replaces authored scene content. This is component integration, not browser input, combat damage integration, authored scene or visual acceptance.

The build-prerequisite test checks copied JavaScript runtime modules against their source files and rejects the known old motion artifact without inertia fields. The branch workflow supplies the stronger guarantee: a checkout of the triggering SHA followed by the project's npm run build, with TypeScript diagnostics, before execution.

Coverage: bounded actual movement, turn-before-launch, single ownership transfer, wall detour, manual/held cancellation, unreachable route, target loss while moving, stationary active action, busy-input policy, matching and stale completion IDs, returned real movement, new requests at the reached point, context/target loss after launch, and no premature ignition/door effect or lamp cost.

The existing awaiting-animation state is still a development placeholder. These tests do not claim that an authored animation, door opening or ignition has been implemented. That phase expectation will change with the authored driver.

## Local status
Test-file syntax and workflow structure were checked locally. The 13 new tests were NOT executed locally: the supported Node >=22 environment and project TypeScript build were not available. No stale tracked runtime, manually type-erased TypeScript, or movement stub is used as substitute evidence for this portion. No green CI result is claimed in advance.

## Branch CI
The existing Main Demo workflow is restricted to main. The added Interaction Verification workflow runs only on relevant pushes to iteration-5b-interaction-completion, with Node 22 on windows-2022 and a 15-minute job timeout. It performs npm ci, npm run build, npm run typecheck, the four interaction suites together, then the full npm test suite. Inherited typecheck and TAP reports are removed before verification; only reports produced in this run are uploaded for seven days. Permissions are contents: read; there is no deploy, desktop packaging or commit-back step.

Iteration 1 closes only after the joint interaction tests and full suite pass on the supported build and the results for that commit are verified. A syntax check or successful workflow-file commit does not close it. Browser and visual acceptance remain separate.

After verification, the next implementation is the authored interaction animation driver with matching-ID completion and explicit failure handling, followed by one functional door and its live collision update. Gallery renewal remains in BACKLOG.md.
