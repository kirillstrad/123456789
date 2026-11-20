import {createEnemyHealthModel,paintEnemyHealth} from '../ui/enemy-health.js';
function contains(v,p){let inside=false;for(let i=0,j=v.length-1;i<v.length;j=i++){const a=v[i],b=v[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function createHealthHitIndex({parts,groups,project,zoom,viewport}){
 const owners=new Map(),ids=new Set(),duplicate=new Set();
 for(const g of groups){if(ids.has(g.id))duplicate.add(g.id);ids.add(g.id);for(const p of g.parts){if(owners.has(p)&&owners.get(p)!==g.id)owners.set(p,null);else if(!owners.has(p))owners.set(p,g.id);}}
 const records=[];
 for(const p of parts){if(!p||p.fireHint||p.interactionVapor||(p.alpha??1)<=0||![0,1,2].includes(p.kind)||!p.v?.length)continue;const v=p.v.map(q=>project(...q));if(v.some(q=>!q.slice(0,2).every(Number.isFinite)))continue;const r=p.kind===2?(p.r??0)*65/94*zoom:p.kind===1?(p.w??1)*zoom/2:0,xs=v.map(q=>q[0]),ys=v.map(q=>q[1]);records.push({id:owners.get(p.interactionSource??p),kind:p.kind,v,r,minX:Math.min(...xs)-r,maxX:Math.max(...xs)+r,minY:Math.min(...ys)-r,maxY:Math.max(...ys)+r});}
 function pick(point){if(!point||!point.every(Number.isFinite)||point[0]<0||point[1]<0||point[0]>=viewport.width||point[1]>=viewport.height)return null;
  for(let i=records.length-1;i>=0;i--){const r=records[i],p=point;if(p[0]<r.minX||p[0]>r.maxX||p[1]<r.minY||p[1]>r.maxY)continue;let hit=false;if(r.kind===0)hit=contains(r.v,p);else if(r.kind===2)hit=r.r>0&&((p[0]-r.v[0][0])/r.r)**2+((p[1]-r.v[0][1])/(r.r*.85))**2<=1;else for(let j=1;j<r.v.length;j++){const a=r.v[j-1],b=r.v[j],dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n)):0;if(Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<=r.r)hit=true;}if(hit)return Number.isSafeInteger(r.id)&&!duplicate.has(r.id)?r.id:null;}
  return null;
 }
 return{pick,records};
}
// Uses final lit ASCII cells, not a guessed world-space lamp radius.
export function healthVisibleIds(index,{data,cols,rows},viewport,{pointer=null,threshold=32}={}){
 function lit(p){if(p[0]<0||p[1]<0||p[0]>=viewport.width||p[1]>=viewport.height)return false;const x=Math.floor(p[0]*cols/viewport.width),y=Math.floor(p[1]*rows/viewport.height),k=(y*cols+x)*4;return Math.max(data[k]??0,data[k+1]??0,data[k+2]??0)>=threshold;}
 const visible=new Set();
 if(pointer&&lit(pointer)){const id=index.pick(pointer);if(id!==null)visible.add(id);}
 for(const r of index.records){if(!Number.isSafeInteger(r.id)||visible.has(r.id))continue;const center=[r.v.reduce((n,p)=>n+p[0],0)/r.v.length,r.v.reduce((n,p)=>n+p[1],0)/r.v.length],samples=[center];if(r.kind===1)for(let j=1;j<r.v.length;j++)samples.push([(r.v[j-1][0]+r.v[j][0])/2,(r.v[j-1][1]+r.v[j][1])/2]);for(const p of samples)if(lit(p)&&index.pick(p)===r.id){visible.add(r.id);break;}}
 return visible;
}
export function createEnemyHealthRuntime({defaultMaxHp=70}={}){
 const model=createEnemyHealthModel({defaultMaxHp});let view={target:null,boss:null},hover=null;
 const roster=s=>Array.isArray(s.enemies)?s.enemies:(s.enemy?[s.enemy]:[]);
 return Object.freeze({
  reset(){model.reset();hover=null;view={target:null,boss:null};},
  geometry(s,build){return roster(s).map(e=>({id:e.id,parts:build(e,s)}));},
  hoverId:()=>hover,
  update({parts,groups,project,zoom,viewport,cells,pointer,state,events,enabled}){
   if(!enabled){hover=null;view=model.update({time:state.time,worldKey:state,enabled:false});return view;}
   const index=createHealthHitIndex({parts,groups,project,zoom,viewport}),visibleIds=healthVisibleIds(index,cells,viewport,{pointer});
   const picked=index.pick(pointer);hover=visibleIds.has(picked)?picked:null;
   const boss=state.bossEncounter;
   view=model.update({time:state.time,worldKey:state,enemies:roster(state),visibleIds,hoverId:hover,hits:events,bossId:boss?.bossId??null,inBossRoom:boss?.active===true&&boss?.inRoom===true,enabled:true});return view;
  },
  paint(ctx,options){paintEnemyHealth(ctx,view,options);},
  snapshot:()=>({target:view.target?{...view.target}:null,boss:view.boss?{...view.boss}:null})
 });
}
