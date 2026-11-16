# Interaction start gate: verification portion 1

Prepared against main commit 7268fa2bba0ab182fa4a9ef675e00926099a0f15.

This portion adds tests and this document only. Production interaction code, app wiring, resource rules, animations and object colliders are unchanged.

## Verified contract
The test suite uses the published start-gate.js and intent.js. The executor is an injected synchronous test callback; no real world action or door effect is launched.

Coverage: readiness of a stopped and facing live actor; one remaining ember; blocked zero/invalid lamp, death and busy states; context/input restrictions; arrival/position/velocity/heading checks; target identity and availability; exact current intent identity; stale/cleared requests; rejection/exception after a possible partial effect; synchronous reentry; serial replay prevention; a later physical request; and malformed mesh input.

A rejected or throwing executor reserves that intention to prevent an unsafe automatic retry. A fresh F request is required. An ordinary failed preflight can be retried after its readiness condition changes. Cancelling the gate does not itself clear the pending F intention.

## Local results
20 tests passed with node --test tests/interaction-start-gate.test.mjs on Node v20.20.1. The test file also passed node --check.

The production inputs used for this isolated run were verified against GitHub blob IDs:
- src/interaction/start-gate.js: 0d9517d01ea6db175c99cc23e7f0a0ae089dc052
- src/interaction/intent.js: b1d3f73606209bc12405c038ac58c98916994cdc

This is not a full repository build or native game/browser run. Project-supported Node >=22, the full regression suite and CI with these new tests remain to be run. The previously reported successful CI did not contain this new test file.

## Next portion
Add and jointly run approach and lifecycle/handoff tests against the current combined implementation. Only after that verification debt is closed, proceed with the authored door action and its completion, object opening and collision update. awaiting-animation is still an unfinished development state; this test-only portion does not remove it.
