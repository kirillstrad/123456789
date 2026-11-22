// Denser room-specific compositions, not random scatter. All solid bases publish footprints.
export function buildLastServiceInteriorPass2(kind){
 if(!['wing','chapel','keeper'].includes(kind))throw Error('Unknown interior pass');
 const parts=[],rects=[],lights=[],features=[];
 const emit=(type,v,c,w=1,extra={})=>parts.push({kind:type,v,c,w,hero:false,d:v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length,...extra});
 const line=(v,c=[120,106,82],w=1)=>emit(1,v,c,w);
 function box(x,y,z,w,d,h,c=[79,75,66],solid=false){
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [f,g]of [[[0,1,5,4],.63],[[1,2,6,5],.48],[[2,3,7,6],.79],[[3,0,4,7],.55],[[4,5,6,7],1.08]])emit(0,f.map(i=>p[i]),c.map(n=>Math.round(n*g)));
  if(solid)rects.push({minX:x,maxX:x+w,minY:y,maxY:y+d});
 }
 function pier(x,y){
  features.push({type:'clustered-pier',x,y});box(x-.23,y-.23,0,.46,.46,.16,[104,95,79],true);
  for(const dx of [-.12,0,.12])box(x+dx-.04,y-.06,.16,.08,.12,2.12,[80,77,70]);
  box(x-.24,y-.2,2.28,.48,.4,.13,[113,103,86]);line([[x-.2,y,2.42],[x,y,2.74],[x+.2,y,2.42]],[118,108,88],2);
 }
 function skull(x,y,z){
  const v=[[-.1,-.05],[0,-.08],[.1,-.05],[.12,.03],[.07,.1],[-.07,.1],[-.12,.03]].map(([a,b])=>[x+a,y+b,z+.08]);
  emit(0,v,[149,138,108]);line([[x-.07,y-.05,z+.09],[x-.025,y-.045,z+.09]],[23,22,21],3);line([[x+.025,y-.045,z+.09],[x+.07,y-.05,z+.09]],[23,22,21],3);
  box(x-.055,y+.055,z,.11,.055,.045,[126,115,89]);
 }
 function ossuary(x,y){
  features.push({type:'ossuary-stack',x,y});box(x-.23,y-.38,0,.46,.76,.13,[73,69,61],true);
  for(const z of [.15,.38,.61])for(let i=0;i<3;i++)skull(x,y-.25+i*.23,z);
  for(const z of [.12,.35,.58,.81])box(x-.25,y-.4,z,.5,.8,.045,[96,85,66]);
 }
 function rack(x,y){
  features.push({type:'guard-weapon-rack',x,y});box(x-.32,y-.65,0,.64,1.3,.13,[66,48,39],true);
  for(const dy of [-.52,.52])box(x-.06,y+dy,0,.12,.1,1.9,[61,44,37]);
  for(const z of [.4,1.3])box(x-.075,y-.6,z,.15,1.2,.08,[90,69,47]);
  for(let i=0;i<5;i++){const Y=y-.45+i*.22;line([[x+.08,Y,.12],[x+.08,Y,2.2]],[105,90,66],2);emit(0,[[x+.08,Y-.065,2.05],[x+.08,Y,2.4],[x+.08,Y+.065,2.05]],[141,139,124]);}
 }
 function books(x,y,z,n=5){
  features.push({type:'books-and-seals',x,y});
  for(let i=0;i<n;i++)box(x-.26+(i%2)*.025,y-.17,z+i*.065,.52-(i%3)*.025,.34,.055,i%2?[105,39,40]:[89,72,48]);
  emit(0,[[x-.18,y-.19,z+.065*n],[x+.18,y-.19,z+.065*n],[x+.18,y-.1,z+.065*n],[x-.18,y-.1,z+.065*n]],[161,139,101]);
  emit(2,[[x+.1,y-.14,z+.065*n+.015]],[126,35,35],1,{r:2});
 }
 function urn(x,y){
  features.push({type:'funerary-urn',x,y});box(x-.17,y-.17,0,.34,.34,.1,[96,85,70],true);
  box(x-.12,y-.12,.1,.24,.24,.42,[103,92,75]);box(x-.16,y-.16,.52,.32,.32,.05,[127,112,85]);
  for(const s of [-1,1])line([[x+s*.12,y,.27],[x+s*.24,y,.43],[x+s*.12,y,.48]],[130,114,85],2);
 }
 function cloth(x,y,z){
  features.push({type:'folded-vestments',x,y});for(let i=0;i<4;i++)box(x-.25+i*.012,y-.2,z+i*.035,.5,.4,.035,[84+i*4,29,35]);
  line([[x-.18,y-.2,z+.145],[x-.18,y+.2,z+.145]],[145,119,75],2);
 }
 function votive(x,y,z=0){
  features.push({type:'votive-stand',x,y});box(x-.16,y-.16,0,.32,.32,.08,[81,74,61],true);
  line([[x,y,.08],[x,y,z+.7]],[82,74,61],3);
  for(let i=0;i<3;i++){const X=x+(i-1)*.12;box(X-.022,y-.022,z+.7,.044,.044,.2+(i%2)*.1,[174,153,105]);emit(2,[[X,y,z+.94+(i%2)*.1]],[255,235,187],1,{r:1.8});}
  lights.push({x,y,z:z+1,r:52,power:.15,fireWarmth:1});
 }
 function wallShield(x,y){
  features.push({type:'memorial-shield',x,y});emit(0,[[x,y-.3,1.9],[x,y+.3,1.9],[x,y+.27,1.35],[x,y,1.1],[x,y-.27,1.35]],[70,37,40]);
  line([[x+.01,y,1.22],[x+.01,y,1.8]],[139,119,83],3);line([[x+.01,y-.16,1.6],[x+.01,y+.16,1.6]],[139,119,83],2);
 }
 function portal(){
  features.push({type:'chapel-portal',x:8,y:-50.55});
  for(const x of [6.5,9.25]){box(x,-50.62,0,.25,.32,2.65,[87,80,68],true);box(x-.12,-50.72,0,.49,.52,.15,[121,106,79]);}
  emit(0,[[6.8,-50.7,0],[9.2,-50.7,0],[9.2,-50.7,2.5],[8,-50.7,3.25],[6.8,-50.7,2.5]],[9,10,15]);
  line([[6.65,-50.4,2.65],[8,-50.4,3.5],[9.4,-50.4,2.65]],[145,125,87],5);
  for(const x of [6.5,9.5])votive(x,-49.75,.2);
  for(let i=0;i<3;i++)line([[7.4,-49.35-i*.3,.02],[8,-49.6-i*.3,.02],[8.6,-49.35-i*.3,.02]],[157,132,88],2);
 }
 if(kind==='wing'){
  for(const y of [16,6,-5.5,-16,-25,-36,-45])for(const x of [2.35,13.6])pier(x,y);
  rack(3.05,6.3);wallShield(2.29,8.6);wallShield(13.7,5);
  books(11.4,3.2,.99);books(3.05,3.1,1.88,3);
  for(const y of [-3,-12,-19,-35,-39,-43.5])ossuary(2.7,y);
  for(const y of [-3,-12.5,-19.5,-30.6,-39.5,-43.5])urn(12.8,y);
  cloth(11.3,-29.3,.99);books(11.8,-29.3,.99,4);books(12.75,-24.5,1.88,3);
  books(20.3,-26.5,.99);urn(21.2,-30);ossuary(21.3,-37);
  for(const y of [-24,-29,-34,-38])wallShield(21.7,y);
  for(const y of [17.6,-7.5,-27.8,-46.8])votive(11.6,y);
  portal();
 }else if(kind==='chapel'){
  for(const y of [6.5,10.4])for(const x of [2.85,13.15])pier(x,y);
  for(const y of [5.9,10.3]){ossuary(3.45,y);ossuary(12.55,y);}
  for(const x of [5.4,10.6]){urn(x,4.4);votive(x,3.6,.3);}
  cloth(8,3.7,1);books(7.4,3.7,1,3);
  for(const y of [7.3,11.5]){wallShield(2.6,y);wallShield(13.4,y);}
 }else{
  for(const y of [4.5,7.5])for(const x of [3.05,12.75]){books(x,y,1.88,4);for(const z of [.8,1.32])books(x,y,z,3);}
  books(11.1,10.3,.99,6);cloth(11.7,10.3,.99);urn(12.6,12.3);votive(5.3,4.1);
  wallShield(2.3,10);wallShield(13.7,10);ossuary(3.7,3.1);
 }
 return {parts,rects,lights,features};
}
