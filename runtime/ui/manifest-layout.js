export const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function manifestLayout(cols,rows,view){
 const cx=cols/2,gemY=rows-9,dialogue=!!view.dialogue;
 const width=Math.min(cols-8,Math.round(cols*(dialogue?.55:.38)));
 const height=dialogue?Math.min(89,rows-30):Math.min(45,rows-28);
 const top=(rows+3)+(gemY-height-5-(rows+3))*smooth(view.amount);
 return {cx,gemY,left:cx-width/2,top,width,height,right:cx+width/2,bottom:top+height,dialogue};
}
export function manifestHit(cols,rows,view,x,y){
 const l=manifestLayout(cols,rows,view);
 if(Math.abs(x-l.cx)<=5&&Math.abs(y-l.gemY)<=5)return {kind:'gem'};
 if(view.amount<=.02)return null;
 const wing=l.dialogue?7*smooth(view.amount):0;
 if(x<l.left-wing-4||x>l.right+wing+4||y<l.top-1||y>l.bottom+10)return null;
 if(l.dialogue&&view.amount>=.98){
  const first=l.top+l.height-5-view.dialogue.choices.length*5;
  const index=Math.floor((y-first)/5);
  if(x>=l.left+4&&x<=l.right-4&&index>=0&&index<view.dialogue.choices.length)return {kind:'choice',index};
 }
 return {kind:'panel'};
}
