# Embedded scene host: lifecycle foundation

This commit adds an actual dispatch point in makeUI: while a registered scene is active, the existing main application's menu-frame path drives its frame method on the same canvas. The host never requests another animation frame and never navigates to another HTML document. The ordinary main game is paused first. Cleanup restores the canvas and menu even if the scene fails.

Factories must be synchronous and return frame(now) and dispose(). They receive the existing canvas, output context and an exit callback. Scene-owned input listeners, overlays and temporary globals must be released by dispose. The menu API reports a non-menu scene mode while hosted content is active.

This is not yet the playable prologue menu feature. No factory is registered automatically and no new menu choice is advertised. The monolithic Last Service entry still needs a mount/dispose API, externally driven frames and input ownership before it can safely be registered. Existing standalone entry, test launcher and gameplay routes are unchanged.

Focused tests cover the host and the real makeUI integration using dependency fixtures. Full build, full existing tests and browser acceptance remain required. No merge approval is implied.
