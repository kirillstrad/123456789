import type {Enemy} from './types.js';
export interface EnemyDefinition {readonly id:string;readonly name:string;readonly category:string;readonly maxHp:number;readonly damage:number;readonly radius:number;readonly speed:number;readonly windup:number;readonly recover:number;readonly reach:number;readonly cooldown:number;readonly stagger:number}
export const BESTIARY:Readonly<Record<string,EnemyDefinition>>;
export function enemyDefinition(id?:string):EnemyDefinition;
export function makeBestiaryEnemy(archetype:string,id:number,x:number,y:number):Enemy;
