import {createLightScene} from './light-scene.js';
import {ROOM_LIGHTS} from './interaction-room-layout.js';
export const COMBAT_LIGHTS=ROOM_LIGHTS;
export const TEST_BRAZIER=COMBAT_LIGHTS.find(d=>d.id==='nave.test-brazier');
const contexts=new WeakMap();
export const findCombatLights=door=>contexts.get(door)??null;
export function enableCombatLights(door){
 if(contexts.has(door))return contexts.get(door);
 if(!door?.map?.circles)throw Error('Combat light integration requires the shared door map');
 const lights=createLightScene(COMBAT_LIGHTS);
 for(const c of lights.getFrame().colliders){if(c.minZ>=2.2||c.maxZ<=0)continue;const x=c.points.reduce((s,p)=>s+p[0],0)/c.points.length,y=c.points.reduce((s,p)=>s+p[1],0)/c.points.length,r=Math.max(...c.points.map(p=>Math.hypot(p[0]-x,p[1]-y)));if(r>0)door.map.circles.push({x,y,r});}
 contexts.set(door,lights);return lights;
}
