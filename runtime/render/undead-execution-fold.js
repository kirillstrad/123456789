export function foldUndeadParts(parts,enemy,entry,visual,struggle=0){
 const u=visual.pin,fx=-entry.fx,fy=-entry.fy,t=entry.elapsed;
 return parts.map(p=>{
  const v=p.v.map(([x,y,z])=>{
   const dx=x-enemy.x,dy=y-enemy.y,side=fy*dx-fx*dy,forward0=fx*dx+fy*dy,forward=forward0*(1-u)+(z-.65)*.75*u,weight=Math.min(1,Math.abs(z-.65)*1.8),shake=Math.sin(t*16+z*9)*.055*struggle*weight;
   return[enemy.x+fy*(side+shake)+fx*forward,enemy.y-fx*(side+shake)+fy*forward,Math.max(.025,z*(1-u)+(.12+Math.abs(forward0)*.08)*u+Math.abs(Math.sin(t*19+z))*struggle*weight*.025)];
  });
  const char=enemy.charred?1:visual.char,c=Array.isArray(p.c)?p.c:typeof p.c==='string'&&/^#[0-9a-f]{6}$/i.test(p.c)?[1,3,5].map(i=>parseInt(p.c.slice(i,i+2),16)):[90,70,70];
  return{...p,v,c:c.map(n=>n*(1-char)+24*char),d:v.reduce((a,q)=>a+q[0]+q[1]+q[2]*.006,0)/v.length+(p.kind===1?.005:0)};
 });
}
