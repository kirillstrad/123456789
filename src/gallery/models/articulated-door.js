import {buildDoorGeometry} from './door-geometry.js';
import {doorProfile,doorProgress} from '../../animation/door-motion.js';
function cut(v,side){const out=[];for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length],ia=a[0]*side>=-1e-10,ib=b[0]*side>=-1e-10;if(ia)out.push(a);if(ia!==ib){const t=-a[0]/(b[0]-a[0]);out.push(a.map((x,j)=>x+t*(b[j]-x)));}}return out.filter((p,i)=>!i||Math.hypot(...p.map((x,j)=>x-out[i-1][j]))>1e-9);}
export function doorAssembly(modelId,transform={}){
 const profile=doorProfile(modelId),closed=buildDoorGeometry({modelId}),yaw=(transform.yaw??0)*Math.PI/180,x=transform.x??0,y=transform.y??0;
 if(![yaw,x,y].every(Number.isFinite))throw Error('Invalid door placement');
 const world=p=>[x+p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),y+p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw),p[2]];
 const defs=profile.motion==='double'?[-1,1].map(wing=>({wing,hinge:wing*1.1,points:cut(closed.leafColliders[0].points.map(p=>[...p,0]),wing)})):[{wing:-1,hinge:-.8,points:closed.leafColliders[0].points.map(p=>[...p,0])}];
 function parameters(progress,side){if(![1,-1].includes(side)||!Number.isFinite(progress)||progress<0||progress>1)throw Error('Invalid door articulation');const p=doorProgress(modelId,progress);return defs.map(d=>({...d,angle:profile.motion==='lift'?0:d.wing*side*p*Math.PI/2,lift:profile.motion==='lift'?2.85*p:0}));}
 const move=(p,d)=>{const u=p[0]-d.hinge,v=p[1],c=Math.cos(d.angle),s=Math.sin(d.angle);return world([d.hinge+u*c-v*s,u*s+v*c,p[2]+d.lift]);};
 const asPart=(p,v)=>{const d=v.reduce((n,q)=>n+q[0]+q[1]+q[2]*.006,0)/v.length+(p.kind===1?.005:p.kind===2?.01:0);return{...p,v,d};};
 const frames=closed.frameParts.map(p=>asPart(p,p.v.map(world))),frameColliders=closed.frameColliders.map(b=>({...b,points:b.points.map(p=>world([...p,0]).slice(0,2))}));
 function mesh(progress=0,side=1){
  const ps=parameters(progress,side),parts=[];
  for(const p of closed.leafParts){
   if(profile.motion!=='double'){parts.push(asPart(p,p.v.map(v=>move(v,ps[0]))));continue;}
   for(const d of ps){const v=p.kind===2?(p.v[0][0]*d.wing>=0?p.v:[]):cut(p.v,d.wing);if(v.length>=(p.kind===0?3:p.kind===1?2:1))parts.push(asPart(p,v.map(v=>move(v,d))));}
  }
  const b=closed.leafColliders[0],leaves=ps.map(d=>({...b,points:d.points.map(p=>move(p,d).slice(0,2)),minZ:b.minZ+d.lift,maxZ:b.maxZ+d.lift}));
  return{parts:[...frames,...parts],frameParts:frames,leafParts:parts,frameColliders,leafColliders:leaves};
 }
 function sweep(from,to,side){const a=parameters(from,side),b=parameters(to,side),c=closed.leafColliders[0];return a.map((d,i)=>({points:d.points.map(p=>world(p).slice(0,2)),hinge:world([d.hinge,0,0]).slice(0,2),fromAngle:d.angle,toAngle:b[i].angle,fromLift:d.lift,toLift:b[i].lift,minZ:c.minZ,maxZ:c.maxZ}));}
 function contacts(progress,side){const ps=parameters(progress,side);return profile.motion==='double'?ps.map(d=>move([d.wing*.4,0,1.2],d)):profile.motion==='lift'?[-.4,.4].map(u=>move([u,0,1.35],ps[0])):[move([.55,0,1.15],ps[0])];}
 return Object.freeze({profile,world,mesh,sweep,contacts});
}
