# 16b activation checkpoint

Base e7499c6a5d64c122f64bd153f65d70d164732b15; iteration-5b-interaction-completion. Base CI passed according to the user; new CI/visual acceptance is pending.

The factory privately forwards actor refresh to the door owner. With scene commit/revision APIs and actor refresh present, the owner syncs before movement, only when revision changes. At open it publishes final geometry, commits the scene collider and syncs the same actor before another step. Unsupported actors stay fail-closed. Reads never advance/refresh physics; disposed lifecycles reject refresh.

Errors detach the owner. Limitation: scene commit and actor refresh are not a single transaction. An endpoint refresh failure leaves the scene committed and stops the owner; the player's prior grid is retained. No teleport, silent rollback, automatic overlap recovery or preflight is implemented. Validate placement and handle this failure path before broader combat use.

The real Chromium runner now expects closed collisions before open and exactly the leaf relocation afterwards (revision 0 -> 1). collidersStable means equality to that phase's expected layout. The read-only wrapper forwards the actor refresh callback unchanged. The runner additionally presses KeyW, requires crossing .5 units beyond the door and saves passed-through.png. It still uses the yaw-zero gallery door with a seeded nearby spawn, not the combat game. Visual approval remains false/pending.

Local Node v20.20.1: 8 committed protocol tests and JS/probe syntax checks passed. They use the actual binding/state/motion/bridge with scripted lifecycle, scene and refresh probes; private producer forwarding is tested in a VM. Three unchanged dependency modules and three changed baselines were checked against GitHub blobs; the local geometry dependency was only the selected production angle declaration. No real player/assembled-scene integration, full regression, build/typecheck, Node 22 CI or Chromium was run in this checkpoint. Prior physical-player tests are not results of this run.

Test: node --test tests/gallery-door-collision-link.test.mjs

Next: publish, confirm CI and inspect browser artifacts. Then revised point 17: integrate one door into CombatWorld and createEnvironment. Those use a different combat movement/obstacle system and currently lack environment door targets; do not replace combat with the gallery player. Test combat approach, animation, damage/death and collision ownership, then prepare a playable branch build.

Combat world, app entry, environment, main branch, F, speed/direction, lights, lamp expenditure and gallery renewal are unchanged. This patch activates the capable gallery path, not the combat-game transfer. No successful browser/game passage is claimed yet.
