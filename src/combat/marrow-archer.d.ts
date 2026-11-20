import type {Enemy,Point,Obstacles} from './types.js';
export interface Arrow{id:number;ownerId:number;x:number;y:number;previousX:number;previousY:number;fx:number;fy:number;remaining:number}
export type ArrowMap=Obstacles&{bounds?:{minX:number;maxX:number;minY:number;maxY:number}};
export const MARROW_ARCHER:Readonly<{id:string;name:string;category:string;maxHp:number;damage:number;radius:number;speed:number;windup:number;aimLock:number;recover:number;cooldown:number;reach:number;stagger:number;near:number;comfortable:number;retreatDistance:number;retreatSpeed:number;arrowSpeed:number;arrowRange:number;arrowRadius:number}>;
export function segmentCircle(a:Point,b:Point,c:Point,r:number):number|null;
export function segmentRect(a:Point,b:Point,r:{minX:number;maxX:number;minY:number;maxY:number},padding?:number):number|null;
export function firstObstacle(a:Point,b:Point,map:ArrowMap,padding?:number):number|null;
export function clearArcherShot(enemy:Enemy,target:Point,map:ArrowMap,enemies?:Enemy[]):boolean;
export function createArrowSystem():{reset():void;spawn(owner:Enemy,direction:Point):Arrow|null;snapshot():Arrow[];step(args:{dt:number;player:Point;previousPlayer?:Point;map:ArrowMap;enemies?:Enemy[];damage:(n:number)=>void}):void};
export function stepMarrowArcher(args:{enemy:Enemy;dt:number;player:Point;map:ArrowMap;enemies?:Enemy[];allowAttack?:boolean;solid:(x:number,y:number,map:Obstacles,radius?:number)=>boolean;shoot:(owner:Enemy,direction:Point)=>unknown}):boolean;
