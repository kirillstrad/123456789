export function createInteriorGeometry({x=0,y=0,z=0,yaw=0}={}){
 if(![x,y,z,yaw].every(Number.isFinite))throw Error('Invalid interior transform');
 const parts=[],colliders=[],lights=[],angle=yaw*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle);
 const transform=p=>[x+p[0]*co-p[1]*si,y+p[0]*si+p[1]*co,z+p[2]];
 const shade=(c,k)=>c.map(v=>Math.max(0,Math.min(255,v*k)));
 const emit=(kind,vertices,c,w=1)=>{
  if(!Array.isArray(vertices)||vertices.length<(kind===0?3:2)||!vertices.every(p=>p.length===3&&p.every(Number.isFinite))||!c.every(Number.isFinite))throw Error('Invalid interior geometry');
  const v=vertices.map(transform),d=v.reduce((sum,p)=>sum+p[0]+p[1]+p[2]*.006,0)/v.length+(kind===1?.005:0);
  parts.push({kind,v,c:shade(c,1),w,hero:false,d});
 };
 const poly=(v,c)=>emit(0,v,c),line=(v,c,w=1.8)=>emit(1,v,c,w);
 const box=(x,y,z,w,d,h,c)=>{
  if(![x,y,z,w,d,h].every(Number.isFinite)||w<=0||d<=0||h<=0)throw Error('Invalid interior box');
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((f,i)=>poly(f.map(j=>p[j]),shade(c,[.6,.45,.72,.55,1.08][i])));
 };
 const oval=(x,y,z,rx,ry,c,n=12)=>poly(Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*rx,y+Math.sin(i/n*Math.PI*2)*ry,z]),c);
 const mound=(x,y,z,rx,ry,h,c,n=10)=>{
  const p=Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*rx,y+Math.sin(i/n*Math.PI*2)*ry,z]);
  for(let i=0;i<n;i++)poly([p[i],p[(i+1)%n],[x-rx*.12,y,h+z]],shade(c,.65+.35*(i/n)));
 };
 const collision=(w,d,h)=>{colliders.push({kind:'polygon',points:[[-w/2,-d/2,0],[w/2,-d/2,0],[w/2,d/2,0],[-w/2,d/2,0]].map(transform).map(p=>p.slice(0,2)),minZ:z,maxZ:z+h});};
 const light=(lx,ly,lz,r,power)=>{const p=transform([lx,ly,lz]);lights.push({x:p[0],y:p[1],z:p[2],r,power});};
 const finish=()=>{
  const p=parts.flatMap(p=>p.v);if(!p.length)throw Error('Empty interior mesh');
  const axis=(k,fn)=>p.reduce((a,v)=>fn(a,v[k]),fn===Math.min?Infinity:-Infinity);
  return {parts,colliders,lights,bounds:{minX:axis(0,Math.min),maxX:axis(0,Math.max),minY:axis(1,Math.min),maxY:axis(1,Math.max),minZ:axis(2,Math.min),maxZ:axis(2,Math.max)},geometryStatus:'native-candidate',visualAcceptance:'pending'};
 };
 return {poly,line,box,oval,mound,collision,shade,light,finish};
}
