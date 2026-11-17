export const DOOR_PROFILES=Object.freeze({
 'prison-door.a':{style:'bar-push',motion:'swing',lean:.1,twist:.08},
 'prison-door.b':{style:'shoulder-push',motion:'swing',lean:.25,twist:-.2},
 'prison-door.c':{style:'two-hand-heave',motion:'swing',lean:.2,twist:.04},
 'iron-door.a':{style:'double-push',motion:'double',lean:.14,twist:0},
 'iron-door.b':{style:'gate-lift',motion:'lift',lean:-.08,twist:0},
 'iron-door.c':{style:'heavy-double',motion:'double',lean:.3,twist:-.04}
});
for(const p of Object.values(DOOR_PROFILES))Object.freeze(p);
export function doorProfile(id){if(!Object.hasOwn(DOOR_PROFILES,id))throw Error('Unknown door profile');return DOOR_PROFILES[id];}
export function doorProgress(id,p){doorProfile(id);if(!Number.isFinite(p))throw Error('Invalid door progress');p=Math.max(0,Math.min(1,p));if(id==='prison-door.b')p=Math.max(0,(p-.12)/.88);if(id==='iron-door.c')p=p<.35?.12*p/.35:.12+.88*(p-.35)/.65;return p*p*(3-2*p);}
