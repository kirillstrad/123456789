# Iteration 3B.1 — Windows x64 desktop preview

Base: verified 3A.2 commit 243f26581131b06855e3e7358da42c058801bd06 (68 unit/integration tests and 10 browser checks). This preview does not claim completion of persistent foot locking or all motion visual acceptance.

The native wrapper pins Electron 45.3.2, starts fullscreen, loads only the local bundled PLAY.html and enters the room directly. Desktop mode hides external settings/debug/status controls without removing the in-canvas HUD. Canvas aspect ratio remains 1008:864, letterboxed rather than stretched. ESC pauses/resumes; F11 toggles fullscreen; EXIT GAME or Alt+F4 closes. Focus loss pauses and clears input through the existing pause handler. Desktop pause/death/victory menus do not offer settings or MAIN MENU. Plain web mode retains its existing menu for regression coverage.

Renderer settings explicitly disable Node integration and DevTools and enable context isolation, sandbox and web security. No preload or privileged IPC bridge is exposed. Remote requests, extra windows, webviews, navigation away from the game and permission requests are blocked. The packaged HTML gets hashes for its two inline scripts and restrictive CSP. This is not a security audit.

Packaging follows Electron's documented prebuilt-binary layout: keep the entire portable folder, including DLLs, locales, licenses and Chromium notices. ASH_IRON.exe is not a standalone single-file executable. There is no installer, custom publisher signing, updater or online service. Electron vendor metadata is not fully rebranded in this first preview. No instruction to bypass OS security is provided.

The Windows workflow replaces the prior Linux-only motion workflow and checks the same branch only. It prepares source hooks, rebuilds the game, runs the full tests and original browser regressions, installs exact Electron with a generated lockfile, packages, then launches the packaged executable for a native smoke test. Only after success does it commit source hooks, lockfile, runtime and reports; binaries are uploaded as a ZIP artifact rather than committed. No main or iteration-2 push target exists.

Local verification: 8 Node tests, JS syntax checks and a synthetic layout/CSP/license fixture only. No native Windows executable was built or launched locally. Native fullscreen, renderer isolation, input, pause, focus-loss and F11 checks are pending Windows CI. User-machine FPS, visual quality, OS compatibility and OS trust prompts remain unverified. Do not call the Windows artifact ready before successful CI and upload.
