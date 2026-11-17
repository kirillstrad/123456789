# One combined interaction-room and visibility patch

Branch: iteration-5j-interaction-room-visibility, based on main at 0b4afd3. Do not merge intermediate implementation commits as a completed patch.

This commit connects the existing spark-ignition processor to the production combat-controller tick, after the actual world sweep event. It covers all normal controller return paths, consumes an owned event once, and records spark-ignited events per source. It does not install another clock or mutate resources. Integration tests use the real combat world, shared scene map and controller. Their results have not yet been observed in CI.

The existing manual F route is retained for compatibility in this intermediate commit; final E/F-only target presentation still needs migration. Remaining in this same patch: enlarged room and orderly rows of all interactive light/door variants; legacy candle migration and any missing native fire models; production hint pulse/action labels with occlusion and independent readability; faint E flash; larger permanent light pools and flames; hero scarlet cloth landmarks, subtle background contrast and sparse cool metal highlights; updated browser acceptance and branch CI. No full completion or visual acceptance is claimed here. Main is unchanged.
