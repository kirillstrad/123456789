import {shadeAmberCell} from './amber-cell.js';
export const LIGHT_TINTS=Object.freeze({yellow:Object.freeze([1,.93,.64]),amber:Object.freeze([1,.68,.39]),scarlet:Object.freeze([1,.24,.32]),ivory:Object.freeze([1,.96,.84])});
export function fixturePalette(id=''){
 const key=id.includes('cluster-c')?'scarlet':id.includes('chandelier')?'yellow':id.includes('cluster-a')?'amber':'ivory';
 return {tint:LIGHT_TINTS[key],outer:key==='scarlet'?[204,66,83]:key==='amber'?[226,163,91]:[231,207,144],core:key==='scarlet'?[255,184,166]:[255,239,200]};
}
export function lightTint(l){
 if(Array.isArray(l?.lightColor)&&l.lightColor.length===3&&l.lightColor.every(Number.isFinite))return l.lightColor.map(v=>Math.max(0,Math.min(1,v)));
 if(l?.fixtureId)return fixturePalette(l.fixtureId).tint;
 return l?.fireWarmth>0?LIGHT_TINTS.amber:[1,1,1];
}
export function exposureShoulder(base){return base<=.55?Math.max(0,base):.55+.55*(1-Math.exp(-(base-.55)/.55));}
export function shadeColoredCell(data,k,base,warm,hero,spectral){
 const a=data[k+3];shadeAmberCell(data,k,exposureShoulder(base),warm,hero);
 const weight=spectral[3];if(Number.isFinite(weight)&&weight>1e-8){
  const rgb=spectral.slice(0,3).map(v=>v/weight),peak=Math.max(...rgb,1e-8);
  for(let i=0;i<3;i++)data[k+i]*=.76+.24*rgb[i]/peak;
 }
 data[k+3]=a;
}
