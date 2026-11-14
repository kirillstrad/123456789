# Object gallery integration — stage 1

Target: a separate OBJECT GALLERY level reachable through Level Select, inside the existing game renderer. Existing combat room remains available.

Approved scope: 57 catalogue families, three variants each, 171 reference IDs. HTML catalogue geometry is reference material, not a drop-in rendering engine. Adapt meshes and detailing to native Part structures, the project palette, cell lighting and the existing ASCII renderer.

This commit contains ONLY the registry and layout contract. It does not add menu navigation, a rendered gallery, collisions or native geometry. Every reference explicitly remains pending-native. A passing test or a normal CI build of this commit is NOT a delivered gallery level.

Layout reserves themed sections and all 171 exhibit positions with space between them. Reservations support placement/culling; they are not automatic solid boxes. Native geometry must supply appropriate collision shapes, including open arch frames.

Gallery rules: no combat, no enemies, no stair traversal. Single bodies are decoration; body piles and stakes are obstacles. Interactive preview states are limited to doors and lights. Boarded doors and blockages do not acquire destruction mechanics.

Next: native geometry per family; shared game lighting/ASCII and original hero locomotion; actual gallery navigation and section jumps; OBJECT GALLERY entry in Level Select; browser/Windows checks covering entry, movement, all reference coverage, interactions, resize and return to menu. Validate geometry before marking an object implemented. Measure performance with culling; do not promise hardware FPS.

Visual acceptance and the latest CI/Windows outcome are separate and remain unconfirmed here. Main and iteration-4-main-4a are not modified.
