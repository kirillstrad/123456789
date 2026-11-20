# Visual ember candidate

Scope: selective hero skin highlights and a small visible-mask backdrop increase; amber flame cores and hints; warm fire contribution and hue-preserving highlight compression; glyph-built normal and boss HP plates. The HP selection model is unchanged. No ordinary filled rectangle health bars remain in the painter.

Seven isolated visual helper tests passed before publication. Full game build, Chromium, regressions and human visual acceptance are not certified by publishing this candidate. Actual results: docs/visual-ember-verification.json. The browser HUD test now checks painted ASCII fill glyphs instead of a pixel inside the removed solid bar.

No changes to damage, lamp-resource rules, ignition costs, attack logic, map brightness sources or lamp radius/power profiles. Tone and hero contrast are intentional rendering changes. Main and BAT files are not targeted.

Next separate gameplay patch: Corpse Golem, one phase, three readable attacks, locked arena, no summons or corpse consumption and no new statuses or resistances. Boss implementation is not included here.
