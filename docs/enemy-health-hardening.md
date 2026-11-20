# Enemy HP hardening

main.js is connected in efd12f1. This batch adds a screen-tile hit index, offscreen rejection, partial-visibility samples, read-only diagnostics and Chromium checks. Five isolated hardening tests passed locally; browser execution and full regressions are not yet observed.

The workflow records actual pointer selection, an actual attack, panel expiry, restart and the real relic modal, plus screenshots/failure evidence. It publishes docs/enemy-health-verification.json with check outcomes and tested source commit. Only automated-checks-passed means every automated stage passed; human visual review remains separate.

It does not apply patch 1, certify multi-enemy combat or create Corpse Golem. The visibility threshold 32 and Canvas styling remain provisional. All automated commits target bestiary-patch-1 only; the main branch is untouched and force-push is not used.
