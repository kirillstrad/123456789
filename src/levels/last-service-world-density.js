export function buildLastServiceWorldDensity(kind){
 if(!['wing','chapel','keeper'].includes(kind))throw Error('Unknown density scene');
 const parts=[],rects=[],lights=[],features=[];
 const face=(v,c,w=1,kind=0)=>parts.push({kind,v,c,w,hero:false,d:v.reduce((a,p)=>a+p[0]+p[1]+p[2]*.006,0)/v.length});
 const line=(v,c,w=1)=>face(v,c,w,1);
 function box(x,y,z,w,d,h,c=[75,65,51],solid=false){
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [f,n]of [[[0,1,5,4],.67],[[1,2,6,5],.5],[[2,3,7,6],.8],[[3,0,4,7],.6],[[4,5,6,7],1.12]])face(f.map(i=>p[i]),c.map(v=>Math.round(v*n)));
  if(solid)rects.push({minX:x,maxX:x+w,minY:y,maxY:y+d});
 }
 function candle(x,y,z=.02){
  box(x-.035,y-.035,z,.07,.07,.17,[164,146,101]);
  face([[x-.035,y,z+.18],[x,y,z+.32],[x+.035,y,z+.18]],[255,220,143]);
 }
 function votiveGroup(x,y,z=0){
  features.push({type:'wax-and-votives',x,y});
  for(let i=0;i<5;i++){const X=x+Math.cos(i*2.4)*.22,Y=y+Math.sin(i*2.4)*.16;
   face([[X-.1,Y-.06,z+.008],[X+.1,Y-.06,z+.008],[X+.08,Y+.06,z+.008],[X-.07,Y+.08,z+.008]],[108,92,60]);candle(X,Y,z+(i%2)*.07);
  }
  lights.push({x,y,z:z+.32,groundZ:z+.03,r:62,power:.29,fireWarmth:1});
 }
 function papers(x,y,z=.018){
  features.push({type:'papers-and-debris',x,y});
  for(let i=0;i<4;i++){const X=x+(i%2)*.16,Y=y+Math.floor(i/2)*.11,Z=z+i*.003;
   face([[X-.13,Y-.08,Z],[X+.12,Y-.1,Z],[X+.15,Y+.1,Z],[X-.1,Y+.09,Z]],[88+i*6,79+i*5,60+i*4]);
   line([[X-.07,Y-.025,Z+.002],[X+.07,Y-.025,Z+.002]],[44,39,32]);
  }
 }
 function rubble(x,y){
  features.push({type:'masonry-debris',x,y});
  for(let i=0;i<6;i++){const X=x+Math.cos(i*2.4)*(.08+i*.035),Y=y+Math.sin(i*2.4)*(.08+i*.03);
   face([[X-.08,Y,.012],[X,Y-.07,.08],[X+.09,Y,.025],[X,Y+.07,.02]],[58+i*4,57+i*3,52+i*2]);
  }
 }
 function wallTablet(x,y){
  features.push({type:'carved-memorial',x,y});
  face([[x,y-.35,.8],[x,y+.35,.8],[x,y+.35,1.8],[x,y,2.1],[x,y-.35,1.8]],[62,62,59]);
  for(let i=0;i<5;i++)line([[x+.01,y-.22,1.02+i*.13],[x+.01,y+.2-(i%2)*.1,1.02+i*.13]],[116,108,88],1.3);
  line([[x+.01,y-.38,.76],[x+.01,y-.38,1.85],[x+.01,y,2.17],[x+.01,y+.38,1.85],[x+.01,y+.38,.76]],[103,96,78],2);
 }
 function hanging(x,y){
  features.push({type:'chain-and-tattered-banner',x,y});
  for(let i=0;i<9;i++){const z=2.3+i*.095;line([[x-.04,y,z],[x,y-.035,z+.035],[x+.04,y,z+.065],[x,y+.035,z+.03],[x-.04,y,z]],[104,94,76],1.4);}
  face([[x,y-.38,2.95],[x,y+.38,2.95],[x,y+.3,1.5],[x,y+.12,1.77],[x,y,1.47],[x,y-.3,1.7]],[75,27,34]);
  line([[x+.01,y,2.75],[x+.01,y,1.85]],[126,106,72],2);
 }
 function bench(x,y){
  features.push({type:'broken-choir-stall',x,y});
  box(x-.4,y-.52,0,.8,1.04,.12,[60,43,34],true);
  for(const Y of [y-.4,y+.37])box(x-.3,Y,.12,.08,.08,.36);
  box(x-.4,y-.52,.47,.8,1.04,.09,[86,59,39]);box(x-.43,y-.52,.5,.09,1.04,.52,[74,49,36]);
  for(let i=0;i<5;i++)line([[x-.34+i*.14,y-.5,.57],[x-.34+i*.14,y+.5,.57]],[113,79,47]);
 }
 function bier(x,y){
  features.push({type:'abandoned-funerary-bier',x,y});
  box(x-.65,y-.9,0,1.3,1.8,.1,[56,44,34],true);
  for(const X of [x-.53,x+.47])for(const Y of [y-.7,y+.6])box(X,Y,.1,.08,.08,.55,[78,56,37]);
  box(x-.52,y-.8,.65,1.04,1.6,.12,[99,74,47]);
  face([[x-.44,y-.65,.78],[x,y-.65,1.02],[x+.44,y-.65,.78],[x+.44,y+.65,.78],[x,y+.65,.94],[x-.44,y+.65,.78]],[107,100,83]);
  for(const Y of [y-.48,y+.25])line([[x-.46,Y,.79],[x,Y,.99],[x+.46,Y,.79]],[64,60,53],2);
 }
 function shelfClutter(x,y,z=1.32){
  features.push({type:'bound-records-and-vessels',x,y});
  for(let i=0;i<5;i++)box(x-.22+i*.09,y-.12,z,.07,.24,.22+(i%3)*.07,[67+i*7,41+i*3,33]);
  box(x-.13,y+.15,z,.26,.18,.07,[140,119,81]);line([[x,y+.15,z+.08],[x,y+.33,z+.08]],[89,40,36],2);
 }
 if(kind==='wing'){
  bier(3.9,15.4);bench(11.5,15.2);bench(12.25,7.8);
  for(const y of [17.5,8.8,-.5,-7.4,-14.1,-22.4,-31.6,-40.5,-47.3]){
   wallTablet(2.12,y);rubble(2.75,y+.45);votiveGroup(12.8,y+.15);
  }
  for(const y of [7.5,-6.8,-18,-30.8,-43.2]){hanging(2.15,y);hanging(13.85,y+.45);}
  for(const [x,y,z]of [[11.4,3.25,.99],[11.3,-29.3,.99],[20.3,-26.5,.99],[12.75,-24.5,1.32]]){papers(x,y,z);shelfClutter(x+.1,y,z+.015);}
  for(const [x,y]of [[3.5,9],[11,-2],[3.8,-16.8],[11.4,-23.5],[12,-33],[4,-40],[21,-32.3]]){papers(x,y);rubble(x+.4,y+.4);}
  for(const y of [-27.8,-34.3,-37.8]){wallTablet(21.8,y);votiveGroup(21.25,y+.5);}
 }else if(kind==='chapel'){
  for(const y of [6.2,9.4,12.3]){bench(4.4,y);bench(11.6,y);wallTablet(2.55,y);wallTablet(13.45,y);}
  for(const x of [5.4,10.6]){box(x-.4,3.1,0,.8,.7,1.02,[86,77,62],true);votiveGroup(x,3.45,1.02);hanging(x,2.7);}
  for(const [x,y]of [[3.25,5],[12.8,7.8],[3.3,11.4],[12.8,13.5]])rubble(x,y);
  papers(7.55,3.65,1.04);papers(12.1,15.8);
 }else{
  for(const y of [4.5,7.5])for(const x of [3.05,12.75])for(const z of [.8,1.32,1.88])shelfClutter(x,y,z);
  papers(10.9,10.3,1.02);papers(11.2,11.3);papers(4.2,9.8);votiveGroup(11.7,10.3,1.02);
  wallTablet(2.14,11);hanging(13.8,5.9);rubble(3.1,12.4);
 }
 return {parts,rects,lights,features};
}
