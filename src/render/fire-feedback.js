import {createInteractionStamp} from './interaction-stamp.js';
import {FIRE_RULES,ignitionMethod,unlitFireHint} from '../interaction/fire-rules.js';
const finitePoint=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
const depth=(v,kind)=>v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length+(kind===2?.01:.005);
export function sparkFlashProfile(cone){const age=cone&&Number.isFinite(cone.maxLife)&&Number.isFinite(cone.life)?Math.max(0,cone.maxLife-cone.life):Infinity,fade=Math.max(0,1-age/FIRE_RULES.visibleConeDuration);return{fade,gain:FIRE_RULES.visibleConeGain*fade*fade,range:2,particleRadius:8,particlePower:.012*fade};}
export function createFireHintParts({sources=[],hover=null,time=0,project,lamp={point:null,radius:0,power:0},reducedMotion=false}={}){
 const parts=[];if(!Number.isFinite(time))time=0;
 const add=(id,kind,v,extra={})=>parts.push({kind,v,c:[243,161,59],alpha:.65,w:1.5,hero:false,d:depth(v,kind),fireHint:true,interactionVapor:true,sourceId:id,...extra});
 for(const source of sources){if(source.enabled===false||source.visible===false||!finitePoint(source.contactPoint))continue;const [x,y,z]=source.contactPoint,q=typeof project==='function'?project(x,y,z):null,illumination=q&&lamp.point&&lamp.radius>0?Math.exp(-((q[0]-lamp.point[0])**2+(q[1]-lamp.point[1])**2)/(2*lamp.radius**2))*lamp.power:0,style=unlitFireHint({status:source.status,illumination});if(!style)continue;
  let hash=0;for(const c of source.id)hash=(hash*31+c.charCodeAt(0))>>>0;const seed=(hash%997)/997,phase=((time*.5+seed)%1+1)%1,sway=reducedMotion?0:Math.sin(time*1.7+seed*6)*.025,lift=.12+(reducedMotion?0:Math.sin(time*2+seed*6)*.035);
  add(source.id,3,[[x+sway,y,z+lift]],{text:'*',size:10,alpha:style.alpha,effectKind:'fire-wisp'});
  add(source.id,1,[[x-.03,y,z+.02],[x+.03,y,z+.02]],{alpha:Math.min(1,style.alpha+.15),effectKind:'wick-accent'});
  if(!reducedMotion&&phase<.12){const t=phase/.12,r=.035+.13*t,v=Array.from({length:13},(_,i)=>[x+Math.cos(i*Math.PI/6)*r,y+Math.sin(i*Math.PI/6)*r,z+.045]);add(source.id,1,v,{alpha:.42*(1-t)*style.alpha,w:1,effectKind:'fire-pulse'});}
 }
 if(hover&&hover.availability==='ready'&&hover.enabled!==false&&hover.visible!==false&&!hover.removed){const method=hover.kind==='door'?'lantern':ignitionMethod(hover.modelId);let anchor=hover.contactPoint;
  if(!finitePoint(anchor)){const vertices=hover.parts?.flatMap(p=>p.v)??[];if(vertices.length)anchor=[vertices.reduce((n,p)=>n+p[0],0)/vertices.length,vertices.reduce((n,p)=>n+p[1],0)/vertices.length,Math.max(...vertices.map(p=>p[2]))];}
  if(method&&finitePoint(anchor)){const point=[anchor[0],anchor[1],anchor[2]+.38];if(method==='sparks')add(hover.id,3,[point],{text:'E',size:12,alpha:.95,actionLabel:true,effectKind:'action-label'});else parts.push(...createInteractionStamp(point,{sourceId:hover.id,project}));}
 }
 return parts;
}
export function createFireHintLayer(canvas){const ctx=canvas.getContext('2d');if(!ctx)throw Error('Fire hint canvas context unavailable');const clear=()=>{ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,canvas.width,canvas.height);};return Object.freeze({clear,resize(width,height){if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;},render(parts,draw){clear();let marked=false;for(const p of parts){if(p.fireHint){marked=true;ctx.globalCompositeOperation='source-over';draw(ctx,p);}else if(marked&&!p.interactionVapor){ctx.globalCompositeOperation='destination-out';draw(ctx,p);}}ctx.globalCompositeOperation='source-over';},composite(out){out.save();out.globalAlpha=1;out.globalCompositeOperation='source-over';out.drawImage(canvas,0,0);out.restore();}});}
