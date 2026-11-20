# Bestiary patch 1 — WIP

This commit preserves an executable source patch, not a finished release.
The game source is unchanged until the patch is applied locally.
Main is not modified. Build, typecheck, tests and visual acceptance have NOT run.

## Apply locally

Use Node.js 22 or newer from the repository root:

    node patches/bestiary-patch-1.apply.mjs --check
    node patches/bestiary-patch-1.apply.mjs --apply
    npm ci
    npm run typecheck
    npm run build
    npm test

The script stages every edit in memory before writing, refuses unexpected source contexts and existing new files, and backs up modified sources in .bestiary-patch-1-backup. It does not commit or push anything. Do not run it over unrelated uncommitted work. Source writes are not a cross-file filesystem transaction: if the process is interrupted during writing, restore the backup before retrying.

## Included in this WIP

- Bestiary definitions and an enemy roster with stable instance IDs.
- Multi-target strike processing and victory only when the roster is defeated.
- Hero/body and enemy/body collision handling and two concurrent enemy windups.
- Identity-bound execution selection, extraction and cancellation.
- Roster snapshots/interpolation and roster rendering through the normal app compositor.
- Dash landing checks and door actor checks for all living enemies.
- No HP payment or budget warnings for manual ignition. The existing low-HP lamp-light profile is retained.

## Not finished / not certified

- Dedicated Bonebound art, animation and a menu-accessible trial encounter.
- Migration of tests and browser fixtures that expect ignition to cost six HP.
- Full verification of multi-enemy execution visuals and dash collision edge cases.
- Rebuilt runtime and PLAY.html.
- HP bars and Corpse Golem belong to later patches.

The default legacy warden encounter stays unchanged. setEncounter accepts custom rosters for development; this is not a claim that the completed undead encounter is already playable from the menu.
