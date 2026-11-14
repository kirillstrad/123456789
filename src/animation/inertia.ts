export const INERTIA_KEYS=['bodyForward','bodySide','swordForward','swordSide','lampForward','lampSide','clothLag','chainLag'] as const;
export type InertiaKey=typeof INERTIA_KEYS[number];
export type InertiaFields=Partial<Record<InertiaKey|`${InertiaKey}V`,number>>;
export const INERTIA=Object.freeze({
  bodyForward:{frequency:16,limit:.25,axis:'forward'},bodySide:{frequency:16,limit:.5,axis:'side'},
  swordForward:{frequency:9,limit:.25,axis:'forward'},swordSide:{frequency:9,limit:.5,axis:'side'},
  lampForward:{frequency:12,limit:.25,axis:'forward'},lampSide:{frequency:12,limit:.5,axis:'side'},
  clothLag:{frequency:7,limit:.5,axis:'side'},chainLag:{frequency:10,limit:.5,axis:'mixed'}
} as const);
const clamp=(x:number,n:number)=>Math.max(-n,Math.min(n,x));
export function createInertia():Required<InertiaFields> {
  return Object.fromEntries(INERTIA_KEYS.flatMap(k=>[[k,0],[`${k}V`,0]])) as Required<InertiaFields>;
}
/** Exact critically damped response for a constant target over one simulation tick. */
export function advanceInertia(state:InertiaFields,dt:number,drive:{forward:number;side:number;enabled:boolean},reset=false):void {
  if(!Number.isFinite(dt)||dt<=0)return;
  if(reset){Object.assign(state,createInertia());return;}
  const forward=Number.isFinite(drive.forward)?drive.forward:0,side=Number.isFinite(drive.side)?drive.side:0;
  for(const k of INERTIA_KEYS){
    const spec=INERTIA[k],vk:`${InertiaKey}V`=`${k}V`,raw=spec.axis==='forward'?forward:spec.axis==='side'?side:.6*forward+.4*side;
    const target=drive.enabled?clamp(raw,spec.limit):0,x=state[k]??0,v=state[vk]??0,w=spec.frequency,y=x-target,c=v+w*y,e=Math.exp(-w*dt);
    let next=clamp(target+(y+c*dt)*e,spec.limit),speed=clamp((v-w*c*dt)*e,2*w*spec.limit);
    if(Math.abs(next)>=spec.limit&&next*speed>0)speed=0;
    if(target===0&&Math.abs(next)<1e-5&&Math.abs(speed)<1e-4){next=0;speed=0;}
    state[k]=next;state[vk]=speed;
  }
}
export function interpolateInertia(a:InertiaFields|undefined,b:InertiaFields,t:number):Required<InertiaFields> {
  const result=createInertia(),alpha=Math.max(0,Math.min(1,t));
  for(const k of Object.keys(result) as (keyof InertiaFields)[]){const x=a?.[k]??0;result[k]=x+((b[k]??0)-x)*alpha;}
  return result;
}
