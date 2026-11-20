# Enemy HP integration

The workflow edits main.js and frame-targeting.js on bestiary-patch-1, checks syntax, builds, runs targeted tests, then commits source integration to that branch only. It never pushes to main or force-pushes. Full regressions run after the integration commit; failure does not roll it back. Adding the workflow is not proof that it ran successfully.

HP comes from world.current. Cursor and HP share mesh ownership; visibility uses final illuminated ASCII cells (draft threshold 32) and front-most geometry samples. Pause, gallery, world replacement and blocking relic UI reset or suppress panels. Thin/partly visible meshes, performance and Canvas styling still need browser/visual acceptance.

A future boss owner must publish world.current.bossEncounter={bossId,active:true,inRoom:true}. The current test warden is not automatically a boss. No boss encounter is created here.

Patch 1 remains an unapplied WIP; its mesh edit is adjusted for compatibility, not executed. PLAY.html is built as an Actions artifact, not replaced in Git. No full build, full-suite pass or browser result is claimed before the workflow is observed.
