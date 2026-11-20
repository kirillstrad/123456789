import {golemArenaMap,GOLEM_BOUNDS} from '../game/golem-arena.js';
export function createGolemTrialScene(){
 const map=golemArenaMap();
 const part=(kind,v,c,w=1)=>({kind,v,c,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length});
 function art(){
  const parts=[part(0,[[2.4,2.4,0],[13.6,2.4,0],[13.6,19.6,0],[2.4,19.6,0]],[51,48,44])];
  for(let y=3;y<20;y++)parts.push(part(1,[[2.4,y,.006],[13.6,y,.006]],[67,61,52]));
  for(let x=3;x<14;x++)parts.push(part(1,[[x,2.4,.006],[x,19.6,.006]],[61,57,51]));
  for(const r of map.rects){
   if(r.golemGate){for(let x=6.85;x<9.2;x+=.18)parts.push(part(1,[[x,14.625,.04],[x,14.625,2.8]],[116,105,88],4));
    for(const z of [.5,1.5,2.6])parts.push(part(1,[[6.8,14.625,z],[9.2,14.625,z]],[106,95,79],5));continue;}
   const a=[r.minX,r.minY,0],b=[r.maxX,r.minY,0],c=[r.maxX,r.maxY,0],d=[r.minX,r.maxY,0],up=p=>[p[0],p[1],2.65];
   for(const [p,q]of [[a,b],[b,c],[c,d],[d,a]])parts.push(part(0,[p,q,up(q),up(p)],[73,67,58]));
   parts.push(part(0,[up(a),up(b),up(c),up(d)],[106,96,80]));
  }
  return parts;
 }
 const doorScene={map,targets:[],parts:[],lightDefinitions:[],interior:null,setActors(){},getTarget:()=>null,getBounds:()=>({...GOLEM_BOUNDS}),getColliders:()=>[],revision:()=>map.golemRevision??0,step(){},reset(){},highlight(){},snapshot:()=>({doors:[],golem:true})};
 const env={targets:[],lights:[{x:5,y:5,z:2,r:100,power:.3,fireWarmth:1},{x:11,y:11,z:2,r:100,power:.3,fireWarmth:1}],get parts(){return art();},step(){}};
 return {doorScene,env};
}
