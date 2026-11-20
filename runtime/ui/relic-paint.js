import {relicLayout,relicTextLayout} from './relic-layout.js';
import {relicLetters,relicMeasure} from './relic-font.js';
const clamp=x=>Math.max(0,Math.min(1,x));
export function paintRelic(frame,cols,rows,v,time=0,reduced=false){
 const l=relicLayout(cols,rows,v),s=l.stages;
 const put=(x,y,r,g=r*.93,b=r*.84)=>{
  x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=cols||y>=rows)return;
  const k=(y*cols+x)*4;frame[k]=r;frame[k+1]=g;frame[k+2]=b;frame[k+3]=255;
 };
 const rect=(x,y,w,h,r,g,b)=>{for(let yy=Math.ceil(y);yy<y+h;yy++)for(let xx=Math.ceil(x);xx<x+w;xx++)put(xx,yy,r,g,b);};
 const line=(a,b,c,d,r,g,bv)=>{
  const n=Math.max(1,Math.ceil(Math.hypot(c-a,d-b)));for(let i=0;i<=n;i++)put(a+(c-a)*i/n,b+(d-b)*i/n,r,g,bv);
 };
 // Broken base and split seam remain visible while the slab is closed.
 const baseLeft=l.cx-cols*.145,baseWidth=cols*.29,baseTop=l.gemY-4;
 for(let yy=0;yy<9;yy++)for(let xx=0;xx<baseWidth;xx++){
  const x=baseLeft+xx,seam=l.cx+Math.sin(yy*1.4)*1.6;
  const gap=1+s.split*2;
  if(Math.abs(x-seam)<gap){put(x,baseTop+yy,8+14*s.split,5,5);continue;}
  if((xx<3&&yy<3)||(xx>baseWidth-4&&yy>5))continue;
  put(x,baseTop+yy,yy===0?85:yy>6?26:44);
 }
 for(const side of [-1,1]){
  const boltX=l.cx+side*(8+s.bolts*5);
  rect(boltX-3,baseTop+1,6,2,24,26,28);rect(boltX-3,baseTop+1,6,1,104,99,85);
  for(const offset of [16,23]){const x=l.cx+side*offset;rect(x,baseTop-1,2,7,19,20,22);put(x,baseTop,103,97,83);put(x,baseTop+5,84,77,65);}
 }
 if(s.lift>0){
  // Stone shutters open about their inner edge; projected width follows rotation.
  const openness=s.split*(.25+.75*(v.spread??0)),wingWidth=l.wing*Math.sin(openness*Math.PI/2);
  for(const side of [-1,1]){
   const edge=side<0?l.left:l.right;
   for(let yy=3;yy<l.height-4;yy++){
    const w=wingWidth*(1-.1*Math.sin(yy*.27));
    rect(side<0?edge-w:edge,l.top+yy,w,1,yy%13===0?67:33);
    put(edge+side*w,l.top+yy,side<0?79:47);
   }
   for(const yy of [8,l.height-11])rect(edge-1,l.top+yy,3,5,91,79,60);
  }
  for(let yy=0;yy<l.height;yy++)for(let xx=0;xx<l.width;xx++){
   if((xx<3&&yy<3-xx)||(xx>l.width-5&&yy>l.height-5))continue;
   const edge=xx<2||xx>l.width-3||yy<3||yy>l.height-4;
   const value=yy<1?111:edge?(xx<2?74:42):19;
   put(l.left+xx,l.top+yy,value,edge?value*.94:20,edge?value*.84:22);
  }
  // Deep irregular fissures stay confined to the frame, never behind the inscription.
  for(let yy=4;yy<l.height-5;yy++){
   const x=l.left+3+Math.round(Math.sin(yy*.6));put(x,l.top+yy,4,5,7);
   if(yy%5===0)put(x+1,l.top+yy,67,24,11);
  }
  line(l.right-13,l.top+1,l.right-7,l.top+4,5,6,8);
  line(l.right-7,l.top+4,l.right-3,l.top+2,7,8,10);
  for(const side of [-1,1]){
   const x=side<0?l.left:l.right-4;
   for(const yy of [6,l.height-13]){
    rect(x-1,l.top+yy,6,2,19,21,24);rect(x-1,l.top+yy,6,1,113,104,87);
    put(x-1,l.top+yy+2,32,31,29);put(x+4,l.top+yy+2,32,31,29);
   }
   const handX=side<0?l.left+7:l.right-12,handY=l.bottom-6;
   rect(handX+1,handY+5,4,9,30,25,23);rect(handX,handY,6,8,54,44,36);
   for(let f=0;f<4;f++){rect(handX+f,handY-3+f%2,1,6,79-f*6,61-f*4,45-f*3);put(handX+f,handY+1,29,23,20);}
   rect(handX+(side<0?4:-1),handY,2,5,87,67,48);
  }
 }
 const pulse=reduced?0:v.unread?.15*Math.sin(time*7)+.08*Math.sin(time*13):.025*Math.sin(time*1.6);
 for(let dy=-4;dy<=4;dy++)for(let dx=-5;dx<=5;dx++){
  const d=Math.abs(dx)/4+Math.abs(dy)/3;if(d>1.45)continue;
  if(d>1){put(l.cx+dx,l.gemY+dy,dy<0?92:28);continue;}
  const glow=clamp(1-d*.55+pulse+s.flash*.3);put(l.cx+dx,l.gemY+dy,160*glow+43,61*glow+12,10+glow*14);
 }
 return l;
}
export function drawRelicText(ctx,cols,rows,height,v,time=0,reduced=false){
 const t=relicTextLayout(cols,rows,ctx.canvas.width,height,v),{l,cw,ch,scale,lineHeight,x,y,bodyY}=t;
 if(!l.ready)return;
 ctx.save();ctx.beginPath();ctx.rect((l.left+4)*cw,(l.top+4)*ch,(l.width-8)*cw,(l.height-8)*ch);ctx.clip();
 const phase=v.dialogue?v.docPhase:v.phase,age=v.dialogue?v.docAge:v.age;
 const progress=phase==='burn'?clamp(age/(v.dialogue?.6:.65)):phase==='assemble'?clamp(age/(v.dialogue?.9:1.05)):1;
 let index=0;
 const inscription=(text,px,py,size,title=false)=>{
  for(const c of text){
   const n=index++,order=(n*.61803398875)%1,burn=phase==='burn'&&progress>order;
   if(phase!=='assemble'||progress>=order){
    ctx.globalAlpha=phase==='quiet'?clamp(age/.18):burn?clamp(1-(progress-order)*4):1;
    ctx.fillStyle=burn?'#ed7137':title?'#ddbf8f':'#c6bdab';
    relicLetters(ctx,c,px,py+(burn&&!reduced?-(progress-order)*9:0),size,title);
    if(burn&&!reduced){ctx.fillStyle='#8c7051';ctx.fillRect(px+Math.sin(n)*3,py-(progress-order)*18,size,size);}
   }
   px+=relicMeasure(c,size);
  }
 };
 t.titleLines.forEach((text,i)=>inscription(text,x,y+i*lineHeight*1.5,scale*1.15,true));
 t.pages[t.page].forEach((text,i)=>inscription(text,x,bodyY+i*lineHeight,scale));
 ctx.globalAlpha=1;
 if(t.pages.length>1){ctx.fillStyle='#ad9876';relicLetters(ctx,`< ${t.page+1} / ${t.pages.length} >`,x,(l.choiceTop-6)*ch,scale*.9);}
 const choices=v.dialogue?.choices??[];
 choices.forEach((choice,i)=>{
  const yy=(l.choiceTop+i*5)*ch,isSelected=i===v.selected;
  if(isSelected){
   ctx.fillStyle=v.heat?'#ffae59':'#9a532f';
   for(let k=0;k<6;k++)ctx.fillRect(x-8+(k%2),yy+k*ch*.55,Math.max(1,scale),ch*.7);
  }
  const choiceScale=Math.min(scale,((l.width-13)*cw)/Math.max(1,relicMeasure(choice.label)));
  ctx.fillStyle=isSelected?'#efd3a4':'#b4aa96';relicLetters(ctx,choice.label,x,yy+3,choiceScale);
  if(v.heat?.index===i){
   const p=clamp(v.heat.age/.24),w=(l.width-13)*cw;
   ctx.fillStyle='#6b321b';ctx.fillRect(x,yy+4.3*ch,w,Math.max(1,scale*.7));
   ctx.fillStyle='#f2b568';ctx.fillRect(x+w*p,yy+4.3*ch,Math.min(12,w*(1-p)),Math.max(1,scale));
  }
 });
 ctx.restore();
}
