# Interaction animation and automatic completion

Base: 5a247d3e8b060efe138a3ed009a20ddc1c99a93b, iteration-5b-interaction-completion. Earlier CI success was reported by the user; it does not certify these changes.

The existing app wiring now receives interactionAnimation through the lifecycle snapshot. combatHero samples an authored reach/contact/recover pose through the original vendor rig and emitter. Door uses a right-arm reach with torso lean and the sword turned aside; ignition/campfire raise the lamp. Root position stays fixed. Poses blend back to breathing at both endpoints. Death outranks interaction; nonfatal hit reaction does not replace its visible pose.

Simulation owns the clock: door 3 seconds, ignition/campfire 3.2 seconds, one interaction-effect marker at 60%, then one interaction-end and automatic input release. These are initial animation timings, not resource prices or visually accepted final tuning. Rendering never advances the clock. No object effect, door rotation, live collision update, lamp cost, ignition light or combat-scene interaction is added here.

Compatibility: phase remains awaiting-animation only in the zero-elapsed launch snapshot, then advances on the next fixed tick. The published animation frame is already available at launch; there is no unbounded wait for an external driver. The existing matching-ID finishInteraction signal is retained; early external completion never invents an effect marker. Future object effects must consume the marker, not assume every end means contact occurred.

Local checks: JavaScript syntax and pure clock boundary checks passed. The nine new native/render tests require npm run build and were NOT run locally. TypeScript compilation, full regression and the real vendor-render integration tests await the existing Node 22 branch CI. No green result for this patch is claimed. Browser and human visual acceptance are still required; no screenshot or visual approval is claimed.

New tests cover original vendor geometry, rendered lamp movement, endpoint blending, automatic completion with the real player and foot contacts, effect deduplication, stale IDs, target cancellation, simulation errors and render purity. Existing launch and handoff suites remain regression tests. Gallery renewal remains deferred in BACKLOG.md.
