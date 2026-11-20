export const LAMP_LIGHTING=Object.freeze({maxLife:100,criticalAt:1,normalAt:15,emberPowerScale:.055,emberRadiusScale:.4});
export function lampLighting(life,phase='playing'){
 const charge=Number.isFinite(life)?Math.max(0,Math.min(LAMP_LIGHTING.maxLife,life)):0;
 if(phase==='dead'||charge<=0)return{power:0,radiusScale:0,warmth:0,mode:'out'};
 const t=Math.max(0,Math.min(1,(charge-LAMP_LIGHTING.criticalAt)/(LAMP_LIGHTING.normalAt-LAMP_LIGHTING.criticalAt))),ease=t*t*(3-2*t),dim=LAMP_LIGHTING.emberPowerScale+(1-LAMP_LIGHTING.emberPowerScale)*ease;
 return{power:(.72+.28*charge/LAMP_LIGHTING.maxLife)*dim,radiusScale:LAMP_LIGHTING.emberRadiusScale+(1-LAMP_LIGHTING.emberRadiusScale)*ease,warmth:dim,mode:charge<=LAMP_LIGHTING.criticalAt?'last-ember':charge<LAMP_LIGHTING.normalAt?'low':'normal'};
}
