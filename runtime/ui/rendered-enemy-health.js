const histories=new WeakMap();
const clamp=x=>Math.max(0,Math.min(1,x));
export function enemyBarLayout(width,{boss=false,y=12}={}){
 const cap=boss?34:22,available=Math.max(40,width-2*cap-12),barWidth=Math.min(available,boss?920:310,Math.max(boss?300:200,width*(boss?.60:.21))),barHeight=boss?29:15;
 const x=(width-barWidth)/2,barY=y+22;
 return {x,barY,barWidth,barHeight,cap,nameY:y+11,numbersY:barY+barHeight+15,bottom:barY+barHeight+36};
}
function path(ctx,points,fill,stroke=null,lineWidth=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}}
function gradient(ctx,x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x+w,y+h);for(const [p,c]of stops)g.addColorStop(p,c);return g;}
function cap(ctx,x,y,h,side){
 const P=(a,b)=>[x+side*a*(h/22),y+b*(h/22)],gold=gradient(ctx,x,y,0,h,[[0,'#dfc47b'],[.28,'#9b793c'],[.55,'#514023'],[.78,'#ac8747'],[1,'#302919']]);
 path(ctx,[P(1,2),P(8,-1),P(15,1),P(22,7),P(16,10),P(20,15),P(11,16),P(5,20),P(0,17),P(3,11),P(-1,8)],gold,'#1c1b13',1.3);
 path(ctx,[P(1,6),P(8,3),P(5,9),P(13,8),P(8,13),P(13,15),P(4,15),P(5,11),P(0,10)],'#756039','#c5a765',.7);
 ctx.beginPath();ctx.moveTo(...P(5,5));ctx.lineTo(...P(17,7));ctx.lineTo(...P(11,11));ctx.lineTo(...P(15,14));ctx.strokeStyle='#e1c88d';ctx.lineWidth=.75;ctx.stroke();
 path(ctx,[P(2,7),P(6,9),P(2,12),P(0,9)],'#342c20','#b49a5b',.7);
}
export function paintRenderedEnemyHealth(ctx,e,{width,height=864,y=12,boss=false,time=null,available=false}={}){
 if(!ctx||!Number.isFinite(width)||width<120||!e||![e.hp,e.maxHp].every(Number.isFinite)||e.maxHp<=0||e.hp<0)return;
 const l=enemyBarLayout(width,{boss,y}),hp=Math.max(0,Math.min(e.maxHp,e.hp)),target=hp/e.maxHp,now=Number.isFinite(time)?time:(globalThis.performance?.now?.()??0)/1000;
 let cache=histories.get(ctx);if(!cache){cache=new Map();histories.set(ctx,cache);}const key=(boss?'boss:':'target:')+(e.id??e.name??'enemy'),old=cache.get(key),reset=!old||old.max!==e.maxHp||now<old.time,dt=old?Math.max(0,Math.min(.1,now-old.time)):0;
 const fraction=hp===0?0:reset?target:old.fraction+(target-old.fraction)*(1-Math.exp(-dt/.11));cache.set(key,{fraction,time:now,max:e.maxHp});if(cache.size>64)cache.delete(cache.keys().next().value);
 const x=l.x,Y=l.barY,W=l.barWidth,H=l.barHeight;
 ctx.save();try{
  ctx.globalAlpha=1;ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
  // Recessed dark channel, thin bevelled metal, and mirrored carved end pieces.
  ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=4;ctx.shadowOffsetY=2;
  path(ctx,[[x-2,Y-2],[x+W+2,Y-2],[x+W+2,Y+H+2],[x-2,Y+H+2]],'#100c0b','#2c261a',1.5);
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.fillStyle=gradient(ctx,x,Y,0,H,[[0,'#070607'],[.5,'#211011'],[1,'#080609']]);ctx.fillRect(x,Y,W,H);
  const fill=Math.min(W-4,Math.max(0,(W-4)*fraction));
  if(fill>0){ctx.fillStyle=gradient(ctx,x,Y+2,0,H-4,[[0,'#d03028'],[.2,'#ad1517'],[.55,'#72090e'],[.82,'#52060b'],[1,'#8b171a']]);ctx.fillRect(x+2,Y+2,fill,H-4);ctx.fillStyle='rgba(245,101,67,.32)';ctx.fillRect(x+3,Y+3,Math.max(0,fill-2),1);ctx.fillStyle='rgba(37,1,7,.5)';ctx.fillRect(x+2,Y+H-4,fill,2);}
  ctx.strokeStyle='#a58b4d';ctx.lineWidth=1;ctx.strokeRect(x-.5,Y-.5,W+1,H+1);ctx.strokeStyle='#ddc48b';ctx.beginPath();ctx.moveTo(x,Y-1);ctx.lineTo(x+W,Y-1);ctx.stroke();
  ctx.strokeStyle='#302719';ctx.beginPath();ctx.moveTo(x,Y+H+1);ctx.lineTo(x+W,Y+H+1);ctx.stroke();
  cap(ctx,x,Y-2,H+4,-1);cap(ctx,x+W,Y-2,H+4,1);
  for(const u of [.25,.5,.75])path(ctx,[[x+W*u-4,Y-2],[x+W*u,Y-5],[x+W*u+4,Y-2],[x+W*u,Y]],'#90713b','#c5a766',.5);
  ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font=`${boss?16:13}px Georgia,serif`;ctx.fillStyle=boss?'#b29ac9':'#d1c1a9';ctx.shadowColor='#000';ctx.shadowBlur=2;
  let name=String(e.name??(boss?'CORPSE GOLEM':'UNDEAD')).replace(/[\r\n\t]/g,' ').toUpperCase();
  while(name.length>4&&ctx.measureText(name).width>W+30)name=name.slice(0,-2)+'…';ctx.fillText(name,width/2,l.nameY);
  ctx.shadowBlur=0;ctx.font='10px Georgia,serif';ctx.fillStyle='#bfb4a2';ctx.fillText(`${Number(hp.toFixed(1))} / ${Number(e.maxHp.toFixed(1))}`,width/2,l.numbersY);
  if(boss&&available){ctx.font='12px Georgia,serif';ctx.fillStyle='#ddc9a0';ctx.fillText('R — Последний уголь',width/2,l.numbersY+18);}
 }finally{ctx.restore();}
}
