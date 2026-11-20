export function blendEngineText(pixels,width,height,annotations,glyphFor){
 function blend(x,y,c,alpha){if(x<0||y<0||x>=width||y>=height||alpha<=0)return;const k=(y*width+x)*4,old=pixels[k+3]/255,a=alpha+old*(1-alpha);if(!a)return;for(let i=0;i<3;i++)pixels[k+i]=(c[i]*alpha+pixels[k+i]*old*(1-alpha))/a;pixels[k+3]=a*255;}
 for(const item of annotations){
  if(!item||![item.x,item.y].every(Number.isFinite))continue;
  const size=Math.max(6,Math.min(22,Math.round(item.size??12))),text=String(item.text??''),advance=Math.max(1,Math.round(size*.62)),length=text.length*advance,color=item.color??[220,205,180],alpha=Math.max(0,Math.min(1,item.alpha??1));
  let x=Math.round(item.x-(item.align==='center'?length/2:item.align==='right'?length:0)),y=Math.round(item.y-(item.baseline==='alphabetic'?size*.82:item.baseline==='middle'?size*.5:0));
  for(const char of text){const glyph=glyphFor(char,size);for(const [dx,dy,a]of glyph)blend(x+dx+1,y+dy+1,[3,4,6],a*alpha);for(const [dx,dy,a]of glyph)blend(x+dx,y+dy,color,a*alpha);x+=advance;}
 }
}
