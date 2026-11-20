import {MELEE_UNDEAD} from '../combat/melee-undead.js';
export function meleeUndeadParts(e){
 const profile=MELEE_UNDEAD[e.archetype];if(!profile)return null;
 const parts=[],n=Math.hypot(e.fx,e.fy),fx=n?e.fx/n:0,fy=n?e.fy/n:1;
 const P=(side,forward,z)=>[e.x+fy*side+fx*forward,e.y-fx*side+fy*forward,z];
 const add=(kind,v,c,w=1,r=0)=>parts.push({kind,v,c,w,r,hero:false,d:v.reduce((s,q)=>s+q[0]+q[1]+q[2]*.006,0)/v.length+(kind===1?.005:kind===2?.01:0)});
 const line=(v,c='#8e8473',w=3)=>add(1,v,c,w),poly=(v,c)=>add(0,v,c),dot=(p,r,c)=>add(2,[p],c,1,r);
 const guard=e.archetype==='ossuary-guard',grave=e.archetype==='gravebearer',bloated=e.archetype==='bloated-remnant';
 const w=bloated?.46:guard?.25:.17,h=guard?1.9:grave?1.5:bloated?1.38:1.65;
 if(e.hp<=0){poly([P(-w,-.5,.03),P(w,-.5,.03),P(w*.8,.55,.07),P(-w*.7,.65,.04)],'#393237');dot(P(0,-.62,.08),guard?8:6,'#847965');line([P(-w,0,.08),P(-w-.25,.35,.03)],'#6e6559',3);line([P(w,0,.08),P(w+.25,.4,.03)],'#6e6559',3);if(grave)poly([P(.2,.2,.04),P(.65,.2,.04),P(.65,.8,.04),P(.2,.8,.04)],'#575154');return parts;}
 const walk=Math.sin(e.walkDistance*(bloated?3:5.1))*(bloated?.045:.1),wind=e.mode==='windup'?Math.min(1,e.timer/profile.windup):0,hit=e.mode==='recover'?Math.max(0,1-e.timer/profile.recover):0;
 for(const s of [-1,1])line([P(s*w*.65,0,.7),P(s*w*.8,s*walk,.38),P(s*w,s*walk,.05)],bloated?'#57504b':'#70675d',bloated?11:5);
 const lean=grave?.25:bloated?.06:.02;
 poly([P(-w,lean,h-.45),P(w,lean,h-.45),P(w*.8,0,.6),P(-w*.8,0,.6)],guard?'#4d5056':bloated?'#73675c':'#363237');
 dot(P(0,lean,h-.12),bloated?6:8,'#a69880');
 if(guard){
  poly([P(-.48,.14,.65),P(-.12,.14,.65),P(-.1,.14,1.4),P(-.46,.14,1.46)],'#55585b');
  for(let i=0;i<3;i++)line([P(-.43+i*.12,.16,.76),P(-.4+i*.12,.16,1.35)],'#9d9078',3);
  const hand=P(.36,.1+hit*.5,1.05+wind*.35);line([P(.2,lean,h-.4),hand],'#8e8473',5);line([hand,[hand[0]+fx*.15,hand[1]+fy*.15,hand[2]+.45]],'#a8adb3',5);
 }else if(grave){
  const angle=-1.7+wind*2.5-hit*2.8,side=Math.sin(angle)*.8,forward=Math.cos(angle)*.8-.15,z=.06+wind*.7+hit*.35;
  const hand=P(.15,.25+wind*.15,1.05);line([P(.13,lean,1.2),hand],'#8e8473',5);
  const end=P(side,forward,z);line([hand,P(side*.5,forward*.5,.3+wind*.6),end],'#777b80',2);
  poly([P(side-.24,forward-.34,z),P(side+.24,forward-.34,z),P(side+.24,forward+.34,z),P(side-.24,forward+.34,z)],'#777173');
 }else if(bloated){
  for(let i=0;i<3;i++)line([P(-w,.02,.7+i*.17),P(0,.22,.67+i*.17),P(w,.02,.7+i*.17)],'#30292d',4);
  for(const s of [-1,1])line([P(s*w,lean,1.03),P(s*(w+.12),.12,.75),P(s*w,.22+hit*.45,.6+wind*.2)],'#8b7d6a',8);
 }else{
  for(const s of [-1,1])line([P(s*.16,.08,1.21),P(s*.31,.02,.9),P(s*.22,.18+hit*.5,1+wind*.22)],'#938777',4);
  line([P(-.16,.1,1.3),P(.16,.1,.72)],'#777c83',2);line([P(0,.1,1.22),P(.09,.1,.8)],'#aca08c',2);
 }
 if(wind)line([P(-.12,lean,h+.1),P(.12,lean,h+.1)],'#b78c60',2);
 return parts;
}
