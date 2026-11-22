// LAST_SERVICE_WORLD_PASS3
// LAST_SERVICE_INTERIOR_PASS2
// Authored, deterministic room compositions. Solid furnishings publish matching footprints.
import {buildLastServiceInteriorPass2} from './last-service-interior-pass2.js';
import {buildLastServiceWorldDensity} from './last-service-world-density.js';
const STONE=[76,72,65],TRIM=[115,105,86],IRON=[52,53,53],WOOD=[62,45,39],CLOTH=[79,27,31];
export function buildLastServiceDressing(kind='wing'){
 if(!['wing','chapel','keeper'].includes(kind))throw Error('Unknown Last Service dressing');
 const parts=[],rects=[],lights=[],features=[];
 const part=(type,v,c,w=1,extra={})=>parts.push({kind:type,v,c,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length+(extra.floor?-999900:0),...extra});
 const line=(v,c=TRIM,w=1,extra={})=>part(1,v,c,w,extra);
 const face=(v,c,extra={})=>part(0,v,c,1,extra);
 function box(x,y,z,w,d,h,c=STONE,solid=false){
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [indices,gain]of [[[0,1,5,4],.65],[[1,2,6,5],.48],[[2,3,7,6],.8],[[3,0,4,7],.57],[[4,5,6,7],1.1]])face(indices.map(i=>p[i]),c.map(n=>Math.round(n*gain)),{occluder:h>1});
  if(solid)rects.push({minX:x,maxX:x+w,minY:y,maxY:y+d});
 }
 function arch(x,y,half=1.65,height=2.4){
  features.push({type:'pointed-arch',x,y});
  for(const side of [-1,1]){
   box(x+side*half-.11,y-.13,0,.22,.26,height,STONE);
   box(x+side*half-.21,y-.21,0,.42,.42,.18,TRIM);
   const v=[];for(let i=0;i<=12;i++){const t=i/12;v.push([x+side*half*(1-t),y,height+1.15*Math.sin(t*Math.PI/2)]);}
   line(v,TRIM,4,{occluder:true});line(v.map(p=>[p[0],p[1]+.14,p[2]-.08]),IRON,2,{occluder:true});
  }
 }
 function niche(x,y,side){
  features.push({type:'burial-niche',x,y});
  face([[x,y-.65,.35],[x,y+.65,.35],[x,y+.65,1.65],[x,y,2.1],[x,y-.65,1.65]],[20,22,24]);
  line([[x+side*.02,y-.65,.35],[x+side*.02,y-.65,1.65],[x+side*.02,y,2.1],[x+side*.02,y+.65,1.65],[x+side*.02,y+.65,.35]],TRIM,3);
  box(Math.min(x,x+side*.18),y-.72,.22,.18,1.44,.15,STONE);
  for(let i=0;i<3;i++)line([[x+side*.04,y-.32,1.35-i*.14],[x+side*.04,y+.32-(i%2)*.16,1.35-i*.14]],[97,89,72],1);
  for(const d of [-.26,.26])box(Math.min(x,x+side*.1),y+d-.06,.4,.1,.12,.09,[127,115,89]);
 }
 function coffin(x,y){
  features.push({type:'sarcophagus',x,y});
  box(x-.46,y-1,0,.92,2,.12,STONE,true);box(x-.4,y-.93,.12,.8,1.86,.48,STONE);
  box(x-.45,y-.98,.6,.9,1.96,.12,TRIM);line([[x,y-.55,.73],[x,y+.55,.73]],IRON,3);line([[x-.22,y-.1,.73],[x+.22,y-.1,.73]],IRON,3);
 }
 function bench(x,y,w=1.8){
  features.push({type:'bench',x,y});
  box(x-w/2,y-.28,.43,w,.56,.12,WOOD,true);
  for(const dx of [-w/2+.1,w/2-.2])box(x+dx,y-.2,0,.1,.4,.43,WOOD);
  box(x-w/2,y+.2,.55,w,.08,.5,WOOD);
 }
 function shelf(x,y){
  features.push({type:'archive',x,y});box(x-.3,y-.8,0,.6,1.6,1.85,WOOD,true);
  for(const z of [.18,.7,1.22,1.75]){
   box(x-.33,y-.84,z,.66,1.68,.07,TRIM);
   if(z<1.7)for(let i=0;i<8;i++)box(x+.23,y-.7+i*.17,z+.07,.1,.11,.28+(i%3)*.04,i%2?CLOTH:[104,87,59]);
  }
 }
 function table(x,y,altar=false){
  features.push({type:altar?'altar':'writing-table',x,y});const w=altar?2.1:1.7;
  box(x-w/2,y-.44,.82,w,.88,.15,altar?STONE:WOOD,true);
  for(const dx of [-w/2+.12,w/2-.24])box(x+dx,y-.32,0,.12,.64,.82,altar?STONE:WOOD);
  face([[x-.5,y-.32,.98],[x+.5,y-.32,.98],[x+.5,y+.3,.98],[x-.5,y+.3,.98]],[139,121,88]);
  line([[x,y-.25,.99],[x,y+.24,.99]],IRON,1);
  if(altar){box(x-.18,y+.15,.98,.36,.25,.2,IRON);line([[x,y+.3,1.2],[x,y+.3,2.05]],TRIM,4);line([[x-.24,y+.3,1.75],[x+.24,y+.3,1.75]],TRIM,3);}
 }
 function candle(x,y,z=0,count=3){
  features.push({type:'votive-candles',x,y});
  for(let i=0;i<count;i++){
   const X=x+(i-(count-1)/2)*.12,h=.2+(i%3)*.11;
   box(X-.026,y-.026,z,.052,.052,h,[161,138,94]);
   line([[X,y,z+h],[X,y,z+h+.1]],[255,208,120],2);
   part(2,[[X,y,z+h+.06]],[255,235,187],1,{r:1.7});
  }
  lights.push({x,y,z:z+.4,r:55,power:.2,fireWarmth:1});
 }
 function rug(x,y,w,d){
  features.push({type:'processional-cloth',x,y});face([[x-w/2,y-d/2,.012],[x+w/2,y-d/2,.012],[x+w/2,y+d/2,.012],[x-w/2,y+d/2,.012]],CLOTH,{floor:true});
  for(const side of [-1,1])line([[x+side*(w/2-.08),y-d/2,.014],[x+side*(w/2-.08),y+d/2,.014]],[121,93,62],1,{floor:true});
 }
 function floorSeal(x,y,r=.9){
  const ring=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;ring.push([x+Math.cos(a)*r,y+Math.sin(a)*r,.016]);}
  line(ring,[124,101,65],1,{floor:true});line([[x-r*.65,y,.018],[x+r*.65,y,.018]],[116,100,76],1,{floor:true});line([[x,y-r*.65,.018],[x,y+r*.65,.018]],[116,100,76],1,{floor:true});
 }
 function standards(y){
  for(const x of [2.55,13.45]){
   line([[x,y,1.7],[x,y,2.8]],IRON,2,{occluder:true});
   face([[x-.22,y,2.65],[x+.22,y,2.65],[x+.2,y,1.65],[x,y,1.45],[x-.2,y,1.65]],CLOTH,{occluder:true});
   line([[x,y-.015,2.4],[x,y-.015,1.85]],TRIM,2,{occluder:true});
  }
 }
 if(kind==='wing'){
  for(const y of [11.5,1,-10,-22,-33,-41])arch(8,y);
  // Low approach-side architecture and high far-side niches leave the player readable.
  for(const y of [16.8,7.4,3.3,-3.5,-8,-13,-18.5,-26.5,-30.5,-35.5,-38,-44,-48])niche(2.1,y,1);
  for(const y of [16,6,-5.3,-16,-25.5,-36,-45.5]){niche(13.85,y,-1);standards(y);}
  rug(8,16,2.3,4.5);floorSeal(8,18.4,.75);
  bench(11.5,15.5);candle(11.5,15.5,.58,5);
  bench(11.4,7.4);table(11.4,3.2);shelf(3.05,3.1);
  for(const y of [-4.4,-16.5,-29.5,-36.5,-45.5])coffin(3.1,y);
  for(const y of [-6,-18,-28,-38,-47])candle(12.8,y,.1,4);
  floorSeal(8,-7,.8);floorSeal(8,-20,.65);
  shelf(12.75,-24.5);table(11.3,-29.3);rug(8,-25,2.1,3.7);
  bench(11.3,-36.6);table(20.3,-26.5);coffin(20.5,-33.6);candle(20.5,-33.6,.75,4);
  for(const y of [-25,-30,-35.8])niche(21.8,y,-1);
  rug(8,-46.1,2,6.6);standards(-49.3);floorSeal(8,-49.4,.65);
 }else if(kind==='chapel'){
  arch(8,14.625,1.65,2.75);arch(8,3.05,2.4,2.7);
  table(8,3.7,true);rug(8,10,1.8,6.5);
  for(const y of [5.2,9,12]){niche(2.52,y,1);niche(13.48,y,-1);}
  for(const x of [4.6,11.4]){bench(x,12.6,1.5);candle(x,4.5,.25,5);}
  floorSeal(8,7,1.4);standards(4.1);
 }else{
  shelf(3.05,4.5);shelf(3.05,7.5);shelf(12.75,4.5);shelf(12.75,7.5);
  table(11.25,10.3);bench(11.25,11.3);coffin(3.1,11.5);
  rug(8,8.5,2.2,6);arch(8,3,2.5,2.3);
  for(const x of [5.3,10.7])candle(x,6.8,.1,5);floorSeal(8,7,.8);
 }
 const extra=buildLastServiceInteriorPass2(kind);parts.push(...extra.parts);rects.push(...extra.rects);lights.push(...extra.lights);features.push(...extra.features);
 const dense=buildLastServiceWorldDensity(kind);parts.push(...dense.parts);rects.push(...dense.rects);lights.push(...dense.lights);features.push(...dense.features);
 return {parts,rects,lights,features};
}
export function dressingEnvironment(env,dressing){
 return {get parts(){return[...(env.parts??[]),...dressing.parts];},get lights(){return[...(env.lights??[]),...dressing.lights];},setView(...args){env.setView?.(...args);},step(dt){env.step?.(dt);}};
}
export function dressLastServiceScene(scene,kind){
 const map=scene.doorScene?.map??scene.map;
 if(!Array.isArray(map?.rects))throw Error('Dressed scene requires a mutable collision map');
 const dressing=buildLastServiceDressing(kind);map.rects.push(...dressing.rects);
 return {...scene,env:dressingEnvironment(scene.env,dressing)};
}
