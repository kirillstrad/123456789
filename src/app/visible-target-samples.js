import {pickFrameTarget} from './frame-targeting.js';
// Read-only candidates. This never changes selection or bypasses occlusion.
export function visibleTargetSamples({parts,targets,project,targetId,zoom=1,viewport,limit=32}){
 if(!Number.isInteger(limit)||limit<1||limit>128)throw Error('Invalid sample limit');
 const target=targets.find(t=>t.id===targetId);if(!target)return[];const owned=new Set(target.parts),seen=new Set(),samples=[];
 for(let n=parts.length-1;n>=0;n--){const part=parts[n];if(part.kind!==0||!owned.has(part.interactionSource??part)||(part.alpha??1)<=0)continue;const v=part.v.map(q=>project(...q));if(v.length<3||!v.every(p=>p.every(Number.isFinite)))continue;const center=[v.reduce((s,p)=>s+p[0],0)/v.length,v.reduce((s,p)=>s+p[1],0)/v.length],candidates=[center,...v.map(p=>[center[0]*.6+p[0]*.4,center[1]*.6+p[1]*.4])];
  for(const point of candidates){const key=point.map(x=>Math.round(x*2)).join(',');if(seen.has(key))continue;seen.add(key);if(pickFrameTarget({parts,targets,project,point,zoom,viewport})?.id!==targetId)continue;samples.push(point);if(samples.length===limit)return samples;}
 }return samples;
}
