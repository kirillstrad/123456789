import {createEnvironment} from './environment.js';
export function createCombatDoorEnvironment(door){
 const env=createEnvironment();
 const isOldBar=p=>p.kind===1&&p.v.length===2&&p.v[0][1]===2.8&&p.v[1][1]===2.8&&p.v[0][2]===.05&&p.v[1][2]===2.4&&p.v[0][0]===p.v[1][0]&&p.v[0][0]>=7.29&&p.v[0][0]<=8.71;
 if(env.parts.filter(isOldBar).length!==8)throw Error('Nave gate geometry changed; review integration');
 const staticParts=env.parts.filter(p=>!isOldBar(p));
 return Object.freeze({get parts(){return[...staticParts,...door.parts];},lights:env.lights,targets:door.targets});
}
