import type {CombatSnapshot,Enemy,Obstacles} from '../combat/types.js';
export const GOLEM_PREPARE:number,GOLEM_DEATH:number;
export interface GolemTrialView {bossId:number;status:string;inRoom:boolean;active:boolean;locked:boolean}
export function createGolemTrialController(map:Obstacles,bossId:number):{canFight():boolean;reset():void;snapshot(s:CombatSnapshot):GolemTrialView;step(dt:number,s:CombatSnapshot):void};
export function stageGolem(s:CombatSnapshot,boss:Enemy,map:Obstacles,solid:(x:number,y:number,map:Obstacles,r?:number)=>boolean,occupy:(s:CombatSnapshot,x:number,y:number)=>boolean):{x:number;y:number}|null;
export function captureGolemLoadout(s:CombatSnapshot):Record<string,unknown>;
export function restoreGolemLoadout(s:CombatSnapshot,checkpoint:Record<string,unknown>):void;
