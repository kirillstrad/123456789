const finite=Number.isFinite;
const point=p=>Array.isArray(p)&&p.length===2&&p.every(finite);
const statuses=new Set(['ready','locked','requires-item']);
export function createInteractionTarget(input){
 if(!input||typeof input.id!=='string'||!input.id.trim()||typeof input.kind!=='string'||!input.kind.trim())throw new TypeError('Target needs id and kind');
 const {hitArea,approach,depth=0,availability='ready',visible=true,enabled=true,removed=false}=input;
 if(!Array.isArray(hitArea)||hitArea.length<3||!hitArea.every(point))throw new TypeError('Target needs a screen polygon');
 let area=0;for(let i=0;i<hitArea.length;i++){const a=hitArea[i],b=hitArea[(i+1)%hitArea.length];area+=a[0]*b[1]-b[0]*a[1];}
 if(!finite(area)||Math.abs(area)<1e-8||!approach||![approach.x,approach.y,approach.z??0,depth].every(finite)||!statuses.has(availability)||![visible,enabled,removed].every(v=>typeof v==='boolean'))throw new TypeError('Invalid target descriptor');
 return Object.freeze({id:input.id,kind:input.kind,hitArea:Object.freeze(hitArea.map(p=>Object.freeze([...p]))),approach:Object.freeze({x:approach.x,y:approach.y,z:approach.z??0}),depth,availability,visible,enabled,removed});
}
export function containsTargetPoint(polygon,p){
 if(!point(p))return false;let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[j],b=polygon[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  if(length>0&&Math.abs(dx*(p[1]-a[1])-dy*(p[0]-a[0]))<=1e-7*length&&p[0]>=Math.min(a[0],b[0])-1e-7&&p[0]<=Math.max(a[0],b[0])+1e-7&&p[1]>=Math.min(a[1],b[1])-1e-7&&p[1]<=Math.max(a[1],b[1])+1e-7)return true;
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;
}
export function pickInteractionTarget(targets,p,viewport){
 if(!Array.isArray(targets)||!point(p))return null;
 if(viewport&&(![viewport.width,viewport.height].every(v=>finite(v)&&v>0)||p[0]<0||p[1]<0||p[0]>=viewport.width||p[1]>=viewport.height))return null;
 const candidates=[],counts=new Map();
 for(const input of targets){try{const t=createInteractionTarget(input);candidates.push(t);counts.set(t.id,(counts.get(t.id)??0)+1);}catch{}}
 let best=null;for(const t of candidates){if(counts.get(t.id)!==1||!t.visible||!t.enabled||t.removed||!containsTargetPoint(t.hitArea,p))continue;
  if(!best||t.depth>best.depth||(t.depth===best.depth&&t.id<best.id))best=t;
 }return best;
}
export function canvasTargetPointer(event,canvas,playHeight=720){
 if(!event||!canvas||typeof canvas.getBoundingClientRect!=='function')return null;
 const r=canvas.getBoundingClientRect();if(![event.clientX,event.clientY,r.left,r.top,r.width,r.height,canvas.width,canvas.height,playHeight].every(finite)||r.width<=0||r.height<=0||canvas.width<=0||canvas.height<=0||playHeight<=0)return null;
 const p=[(event.clientX-r.left)*canvas.width/r.width,(event.clientY-r.top)*canvas.height/r.height];
 return p[0]>=0&&p[0]<canvas.width&&p[1]>=0&&p[1]<Math.min(playHeight,canvas.height)?p:null;
}
export function createTargetSelection(){let selected=null;return Object.freeze({update(targets,p,viewport){selected=pickInteractionTarget(targets,p,viewport);return selected;},current:()=>selected,clear(){selected=null;}});}
