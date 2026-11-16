import {containsTargetPoint,canvasTargetPointer,pickInteractionTarget} from '../interaction/targeting.js';
function hitArea(part,p,project,zoom){
 if((part.alpha??1)<=0)return null;const v=part.v.map(q=>project(...q));
 if(part.kind===0)return containsTargetPoint(v,p)?v:null;
 let hit=false,r=0;
 if(part.kind===2){r=(part.r||0)*65/94*zoom;hit=r>0&&((p[0]-v[0][0])/r)**2+((p[1]-v[0][1])/(r*.85))**2<=1;}
 if(part.kind===1){r=(part.w||1)*zoom/2;for(let i=1;i<v.length;i++){const a=v[i-1],b=v[i],dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n)):0;if(Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<=r)hit=true;}}
 if(!hit)return null;const xs=v.map(q=>q[0]),ys=v.map(q=>q[1]),x=Math.min(...xs)-r,y=Math.min(...ys)-r,X=Math.max(...xs)+r,Y=Math.max(...ys)+r;return[[x,y],[X,y],[X,Y],[x,Y]];
}
export function pickFrameTarget({parts,targets,point,project,zoom=1,viewport}){
 if(!point||!targets.length||!Number.isFinite(zoom)||zoom<=0)return null;const owners=new Map(),ids=new Set(),duplicates=new Set();
 for(const t of targets){if(ids.has(t.id))duplicates.add(t.id);ids.add(t.id);for(const p of t.parts)owners.set(p,t);}
 for(let i=parts.length-1;i>=0;i--){const p=parts[i],area=hitArea(p,point,project,zoom);if(!area)continue;const t=owners.get(p);if(!t||duplicates.has(t.id))return null;return pickInteractionTarget([{...t,hitArea:area,depth:p.d}],point,viewport);}
 return null;
}
export function installFrameTargeting(canvas){
 let pointer=null,selected=null,disposed=false;const original=canvas.style.cursor,doc=canvas.ownerDocument,win=doc?.defaultView;
 const clear=()=>{pointer=null;selected=null;canvas.style.cursor=original;},move=e=>{pointer={clientX:e.clientX,clientY:e.clientY};},visibility=()=>{if(doc.hidden)clear();};
 canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',clear);win?.addEventListener('blur',clear);doc?.addEventListener('visibilitychange',visibility);
 return Object.freeze({clear,current:()=>selected,frame(frame){if(disposed)return null;if(!frame.active){clear();return null;}selected=pickFrameTarget({...frame,point:canvasTargetPointer(pointer,canvas),viewport:{width:canvas.width,height:720}});canvas.style.cursor=selected?'pointer':original;return selected;},dispose(){if(disposed)return;disposed=true;clear();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',clear);win?.removeEventListener('blur',clear);doc?.removeEventListener('visibilitychange',visibility);}});
}
