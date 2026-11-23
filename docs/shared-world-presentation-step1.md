# Shared gameplay dressing — first integration step

The ordinary createCombatDoorEnvironment factory now receives map-aware decoration. This reaches the test chamber, Ashen Nave and other scenes using that shared factory, not only the separate Last Service view.

- Decoration is cached per environment and rendered through the existing world geometry / ASCII pipeline.
- Floor remnants stay outside sampled collision footprints; wall reliefs follow existing walls.
- Target approach areas are excluded. No colliders, lights, target identities, enemy positions or input rules are changed.
- Near-facing reliefs use a fixed low cutaway, not proximity fading. Geometry generation is bounded.

Focused tests use the actual shared factory source with injected dependencies. Full build, existing tests, browser checks and visual acceptance remain required in PR CI.

Not included in this commit: common F stamps, menu/prologue scene integration, special arena dressing, artwork polish or merge approval.
