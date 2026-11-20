import {MARROW_ARCHER} from './marrow-archer.js';
import {COMBAT} from './config.js';
import {MELEE_UNDEAD} from './melee-undead.js';
const profiles={...MELEE_UNDEAD,'marrow-archer':MARROW_ARCHER,
 'test-warden':{id:'test-warden',name:'Test Warden',category:'human',maxHp:COMBAT.enemyLife,damage:COMBAT.enemyDamage,radius:.35,speed:COMBAT.enemySpeed,windup:COMBAT.enemyWindup,recover:COMBAT.enemyRecover,reach:COMBAT.enemyReach,cooldown:COMBAT.enemyCooldown,stagger:COMBAT.staggerDuration},
 bonebound:{id:'bonebound',name:'Bonebound',category:'undead',maxHp:36,damage:8,radius:.32,speed:.8,windup:.72,recover:.8,reach:1.15,cooldown:1.35,stagger:.45}
};
export const BESTIARY=Object.freeze(Object.fromEntries(Object.entries(profiles).map(([k,v])=>[k,Object.freeze(v)])));
export function enemyDefinition(id='test-warden'){if(!Object.hasOwn(BESTIARY,id))throw Error('Unknown enemy archetype: '+id);return BESTIARY[id];}
export function makeBestiaryEnemy(archetype,id,x,y){const p=enemyDefinition(archetype);if(!Number.isSafeInteger(id)||id<0||![x,y].every(Number.isFinite))throw Error('Invalid enemy spawn');return{id,archetype,name:p.name,category:p.category,maxHp:p.maxHp,radius:p.radius,x,y,fx:0,fy:1,hp:p.maxHp,mode:'wait',timer:0,cooldown:0,walkDistance:0,hitFired:false};}
