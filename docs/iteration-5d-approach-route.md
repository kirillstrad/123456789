# Patch 1.4a: isolated approach route planning

Base: c65b77bc9da39af06d94b2260901db258124f3e2, iteration-5a-lamp-life.

Adds planApproachRoute with the existing gallery collision world, default hero radius 0.24 and height 1.8. This module has no DOM, actor, input or intent dependencies and is not wired into main.js.

Routes contain axis-aligned waypoints, exclude the start and include the exact requested ground-plane approach point. An unobstructed L-shaped route is tried first; otherwise a deterministic four-neighbour breadth-first grid search is used. Every leg is checked with the existing collision move method. No diagonal shortcuts or partial success routes are returned.

Statuses: ready, arrived, unreachable, budget-exceeded. Invalid inputs or invalid collider geometry throw. Callers must handle both unsuccessful statuses and exceptions without starting movement. arrived means only that the valid start matches the requested point; it is not authorization to interact.

Limits: cell size 0.1..2 (default 0.5), radius 0.1..2, world spans at most 128 per axis, at most 65,536 grid nodes, and 1..16,384 visited nodes (default 4,096). Endpoints connect to nearby grid nodes by checked orthogonal segments. This is a resolution-limited planner: unreachable means no route found at this resolution, not proof of geometric impossibility. Routes are not guaranteed to be shortest. Obstacle validation inherits the existing collision implementation and is not a new exact swept-volume solver. No browser performance guarantee is made.

Planning uses a snapshot of colliders. Moving obstacles, target validity, context, manual cancellation, actual steering, braking, facing, replanning and stuck detection belong to patch 1.4b. The caller must revalidate before and during movement. This module does not change combat collision rules and does not silently infer combat-world obstacles.

No movement, action launch, door opening, animation or lamp spending is added. main and existing files are unchanged.

Local verification: 13 new tests passed on Node v20.20.1 using the unchanged gallery collision source from the base branch. Supported Node >=22 checks, full regression suite, build/typecheck, browser review and complete CI were not run. This document records preparation results, not deployment or visual acceptance.
