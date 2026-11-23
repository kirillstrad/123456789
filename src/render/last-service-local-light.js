export function lightExposure(g){
 if(!Number.isFinite(g))return 0;
 if(g<=.95)return Math.max(0,g);
 return .95+.55*(-Math.expm1(-(g-.95)/.55));
}
export function lastServiceLocalLights(sources,project,{width=1008,height=864}={}){
 return sources.filter(l=>l&&[l.x,l.y,l.groundZ??l.z,l.r,l.power].every(Number.isFinite)&&l.r>0&&l.power>0).map(l=>({p:project(l.x,l.y,l.groundZ??l.z),r:Math.min(156,l.r*1.16),power:Math.min(1.7,l.power*1.3)})).filter(l=>l.p.every(Number.isFinite)&&l.p[0]+l.r*3>=0&&l.p[0]-l.r*3<=width&&l.p[1]+l.r*3>=0&&l.p[1]-l.r*3<=height);
}
