import {createLightScene} from './light-scene.js';
export const TEST_BRAZIER=Object.freeze({id:'nave.test-brazier',modelId:'brazier.a',initialStatus:'off',transform:Object.freeze({x:6.8,y:10.8,yaw:0})});
export const COMBAT_LIGHTS=Object.freeze([TEST_BRAZIER,...[
 ['nave.brazier-b','brazier.b',9.2,8,0],
 ['nave.brazier-c','brazier.c',14.5,9.5,0],
 ['nave.candlestick-a','candlesticks.a',4.2,6.7,0],
 ['nave.candlestick-b','candlesticks.b',8.9,5.8,0],
 ['nave.candlestick-c','candlesticks.c',12.9,14.4,0],
 ['nave.wall-light-a','wall-light.a',5.5,1.55,180],
 ['nave.wall-light-b','wall-light.b',10.5,1.55,180],
 ['nave.wall-light-c','wall-light.c',13.8,1.55,180]
].map(([id,modelId,x,y,yaw])=>Object.freeze({id,modelId,initialStatus:'off',transform:Object.freeze({x,y,yaw})}))]);
const contexts=new WeakMap();
export const findCombatLights=door=>contexts.get(door)??null;
export function enableCombatLights(door){
 if(contexts.has(door))return contexts.get(door);
 if(!door?.map?.circles)throw Error('Combat light integration requires the shared door map');
 const lights=createLightScene(COMBAT_LIGHTS);
 // Preserve authored collider membership; candles and wall lights add none.
 for(const c of lights.getFrame().colliders){if(c.minZ>=2.2||c.maxZ<=0)continue;const x=c.points.reduce((s,p)=>s+p[0],0)/c.points.length,y=c.points.reduce((s,p)=>s+p[1],0)/c.points.length,r=Math.max(...c.points.map(p=>Math.hypot(p[0]-x,p[1]-y)));if(r>0)door.map.circles.push({x,y,r});}
 contexts.set(door,lights);return lights;
}
