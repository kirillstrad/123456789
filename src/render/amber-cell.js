export function shadeAmberCell(data,k,base,warmth,hero=false){
 if(!Number.isFinite(base)||base<0)base=0;if(!Number.isFinite(warmth))warmth=0;
 const t=Math.max(0,Math.min(1,warmth))*(hero?.65:1),r=data[k]*base*(1+.08*t),g=data[k+1]*base*(1-.28*t),b=data[k+2]*base*(1-.68*t),peak=Math.max(r,g,b),cap=hero?238:245,gain=peak>cap?cap/peak:1;
 data[k]=r*gain;data[k+1]=g*gain;data[k+2]=b*gain;
}
