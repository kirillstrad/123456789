import {manifestLayout,smooth} from './manifest-layout.js';
const clamp=x=>Math.max(0,Math.min(1,x));

export function paintManifest(frame,cols,rows,view,time=0,reduced=false){
 const l=manifestLayout(cols,rows,view);
 const put=(x,y,r,g=r*.94,b=r*.84)=>{
  x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=cols||y>=rows)return;
  const i=(y*cols+x)*4;frame[i]=r;frame[i+1]=g;frame[i+2]=b;frame[i+3]=255;
 };
 const rect=(x,y,w,h,r,g,b)=>{for(let yy=Math.ceil(y);yy<y+h;yy++)for(let xx=Math.ceil(x);xx<x+w;xx++)put(xx,yy,r,g,b);};
 if(view.amount>.005){
  if(l.dialogue){
   const wing=7*smooth(view.amount);
   rect(l.left-wing,l.top+5,wing,l.height-9,29);
   rect(l.right,l.top+5,wing,l.height-9,29);
   rect(l.left-wing,l.top+5,1,l.height-9,74);
   rect(l.right+wing-1,l.top+5,1,l.height-9,74);
  }
  rect(l.left+1,l.top+2,l.width,l.height+1,5,6,8);
  rect(l.left,l.top,l.width,l.height,47);
  rect(l.left,l.top,l.width,1,105);
  rect(l.left,l.top+1,1,l.height-2,78);
  rect(l.right-1,l.top+1,1,l.height-2,24);
  rect(l.left+2,l.top+3,l.width-4,l.height-7,18,19,21);
  rect(l.left+3,l.top+4,l.width-6,1,8,9,10);
  rect(l.left,l.bottom-3,l.width,1,79);
  rect(l.left+1,l.bottom-2,l.width-2,2,29);
  // Two palms, thumbs and four fingers, rendered in the same cell buffer.
  for(const side of [-1,1]){
   const handX=side<0?l.left-3:l.right-2,handY=l.bottom-6;
   rect(handX+1,handY+5,4,10,34,29,26);
   rect(handX,handY+1,6,7,55,46,39);
   rect(handX+(side<0?4:-1),handY,2,5,75,62,48);
   for(let finger=0;finger<4;finger++){
    rect(handX+finger,handY-3+(finger%2),1,6,70-finger*5,57-finger*4,44-finger*3);
    put(handX+finger,handY+1,34,27,23);
   }
   rect(handX+1,handY+8,4,1,86,66,45);
  }
 }
 // The fire-stone stays between the two resource spheres.
 const flicker=reduced?0:view.unread?.18*Math.sin(time*7)+.09*Math.sin(time*13):.035*Math.sin(time*1.6);
 for(let dy=-4;dy<=4;dy++)for(let dx=-5;dx<=5;dx++){
  const d=Math.abs(dx)/4+Math.abs(dy)/3;
  if(d>1.45)continue;
  if(d>1){put(l.cx+dx,l.gemY+dy,dy<0?88:32);continue;}
  const glow=clamp(1-d*.55+flicker);
  put(l.cx+dx,l.gemY+dy,150*glow+50,55*glow+18,12+glow*13);
 }
 return l;
}

function wrap(text,width,measure){
 const lines=[];
 for(const paragraph of String(text).split('\n')){
  let line='';
  for(const char of paragraph){
   if(line&&measure(line+char)>width){lines.push(line);line='';}
   line+=char;
  }
  lines.push(line);
 }
 return lines;
}

export function drawManifestText(ctx,cols,rows,height,view,time=0,reduced=false){
 if(view.amount<.98)return;
 const l=manifestLayout(cols,rows,view),cw=ctx.canvas.width/cols,ch=height/rows;
 const text=view.dialogue?{title:view.dialogue.speaker,text:view.dialogue.text}:view.shown??{title:'ЦЕЛЬ НЕ ЗАДАНА',text:''};
 const size=Math.max(11,Math.min(17,ch*2.5)),lineHeight=size*1.38;
 const x=(l.left+5)*cw,y=(l.top+5)*ch,maxWidth=(l.width-10)*cw;
 ctx.save();ctx.beginPath();ctx.rect((l.left+3)*cw,(l.top+3)*ch,(l.width-6)*cw,(l.height-7)*ch);ctx.clip();
 ctx.font=`${size}px monospace`;ctx.textBaseline='top';ctx.textAlign='left';
 const lines=[...wrap(text.title,maxWidth,t=>ctx.measureText(t).width),'',...wrap(text.text,maxWidth,t=>ctx.measureText(t).width)];
 const choiceTop=view.dialogue?l.top+l.height-5-view.dialogue.choices.length*5:l.bottom-4;
 const maxLines=Math.max(1,Math.floor(((choiceTop-2)*ch-y)/lineHeight));
 let index=0;
 const phase=view.dialogue?'idle':view.phase;
 const progress=phase==='burn'?clamp(view.age/.65):phase==='assemble'?clamp(view.age/1.05):1;
 const total=lines.join('').length||1;
 lines.slice(0,maxLines).forEach((line,row)=>{
  let px=x;
  for(const char of line){
   const n=index++,order=(n*.61803398875)%1;
   const burn=phase==='burn'&&progress>order;
   const shown=phase!=='assemble'||progress>=order;
   const width=ctx.measureText(char).width;
   if(shown){
    ctx.globalAlpha=burn?Math.max(0,1-(progress-order)*4):1;
    ctx.fillStyle=burn?'#ff7130':row===0?'#e3c79b':'#d1c7b4';
    const dy=burn&&!reduced?-(progress-order)*9:0;
    ctx.fillText(char,px,y+row*lineHeight+dy);
    if(burn&&!reduced){
     ctx.fillStyle='#9d7953';ctx.globalAlpha=Math.max(0,.5-(progress-order));
     ctx.fillText('·',px+Math.sin(n)*3,y+row*lineHeight-6-(progress-order)*18);
    }
   }
   px+=width;
  }
 });
 ctx.globalAlpha=1;
 if(lines.length>maxLines){ctx.fillStyle='#b8a58b';ctx.fillText('…',x+maxWidth-size,y+(maxLines-1)*lineHeight);}
 if(view.dialogue){
  view.dialogue.choices.forEach((choice,i)=>{
   const yy=(choiceTop+i*5)*ch;
   if(i===view.selected){ctx.fillStyle='#39261e';ctx.fillRect(x-4,yy,maxWidth+8,5*ch-2);}
   ctx.fillStyle=i===view.selected?'#ffe0a5':'#c1b4a2';
   const label=(i===view.selected?'› ':'  ')+choice.label;
   const rows=wrap(label,maxWidth,t=>ctx.measureText(t).width);
   ctx.fillText(rows[0]+(rows.length>1?'…':''),x,yy+2,maxWidth);
  });
 }
 ctx.restore();
}
