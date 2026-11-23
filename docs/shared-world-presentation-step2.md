# Shared F stamp — second integration step

The existing main-game createFireHintParts hover path now produces a small F seal made of world polygons for doors and manually ignited sources. It replaces the previous native F text, rather than adding a second indicator.

The F seal goes through the ordinary geometry / ASCII pass. It is marked as transient noninteractive geometry so existing picking ignores it. The fire overlay does not composite it twice. Screen width is approximately 32 pixels at normal interaction zooms. E labels and ignition policy remain unchanged.

No input handler, approach controller, collision, lamp cost or target identity is changed. Eligibility remains controlled by the existing caller and hover availability. This does not add a new indicator for non-targeted books or ritual interactions, does not change the separate prologue stamp, and does not complete menu/prologue integration. Full PR CI and visual acceptance are still required.
