import {createInteriorGeometry} from '../interior/geometry.js';
import {VISUAL_MATERIALS as M} from './ashen-visual-data.js';
export function ashenMotionParts(time,banners,reduced=false){
 const parts=[];
 for(const [i,b]of banners.entries()){
  const g=createInteriorGeometry(b),wave=reduced?0:Math.sin(time*.65+b.phase)*.035;
  for(let j=0;j<5;j++){
   const x=-.33+j*.132,bottom=.7+(j%2)*.13;
   g.poly([[x,.06,2.07],[x+.125,.06,2.07],[x+.125,.065+wave,bottom],[x,.06+wave,.75+(j%2)*.14]],g.shade(M.cloth,j%2?.72:.94));
  }
  g.line([[0,.075+wave,1],[0,.075,1.84]],M.trim,2);
  parts.push(...g.finish().parts.map(p=>({...p,levelInstanceId:b.id,ambientMotion:true})));
 }
 if(!reduced)for(const [n,x,y]of [[0,20,12],[1,20,25],[2,34,4],[3,32,26]]){
  const g=createInteriorGeometry();
  for(let i=0;i<3;i++){const age=(time*.11+i*.31+n*.17)%1,xx=x+Math.sin(i*2.3+n)*.8,yy=y+Math.cos(i*2.7+n)*.6,z=2-age*1.8;g.line([[xx,yy,z],[xx+.015,yy,z-.035]],[59,53,44],1);}
  parts.push(...g.finish().parts.map(p=>({...p,ambientMotion:true,alpha:.35})));
 }
 return parts;
}
