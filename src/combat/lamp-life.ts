export const LAMP_LIFE={max:100,lastEmber:1,low:15} as const;
export type InteractionKind='door'|'ignite'|'campfire';
export interface LampInteraction{id:number;kind:InteractionKind;lastEmberUsed:boolean;costPaid:boolean;recoveryGranted:number}
export function lampAfterDamage(life:number,damage:number,protectedAction=false,graceUsed=false):{life:number;usedGrace:boolean}{
 if(!Number.isFinite(life)||life<=0)return{life:0,usedGrace:false};
 if(!Number.isFinite(damage)||damage<=0)return{life,usedGrace:false};
 if(life<=LAMP_LIFE.lastEmber)return{life:0,usedGrace:false};
 const next=Math.max(0,life-damage);
 return next===0&&protectedAction&&!graceUsed?{life:LAMP_LIFE.lastEmber,usedGrace:true}:{life:next,usedGrace:false};
}
export function lampCostPreview(life:number,cost:number):{remaining:number;warning:string|null}|null{
 if(!Number.isFinite(life)||life<=0||!Number.isFinite(cost)||cost<0)return null;
 const remaining=Math.max(Math.min(LAMP_LIFE.lastEmber,life),life-cost);
 return{remaining,warning:cost>0&&life-cost<=LAMP_LIFE.lastEmber?'LAST EMBER - ONE HIT LEFT':null};
}
