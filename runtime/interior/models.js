import {interiorCard} from './catalogue.js';
import {createInteriorGeometry} from './geometry.js';
const stone=[91,88,82],wood=[84,63,48],iron=[75,73,72],bone=[157,145,117],cloth=[93,48,43],paper=[140,125,92],dark=[18,18,21],wax=[157,137,101];
export function buildInteriorModel(id,transform={}){
 const card=interiorCard(id),g=createInteriorGeometry(transform),{width:w,depth:d,height:h}=card.dimensions,v=card.variant,f=card.feature;
 const C=g.shade(card.category==='textile'?cloth:card.category==='iron'?iron:wood,v?.73:1);
 const rect=(x,y,z,a,b,c)=>g.poly([[x,y,z],[x+a,y,z],[x+a,y+b,z],[x,y+b,z]],c);
 const stain=(x,y,a,b,c,seed=0,z=.018)=>{
  const points=[];for(let i=0;i<15;i++){const t=i/15*Math.PI*2,r=.73+.24*Math.sin(i*2.3+seed+v*1.7);points.push([x+Math.cos(t)*a*r,y+Math.sin(t)*b*r,z]);}g.poly(points,c);
 };
 const ring=(x,y,z,rx,ry,c,vertical=false)=>{
  const points=Array.from({length:17},(_,i)=>{const a=i/16*Math.PI*2;return vertical?[x+Math.cos(a)*rx,y,z+Math.sin(a)*ry]:[x+Math.cos(a)*rx,y+Math.sin(a)*ry,z];});g.line(points,c,2);
 };
 const clothPatch=(x,y,z,a,b,c,fold=0)=>{
  for(let i=0;i<6;i++){
   if(v&&i===1&&f!=='pile')continue;
   const y0=y+b*i/6,y1=y+b*(i+1)/6,zz=z+(i%2?fold:0);
   g.poly([[x+(i===0?.08:0),y0,z],[x+a,y0,zz],[x+a-(i===5?.17:0),y1,z],[x,y1,zz]],g.shade(c,i%2?.78:1));
  }
 };
 const vessel=(x,y,z,a,b,height,c,fill=null)=>{
  const n=10;for(let i=0;i<n;i++){
   const t=i/n*Math.PI*2,u=(i+1)/n*Math.PI*2;
   g.poly([[x+Math.cos(t)*a*.62,y+Math.sin(t)*b*.62,z],[x+Math.cos(u)*a*.62,y+Math.sin(u)*b*.62,z],[x+Math.cos(u)*a,y+Math.sin(u)*b,z+height],[x+Math.cos(t)*a,y+Math.sin(t)*b,z+height]],g.shade(c,.6+.4*i/n));
  }
  g.oval(x,y,z+height+.002,a*.87,b*.87,fill??dark);ring(x,y,z+height+.006,a,b,g.shade(c,1.25));
 };
 const table=(width,depth,height,c=wood,broken=false)=>{
  for(const x of[-width/2+.05,width/2-.16])for(const y of[-depth/2+.05,depth/2-.16]){
   if(broken&&x>0&&y>0)continue;
   g.box(x,y,0,.11,.11,height,c);
  }
  g.box(-width/2,-depth/2,height,width*(broken?.77:1),depth,.09,c);
  for(let i=1;i<4;i++)g.line([[-width/2+width*i/4,-depth/2,height+.095],[-width/2+width*i/4,depth/2,height+.095]],g.shade(c,.45),1);
 };
 const bones=(x,y,z,a,b,skull=true)=>{
  g.line([[x,y-b*.35,z+.025],[x,y+b*.18,z+.035]],bone,3);
  for(let i=0;i<5;i++){const yy=y-b*.3+i*b*.07;g.line([[x-a*.3,yy+.05,z],[x,yy,z+.055],[x+a*.3,yy+.05,z]],g.shade(bone,.82),2);}
  for(const side of[-1,1])g.line([[x+side*a*.17,y+b*.17,z],[x+side*a*(v?.26:.2),y+b*.33,z],[x+side*a*.22,y+b*.48,z]],bone,3);
  if(skull){g.mound(x,y-b*.43,z,a*.18,b*.09,.10,bone);g.line([[x-a*.06,y-b*.45,z+.085],[x+a*.06,y-b*.45,z+.085]],dark,2);}
 };
 const corpse=(covered=false,z=0)=>{
  const c=f==='charred'?[26,25,25]:f==='decayed'?[64,66,46]:f==='dry'?[100,85,62]:[67,49,45];
  if(covered){g.mound(0,-d*.12,z,w*.36,d*.34,h*.85,[116-v*22,107-v*19,88-v*15]);g.mound(0,-d*.39,z,w*.17,d*.09,h*.7,[105,97,79]);}
  else{
   g.mound(0,-d*.13,z,w*.29,d*.22,h*.84,c);
   g.mound(0,-d*.41,z,w*.14,d*.09,h*.72,f==='skeleton'?bone:[107,94,70]);
   for(const side of[-1,1]){
    const bend=side>0&&v?.15:0;
    g.line([[side*w*.16,d*.05,z+h*.3],[side*w*(.19+bend),d*.25,z+h*.18],[side*w*.2,d*.45,z+.04]],g.shade(c,1.2),6);
    g.line([[side*w*.25,-d*.25,z+h*.4],[side*w*(v?.43:.35),-d*.02,z+.03],[side*w*.3,f==='reaching'?-d*.5:d*.12,z+.02]],c,4);
   }
   if(f==='skeleton'||f==='decayed'||f==='dry')bones(0,0,z+h*.34,w,d,f==='skeleton');
   if(f==='clothed'||f==='reaching')stain(-w*.13,-d*.15,w*.25,d*.12,[71,20,20],3,z+h*.87);
  }
 };
 switch(card.shape){
 case 'rug':{
  const c=f==='ornament'?[107,44,40]:C;
  clothPatch(-w/2,-d/2,.02,w,d,c,.015);
  for(const x of[-w*.42,w*.42])g.line([[x,-d*.44,.045],[x,d*.44,.045]],[132,99,64],2);
  for(const y of[-d/2,d/2])for(let i=0;i<9;i++)g.line([[-w*.45+i*w*.11,y,.025],[-w*.45+i*w*.11,y+(y>0?.13:-.13),.018]],[109,95,73],1);
  if(f==='ornament')g.line([[0,-d*.32,.045],[w*.25,0,.045],[0,d*.32,.045],[-w*.25,0,.045],[0,-d*.32,.045]],[155,113,72],2);
  if(v)g.poly([[w*.15,d*.25,.05],[w*.48,d*.1,.2],[w*.46,d*.46,.045]],[55,39,32]);break;
 }
 case 'cloth':{
  const c=f==='bloody'?[91,39,35]:f==='bandage'||f==='plain'?[124,114,94]:C;
  clothPatch(-w/2,-d/2,.025,w,d,c,Math.max(.03,h*.6));
  if(f==='pile'||f==='folded'||f==='hood')g.mound(0,0,.04,w*.3,d*.29,h,C);
  if(f==='pole')g.line([[-w*.6,-d*.55,.04],[w*.1,d*.57,.06]],wood,4);
  if(f==='bloody')stain(0,0,w*.27,d*.23,[63,17,19],1,h*.3+.035);break;
 }
 case 'garment':{
  const a=f==='shirt'?.5:.35;
  g.poly([[-w*.15,-d/2,.04],[w*.15,-d/2,.04],[w/2,-d*.26,.055],[w*.31,-d*.1,.035],[w*a,d/2,.04],[-w*a,d/2,.04],[-w*.31,-d*.1,.06],[-w/2,-d*.26,.035]],C);
  g.line([[0,-d*.35,.065],[-w*.06,d*.37,.055]],g.shade(C,.45),2);if(v)g.line([[-w*.2,d*.2,.07],[w*.15,d*.3,.075]],[27,26,26],3);break;
 }
 case 'strips':for(let i=0;i<5;i++)clothPatch(-w/2+i*w*.2,-d*.4+(i%2)*d*.2,.02,w*.11,d*.5,[126,111,89],.02);break;
 case 'straw':{
  stain(0,0,w*.56,d*.55,[89,76,44],2,.018);
  for(let i=0;i<32;i++){const x=Math.sin(i*2.4+v)*w*.45,y=Math.cos(i*4.1)*d*.45;g.line([[x,y,.04],[x+.13,y+.22,.06]],[119+(i%3)*9,100,61],1.5);}
  if(f==='cloth')clothPatch(-w*.4,-d*.32,.1,w*.8,d*.65,[81,74,60],.04);break;
 }
 case 'stain':{
  const c=f==='water'?[40,53,60]:f==='wax'?wax:f==='dust'?[86,82,72]:f==='ash'?[53,52,51]:f==='charred'?[20,20,22]:f==='washed'?[62,38,34]:f==='dry'?[47,25,25]:[91-v*21,23-v*4,24-v*4];
  stain(0,0,w*.53,d*.53,c,2);if(f==='water')g.line([[-w*.25,-d*.15,.023],[w*.18,-d*.18,.023]],[97,107,106],1.5);else stain(-w*.1,d*.04,w*.24,d*.23,g.shade(c,.7),4,.021);break;
 }
 case 'trail':{
  for(let i=0;i<9;i++)stain(Math.sin(i*.8+v)*w*.2,-d*.43+i*d*.1,w*(f==='drops'?.07:.25),d*.08,f==='dust'?[77,73,63]:[65-i*2,24,24],i,.02);break;
 }
 case 'prints':for(let i=0;i<7;i++){const x=(i%2?1:-1)*w*.22,y=-d*.4+i*d*.13;g.oval(x,y,.02,w*.11,d*.045,[76-i*5,23,24]);g.oval(x,y-d*.06,.022,w*.07,d*.025,[78-i*5,24,25]);}break;
 case 'hand':{
  stain(0,d*.1,w*.32,d*.2,[83,25,25]);for(let i=0;i<5;i++)g.line([[-w*.33+i*w*.16,0,.023],[-w*.37+i*w*.18,-d*(.3+(i%2)*.15),.023]],[88,27,26],3);break;
 }
 case 'joints':for(let i=-1;i<=1;i++){const x=i*w*.3;g.line([[x,-d/2,.022],[x,d/2,.022]],f==='moss'?[57,72,41]:[72,23,24],3);g.line([[-w/2,i*d*.3,.023],[w/2,i*d*.3,.023]],f==='moss'?[66,76,42]:[64,22,23],2);}break;
 case 'body':{
  corpse(f==='shrouded');if(f==='buried')for(let i=0;i<5;i++)g.mound(w*.12+Math.sin(i)*w*.24,d*.1+Math.cos(i)*d*.25,.03,w*.23,d*.2,h*(.6+i*.08),stone);break;
 }
 case 'bones':{
  bones(0,0,.025,w,d);for(let i=0;i<5;i++)g.line([[Math.sin(i*2)*w*.4,Math.cos(i*3)*d*.3,.04],[Math.sin(i*2+1)*w*.4,Math.cos(i*3+1)*d*.3,.06]],bone,3);break;
 }
 case 'niche':{
  g.box(-w/2,-d/2,0,.18,d,h,stone);g.box(w/2-.18,-d/2,0,.18,d,h,stone);g.box(-w/2,d/2-.13,0,w,.13,h,stone);g.box(-w/2,-d/2,0,w,d,.15,stone);g.box(-w/2,-d/2,h-.16,w,d,.16,stone);
  clothPatch(-w*.37,-d*.35,.16,w*.74,d*.65,[75,70,59],.08);bones(0,0,.25,w*.65,d*.8);break;
 }
 case 'stretcher':{
  for(const x of[-w*.44,w*.4])g.box(x,-d/2,.1,.07,d,.08,wood);clothPatch(-w*.37,-d*.35,.18,w*.74,d*.7,[93,83,65],.03);if(f==='body')g.mound(0,-d*.05,.19,w*.35,d*.3,Math.max(.08,h-.19),[113,102,82]);break;
 }
 case 'cart':{
  g.box(-w/2,-d*.4,.38,w,d*.8,.12,wood);for(const x of[-w/2,w/2-.1])g.box(x,-d*.4,.45,.1,d*.8,.42,wood);
  for(const side of[-1,1])for(const yy of[-d*.26,d*.26]){const xx=side*w*.57;const wheel=Array.from({length:13},(_,i)=>[xx,yy+Math.cos(i/12*Math.PI*2)*.32,.34+Math.sin(i/12*Math.PI*2)*.32]);g.line(wheel,iron,4);g.line([[xx,yy-.32,.34],[xx,yy+.32,.34]],wood,3);}
  clothPatch(-w*.42,-d*.33,.66,w*.84,d*.66,[101,93,75],.19);break;
 }
 case 'bed':{
  table(w,d,.3,wood,f==='broken'||!!v);clothPatch(-w*.43,-d*.43,.4,w*.86,d*.86,[96,87,67],.05);g.box(-w/2,d/2-.1,0,w,.1,h,wood);break;
 }
 case 'table':table(w,d,h-.09,wood,!!v);break;
 case 'bench':{
  const c=f==='stone'?stone:wood;for(const x of[-w*.38,w*.29])g.box(x,-d*.32,0,w*.09,d*.64,h-.13,c);g.box(-w/2,-d/2,h-.13,w*(f==='broken'||v?.76:1),d,.13,c);if(f==='padded')clothPatch(-w*.42,-d*.36,h+.01,w*.84,d*.72,cloth,.02);break;
 }
 case 'stool':{
  g.box(-w/2,-d/2,.02,w,d,.12,wood);for(const x of[-w*.4,w*.28])for(const y of[-d*.4,d*.28])if(!(v&&x>0&&y>0))g.box(x,y,.14,.1,.1,h-.14,wood);break;
 }
 case 'crate':{
  g.box(-w/2,-d/2,0,w,d,h,wood);for(let i=1;i<5;i++)g.line([[-w/2+w*i/5,-d/2-.005,0],[-w/2+w*i/5,-d/2-.005,h]],dark,1.5);g.line([[-w*.46,-d/2-.01,h*.1],[w*.46,-d/2-.01,h*.9]],g.shade(wood,1.3),4);break;
 }
 case 'chest':case 'shrine':{
  const c=f==='iron'?iron:f==='empty'?stone:wood;
  g.box(-w/2,-d/2,0,w,.09,h*.57,c);g.box(-w/2,d/2-.09,0,w,.09,h*.57,c);g.box(-w/2,-d/2,0,.09,d,h*.57,c);g.box(w/2-.09,-d/2,0,.09,d,h*.57,c);g.box(-w*.43,-d*.4,.04,w*.86,d*.8,.05,dark);
  g.box(-w/2,d/2-.07,h*.57,w,.07,h*.43,c);for(const x of[-w*.3,w*.27])g.box(x,-d/2-.012,.04,.04,.025,h*.47,iron);
  if(card.shape==='shrine'){g.poly([[-w*.6,d*.3,h*.8],[0,d*.3,h],[w*.6,d*.3,h*.8]],stone);g.box(-.08,-d/2-.035,h*.23,.16,.05,.13,iron);}break;
 }
 case 'basket':case 'bucket':case 'barrel':{
  const c=card.shape==='basket'?[106,82,52]:wood;vessel(0,0,.02,w*.48,d*.48,h,c,card.shape==='bucket'?[37,44,43]:null);
  for(let i=1;i<5;i++)ring(0,0,h*i/5,w*.43,d*.43,card.shape==='basket'?g.shade(c,.7):iron);
  if(card.shape==='barrel')g.line([[-w*.3,0,h*.02],[w*.22,d*.1,h*.04]],wood,5);
  if(card.shape==='bucket')g.line([[-w*.46,0,h*.7],[-w*.3,0,h*1.25],[w*.3,0,h*1.25],[w*.46,0,h*.7]],iron,2);break;
 }
 case 'sacks':for(let i=0;i<3;i++){const x=(i-1)*w*.23,y=(i%2)*d*.25;g.mound(x,y,.02,w*.27,d*.28,h*(i===1?1:.7),[112-v*13,96-v*10,64]);g.line([[x-.07,y,h*.7],[x+.07,y,h*.7]],iron,2);}break;
 case 'bowl':case 'tray':case 'goblet':{
  const c=f==='clay'?[125,89,62]:iron;
  if(card.shape==='goblet'){g.oval(0,0,.02,w*.35,d*.35,iron);g.box(-.035,-.035,.02,.07,.07,h*.5,iron);vessel(0,0,h*.47,w*.45,d*.45,h*.53,iron);}
  else vessel(0,0,.02,w*.49,d*.49,h,c,f==='water'?[35,43,44]:f==='ash'?[50,49,48]:null);break;
 }
 case 'jug':{
  const c=f==='ink'?[48,43,48]:[123-v*18,86-v*12,57];g.mound(0,0,.02,w*.48,d*.48,h*.7,c);vessel(0,0,h*.52,w*.22,d*.22,h*.45,c);ring(w*.3,0,h*.46,w*.34,h*.26,c,true);break;
 }
 case 'shards':{
  const c=f==='seal'?[121,40,32]:[151,130,99];for(let i=0;i<5;i++){const x=Math.sin(i*2.2+v)*w*.32,y=Math.cos(i*2.7)*d*.31;g.poly([[x,y,.022],[x+w*.23,y+d*.08,.03],[x+w*.08,y+d*.23,.025]],g.shade(c,.7+i*.06));}break;
 }
 case 'brush':g.box(-w/2,-d/2,.06,w,d,.08,wood);for(let i=0;i<9;i++)g.line([[-w*.4+i*w*.1,-d*.3,.07],[-w*.4+i*w*.1,-d*.3,.01]],bone,2);break;
 case 'bundle':g.mound(0,0,.02,w*.49,d*.48,h,C);g.line([[-w*.4,0,.06],[0,0,h+.025],[w*.4,0,.06]],bone,2);g.line([[0,-d*.4,.04],[0,0,h+.03],[0,d*.4,.04]],bone,2);break;
 case 'shoe':g.mound(0,0,.02,w*.48,d*.48,h,[64,48,36]);g.oval(0,d*.18,h*.65,w*.25,d*.16,dark);break;
 case 'keys':{
  ring(0,-d*.22,.025,w*.22,d*.17,iron);for(let i=0;i<3;i++){const x=(i-1)*w*.2;g.line([[x,-d*.15,.03],[x,d*.4,.03],[x+w*.1,d*.4,.03],[x+w*.1,d*.28,.03]],iron,2);}break;
 }
 case 'medallion':g.oval(0,0,.025,w*.38,d*.38,[147,109,51]);g.line([[0,-d*.24,.035],[0,d*.24,.035]],dark,1.5);ring(0,-d*.4,.025,w*.13,d*.12,iron);break;
 case 'comb':g.box(-w/2,-d/2,.01,w,d*.25,.03,bone);for(let i=0;i<8;i++)if(!(v&&i===3))g.line([[-w*.45+i*w*.13,-d*.3,.03],[-w*.45+i*w*.13,d*.45,.03]],bone,2);break;
 case 'effigy':g.box(-w*.2,-d*.2,0,w*.4,d*.4,h*.68,wood);g.mound(0,0,h*.67,w*.25,d*.25,h*.3,wood);g.line([[-w*.45,0,h*.4],[w*.45,0,h*.4]],wood,4);break;
 case 'book':{
  if(f==='open'){
   g.poly([[-w/2,-d/2,.02],[0,-d/2,.1],[0,d/2,.1],[-w/2,d/2,.02]],paper);g.poly([[0,-d/2,.1],[w/2,-d/2,.025],[w/2,d/2,.025],[0,d/2,.1]],g.shade(paper,.85));
   for(let i=0;i<5;i++)for(const side of[-1,1])g.line([[side*w*.09,-d*.35+i*d*.15,.1],[side*w*.4,-d*.35+i*d*.15,.04]],[73,65,53],1);
  }else{g.box(-w/2,-d/2,.02,w,d,h,[78-v*12,41,34]);g.box(-w*.45,-d*.46,h*.3,w*.9,d*.92,h*.3,paper);g.line([[0,-d*.25,h+.025],[0,d*.25,h+.025]],[136,104,58],2);}break;
 }
 case 'pages':{
  for(let i=0;i<4;i++){const x=Math.sin(i*2+v)*w*.25,y=Math.cos(i*3)*d*.24;rect(x-w*.18,y-d*.2,.02+i*.003,w*.36,d*.4,f==='charred'?[56,48,39]:paper);for(let j=0;j<3;j++)g.line([[x-w*.12,y-d*.12+j*d*.09,.025+i*.003],[x+w*.1,y-d*.12+j*d*.09,.025+i*.003]],[61,55,45],1);}break;
 }
 case 'scroll':g.mound(0,0,.02,w*.43,d*.48,h,[84,59,39]);for(const y of[-d*.35,d*.35])ring(0,y,.03,w*.43,d*.06,iron);break;
 case 'candles':{
  const count=f==='group'?5:1;for(let i=0;i<count;i++){
   const x=count===1?0:Math.sin(i*2.3)*w*.35,y=count===1?0:Math.cos(i*2.3)*d*.35,hh=h*(1-i*.12);
   const radius=count===1?Math.min(w,d)*.32:.075;g.box(x-radius,y-radius,.02,radius*2,radius*2,hh,wax);
   g.line([[x,y,hh+.02],[x+.025,y,hh+.1]],dark,1.5);
   if(!v){g.poly([[x-.045,y,hh+.04],[x,y,hh+.22],[x+.055,y,hh+.04]],[224,132,46]);g.light(x,y,hh+.15,35,.12);}
  }break;
 }
 case 'fallen-candle':g.box(-w*.25,-d*.42,.02,w*.5,d*.84,h*.7,wax);g.line([[0,-d*.43,h*.4],[0,-d*.55,h*.4]],dark,1.5);break;
 case 'wax':{
  stain(0,0,w*.5,d*.5,wax,4,.025);for(let i=0;i<7;i++)g.mound(Math.sin(i*3)*w*.3,Math.cos(i*2)*d*.3,.02,w*.09,d*.09,h*(.5+i*.07),wax);break;
 }
 case 'censer':{
  const base=f==='hanging'?h*.46:.05;vessel(0,0,base,w*.32,d*.32,f==='hanging'?.24:h*.45,iron,[41,34,30]);
  if(f==='hanging')for(const side of[-1,1])g.line([[side*w*.3,0,base+.2],[0,0,h]],iron,2);
  else if(f==='fallen')for(let i=0;i<7;i++)g.mound(Math.sin(i)*w*.45,Math.cos(i*2)*d*.4,.02,.04,.05,.04,[38,33,30]);
  else g.mound(0,0,h*.45,w*.33,d*.33,h*.3,iron);break;
 }
 case 'lectern':g.box(-w*.32,-d*.3,0,w*.64,d*.6,.1,wood);g.box(-.07,-.07,.1,.14,.14,h*.7,wood);g.poly([[-w/2,-d/2,h*.7],[w/2,-d/2,h*.7],[w/2,d/2,h],[-w/2,d/2,h]],wood);break;
 case 'flowers':for(let i=0;i<9;i++){const x=Math.sin(i*2)*w*.4,y=Math.cos(i*3)*d*.4;g.line([[0,d*.4,.025],[x,y,.05]],g.shade([89,86,47],v?.7:1),1.5);g.mound(x,y,.05,.065,.065,.045,[111-v*20,87-v*10,59]);}break;
 case 'coins':for(let i=0;i<9;i++)g.oval(Math.sin(i*2+v)*w*.4,Math.cos(i*3)*d*.4,.025,.045,.045,[145-v*25,111-v*18,54],8);break;
 case 'rubble':{
  for(let i=0;i<(f==='pile'?9:4);i++){const x=Math.sin(i*2.1+v)*w*.3,y=Math.cos(i*3.5)*d*.28;g.mound(x,y,.02,w*(.15+(i%2)*.08),d*.24,h*(.5+(i%3)*.2),g.shade(stone,.7+i*.035));}
  if(f==='carved')g.line([[-w*.3,-d*.15,h*.44],[w*.2,-d*.1,h*.57]],g.shade(stone,.35),2);break;
 }
 case 'head':{
  g.mound(0,0,.02,w*.43,d*.4,h,stone);g.box(-w*.13,-d*.35,h*.35,w*.26,d*.16,h*.28,stone);for(const x of[-w*.2,w*.14])g.line([[x,-d*.34,h*.61],[x+w*.08,-d*.34,h*.61]],dark,3);break;
 }
 case 'pedestal':g.box(-w/2,-d/2,0,w,d,.16,stone);g.box(-w*.35,-d*.35,.16,w*.7,d*.7,h-.3,stone);g.box(-w/2,-d/2,h-.14,w,d,.14,stone);break;
 case 'slab':g.poly([[-w/2,-d/2,.02],[w*.3,-d/2,h*.8],[w/2,-d*.1,h],[w*.3,d/2,h*.8],[-w/2,d/2,h*.7]],stone);g.line([[-w*.3,-d*.4,h*.71],[w*.05,0,h*.94],[-w*.05,d*.4,h*.76]],dark,2);break;
 case 'circle':ring(0,0,.023,w*.47,d*.47,[134-v*22,94-v*18,58]);ring(0,0,.025,w*.39,d*.39,[113,72,49]);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.line([[Math.cos(a)*w*.28,Math.sin(a)*d*.28,.027],[Math.cos(a+.7)*w*.28,Math.sin(a+.7)*d*.28,.027]],[115,73,51],2);}break;
 case 'column':{
  for(let i=0;i<7;i++)g.mound(0,-d*.4+i*d*.13,.02,w*.43,d*.09,h,stone);g.line([[-w*.24,-d*.43,h*.55],[-w*.24,d*.42,h*.55]],g.shade(stone,.5),2);break;
 }
 case 'boards':{
  const count=f==='splinters'?9:f==='door'?6:4;for(let i=0;i<count;i++){
   const x=-w*.45+i*w*.8/count,y=(i%2)*d*.12-d*.45,depth=d*(f==='splinters'?.3+(i%3)*.2:.84);
   g.box(x,y,.02+i*.004,w*(f==='splinters'?.045:.13),depth,.045,g.shade(wood,.7+i*.04));
  }if(f==='door')for(const y of[-d*.27,d*.28])g.box(-w*.42,y,.08,w*.84,.09,.05,iron);break;
 }
 case 'beam':g.box(-w/2,-d/2,.02,w,d,h*.8,wood);for(let i=0;i<3;i++)g.line([[-w*.3+i*w*.27,-d*.44,h*.82],[-w*.3+i*w*.27,d*.4,h*.82]],g.shade(wood,.45),1.5);break;
 case 'ripples':stain(0,0,w*.5,d*.5,[37,47,53]);for(let i=1;i<4;i++)ring(0,0,.023+i*.001,w*.12*i,d*.12*i,[74-i*6,85-i*5,86-i*4]);break;
 case 'wall-patch':{
  const c=f==='mould'?[55,67,44]:f==='charred'?[24,24,25]:[43,51,48];
  g.poly([[-w/2,0,.02],[w/2,0,.02],[w*.38,0,h*.8],[w*.1,0,h],[-w*.3,0,h*.65]],c);
  for(let i=0;i<7;i++)g.line([[-w*.4+i*w*.12,-.004,.03],[-w*.35+i*w*.12,-.004,h*(.2+(i%3)*.2)]],g.shade(c,1.22),2);break;
 }
 case 'outline':{
  g.line([[-w/2,-d/2,.023],[w/2,-d/2,.023],[w/2,d/2,.023],[-w/2,d/2,.023],[-w/2,-d/2,.023]],[102,95,80],4);if(v)g.line([[-w*.3,d*.4,.025],[w*.4,d*.1,.025]],dark,3);break;
 }
 case 'web':{
  const a=[-w/2,0,h],b=[w/2,0,h],c=[-w/2,-d,0];
  for(let i=0;i<7;i++){const t=i/6;g.line([a,[b[0]*(1-t)+c[0]*t,b[1]*(1-t)+c[1]*t,b[2]*(1-t)+c[2]*t]],[104,102,96],1);}
  for(let k=1;k<5;k++){const t=k/5;g.line([[a[0]+(b[0]-a[0])*t,0,h],[a[0]+(b[0]-a[0])*t*.4,-d*t*.5,h*(1-t*.5)],[a[0],-d*t,h*(1-t)]],[79,79,75],1);}break;
 }
 case 'chain':case 'rope':{
  for(let i=0;i<12;i++){const x=Math.sin(i*.7+v)*w*.31,y=-d*.44+i*d*.08;ring(x,y,.04,w*.09,d*.045,card.shape==='rope'?[114,91,60]:g.shade(iron,v?.65:1));}
  if(card.shape==='rope')ring(-w*.2,-d*.4,.045,w*.22,d*.1,iron);break;
 }
 case 'staples':for(let i=0;i<4;i++){const x=Math.sin(i*2+v)*w*.3,y=Math.cos(i*3)*d*.3;g.line([[x-.1,y,0],[x-.1,y,.1],[x+.1,y,.1],[x+.1,y,0]],g.shade(iron,v?.64:1),3);}break;
 case 'grate':for(let i=0;i<7;i++)g.line([[-w/2+i*w/6,-d/2,.05],[-w/2+i*w/6,d/2,.05]],iron,3);for(const y of[-d/2,0,d/2])g.line([[-w/2,y,.05],[w/2,y,.05]],iron,3);break;
 default:throw Error('Unauthored interior shape: '+card.shape);
 }
 // Every B variant receives material wear as geometry, not just a rotated A mesh.
 if(v&&!['blood','damp','decay'].includes(card.category)){
  const z=Math.max(.028,h*.5);g.line([[-w*.22,-d*.14,z],[0,-d*.04,z+.005],[w*.16,d*.09,z]],g.shade(dark,1.25),1.6);
 }
 if(v&&['blood','damp','decay'].includes(card.category))for(const part of g.finish().parts)part.c=g.shade(part.c,.8);
 if(card.collision==='footprint')g.collision(w,d,h);
 return {...g.finish(),objectId:id,familyId:card.familyId,variant:v,role:card.role,card};
}
