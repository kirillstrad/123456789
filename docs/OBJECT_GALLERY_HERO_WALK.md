# Gallery hero walking draft

Adds a separate gallery player through window.__ASH_GALLERY__.walk(). Existing open()/focus()/setCamera() remain inspection mode; changing the inspection camera releases the walking player. Escape closes the gallery and restores the prior app mode.

The app supplies original createMotion/velocity/finishMotion and advanceWorldFootContacts. Original combatHero/IronPilgrim emits the hero, walking/idle blend and foot-contact pose; hero geometry joins gallery objects in the native depth pass and hero mask. The hero lamp replaces the inspection lamp while walking. No enemy, attack, dash, execution or combat-world stepping is enabled.

The controller owns a deep-copied compatibility snapshot; combat-only action fields, time, locomotion, lamp and contacts are reset. Simulation uses the existing 1/60 fixed-step convention and camera follow rate. Boundaries clamp at the gallery edges. IMPORTANT: authored OBJECT COLLISIONS ARE NOT CONNECTED YET; walking through exhibits is possible in this intermediate walk test. There is no stair traversal, new interaction, Level Select entry or save integration.

Local checks: 9 controller tests passed; changed JS/MJS pass node --check. Local numeric adapters were JavaScript test copies of the existing motion/inertia logic, not a TypeScript build. Foot-contact tests check adapter invocation, not actual IK/visual acceptance. Full project, real browser, Windows and rendering checks have not run for this draft. Browser script is extended to check visible native hero parts, actual key movement, idle recovery, unchanged combat snapshot and cleanup, and to capture walk/idle screenshots in the existing gallery CI artifact.

Status: prepared patch, NOT committed. Base branch iteration-4e-throne-test, commit 0e18ff5a2b3d331c4a4d7d439b433e5e054eb7e7; base main blob 20fed186184b4e603ebbe1da36689f0188611399. Previous CI success is user-reported for that base, not a result for these new changes.
