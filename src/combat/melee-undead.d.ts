import type {Enemy,Point,Obstacles} from './types.js';
import type {EnemyDefinition} from './bestiary.js';
export const MELEE_UNDEAD:Readonly<Record<string,EnemyDefinition & {readonly arc:number}>>;
export function stepMeleeEnemy(args:{enemy:Enemy;dt:number;player:Point;map:Obstacles;damage:(n:number)=>void;allowAttack?:boolean;solid:(x:number,y:number,map:Obstacles,radius?:number)=>boolean;blocked:(a:Point,b:Point,map:Obstacles)=>boolean}):boolean;
