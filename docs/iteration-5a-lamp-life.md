# Iteration 5A: lamp life — source implementation

Branch: iteration-5a-lamp-life. This package is based on 8a8749e684b66f28f476fd07804462cb024a28bc.

## Existing packages
- 62c4248: last-ember resource policy and guarded interaction lifecycle APIs.
- 8a8749e: one LAMP HUD and death priority over stale actions/execution metadata.
- F input, approach routing and authored interaction clips are not connected yet.

## World-light package
- Shared pure lampLighting profile is consumed by the actual app renderer and report.
- Working tuning: fade begins below 15/100; at 1 HP power is 0.039754 of full-charge power and radius is 0.4 of the normal radius.
- At 15 HP and above the old power/radius/warmth profile is retained. Below this threshold the fade is smooth and monotonic.
- Zero or invalid charge and dead phase produce zero lamp power, radius and warmth; zero radius never enters the Gaussian division.
- External lights, spark effects, ambient light and the existing hero-readability floor are not reduced by low lamp charge.
- Native hero geometry and lampBeat are unchanged by this package.
- Non-walking object-gallery preview remains lit independently of the combat death phase. Walking snapshots retain their own life/phase profile.
- Report lampLight is the combat-world profile; per-frame lampLight additionally records radiusPixels. Gallery timings describe the gallery preview separately.
- The obsolete HEALTH-mirrors-LAMP note is replaced. Public debug API, legacy build tag and export names remain unchanged for compatibility; this is not a new portable build.

## Verification and status
- 6 local native-JavaScript policy/wiring tests passed.
- 8 additional contract scenarios exercised the actual renderer body with stubbed DOM, world, geometry, effects and ASCII I/O.
- These are not native-browser visual acceptance, full project typecheck/build or complete CI.
- Earlier original-vendor execution-render regressions still await the final shared run.

The source scope of the first block is covered after this package, but end-to-end gameplay and visual acceptance remain pending. Future F targets must use the existing preview/spend/recovery APIs. No new door, ignition, campfire, AI or resurrection mechanics are added here.

Full CI is deferred until all functional blocks are complete. Commits use [skip ci]; skipped checks are not passed checks. No main merge, source-branch edits, portable rebuild or Windows release is claimed.
