const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function relicStages(amount){
 return {flash:Math.sin(clamp(amount/.12)*Math.PI),bolts:smooth((amount-.08)/.18),split:smooth((amount-.25)/.15),lift:smooth((amount-.37)/.54),seat:smooth((amount-.91)/.09)};
}
export function relicLayout(cols,rows,v){
 const cx=cols/2,gemY=rows-9,stages=relicStages(v.amount),spread=v.spread??(v.dialogue?1:0);
 const width=Math.min(cols-16,Math.round(cols*(.40+.18*spread))),height=Math.min(rows-28,46+48*spread);
 const bottom=gemY-6-18*spread+(1-stages.lift)*(height+20),top=bottom-height+Math.sin(stages.seat*Math.PI)*.6;
 const left=cx-width/2,right=cx+width/2,wing=10*spread*stages.split;
 const choices=v.dialogue?.choices??[],choiceTop=top+height-5-choices.length*5;
 return {cx,gemY,width,height,top,left,right,bottom,wing,choiceTop,stages,ready:v.amount>=.999&&(!v.dialogue||spread>=.999)};
}
export function relicHit(cols,rows,v,x,y){
 const l=relicLayout(cols,rows,v);
 if(Math.abs(x-l.cx)<=5&&Math.abs(y-l.gemY)<=5)return {kind:'gem'};
 if(v.amount<.01)return null;
 if(x<l.left-l.wing-4||x>l.right+l.wing+4||y<l.top-1||y>l.bottom+10)return null;
 if(l.ready&&x>=l.left+5&&x<=l.right-5){
  const index=Math.floor((y-l.choiceTop)/5);
  if(index>=0&&index<(v.dialogue?.choices.length??0))return {kind:'choice',index};
  if(y>l.choiceTop-7&&y<l.choiceTop-2)return {kind:x<l.cx?'previous':'next'};
 }
 return {kind:'panel'};
}
export function wrapRelic(text,columns){
 columns=Math.max(1,Math.floor(columns));const result=[];
 for(const para of String(text).toUpperCase().split('\n')){
  let line='';
  for(const word of para.split(/\s+/)){
   if(!word)continue;
   if(line&&line.length+1+word.length>columns){result.push(line);line='';}
   let rest=word;
   while(rest.length>columns){if(line){result.push(line);line='';}result.push(rest.slice(0,columns));rest=rest.slice(columns);}
   line+=(line?' ':'')+rest;
  }
  result.push(line);
 }
 return result;
}
export function relicTextLayout(cols,rows,width,height,v){
 const l=relicLayout(cols,rows,v),cw=width/cols,ch=height/rows;
 const scale=Math.max(.8,Math.min(1.8,cw*.29)),lineHeight=10*scale;
 const columns=Math.max(8,Math.floor((l.width-12)*cw/(6*scale)));
 const title=v.dialogue?.speaker??v.shown?.title??'NO ACTIVE OBJECTIVE';
 const text=v.dialogue?.text??v.shown?.text??'';
 const titleLines=wrapRelic(title,Math.max(8,Math.floor(columns/1.15)));
 const y=(l.top+6)*ch,titleHeight=titleLines.length*lineHeight*1.5;
 const bodyY=y+titleHeight+lineHeight*.5;
 const perPage=Math.max(1,Math.floor(((l.choiceTop-9)*ch-bodyY)/lineHeight));
 const lines=wrapRelic(text,columns),pages=[];
 for(let i=0;i<lines.length;i+=perPage)pages.push(lines.slice(i,i+perPage));
 return {l,cw,ch,scale,lineHeight,columns,titleLines,x:(l.left+6)*cw,y,bodyY,pages,page:Math.max(0,Math.min(pages.length-1,v.page??0))};
}
