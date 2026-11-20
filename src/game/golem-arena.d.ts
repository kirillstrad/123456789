export interface GolemRect {minX:number;maxX:number;minY:number;maxY:number;golemGate?:boolean}
export interface GolemMap {bounds:{minX:number;maxX:number;minY:number;maxY:number};circles:{x:number;y:number;r:number}[];rects:GolemRect[];golemRevision?:number}
export interface GolemArenaSnapshot {bossId:number;status:'waiting'|'fighting'|'failed'|'won';inRoom:boolean;active:boolean;locked:boolean}
export const GOLEM_BOUNDS:Readonly<GolemMap['bounds']>;
export function golemArenaMap():GolemMap;
export function createGolemArena(map:GolemMap,bossId:number):{snapshot():GolemArenaSnapshot;reset():void;update(hero:{x:number;y:number;lamp:number;phase:'playing'|'dead'|'won';execution?:unknown},boss:{id:number;hp:number}):GolemArenaSnapshot};
