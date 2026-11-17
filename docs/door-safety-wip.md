# Door completion WIP: sweep and contact primitives

Not gameplay complete. These modules are not yet wired into the scene, controller or hero rig. No anti-crush, exact hand contact, new articulation or browser-regression acceptance is claimed.

checkDoorSweep accepts closed-world polygon footprints and world-space hinges. Angles are radians. Each requested segment is linear in rotation and vertical translation. Samples are expanded by a bound on maximum displacement between adjacent samples; budget exhaustion fails closed. Checks include both leaves and height overlap. Obstacles are static during one call: live occupancy must be supplied again before every proposed motion segment. This is not prediction of arbitrary future actor trajectories. Nonlinear animation paths must be subdivided into bounded segments by the caller; clear endpoint samples alone are insufficient.

Caller obligations: test static obstacles and all relevant live actors; do not advance geometry or its motion clock when blocked; preserve consistent colliders and allow cancellation/reset; recheck before resuming. Whole-opening reservation versus per-tick stopping remains to be integrated and tested with the real CombatWorld.

Door contact helpers invert the existing combatHero ground-plane transform, retaining its world-height convention. The measurement helper reports actual world-hand error. A coordinate round-trip is not a real rig test: actual rig-hand vertices must be measured at contact and compared after integration.

Native tests cover mid-swing collisions, between-sample bounds, walls, two wings, raised gates, rechecking, budget failure and coordinate conversion. Full regressions including execution, both-side opening and actual hand/door pose validation remain required for the final package. Existing lighting modules and main are unchanged.
