import {pickFrameTarget} from './frame-targeting.js';
// Read-only candidates. Polygon ordering is retained before line/dot fallback.
export function visibleTargetSamples({parts,targets,project,targetId,zoom=1,viewport,limit=32}){
 if(!Number.isInteger(limit)||limit<1||limit>128)throw Error('Invalid sample limit');
 const target=targets.find(t=>t.id===targetId);if(!target)return[];const owned=new Set(target.parts),seen=new Set(),samples=[];
 for(const kind of [0,1,2])for(let n=parts.length-1;n>=0;n--){const part=parts[n];if(part.kind!==kind||!owned.has(part.interactionSource??part)||(part.alpha??1)<=0)continue;const v=part.v.map(q=>project(...q));if(!v.length||!v.every(p=>p.every(Number.isFinite)))continue;let candidates=[];
  if(kind===0){if(v.length<3)continue;const center=[v.reduce((s,p)=>s+p[0],0)/v.length,v.reduce((s,p)=>s+p[1],0)/v.length];candidates=[center,...v.map(p=>[center[0]*.6+p[0]*.4,center[1]*.6+p[1]*.4])];}
  else if(kind===1){for(let i=1;i<v.length;i++)for(const t of [.1,.3,.5,.7,.9])candidates.push([v[i-1][0]+(v[i][0]-v[i-1][0])*t,v[i-1][1]+(v[i][1]-v[i-1][1])*t]);}
  else{const r=(part.r||0)*65/94*zoom;if(!Number.isFinite(r)||r<=0)continue;const [x,y]=v[0];candidates=[[x,y],[x-r*.35,y],[x+r*.35,y],[x,y-r*.3],[x,y+r*.3]];}
  for(const point of candidates){const key=point.map(x=>Math.round(x*2)).join(',');if(seen.has(key))continue;seen.add(key);if(pickFrameTarget({parts,targets,project,point,zoom,viewport})?.id!==targetId)continue;samples.push(point);if(samples.length===limit)return samples;}
 }return samples;
}
