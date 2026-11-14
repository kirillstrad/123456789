import type {ExecutionState} from './execution.js';
import type {DashState} from './ash-dash.js';
import type {MotionState} from '../animation/motion.js';
import type {FootContacts} from '../animation/foot-contact.js';
import type {State,MoveInput,Vec3} from '../core/types.js';
export interface Point{x:number;y:number}
export type AttackKind='light'|'heavy';
export interface AttackCommand{kind:AttackKind;aim:Point|null}
export interface Strike{id:number;kind:AttackKind;stage:number;elapsed:number;duration:number;fx:number;fy:number;hitIds:Set<number>}
export interface ActionView{id:number;kind:AttackKind;stage:number;progress:number;fx:number;fy:number;clip:string}
export interface Enemy{id:number;x:number;y:number;fx:number;fy:number;hp:number;mode:'wait'|'chase'|'windup'|'recover'|'stagger'|'dead';timer:number;cooldown:number;walkDistance:number;hitFired:boolean;charred?:boolean}
export interface Particle{x:number;y:number;z:number;vx:number;vy:number;vz:number;life:number;maxLife:number;glow:boolean;glyph:string}
export interface Cone{x:number;y:number;fx:number;fy:number;life:number;maxLife:number}
export interface CombatFootEntry{clip:string;actionId:number|null;feet:Vec3[]}
export interface CombatSnapshot extends State{execution?:ExecutionState|null;motion?:MotionState;footContacts?:FootContacts|null;combatEntry?:CombatFootEntry|null;dash?:DashState|null;dashCooldown?:number;phase:'playing'|'won'|'dead';action:ActionView|null;sweepProgress:number|null;enemy:Enemy;particles:Particle[];cone:Cone|null;hitReaction:number;deathTime:number;note:string}
export interface WorldInput extends MoveInput{aim?:Point|null}
export interface Obstacles{circles:readonly {x:number;y:number;r:number}[];rects:readonly {minX:number;maxX:number;minY:number;maxY:number}[]}
export interface AttackHooks{position():Point;facing():Point;hit(strike:Strike):void;lunge(dx:number,dy:number):void}
export type SwordTip=Vec3;
