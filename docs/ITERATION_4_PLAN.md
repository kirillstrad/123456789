# Iteration 4 - approved order and scope

Branch: iteration-4-development. Base: 7acb667aa0f70dbd65e72c993c14deed7f6ce859 from iteration-3c-stabilization. Main and previous branches are not write targets. User-approved order: 4.0 -> 4A -> 4C -> 4B -> 4E -> final 4D. Work in complete feature blocks with integration tests and one full CI per block; corrective commits may require reruns.

## Carried risk

3C.4 manual report review and complete visual acceptance remain pending. See PENDING_ACCEPTANCE_3C.md. User-reported green CI does not independently verify performance, scan details or visual quality. This iteration does not close that risk or authorize a main merge.

## 4.0 - baseline infrastructure

Add a workflow restricted to this branch, separate Windows/web/report artifact names, exact source provenance and a baseline-only label. Reuse existing build, unit/integration, browser, stability, native smoke, Defender and signature checks without weakening publication gates. This first build contains the inherited gameplay, not implemented iteration-4 abilities. Legacy internal build identifiers may remain until deliberately migrated; provenance is explicit.

## 4A - continuous smoke dash

Shift with movement direction: smoothly dissolve into smoke, travel continuously as smoke with sparks, then reform through a phoenix-like ignition. No instant teleport or automatic bird model. Pass through enemies, not solid terrain/walls. Preserve the previously requested damage protection during a defined dash phase. Collision must be checked along travel, not only at the endpoint. Reset ordinary foot support during the action and safely reacquire it afterward. Pause, damage, death and retry must not leave stale action state. The ending flare is visual, not an implicitly approved area-damage attack.

Before implementation, explicitly set duration, travel distance, recovery/cooldown, protection window, behavior with no direction, and compatibility with attack/sweep/execution. These numerical/rule details are not approved by this document. Include rendered movement, input, simulation and tests in the same 4A block.

## 4C - authored one-handed heavy-sword combat

Replace light/heavy attack animations with coherent windup, body/weight motion, blade passage and recovery. Approved chains: LLH, HH and LLL. After shared LL, the third input chooses H or L; LL must not auto-trigger H. Preserve readable input and independently define queue/cancel/hit windows and damage before changing rules. This block authorizes animation work and the listed chain structures, not arbitrary numerical balance changes.

## 4B - pin, struggle and extract fire

Impale the enemy with the sword and pin them to the floor. The enemy tries and fails to pull the sword out. The hero draws their fire into the lamp, restoring its resource while the enemy burns. Finish with sword retrieval and return to stance. Previously requested rule: normal damage to the hero does not interrupt execution; lethal damage needs explicit cleanup. Prevent repeated resource rewards from the same victim. Target eligibility, resource amount and reward timing require explicit definition. Whether restored lamp charge means the existing life pool or a separate resource remains unresolved; do not silently add a second meter.

## 4E - shared visual direction, then separate implementation tracks

First approve one visual reference/specification covering palette, typography, ornaments, materials, light and readability. No UI/room restyling before that visual direction is fixed.

4E interface: menus, HUD and other interface elements.
4E room: visual atmosphere and interior treatment, coherent with the same direction.

The OBJECT REGISTRY is a separate task explicitly requested by the user. Do not implement its schema, asset catalog, placement system or mass room population as part of 4.0 or implicitly under 4E. Later room population should consume that separately agreed registry. Its contents and implementation schedule are not assigned here. No new levels, enemies or interactive object mechanics are implied.

## Final 4D - combined acceptance

Integration checks accompany every block. The final pass covers transitions among walking, attacks, dash and execution; collisions; damage/death; pause/focus/fullscreen; repeated restart; performance observations; full Windows/web builds and test/security reports. Correct confirmed defects, record known limitations and request visual acceptance. No automatic release, main merge or claim of complete acceptance.

## Delivery status at 4.0

This commit adds infrastructure and this plan only. 4A, 4C, 4B, 4E and final 4D are not implemented by it. Object-registry work is separate. New gameplay and visual changes need their own concrete patch review.
