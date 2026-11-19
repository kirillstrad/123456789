const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function interactionCamera(s,base,doorPassable){
 const frame=s.interactionAnimation;
 if(s.phase!=='playing'||s.execution||!frame||!['door','ignite'].includes(frame.kind))return base;
 const door=frame.kind==='door';
 const contact=frame.doorContact?.points?.[0]??frame.lightContact?.point??frame.lightContact?.target;
 const target=Array.isArray(contact)&&contact.length===3&&contact.every(Number.isFinite)?contact:[s.x+s.fx*.55,s.y+s.fy*.55,.85];
 const fade=door?(doorPassable?smooth((frame.progress-.6)/.4):0):smooth((frame.progress-.68)/.32);
 const weight=smooth(frame.elapsed/.24)*(1-fade);
 return {focusX:(s.x+target[0])/2,focusY:(s.y+target[1])/2,focusZ:(1+target[2])/2,zoom:1+weight*(door?.12:.17),weight,shakeX:0,shakeY:0};
}
