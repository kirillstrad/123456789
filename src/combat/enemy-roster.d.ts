import type {Enemy,CombatSnapshot,Obstacles,Point} from './types.js';
type Roster={enemies?:Enemy[];enemy?:Enemy};
export function enemiesOf(s:Roster):Enemy[];
export function aliveEnemies(s:Roster):Enemy[];
export function enemyRadius(e:Enemy):number;
export function enemyMaxHp(e:Enemy):number;
export function actorCanOccupy(s:Roster,x:number,y:number,r?:number):boolean;
export function cloneEnemyRoster(p:Roster,s:Roster,t?:number):Enemy[];
export function stepEnemyGroup(s:CombatSnapshot,dt:number,map:Obstacles,damage:(n:number)=>void,step:(e:Enemy,dt:number,p:Point,map:Obstacles,damage:(n:number)=>void,allowAttack?:boolean)=>void,excludeId?:number|null,landing?:Point|null):void;
