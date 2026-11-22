export function buildLastServiceThresholdArt(id){
 if(!['wing','chapel','keeper'].includes(id))throw Error('Unknown threshold art');
 const parts=[],lights=[];
 const part=(kind,v,c,w=1)=>parts.push({kind,v,c,w,d:v.reduce((a,p)=>a+p[0]+p[1]+p[2]*.006,0)/v.length});
 const line=(v,c,w=1)=>part(1,v,c,w);
 function box(x,y,z,w,d,h,c=[91,85,73]){
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [indices,k]of [[[0,1,5,4],.63],[[1,2,6,5],.5],[[2,3,7,6],.82],[[3,0,4,7],.7],[[4,5,6,7],1.15]])part(0,indices.map(i=>p[i]),c.map(v=>Math.round(v*k)));
 }
 function candle(x,y,z=0){box(x-.055,y-.055,z,.11,.11,.4,[189,163,112]);part(0,[[x-.06,y,z+.4],[x,y,z+.73],[x+.06,y,z+.4]],[255,222,157]);lights.push({x,y,z:z+.55,r:88,power:.3});}
 function pillar(x,y){
  box(x-.55,y-.55,0,1.1,1.1,.25);for(const dx of [-.27,0,.27])box(x+dx-.1,y-.12,.25,.2,.24,5.8,[99,94,85]);
  box(x-.55,y-.45,6,1.1,.9,.22,[128,115,91]);
  for(let i=0;i<10;i++)line([[x-.42,y-.25,.5+i*.5],[x+.42,y-.25,.5+i*.5]],[57,55,51]);
 }
 function book(x,y,z){for(let i=0;i<5;i++)box(x-.38,y-.24,z+i*.09,.76,.48,.075,i%2?[104,51,43]:[114,94,62]);}
 for(let x=0;x<16;x++)for(let y=0;y<17;y++){
  const n=(x*13+y*7)%5;part(0,[[x+.025,y+.025,0],[x+.975,y+.025,0],[x+.975,y+.975,0],[x+.025,y+.975,0]],[58+n*4,56+n*3,51+n*2]);
  if(n===2)line([[x+.2,y+.1,.006],[x+.45,y+.47,.006],[x+.36,y+.8,.006]],[34,34,32]);
 }
 for(const y of [2,6,10])for(const x of [2.2,13.8])pillar(x,y);
 for(const x of [1.2,14.7])for(let y=1;y<12;y+=2){
  box(x,y,0,.2,1.4,3.8,[68,68,65]);
  for(let z=.5;z<3.5;z+=.42)line([[x+.21,y+.12,z],[x+.21,y+1.25,z]],[115,106,86]);
  for(let i=0;i<3;i++)candle(x+.45,y+.3+i*.28,.2);
 }
 if(id==='chapel'){
  for(const x of [5.15,10.5])box(x,3.2,0,.35,.65,5.2,[111,99,78]);
  part(0,[[5.5,3.38,0],[10.5,3.38,0],[10.5,3.38,4.8],[8,3.38,6.7],[5.5,3.38,4.8]],[15,18,24]);
  line([[5.35,3.18,5],[8,3.18,7],[10.7,3.18,5]],[180,156,109],9);
  box(6.5,1.7,.1,3,1.2,1.2,[157,138,99]);for(const x of [6.4,7.2,8,8.8,9.6])candle(x,2.2,1.35);
  for(const x of [5.4,10.6])for(let i=0;i<20;i++)line([[x,3.05,2+i*.2],[x+.07,3.05,2.13+i*.2]],[139,126,98],2);
  lights.push({x:8,y:2.3,z:1.2,r:225,power:1.2});
 }else if(id==='wing'){
  for(const y of [3.5,7.5,10.2])for(const x of [3.3,12.1]){box(x,y,0,.85,1.6,.65,[100,92,77]);box(x-.05,y-.05,.65,.95,1.7,.12,[128,114,88]);candle(x+.4,y+.8,.8);}
  line([[3,1.2,4.5],[8,1.2,7],[13,1.2,4.5]],[140,131,110],9);
  lights.push({x:8,y:1,z:2,r:240,power:.8});
 }else{
  for(const x of [3.1,12.2])for(const y of [3,6.2,9.4]){
   box(x-.5,y-.7,0,1,1.4,3.8,[62,43,34]);
   for(const z of [.5,1.3,2.1,2.9]){box(x-.55,y-.75,z,1.1,1.5,.09,[108,81,48]);for(let i=0;i<7;i++)box(x-.4,y-.6+i*.17,z+.09,.65,.12,.5-(i%3)*.05,[75+i*8,43+i*3,36]);}
  }
  box(6.5,4.3,0,3,1.4,1.15,[93,65,41]);box(6.3,4.15,1.15,3.4,1.7,.15,[137,99,58]);book(7.2,4.8,1.3);candle(8.8,4.8,1.3);
  part(0,[[7.65,4.6,1.34],[8,4.6,1.5],[8.35,4.6,1.34],[8.35,5.1,1.34],[8,5.1,1.5],[7.65,5.1,1.34]],[198,174,123]);
  lights.push({x:8,y:4.8,z:1.8,r:165,power:1});
 }
 for(let i=0;i<24;i++){const x=2.8+(i*3.7)%10,y=9+(i*1.9)%6;
  part(0,[[x,y,.013],[x+.23,y-.09,.03],[x+.38,y+.13,.02],[x+.04,y+.24,.012]],[97,87,67]);
 }
 return {parts,lights,hero:{x:7.1,y:13.2,scale:1.75},title:{wing:'ПОГРЕБАЛЬНОЕ КРЫЛО',chapel:'НИЖНЯЯ ЧАСОВНЯ',keeper:'ПОКОИ ХРАНИТЕЛЯ'}[id]};
}
