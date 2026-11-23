import {ASCII} from '../render/ascii.js';
const cache=new Map();
export function stampPlacement(frame){
 const c=frame.selected;if(!c?.actionable)return null;
 const p=frame.project(c.x,c.y,c.z);if(!p.every(Number.isFinite))return null;
 const size=32,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 return {x:clamp(p[0]-size/2,8,frame.width-size-8),y:clamp(p[1]-size-7,12,frame.height-size-172),size};
}
function image(){
 if(cache.has('ready'))return cache.get('ready');
 const cv=document.createElement('canvas'),raw=document.createElement('canvas');cv.width=raw.width=64;cv.height=raw.height=64;
 const ctx=raw.getContext('2d'),out=cv.getContext('2d'),parts=[];
 const project=(x,y,z)=>[32+x*22-y*9,52+y*8-z*25];
 function box(x,y,z,w,d,h,c){
  const p=[[x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]];
  for(const [f,k]of [[[0,1,5,4],1],[[1,2,6,5],.58],[[4,5,6,7],1.25]])parts.push({v:f.map(i=>p[i]),c:c.map(n=>Math.min(255,Math.round(n*k))),d:y+z*.001});
 }
 box(-.65,0,.05,1.3,.2,1.55,[77,72,62]);box(-.53,-.025,.18,1.06,.03,1.29,[24,26,30]);
 for(const x of [-.62,.53])box(x,-.06,.06,.09,.06,1.53,[157,139,100]);
 for(const z of [.06,1.5])box(-.62,-.06,z,1.24,.06,.09,[193,169,117]);
 box(-.3,-.1,.35,.13,.06,1,[245,225,172]);box(-.3,-.1,1.22,.68,.06,.13,[245,225,172]);box(-.3,-.1,.82,.5,.06,.12,[245,225,172]);
 ctx.fillStyle='#000';ctx.fillRect(0,0,64,64);
 for(const p of parts.sort((a,b)=>b.d-a.d)){ctx.fillStyle=`rgb(${p.c.join(',')})`;ctx.beginPath();p.v.forEach((v,i)=>{const q=project(...v);if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});ctx.closePath();ctx.fill();}
 const ascii=new ASCII(out,64);ascii.paint(raw,24,24,0,64,false);cache.set('ready',cv);return cv;
}
export function paintLastServiceStamp(ctx,frame,{drawStamp=(target,p)=>target.drawImage(image(),p.x,p.y,p.size,p.size)}={}){
 const p=stampPlacement(frame);if(!p)return;
 ctx.save();try{ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;drawStamp(ctx,p);}finally{ctx.restore();}
}
