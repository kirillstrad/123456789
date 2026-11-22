// Small F seal made of world polygons; rendered by the normal game ASCII pass.
export function createInteractionStamp(anchor,{sourceId='',project}={}){
 if(!Array.isArray(anchor)||anchor.length!==3||!anchor.every(Number.isFinite))return [];
 const [x,y,z]=anchor,parts=[];let width=.45,height=.6;
 if(typeof project==='function'){
  const p=project(x,y,z),u=project(x+.707,y-.707,z),v=project(x,y,z+1);
  if([p,u,v].every(q=>Array.isArray(q)&&q.length>=2&&q.slice(0,2).every(Number.isFinite))){
   const a=Math.hypot(u[0]-p[0],u[1]-p[1]),b=Math.hypot(v[0]-p[0],v[1]-p[1]);
   if(a>1e-6)width=Math.min(1.2,Math.max(.01,32/a));if(b>1e-6)height=Math.min(1.2,Math.max(.01,34/b));
  }
 }
 const point=(u,h,d=0)=>[x+u*width*.707+d*.707,y-u*width*.707+d*.707,z+h*height];
 function slab(u,h,w,H,c,d=0){const v=[point(u,h,d),point(u+w,h,d),point(u+w,h+H,d),point(u,h+H,d)];parts.push({kind:0,v,c,alpha:.98,hero:false,interactionVapor:true,interactionStamp:true,sourceId,effectKind:'interaction-stamp',d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/4});}
 slab(-.5,0,1,1,[74,71,64]);slab(-.43,.06,.86,.88,[22,25,29],.003);
 for(const u of [-.5,.44])slab(u,0,.06,1,[168,150,110],.006);
 for(const h of [0,.94])slab(-.5,h,1,.06,[197,174,121],.006);
 slab(-.23,.18,.16,.65,[245,226,175],.012);slab(-.23,.68,.55,.15,[245,226,175],.012);slab(-.23,.43,.42,.14,[245,226,175],.012);
 const side=[point(.5,0),point(.5,0,-.04),point(.5,1,-.04),point(.5,1)];parts.push({kind:0,v:side,c:[39,40,39],alpha:.98,hero:false,interactionVapor:true,interactionStamp:true,sourceId,effectKind:'interaction-stamp',d:side.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/4});
 Object.assign(parts[0],{actionLabel:true,text:'F',effectKind:'action-label'});return parts;
}
