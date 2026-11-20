import {fixturePalette} from './spectral-light.js';
export function candleFieldProfile(count,{hanging=false}={}){
 if(!Number.isSafeInteger(count)||count<1||count>16)throw Error('Expected 1..16 candles');
 const power=(hanging?.075:.065)/Math.sqrt(1+(count-1)*.3);
 return Object.freeze({radius:(hanging?57:27)+Math.log2(count)*6,power,totalPower:power*count});
}
export function candleFixture({id,x,y,z=.04,count=1,hanging=false}){
 if(![x,y,z].every(Number.isFinite))throw Error('Invalid candle position');
 const profile=candleFieldProfile(count,{hanging}),parts=[],lights=[],tones=fixturePalette(id);
 const add=(v,c,w=1)=>parts.push({kind:1,v,c,w,hero:false,fixtureId:id,overhead:hanging,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length+(hanging?10000:.005)});
 if(hanging){
  add([[x,y,z+.35],[x,y,z+1.65]],[100,94,82],2);
  add(Array.from({length:25},(_,i)=>{const a=i/24*Math.PI*2;return[x+Math.cos(a)*.75,y+Math.sin(a)*.75,z];}),[110,99,78],5);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;add([[x,y,z+.65],[x+Math.cos(a)*.75,y+Math.sin(a)*.75,z]],[87,81,72],2);}
 }
 for(let i=0;i<count;i++){
  const a=i/count*Math.PI*2,r=count===1?0:hanging?.75:.17+count*.012,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r,h=.19+(i%3)*.035;
  add([[px,py,z],[px,py,z+h]],[187,177,145],hanging?3:4);
  add([[px-.012,py,z+h],[px+.015,py,z+h+.12]],tones.outer,2.8);
  add([[px,py,z+h+.015],[px-.008,py,z+h+.085]],tones.core,1.35);
  lights.push({x:px,y:py,z:z+h+.04,groundZ:.025,r:profile.radius,power:profile.power,fireWarmth:.7,lightColor:tones.tint,fixtureId:id});
 }
 return {parts,lights};
}
export function overheadOpacity(parts,s,project){
 if(!s||!project)return .82;
 const q=parts.flatMap(p=>p.v.map(v=>project(...v,s.cameraX,s.cameraY)));if(!q.length)return .82;
 const foot=project(s.x,s.y,.05,s.cameraX,s.cameraY),head=project(s.x,s.y,1.95,s.cameraX,s.cameraY);
 const minX=Math.min(...q.map(p=>p[0])),maxX=Math.max(...q.map(p=>p[0])),minY=Math.min(...q.map(p=>p[1])),maxY=Math.max(...q.map(p=>p[1]));
 return maxX>=foot[0]-22&&minX<=foot[0]+22&&maxY>=head[1]-12&&minY<=foot[1]+12?.2:.82;
}
