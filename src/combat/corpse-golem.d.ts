import type {Enemy,Point,Obstacles} from './types.js';
import type {EnemyDefinition} from './bestiary.js';
import type {ExecutionActor,ExecutionState,ExecutionEvent} from './execution.js';
export type GolemAttack='slam'|'sweep'|'press';
export const CORPSE_GOLEM:Readonly<EnemyDefinition & {boss:true;category:'undead'}>;
export const GOLEM_ATTACKS:Readonly<Record<GolemAttack,Readonly<{windup:number;recover:number;reach:number;arc:number;damage:number}>>>;
export const GOLEM_FINISHER:Readonly<{weakFraction:number;reach:number;duration:number;down:number;pin:number;release:number;offer:number;extract:number;regrip:number;pull:number}>;
export interface GolemExecutionState extends ExecutionState {kind:'corpse-golem'}
export function golemExecutionWeak(e:Partial<Enemy>|null|undefined):boolean;
export function canFinishGolem(hero:ExecutionActor,boss:Enemy,lineBlocked?:boolean):boolean;
export function beginGolemExecution(hero:ExecutionActor,boss:Enemy,lineBlocked?:boolean):GolemExecutionState|null;
export function advanceGolemExecution(input:GolemExecutionState,dt:number,heroAlive?:boolean):{state:GolemExecutionState;events:ExecutionEvent[]};
export function golemFinisherFrame(e:{elapsed:number}|null|undefined):{kneel:number;open:number;offer:number;burn:number;fall:number;withdraw:number};
export function golemExecutionPresentation(e:{elapsed:number}|null|undefined):{pin:number;release:number;offer:number;char:number;regrip:number;pull:number;back:number;cameraZoom:number;cameraShake:number};
export function stepCorpseGolem(args:{enemy:Enemy;dt:number;player:Point;map:Obstacles;damage:(n:number)=>void;allowAttack?:boolean;solid:(x:number,y:number,map:Obstacles,radius?:number)=>boolean;blocked:(a:Point,b:Point,map:Obstacles)=>boolean}):boolean;
