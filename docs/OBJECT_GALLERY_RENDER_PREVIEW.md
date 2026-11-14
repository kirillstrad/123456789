# Native gallery render preview

main.js now invokes createGalleryScene through window.__ASH_GALLERY__.open(). This is an isolated RENDER PREVIEW, not a playable level or a Level Select entry. The same native part painter, projection, ASCII conversion and cell-lighting loop are reused; floorParts are drawn first, then depth-sorted object parts. Gallery lights replace combat environment lights in this mode. No hero, enemy, execution effects, attack cone, dash or combat particles are drawn in the preview. A fixed inspection lamp is used only for preview illumination, without modifying the combat lamp value.

Temporary test API: open(), focus('bookcase.a'), setCamera(x,y), render(), stats(), camera(), close(). Escape or the menu toolbar button closes the preview. Normal movement/attack/menu clicks are ignored while previewing. Combat stepping is bypassed in the preview tick; close restores the previous mode/camera/view and releases scene data. Existing explicit restart/home actions retain their original reset behavior. Menus, CombatWorld and main branch are not replaced.

Viewport range is derived from the current native projection for widths through 3840 in unit tests. Light radius/power follow the existing renderer. This is not visual approval or an FPS claim.

Local checks: four renderer-helper tests pass (range coverage, widening, separate floor/depth order, invalid input), and changed JS/MJS pass node --check. The original main.js was verified against Git blob SHA before applying targeted replacements. Full project/browser/Windows checks have NOT run locally. New Gallery Render Preview CI builds PLAY.html on Node 22/Linux and runs tools/gallery-render-check.mjs, producing four native canvas screenshots and JSON in OBJECT_GALLERY_RENDER_<commit>. This CI result remains unconfirmed until execution. It does not replace the existing Windows/full regression workflow.

Next: review real screenshots/errors, original hero locomotion, collision handling, door/light states, Level Select and native Windows acceptance. Models remain pending visual acceptance.
