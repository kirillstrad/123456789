import {ASCII} from './ascii.js';
import {relicLetters,relicMeasure} from '../ui/relic-font.js';
import {buildLastServiceThresholdArt} from '../levels/last-service-threshold-art.js';
export function createLastServiceThresholdRenderer(canvas){
 const W=1008,H=864,COLS=252,ROWS=210,out=canvas.getContext('2d'),surface=document.createElement('canvas');surface.width=W;surface.height=H;
 const ctx=surface.getContext('2d'),ascii=new ASCII(out,W),cache=new Map();let last=-Infinity;
 const project=(x,y,z)=>[504+(x-y)*40,150+(x+y)*21-z*48];
 function poly(p){ctx.globalAlpha=p.alpha??1;ctx.fillStyle=Array.isArray(p.c)?`rgb(${p.c.map(n=>Math.max(0,Math.min(255,Math.round(n)))).join(',')})`:p.c;ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=p.w??1;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();p.v.forEach((v,i)=>{const q=project(...v);if(i)ctx.lineTo(...q);else ctx.moveTo(...q);});if(p.kind===1)ctx.stroke();else if(p.kind===2){const q=project(...p.v[0]);ctx.fillRect(q[0]-1,q[1]-1,2,2);}else{ctx.closePath();ctx.fill();}}
 return {reset(){last=-Infinity;},paint(id,hero,now,status){
  if(now-last<50)return false;last=now;
  if(!cache.has(id))cache.set(id,buildLastServiceThresholdArt(id));const art=cache.get(id),anchor=hero.anchor,scale=art.hero.scale;
  const shift=v=>[art.hero.x+(v[0]-anchor.x)*scale,art.hero.y+(v[1]-anchor.y)*scale,v[2]*scale];
  const heroParts=hero.frame.parts.map(p=>({...p,v:p.v.map(shift)})).map(p=>({...p,d:p.v.reduce((n,v)=>n+v[0]+v[1]+v[2]*.006,0)/p.v.length}));
  ctx.globalAlpha=1;ctx.fillStyle='#07090e';ctx.fillRect(0,0,W,H);
  [...art.parts,...heroParts].sort((a,b)=>a.d-b.d).forEach(poly);
  for(let i=0;i<24;i++){const x=120+(i*67)%780,y=130+(i*41+now*.007)%560;ctx.fillStyle=i%3?'#756344':'#b49b68';ctx.fillRect(x,y,1.2,1.2);}
  ctx.globalAlpha=1;const data=ascii.read(surface,COLS,ROWS),lamp=shift(hero.frame.lamp??[anchor.x,anchor.y,1.1]),sources=[...art.lights,{x:lamp[0],y:lamp[1],z:lamp[2],r:175,power:.95}].map(l=>({...l,p:project(l.x,l.y,l.z)}));
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const k=(y*COLS+x)*4,X=(x+.5)*W/COLS,Y=(y+.5)*H/ROWS;let g=.26;
   for(const l of sources)g+=l.power*Math.exp(-((X-l.p[0])**2+(Y-l.p[1])**2)/(2*l.r*l.r));g=Math.min(1.6,g);
   const edge=Math.max(.45,1-.27*((X-W/2)/(W/2))**2);data[k]*=g*edge;data[k+1]*=g*.93*edge;data[k+2]*=g*.8*edge;
  }
  out.fillStyle='#050609';out.fillRect(0,0,W,H);ascii.paint(data,COLS,ROWS,0,H,false);
  out.fillStyle='#090a0e';out.fillRect(0,754,W,110);
  const text=(s,y,size,color)=>{out.fillStyle=color;relicLetters(out,s,W/2-relicMeasure(s,size)/2,y,size,true);};
  text(art.title,780,2.5,'#e3cfaa');text(status,827,1.15,'#aaa18d');return true;
 }};
}
