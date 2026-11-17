# Lighting patch 4a: guarded ignition session

Explicit gameplay policy: six LAMP per successful ignition with at least one LAMP remaining. Seven LAMP is the minimum start budget. The pure state module keeps its unconfigured default for low-level callers; the gameplay controller explicitly passes the approved six-unit policy, never an implicit zero or clipped last-ember payment.

Start fails closed unless the integration owner explicitly grants allowed(), the actor passes interactionInputAllowed, the target is a ready ignite target, the actor is within 0.15 world units of its approach point and faces its face point within 18 degrees. Missing data, busy/dead actors, inadequate funds and concurrent requests are rejected before animation ownership is acquired. A warning is returned when payment would leave 15 LAMP or less.

The simulation owner calls step after the world tick. The session exposes the existing ignite interaction frame for rendering. At the contact marker, identity-bound light ownership, actor interaction, alignment and the full payment budget are checked. The stock world payment and scene ignition methods execute synchronously without callbacks or awaits. Six is paid once, then the owned source becomes lit. An unexpected violation throws instead of silently continuing. The generic payment API is not changed for doors or other interactions.

Insufficient budget at contact restores the source and lets the animation recover without payment. Nonlethal damage alone does not cancel; death, lost ownership or displacement before contact cancel without payment. After successful contact, cancellation never refunds or extinguishes the source. Reset invalidates scene tokens.

This is a controller layer, not completed app wiring. Existing F dispatch and approach owners are unchanged; source placement, controller arbitration with doors, hand contact fitting, browser checks and playable acceptance are still required. allowed() must account for active mode, pause/freeze and hidden state when connected. step must not advance during pause/freeze. The controller owns no world or wall-clock time.

Tests cover budget boundaries, missing permission, facing, marker payment, repeat prevention, low-budget damage, ordinary damage, cancellation, reset and death. CI results have not yet been established for this commit. No additional hero or door-camera changes are included.
