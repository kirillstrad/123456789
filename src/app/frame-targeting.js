import {createInteractionIntent} from '../interaction/intent.js';
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
export function installFrameTargeting(canvas,{canRequest=()=>false,resolve=()=>null,context=()=>''}={}){
 let pointer=null,selected=null,lastFrame=null,held=false,disposed=false;const pending=createInteractionIntent(),original=canvas.style.cursor,doc=canvas.ownerDocument,win=doc?.defaultView;
 const leave=()=>{pointer=null;selected=null;canvas.style.cursor=original;},clear=()=>{leave();lastFrame=null;held=false;pending.clear();},move=e=>{pointer={clientX:e.clientX,clientY:e.clientY};},visibility=()=>{if(doc.hidden)clear();};
 const reconcile=()=>{const i=pending.current();return i?pending.reconcile(resolve(i.targetId),context(),canRequest()):null;};
 const pick=()=>lastFrame?pickFrameTarget({...lastFrame,point:canvasTargetPointer(pointer,canvas),viewport:{width:canvas.width,height:720}}):null;
 function keydown(e){
  if(e.code!=='KeyF'||e.repeat||held||e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.target?.isContentEditable||e.target?.closest?.('input,select,textarea,button,[contenteditable]'))return;
  held=true;reconcile();if(disposed||!lastFrame?.active||!canRequest()||pending.current())return;
  selected=pick();if(!selected)return;const live=resolve(selected.id),drawn=lastFrame.targets.find(t=>t.id===selected.id);
  if(!live||live.parts!==drawn?.parts)return;if(pending.request(live,context()))e.preventDefault();
 }
 const keyup=e=>{if(e.code==='KeyF')held=false;};
 canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);win?.addEventListener('blur',clear);doc?.addEventListener('visibilitychange',visibility);win?.addEventListener('keydown',keydown);win?.addEventListener('keyup',keyup);
 return Object.freeze({clear,current:()=>selected,intent:reconcile,frame(frame){if(disposed)return null;if(!frame.active){clear();return null;}lastFrame=frame;reconcile();selected=pick();canvas.style.cursor=selected?'pointer':original;return selected;},dispose(){if(disposed)return;disposed=true;clear();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);win?.removeEventListener('blur',clear);doc?.removeEventListener('visibilitychange',visibility);win?.removeEventListener('keydown',keydown);win?.removeEventListener('keyup',keyup);}});
}
