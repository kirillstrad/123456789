const vec=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
function validate(actor,root,target){if(!actor||![actor.x,actor.y,actor.heading].every(Number.isFinite)||!vec(root)||!vec(target))throw Error('Invalid door contact transform');}
// Inverse of combatHero's pose-root-relative ground-plane transform.
export function doorContactToPose(actor,root,target){validate(actor,root,target);const fx=Math.cos(actor.heading),fy=Math.sin(actor.heading),dx=target[0]-actor.x,dy=target[1]-actor.y;return[root[0]+fy*dx-fx*dy,root[1]+fx*dx+fy*dy,target[2]];}
export function doorContactToWorld(actor,root,hand){validate(actor,root,hand);const fx=Math.cos(actor.heading),fy=Math.sin(actor.heading),x=hand[0]-root[0],y=hand[1]-root[1];return[actor.x+fy*x+fx*y,actor.y-fx*x+fy*y,hand[2]];}
export function checkDoorHandContact(actual,target,tolerance=.04){if(!vec(actual)||!vec(target)||!Number.isFinite(tolerance)||tolerance<0||tolerance>.1)throw Error('Invalid door contact measurement');const error=Math.hypot(...actual.map((v,i)=>v-target[i]));return{matches:error<=tolerance,error,tolerance};}
