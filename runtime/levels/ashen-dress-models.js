import {createInteriorGeometry} from '../interior/geometry.js';
import {VISUAL_MATERIALS as M} from './ashen-visual-data.js';
export const DRESSING_FOOTPRINTS=Object.freeze({wardrobe:[.7,1.2,1.8],desk:[1.4,.7,.86],crate:[.9,.8,.75],bench:[2.4,.65,.65],shelf:[1.4,.6,1.9],sideboard:[2.2,.65,.85],lectern:[.7,.6,1],coffin:[.65,2.1,.7],memorial:[1.7,.4,1.55]});
export function buildAshenDressModel(p){
 const g=createInteriorGeometry(p),{type}=p;
 const book=(x,y,z,w=.13,h=.23,c=M.cloth)=>{g.box(x,y,z,w,.22,h,c);g.line([[x+.025,y-.004,z+.02],[x+.025,y-.004,z+h-.02]],M.paper,1.2);};
 const cup=(x,y,z)=>{g.mound(x,y,z,.12,.12,.18,M.iron);g.oval(x,y,z+.18,.075,.075,M.dark);};
 const cloth=(x,y,z,w,d)=>{for(let i=0;i<5;i++)g.poly([[x,y+d*i/5,z],[x+w,y+d*i/5,z+(i%2)*.05],[x+w-.04,y+d*(i+1)/5,z],[x+.03,y+d*(i+1)/5,z+.02]],g.shade(M.cloth,i%2?.75:1));};
 const legs=(w,d,h)=>{for(const x of[-w/2+.04,w/2-.12])for(const y of[-d/2+.04,d/2-.12])g.box(x,y,0,.08,.08,h,M.wood);};
 if(type==='wardrobe'||type==='shelf'){
  const [w,d,h]=DRESSING_FOOTPRINTS[type];g.box(-w/2,d/2-.06,0,w,.06,h,M.wood);for(const x of[-w/2,w/2-.07])g.box(x,-d/2,0,.07,d,h,M.wood);
  for(const z of[.08,.65,1.25,h-.08])g.box(-w/2,-d/2,z,w,d,.07,M.wood);
  if(type==='wardrobe'){
   for(let i=0;i<4;i++)g.poly([[-w*.35+i*w*.18,-d*.25,1.7],[-w*.23+i*w*.18,-d*.25,1.7],[-w*.16+i*w*.18,-d*.27,.45],[-w*.42+i*w*.18,-d*.27,.35]],g.shade(M.cloth,.7+i*.09));
   g.box(-w/2,-d/2-.015,.1,w*.28,.04,h-.2,M.wood);
  }else{
   for(let i=0;i<5;i++)book(-w*.35+i*w*.14,-d*.27,.72,.10,.24+(i%3)*.05);
   cup(w*.22,-.04,1.32);book(-w*.3,-d*.22,1.32,.18,.25,M.paper);
  }
 }else if(type==='desk'||type==='sideboard'){
  const [w,d,h]=DRESSING_FOOTPRINTS[type];legs(w,d,h-.08);g.box(-w/2,-d/2,h-.08,w,d,.08,M.wood);
  if(type==='sideboard')g.box(-w*.43,-d*.35,.25,w*.86,d*.7,.08,M.wood);
  for(let i=0;i<3;i++)g.line([[-w*.3+i*w*.25,-d*.4,h+.003],[-w*.3+i*w*.25,d*.4,h+.003]],M.dark,1);
 }else if(type==='crate'){
  const [w,d,h]=DRESSING_FOOTPRINTS[type];g.box(-w/2,-d/2,0,w,d,h,M.wood);g.line([[-w*.4,-d/2-.004,.1],[w*.4,-d/2-.004,h-.1]],M.iron,4);
 }else if(type==='bench'){
  legs(2.4,.65,.53);g.box(-1.2,-.325,.53,2.4,.65,.12,M.wood);g.box(-1.2,.25,.65,.85,.07,.55,M.wood);g.box(.3,.25,.65,.9,.07,.36,M.wood);
 }else if(type==='lectern'){
  g.box(-.3,-.25,0,.6,.5,.08,M.wood);g.box(-.06,-.06,.08,.12,.12,.65,M.wood);g.poly([[-.35,-.3,.72],[.35,-.3,.72],[.35,.3,1],[-.35,.3,1]],M.wood);
 }else if(type==='coffin'){
  g.poly([[-.22,-1.05,.05],[.22,-1.05,.05],[.325,-.65,.6],[.25,1.05,.5],[-.25,1.05,.5],[-.325,-.65,.6]],M.wood);
  g.poly([[-.18,-.95,.65],[.18,-.95,.65],[.29,-.6,.7],[.22,.95,.6],[-.22,.95,.6],[-.29,-.6,.7]],g.shade(M.wood,.65));
  g.line([[0,-.65,.72],[0,.5,.65]],M.iron,3);g.line([[-.15,-.2,.7],[.15,-.2,.7]],M.iron,3);
 }else if(type==='memorial'){
  g.box(-.85,-.2,0,1.7,.4,1.55,M.stone);g.box(-.67,-.215,.3,1.34,.03,.95,M.dark);
  for(let i=0;i<5;i++)g.line([[-.48,-.235,1.05-i*.13],[.48-(i%2)*.25,-.235,1.05-i*.13]],M.trim,1.7);
 }else if(type==='rug'){
  cloth(-.65,-1.75,.014,1.3,3.5);for(const x of[-.53,.53])g.line([[x,-1.6,.04],[x,1.6,.04]],[135,98,59],2);
 }else if(type==='pages'){
  for(let i=0;i<3;i++){const x=-.28+i*.15,y=-.14+(i%2)*.16;g.poly([[x,y,.01],[x+.27,y,.013],[x+.27,y+.32,.012],[x,y+.32,.01]],M.paper);for(let j=0;j<3;j++)g.line([[x+.04,y+.07+j*.07,.018],[x+.22,y+.07+j*.07,.018]],M.dark,1);}
 }else if(type==='pot'){
  g.mound(0,0,0,.18,.18,.28,[119,83,54]);g.oval(0,0,.27,.09,.09,M.dark);g.line([[.13,0,.12],[.3,0,.19],[.22,0,.32],[.1,0,.28]],M.wood,2.5);
 }else if(type==='candles'){
  for(let i=0;i<5;i++){const x=Math.sin(i*2)*.22,y=Math.cos(i*2)*.2,h=.12+(i%3)*.12;g.box(x-.045,y-.045,.01,.09,.09,h,M.wax);g.line([[x,y,h],[x+.015,y,h+.06]],M.dark,1);}
 }else if(type==='wax'){
  g.oval(0,0,.013,.35,.3,M.wax);for(let i=0;i<5;i++)g.mound(Math.sin(i*3)*.25,Math.cos(i*2)*.22,.014,.06,.06,.035,M.wax);
 }else if(type==='rags')cloth(-.35,-.4,.02,.7,.8);
 else if(type==='rubble')for(let i=0;i<5;i++)g.mound(Math.sin(i*2)*.35,Math.cos(i*3)*.3,.01,.18,.2,.12+(i%3)*.1,M.stone);
 else if(type==='grate'){for(let i=0;i<6;i++)g.line([[-.45+i*.18,-.65,.035],[-.45+i*.18,.65,.035]],M.iron,3);for(const y of[-.65,.65])g.line([[-.45,y,.035],[.45,y,.035]],M.iron,3);}
 else if(type==='chain'){for(let i=0;i<10;i++){const x=Math.sin(i*.8)*.13,y=-.5+i*.11;g.line([[x-.055,y,.03],[x,y-.05,.03],[x+.055,y,.03],[x,y+.05,.03],[x-.055,y,.03]],M.iron,2);}}
 else if(type==='bones'){for(let i=0;i<6;i++)g.line([[Math.sin(i*2)*.3,Math.cos(i*3)*.35,.03],[Math.sin(i*2+1)*.3,Math.cos(i*3+1)*.35,.035]],[130,120,99],3);g.mound(-.1,-.2,.03,.1,.12,.1,[141,128,105]);}
 else throw Error('Unknown ashen dressing model: '+type);
 if(DRESSING_FOOTPRINTS[type]){const [w,d,h]=DRESSING_FOOTPRINTS[type];g.collision(w,d,h);}
 const m=g.finish();for(const part of m.parts){part.levelInstanceId=p.id;part.visualDressing=true;}
 return {...m,objectId:p.id};
}
