export function shadeAmberCell(data,k,base,warmth,hero=false){
 if(!Number.isFinite(base)||base<0)base=0;if(!Number.isFinite(warmth))warmth=0;
 const warm=Math.max(0,Math.min(1,warmth)),hot=Math.max(0,Math.min(1,(base-.7)/1.5)),t=warm*(hero?.65:1)*(1-.5*hot),shadow=(1-warm)*Math.max(0,Math.min(1,(.7-base)/.7));
 const r=data[k]*base*(1+.035*t-.12*shadow),g=data[k+1]*base*(1-.09*t-.035*shadow),b=data[k+2]*base*(1-.21*t+.10*shadow),peak=Math.max(r,g,b),cap=hero?238:245,gain=peak>cap?cap/peak:1;
 data[k]=r*gain;data[k+1]=g*gain;data[k+2]=b*gain;
}
