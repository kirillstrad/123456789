import {relicLetters,relicMeasure} from './relic-font.js';
export function paintChapelPrompt(ctx,gate,{width,height,hidden=false}={}){
 if(hidden||!gate?.near)return;
 const w=Math.min(760,width-40),x=(width-w)/2,y=height-160;
 ctx.save();try{
  ctx.globalAlpha=1;ctx.fillStyle='#121113';ctx.fillRect(x,y,w,61);
  ctx.fillStyle=gate.ready?'#c4a376':'#756957';ctx.fillRect(x,y,w,2);ctx.fillRect(x,y+59,w,2);
  for(const side of [0,1]){const X=x+side*(w-10);ctx.fillRect(X,y+3,10,55);}
  const label=(text,Y,scale,title)=>{const size=Math.min(scale,(w-40)/Math.max(1,relicMeasure(text)));ctx.fillStyle=title?'#e0c799':'#c9c0af';relicLetters(ctx,text,width/2-relicMeasure(text,size)/2,Y,size,title);};
  label(gate.title,y+10,1.65,true);label(gate.text,y+36,1.25,false);
 }finally{ctx.restore();}
}
