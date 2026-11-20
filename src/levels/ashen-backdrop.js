import {createInteriorGeometry} from '../interior/geometry.js';
export function buildAshenBackdrop(walkable){
 const parts=[],records=[];
 const add=(id,x,y,z,w,d,h,band=0)=>{
  // Decorative background only. Reject any occupied footprint on playable floor.
  for(let yy=y;yy<=y+d;yy+=.25)for(let xx=x;xx<=x+w;xx+=.25)if(walkable(xx,yy))return;
  const g=createInteriorGeometry(),level=[33,23,13][band],c=[level*.86,level*.94,level];
  g.box(x,y,z,w,d,h,c);
  for(const p of g.finish().parts){p.c=p.c.map(n=>Math.min(level,n));p.d=-20000+band*.01;p.backdrop=true;p.depthBand=band;p.backgroundId=id;parts.push(p);}
  records.push({id,x,y,z,w,d,h,band});
 };
 for(const [i,x]of [15.8,19.7,23.6].entries()){
  add('north-buttress-'+i,x,5.3,-1,.65,1.1,5.2,0);
  add('north-capital-'+i,x-.22,5.3,3.9,1.1,1.1,.3,0);
  add('north-distance-'+i,x+1,2.8,-1,.45,.7,5.8,1);
  add('north-far-'+i,x+1.9,-1.5,0,.65,.7,7.1,2);
 }
 // Broken cross-members are short and staggered, never a continuous walkable bridge.
 add('broken-arch-left',16.4,5.6,3.9,1.4,.3,.25,0);
 add('broken-arch-right',21.5,5.6,4.3,1.2,.3,.25,0);
 for(const [i,x]of [31.3,33.6,35.8].entries()){
  add('apse-pier-'+i,x,.55,-1,.55,.6,7,0);
  add('apse-far-'+i,x-.2,-2.1,-.5,.7,.6,8.5,2);
 }
 add('apse-lintel-left',31.3,.6,5.1,1.15,.35,.3,1);
 add('apse-lintel-right',35,.6,5.1,1.35,.35,.3,1);
 for(const [i,y]of [23,26,29].entries()){
  add('crypt-descending-pier-'+i,38.1,y,-5.5,.7,.7,5.05,0);
  add('crypt-foundation-'+i,37.25,y,-1.1,.8,.85,.4,0);
  add('crypt-lower-arch-'+i,40.3,y-.2,-6,.55,.55,4.1,1);
  add('crypt-distance-'+i,43.2,y+.5,-7,.65,.65,3.5,2);
 }
 // Fragmented masonry beyond the burial wing, not another playable room.
 add('burial-neighbour-wall',26.2,29.1,-.3,.25,1.5,2.6,0);
 add('burial-neighbour-pier',27.2,30.2,-.3,.45,.5,3.1,1);
 return {parts,records,colliders:[],targets:[],lights:[]};
}
