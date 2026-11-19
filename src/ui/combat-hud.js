import {LAMP_LIFE} from '../combat/lamp-life.js';
const clamp=x=>Math.max(0,Math.min(1,x));
const transition=(old,target,dt)=>old===undefined?target:target+(old-target)*Math.exp(-dt/.10);
const displays=new WeakMap();

function frame(ctx,x,y,w){
 const h=88;
 const metal=ctx.createLinearGradient(0,y,0,y+h);
 for(const [at,color] of [[0,'#46383b'],[.18,'#211c20'],[.78,'#131014'],[1,'#34262a']])metal.addColorStop(at,color);
 ctx.beginPath();
 [[16,0],[w-16,0],[w,16],[w,h-16],[w-16,h],[16,h],[0,h-16],[0,16]].forEach(([a,b],i)=>i?ctx.lineTo(x+a,y+b):ctx.moveTo(x+a,y+b));
 ctx.closePath();ctx.fillStyle=metal;ctx.fill();ctx.strokeStyle='#80604c';ctx.stroke();
 ctx.save();ctx.clip();ctx.strokeStyle='#59434a';ctx.strokeRect(x+5,y+5,w-10,h-10);
 for(let i=42;i<w-36;i+=16){
  ctx.beginPath();ctx.moveTo(x+i-5,y+h-6);ctx.quadraticCurveTo(x+i,y+h-16,x+i+5,y+h-6);ctx.stroke();
 }
 for(const side of [-1,1]){
  ctx.save();ctx.translate(side===1?x+8:x+w-8,y+9);ctx.scale(side,1);
  ctx.fillStyle='#40383c';ctx.strokeStyle='#76656a';
  ctx.beginPath();ctx.moveTo(0,11);ctx.lineTo(11,0);ctx.lineTo(34,0);ctx.lineTo(24,10);ctx.lineTo(12,15);ctx.lineTo(0,32);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#19151a';ctx.beginPath();ctx.moveTo(17,2);ctx.lineTo(14,7);ctx.lineTo(20,10);ctx.moveTo(14,7);ctx.lineTo(9,13);ctx.stroke();
  ctx.fillStyle='#662931';ctx.beginPath();ctx.moveTo(3,19);ctx.bezierCurveTo(9,17,5,29,4,34);ctx.lineTo(1,29);ctx.closePath();ctx.fill();ctx.restore();
 }
 ctx.restore();
}

function meter(ctx,x,y,w,value,color){
 ctx.fillStyle='#09080a';ctx.fillRect(x,y,w,8);
 ctx.strokeStyle='#604850';ctx.strokeRect(x,y,w,8);
 ctx.fillStyle=color;ctx.fillRect(x+1,y+1,(w-2)*clamp(value),6);
}

export function drawCombatHud(ctx,hud,s,ready,cooldown,width,hint){
 const old=displays.get(hud);
 const fresh=!old||s.time<old.time;
 const dt=fresh?0:Math.min(.1,s.time-old.time);
 if(ready&&!hud.ready)hud.at=s.time;
 hud.ready=ready;
 const flash=ready&&s.time-hud.at<.22;
 const ember=s.lamp>0&&s.lamp<=LAMP_LIFE.lastEmber;
 const lamp=clamp(s.lamp/LAMP_LIFE.max);
 const charge=cooldown>0?clamp(1-(s.dashCooldown??0)/cooldown):1;
 const alpha=ember||hint?.text||!ready||flash?1:.82;
 const display={time:s.time,lamp:fresh||ember||s.lamp===0?lamp:transition(old.lamp,lamp,dt),dash:fresh||s.dash||ready?(s.dash?0:charge):transition(old.dash,charge,dt),alpha:fresh?alpha:transition(old.alpha,alpha,dt)};
 displays.set(hud,display);
 const w=Math.min(width-24,960),x=(width-w)/2,y=754;
 if(w<76)return;
 const compact=w<690,bar=Math.min(210,Math.floor(w*.37)),left=x+24,right=x+w-24;
 const labelY=y+(compact?42:34),meterY=labelY+14;
 ctx.save();ctx.lineWidth=1;
 ctx.save();ctx.globalAlpha*=display.alpha;frame(ctx,x,y,w);ctx.restore();
 ctx.font='bold 14px monospace';ctx.textBaseline='middle';ctx.textAlign='left';
 ctx.fillStyle=ember?'#ff9a83':'#f1cd96';ctx.fillText(ember?'ПОСЛЕДНИЙ УГОЛЁК':'LAMP',left,labelY,bar);
 meter(ctx,left,meterY,bar,display.lamp,ember?'#ed6d62':'#c98849');
 ctx.font='12px monospace';ctx.fillStyle='#dfc6af';ctx.fillText(`${Math.ceil(s.lamp)} / ${LAMP_LIFE.max}`,left,meterY+19);
 ctx.textAlign='right';const dashColor=flash?'#fff1ba':ready?'#edbf79':'#a89999';ctx.fillStyle=dashColor;
 ctx.fillText(ready?'РЫВОК · ГОТОВ':charge>=1?'РЫВОК · ЗАНЯТ':'РЫВОК · ПЕРЕЗАРЯДКА',right,labelY,bar);
 meter(ctx,right-bar,meterY,bar,display.dash,dashColor);
 if(hint?.text){ctx.textAlign='center';ctx.fillStyle='#ffe0b6';ctx.fillText(hint.text,width/2,compact?y+20:y+45,compact?w-60:w-2*bar-66);}
 ctx.restore();
}
