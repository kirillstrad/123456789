# Last Service lifecycle 2.1 candidate

Public API: mountLastService from src/app/last-service-mounted.js. It takes the existing canvas, hosted flag and onExit callback; returns frame, dispose, stopped, state, retry, restart and exit. The mounted module owns no RAF. Resources are acquired through scene-scope and restored on disposal or failed setup.

Both new portable builds use the mounted implementation. LAST_SERVICE.html boots last-service-standalone.js, which owns the standalone RAF and pagehide cleanup. LAST_SERVICE_HOSTED_TEST.html loads the normal main application, registers a test-only scene with the existing host, and adds one launch button. Exit uses the scene-owned button. No production menu item or new HTML navigation is introduced for the hosted route.

Build with npm run build:prologue. Run npm test. Open LAST_SERVICE_HOSTED_TEST.html, enter, move/read/pause, exit and repeat. Verify ordinary controls after exit and the standalone route. Full CI and real-browser acceptance remain required.

The previous last-service.js is retained as a legacy compatibility entry and for its existing source-level tests; it is not loaded by the new portable entry paths. Gameplay was copied from its verified blob 434d24a0edb5c8e8a11d68c5ce45a6bfc824fac3 without redesigning encounters. Consolidation of legacy source-level tests is follow-up cleanup, not proof of gameplay acceptance.
