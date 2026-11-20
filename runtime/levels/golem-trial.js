import {golemArenaMap,GOLEM_BOUNDS} from '../game/golem-arena.js';
import {candleFixture,overheadOpacity} from '../render/candle-field.js';
export function createGolemTrialScene(){
 const map=golemArenaMap();let actor=null,project=null;
 const fixtures=[candleFixture({id:'trial.single',x:4.1,y:15.8,count:1}),candleFixture({id:'trial.cluster-a',x:3.2,y:5,count:6}),candleFixture({id:'trial.cluster-b',x:12.8,y:10.8,count:6}),candleFixture({id:'trial.cluster-c',x:12.8,y:4.5,count:4}),candleFixture({id:'trial.chandelier-a',x:7.5,y:6,z:3.65,count:8,hanging:true}),candleFixture({id:'trial.chandelier-b',x:8.5,y:11,z:3.65,count:8,hanging:true})];
 const part=(kind,v,c,w=1,extra={})=>({kind,v,c,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length,...extra});
 const floors=[];
 for(let x=2.4;x<13.6-1e-6;x+=.7)for(let y=2.4;y<19.6-1e-6;y+=.7){
  const X=Math.min(13.6,x+.7),Y=Math.min(19.6,y+.7),tone=45+((Math.round(x*10)+Math.round(y*10))%3)*4;
  floors.push(part(0,[[x,y,0],[X,y,0],[X,Y,0],[x,Y,0]],[tone,tone-2,tone-5],1,{d:-1000000+x+y,floor:true}));
  floors.push(part(1,[[x,y,.004],[X,y,.004],[X,Y,.004]],[66,62,54],.65,{d:-999999+x+y,floor:true}));
 }
 function art(){
  const parts=[...floors];
  for(const r of map.rects){
   if(r.golemGate){for(let x=6.85;x<9.2;x+=.18)parts.push(part(1,[[x,14.625,.04],[x,14.625,2.8]],[113,108,96],3));for(const z of [.5,1.5,2.6])parts.push(part(1,[[6.8,14.625,z],[9.2,14.625,z]],[102,96,83],4));continue;}
   const near=r.minX>=13.59||r.minY>=19.59,h=near?.48:2.65;
   const edges=[[[r.minX,r.minY],[r.maxX,r.minY]],[[r.maxX,r.minY],[r.maxX,r.maxY]],[[r.maxX,r.maxY],[r.minX,r.maxY]],[[r.minX,r.maxY],[r.minX,r.minY]]];
   for(const [a,b]of edges){
    const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.45));
    for(let i=0;i<n;i++){
     const A=[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,0],B=[a[0]+(b[0]-a[0])*(i+1)/n,a[1]+(b[1]-a[1])*(i+1)/n,0],up=p=>[p[0],p[1],h];
     parts.push(part(0,[A,B,up(B),up(A)],[72,69,62],1,{wall:true}));parts.push(part(1,[up(A),up(B)],[109,102,87],1,{wall:true}));
    }
   }
  }
  for(const fixture of fixtures){const overhead=fixture.parts[0]?.overhead,alpha=overhead?overheadOpacity(fixture.parts,actor,project):1;for(const p of fixture.parts)parts.push(overhead?{...p,alpha}:p);}
  return parts;
 }
 const doorScene={map,targets:[],parts:[],lightDefinitions:[],interior:null,setActors(){},getTarget:()=>null,getBounds:()=>({...GOLEM_BOUNDS}),getColliders:()=>[],revision:()=>map.golemRevision??0,step(){},reset(){},highlight(){},snapshot:()=>({doors:[],golem:true})};
 const env={targets:[],lights:fixtures.flatMap(f=>f.lights),setView(s,p){actor=s;project=p;},get parts(){return art();},step(){}};
 return {doorScene,env};
}
