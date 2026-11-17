# Combined patch: package 2 implementation candidate

Work branch: iteration-5j-interaction-room-visibility. Main remains unchanged. Per user instruction, tests and CI remain deferred until package 3. Package 1/2 commits use [skip ci]. No visual acceptance or passing run is claimed.

Package 1 supplies the 44 by 26 room, six articulated doors, 29 stateful light sources, expanded movement/navigation bounds and production E/F target separation. Package 2 part 1 connects source-specific permanent lighting and enlarged flames, including the fixed 70-LAMP reference for oven and campfire.

Package 2 part 2 now changes the real app renderer: every eligible unlit source receives one cool-white wisp, a wick accent and a short periodic pulse. Source metadata includes igniting sources until the actual ignition effect. Darkness does not hide hints; projected lantern illumination increases their opacity. Hover picking considers both E sources and F targets, but actual F intent resolution still uses only the manual-target list. E/F glyphs appear only for a hovered ready target. The game removes its old proximity tint/vapor after targeting; gallery behavior is preserved.

Hints are decorative depth-sorted parts, skipped by interaction picking and excluded from the lit scene/hero mask. A separate transparent canvas draws hints in source-over mode and erases later foreground geometry in destination-out mode using the same projection and shape renderer. The surviving pixels are composited after ASCII lighting. This implements pixel-shaped occlusion within the existing painter-order renderer, not a new physically accurate depth buffer. Halo-like partial erasure and painter-order edge cases still require browser/visual checks. Reduced-motion mode keeps steady hints without drifting or pulses.

The visual E flash now fades over 0.18 seconds at maximum gain 0.035 and visual range 2; spark particle illumination is reduced to radius 8/power 0.012 and ends with that flash. The real ignition range, event timing, particles and resource rules are not changed. Render metrics expose flash gain, hint-part count and the hovered action letter.

Tests are added but NOT run. Package 2 is implemented as a candidate, not verified. Package 3 still includes hero scarlet landmarks, subtle background contrast and sparse metal glints, migration of old layout/geometry/browser fixtures and final combined tests/CI/visual review. No intermediate merge into main.
