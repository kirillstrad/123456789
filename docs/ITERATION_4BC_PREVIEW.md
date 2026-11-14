# Unified 4BC preview work: attack animation integration patch 1

Target branch iteration-4-main-4a. Main and vendor hero geometry unchanged. This patch activates new attack pose profiles through ActionMachine.view -> CombatSnapshot.action -> transitionPose -> combatHero, rather than adding an unused module. Execution rendering introduced by 1e3d55f remains in the existing combatHero path.

New light clips have compact oblique edge passes, not broad horizontal swings or repeated high vertical lifts. Heavy clips use broad passes, body preparation and follow-through. Existing 70/160-degree gameplay cones, two-target L cap, damage, reach and mild forward/signed lateral inertia are retained. The target room still has one enemy; multi-target selection is tested separately.

LLL, LLH and HH share defined end/entry poses. Queued continuations preserve follow-through instead of blending to locomotion between strikes; single attacks recover. App actions advertise animation4C and continuation; manually authored legacy fixtures without this marker still exercise the original sampling path. New tests explicitly assert that actual world actions take the new path. Old vendor-geometry regressions are not proof of new choreography quality.

To prevent a late input from snapping an already recovering pose back into combo, continuation now closes at normalized activeEnd .71; start .14 and one-command capacity remain. The kernel's hit at (.46+.71)/2 is a keyframe in every new profile. Existing durations are intentionally retained: light .88/.98/1.08s, heavy 1.35/1.48/1.62s. These are NOT the slow inspection-demo seconds; perceived weight/speed still needs gameplay review. This patch changes pose choreography, not damage balancing or timing configuration.

Seven tests cover live activation, compact/broad arcs, end/entry continuity, solo recovery, pure sampling, rig lengths and queue timing. New CI and artistic acceptance are pending. Angular matching at pose handoff does not prove continuous momentum/velocity or physical realism. The existing move/aim heading handoff, costume clipping, foot plant and visual start/stop remain inspection points.

Expected final deliverable is still ONE rebuilt playable preview containing attacks, execution and dash together. Remaining patches must add execution blood/stains, embers/sparks, fire extraction stream/light, optional camera motion/shake, updated provenance/labels, real browser input scenarios and screenshots. This first patch does not complete 4B/4C or authorize final acceptance. Keep 3C.4 and manual review open; no main merge.
