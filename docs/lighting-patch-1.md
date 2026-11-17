# Lighting patch 1: scene state and ignition rules

Scope: pure state for nine existing light models. No gameplay wiring, models, rendering, lamp balance, damage logic or main merge.

Instance IDs are distinct from model IDs. Authored initial states are off or smoldering. A positive safe-integer action ID acquires an immutable ownership token and enters igniting. The animation owner calls ignite(token) only at the contact marker. A successful commit enters lit exactly once; lit sources do not reactivate or extinguish on later cancellation. Pre-contact cancellation restores the authored initial state.

Tokens are identity-bound and local to the scene; serialized copies are not accepted. Reused action IDs after cancellation are rejected until reset. Reset increments the instance epoch, restores authored initial state, clears action history and invalidates stale tokens. Instances sharing a model stay independent. Registry reset preserves instance handles.

Timing follows the existing ignite animation: duration 3.2 seconds, contact at 1.92 seconds. Tests verify the marker against interactionFrame. The state module does not own or advance a clock and cannot enforce caller timing, actor life or resource payment: those are responsibilities of subsequent controller/resource patches.

Lamp cost is explicitly null (unapproved). requireIgnitionCost() rejects an unset cost; zero is accepted only when passed explicitly. No resource is spent by this patch. Cost approval remains a blocker for the resource integration patch, not for state tests.

Tests: tests/light-state.test.mjs. The dedicated workflow runs these tests on push. Passing state tests does not establish build, full regression, Chromium, visual or playable acceptance. Later patches must connect models, F/approach, animation, atomic lamp payment and contact, death handling, permanent light, placement and final browser evidence.
