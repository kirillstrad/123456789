# Point 15: visual evidence preparation

Base: 63fc7e20374fe6b5956b5d284743745120839850. Its CI was reported passed by the user. This is not a CI result for the new evidence workflow.

## Scope

No production code, hinge, direction, speed, collisions, light, lamp expenditure, main branch or gallery renewal is changed. This checkpoint adds a Chromium evidence runner, helper tests and a separate Node 22 CI job. Browser automation has not been run locally; point 15 is NOT visually accepted.

The runner opens the real built runtime/index.html over local HTTP. Playwright intercepts only two production module URLs: the scene factory gets a near-door spawn 1.5 units beyond the actual approach point, and the binding export delegates to its unchanged original behind a read-only probe. Scene assembly, geometry, player, approach, collisions, interaction, F handler and renderer remain real. The test does not call beginOpening or set an angle directly. Production files are never rewritten. Default-spawn travel and portable PLAY.html are not checked.

After pointing at the actual projected door and pressing F, the runner advances Playwright's controlled clock and uses observed states to capture closed, reach, before-effect, first-observed opening, mid-opening and open frames. First-observed opening need not be the exact zero-angle simulation tick; the report records the sampled state. Machine checks cover one effect/end, full angle, monotonic motion, stable target/frame/approach, unchanged closed colliders and lamp, real approach movement, and player release on close. They do not prove correct hand contact, hinge choice, clearance or aesthetics.

## Results and review

Local Node v20.20.1: 12 helper/contract tests and syntax checks passed. Chromium, full app, Node 22 build and the new workflow were not executed here. Local results are NOT browser results. Remaining point 14 browser/real-player gates remain open until supported by actual evidence.

After approval/push, Door Visual Evidence runs on this branch and uploads door-visual-evidence-<commit>. Each run contains PNGs and report.json with actual commit, samples, trace, errors and failure status. automationPassed describes machine checks only. visualAccepted is always false; visualReview stays pending. A failure still attempts to save diagnostic evidence. Generated images/reports are not committed.

Review the same-commit frames and normal-speed playback before accepting:

- Hand/door timing: no door movement before contact and no conspicuous delay afterwards.
- Hinge/frame: frame is stationary; the leaf turns about the intended edge without detaching.
- Direction/clearance: the candidate -90 degrees does not visibly cut through hero or architecture.
- Speed: the candidate 1.2 seconds feels continuous, without snapping or a long tail.
- Readability: door and hero are legible in actual lighting and projection.
- Endpoint: the leaf stays open and the hero returns to idle. Physical passage is still deliberately blocked.

Static frames alone are insufficient to approve speed. Record acceptance or a precise defect with the artifact commit. If anything fails, fix this block and repeat evidence; do not proceed as visually accepted.

Local commands in a fully installed repository: npm run build; npx playwright install --with-deps chromium; node tools/door-visual-check.mjs. Unit tests: node --test tests/door-visual-check.test.mjs.
