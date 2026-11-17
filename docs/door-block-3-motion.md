# Door block 3: time-based leaf motion

Base: ed062638e92069da733d907183370de118a91eb0, iteration-5b-interaction-completion.

createPrisonDoorMotion({duration=1.2}) owns one private createDoorState instance for prison-door.a. The public frozen API is beginOpening(actionId), step(dt), snapshot(). The state module and geometry module from blocks 1/2 are unchanged. External callers cannot finish the private state early or replace the owning action ID.

Duration is captured at construction, in seconds, finite and in (0,120]. The initial 1.2-second value is a tuning candidate, not visual acceptance or a connection to the hero animation. A valid simulation step is finite, positive and <=1/30 second. Pause means not stepping, not supplying dt=0.

A successful start enters opening at angle 0 without advancing time. Steps use smoothstep progress to approach the geometry module's open-angle constant (-90 degrees). Elapsed time is clamped to duration; the last 1e-12 relative remainder is snapped to absorb accumulation rounding. The owning action automatically enters open only at the endpoint. step returns true exactly on that transition and false otherwise. Further valid steps and repeated starts leave the open view unchanged. No callback or gameplay effect event is emitted.

Snapshots contain id, status, actionId, duration, elapsed, progress and angle, and are immutable. Reading them never advances time. The angle can be passed explicitly to buildPrisonDoorGeometry; tests use that real implementation and verify that the frame and closed colliders stay unchanged while the leaf changes.

Scope exclusions: no app/scene wiring, F, hero-animation event binding, live rendering, collision refresh, lamp cost, death/cancellation rules, closing, additional doors or gallery renewal. The in-game door still does not open from this module and the physical passage remains blocked.

Verification: 15 new tests passed locally on Node v20.20.1. A joint run with the unchanged 14 door-state and 11 door-geometry tests passed all 40 tests. JavaScript syntax checks passed. Local copies of the five existing production dependencies and two existing test files were checked against their GitHub blob IDs; no substitutes or baseline copies are part of this commit.

Full project build/typecheck/regression on supported Node 22 remains pending the existing branch CI. No CI success, browser result, visual speed approval or hinge/clearance acceptance is claimed for this patch.

Next block: bind the existing hero interaction-effect marker to this motion and publish the changing door mesh into the scene, with explicit object lifetime and interruption rules. Live collision changes remain a separate block.
