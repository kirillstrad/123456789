// Shared visual dressing. No collider, light, target or encounter mutation.
export function createWorldDressing(map,{targets=[],maxGroups=48}={}){
 const bounds=map?.bounds,parts=[],features=[];
 if(!bounds||!['minX','maxX','minY','maxY'].every(k=>Number.isFinite(bounds[k]))||bounds.minX>=bounds.maxX||bounds.minY>=bounds.maxY)return {parts,features};
 const rects=(map.rects??[]).filter(r=>['minX','maxX','minY','maxY'].every(k=>Number.isFinite(r[k]))),circles=(map.circles??[]).filter(c=>[c.x,c.y,c.r].every(Number.isFinite));
 const centres=targets.flatMap(t=>{const v=(t.parts??[]).flatMap(p=>p.v??[]).filter(p=>p.length===3&&p.every(Number.isFinite));return v.length?[{x:(Math.min(...v.map(p=>p[0]))+Math.max(...v.map(p=>p[0])))/2,y:(Math.min(...v.map(p=>p[1]))+Math.max(...v.map(p=>p[1])))/2}]:[];});
 const solid=(x,y)=>x<=bounds.minX||x>=bounds.maxX||y<=bounds.minY||y>=bounds.maxY||rects.some(r=>x>=r.minX&&x<=r.maxX&&y>=r.minY&&y<=r.maxY)||circles.some(c=>Math.hypot(x-c.x,y-c.y)<=c.r);
 const free=(x,y)=>[[0,0],[.3,0],[-.3,0],[0,.3],[0,-.3]].every(([a,b])=>!solid(x+a,y+b));
 const emit=(kind,v,c,w=1)=>parts.push({kind,v,c,w,hero:false,worldDressing:true,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length});
 function scatter(x,y,index){
  features.push({kind:'floor-remnants',x,y});
  for(let i=0;i<3;i++){const a=i*2.4+index*.17,X=x+Math.cos(a)*.13,Y=y+Math.sin(a)*.13,z=.008+i*.002;
   emit(0,[[X-.09,Y-.06,z],[X+.08,Y-.07,z],[X+.1,Y+.07,z],[X-.07,Y+.06,z]],[80+i*9,72+i*7,55+i*5]);
   emit(1,[[X-.05,Y,z+.001],[X+.05,Y,z+.001]],[38,36,31]);
  }
 }
 function relief(anchor,index){
  const {x,y,nx,ny}=anchor,height=nx+ny<0?.35:1,point=(u,z)=>[x-ny*u+nx*.02,y+nx*u+ny*.02,z*height];
  features.push({kind:index%2?'memorial-relief':'iron-wall-grille',x,y});
  emit(0,[point(-.32,.45),point(.32,.45),point(.32,1.55),point(0,1.8),point(-.32,1.55)],[68,67,61]);
  for(let i=0;i<4;i++)emit(1,[point(-.23,.68+i*.19),point(.23-(i%2)*.06,.68+i*.19)],[112,103,82],1.3);
  if(index%2)emit(1,[point(0,.6),point(0,1.55)],[143,126,88],2);
 }
 const used=new Set();let scanned=0;
 const limit=Math.min(64,Math.max(0,Math.floor(maxGroups)||0));
 for(let y=bounds.minY+.8;y<bounds.maxY-.8&&features.length<limit&&scanned<512;y+=2.35){
  for(let x=bounds.minX+.8;x<bounds.maxX-.8&&features.length<limit&&scanned<512;x+=2.3){
   scanned++;if(!free(x,y)||centres.some(p=>Math.hypot(p.x-x,p.y-y)<2.6))continue;
   let anchor=null;
   for(const r of rects){
    if(y>r.minY+.35&&y<r.maxY-.35){if(x<r.minX&&r.minX-x<1.4)anchor={x:r.minX,y,nx:-1,ny:0};else if(x>r.maxX&&x-r.maxX<1.4)anchor={x:r.maxX,y,nx:1,ny:0};}
    if(x>r.minX+.35&&x<r.maxX-.35){if(y<r.minY&&r.minY-y<1.4)anchor={x,y:r.minY,nx:0,ny:-1};else if(y>r.maxY&&y-r.maxY<1.4)anchor={x,y:r.maxY,nx:0,ny:1};}
    if(anchor)break;
   }
   const key=anchor?[anchor.x.toFixed(1),anchor.y.toFixed(1)].join(','):null;
   if(anchor&&!used.has(key)&&!centres.some(p=>Math.hypot(p.x-anchor.x,p.y-anchor.y)<2.6)){used.add(key);relief(anchor,features.length);}
   else scatter(x,y,features.length);
  }
 }
 return {parts,features};
}
