const EPS=1e-9;
const point=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const polygon=p=>Array.isArray(p)&&p.length>=3&&p.every(point);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function segmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],n=dx*dx+dy*dy,t=n?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/n)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(segmentDistance(p,a,b)<EPS)return true;if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function intersects(a,b,c,d){
 const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);
 if(ab1*ab2<0&&cd1*cd2<0)return true;
 return segmentDistance(a,c,d)<EPS||segmentDistance(b,c,d)<EPS||segmentDistance(c,a,b)<EPS||segmentDistance(d,a,b)<EPS;
}
function distance(poly,obstacle){
 if(obstacle.kind==='circle'){const p=obstacle.center;if(inside(p,poly))return 0;return Math.min(...poly.map((a,i)=>segmentDistance(p,a,poly[(i+1)%poly.length])))-obstacle.radius;}
 const other=obstacle.points;if(inside(poly[0],other)||inside(other[0],poly))return 0;let result=Infinity;
 for(let i=0;i<poly.length;i++)for(let j=0;j<other.length;j++){const a=poly[i],b=poly[(i+1)%poly.length],c=other[j],d=other[(j+1)%other.length];if(intersects(a,b,c,d))return 0;result=Math.min(result,segmentDistance(a,c,d),segmentDistance(b,c,d),segmentDistance(c,a,b),segmentDistance(d,a,b));}
 return result;
}
// Angles are radians. Each leaf follows a linear angular/vertical segment.
// Inflating samples by the maximum between-sample displacement is conservative:
// clear=true covers the whole segment, not just the sampled poses.
export function checkDoorSweep({leaves,obstacles,maxStep=.025,maxSamples=2048}={}){
 if(!Array.isArray(leaves)||!leaves.length||!Array.isArray(obstacles)||!Number.isFinite(maxStep)||maxStep<=0||maxStep>.1||!Number.isSafeInteger(maxSamples)||maxSamples<2||maxSamples>16384)throw Error('Invalid door sweep request');
 for(const o of obstacles){if(!o||!Number.isFinite(o.minZ)||!Number.isFinite(o.maxZ)||o.maxZ<=o.minZ||(o.kind==='circle'?(!point(o.center)||!Number.isFinite(o.radius)||o.radius<0):(o.kind!=='polygon'||!polygon(o.points))))throw Error('Invalid door obstacle');}
 let samples=0;
 for(let index=0;index<leaves.length;index++){
  const l=leaves[index];if(!l||!polygon(l.points)||!point(l.hinge)||![l.fromAngle,l.toAngle,l.fromLift,l.toLift,l.minZ,l.maxZ].every(Number.isFinite)||l.maxZ<=l.minZ)throw Error('Invalid swept leaf');
  const radius=Math.max(...l.points.map(p=>Math.hypot(p[0]-l.hinge[0],p[1]-l.hinge[1]))),angle=l.toAngle-l.fromAngle,lift=l.toLift-l.fromLift;
  const travel=radius*Math.abs(angle),steps=Math.max(1,Math.ceil(Math.max(travel,Math.abs(lift))/maxStep));
  if(!Number.isSafeInteger(steps)||samples+steps+1>maxSamples)return{clear:false,reason:'budget-exceeded',leaf:index,samples};
  const xyPad=travel/(2*steps)+EPS,zPad=Math.abs(lift)/(2*steps)+EPS;
  for(let i=0;i<=steps;i++){
   samples++;const t=i/steps,a=l.fromAngle+angle*t,c=Math.cos(a),s=Math.sin(a),z=l.fromLift+lift*t;
   const pose=l.points.map(p=>{const x=p[0]-l.hinge[0],y=p[1]-l.hinge[1];return[l.hinge[0]+x*c-y*s,l.hinge[1]+x*s+y*c];});
   for(let j=0;j<obstacles.length;j++){const o=obstacles[j];if(l.maxZ+z+zPad<o.minZ||l.minZ+z-zPad>o.maxZ)continue;if(distance(pose,o)<=xyPad)return{clear:false,reason:'occupied-sweep',leaf:index,obstacle:j,sample:i,samples};}
  }
 }
 return{clear:true,reason:'clear',samples};
}
