const mix=(a,b,t)=>a+(b-a)*t;
const localWorld=(e,h,x,y)=>[e.x+Math.sin(h)*x+Math.cos(h)*y,e.y-Math.cos(h)*x+Math.sin(h)*y];
export function updateGolemMotion(e,dt,before){
 if(e?.archetype!=='corpse-golem'||!(e.hp>0)||e.mode==='dead'||!Number.isFinite(dt)||dt<=0||![e.x,e.y,e.fx,e.fy,before.x,before.y].every(Number.isFinite))return;
 const target=Math.atan2(e.fy,e.fx),old=e.golemMotion,heading=old?old.heading+Math.atan2(Math.sin(target-old.heading),Math.cos(target-old.heading))*(1-Math.exp(-dt*8)):target;
 const speed=mix(old?.speed??0,Math.hypot(e.x-before.x,e.y-before.y)/dt,1-Math.exp(-dt*8)),nominal=[localWorld(e,heading,-.48,.12),localWorld(e,heading,.48,.12)];
 let feet=old?old.feet.map(f=>({...f,start:[...f.start],goal:[...f.goal],p:[...f.p]})):nominal.map(p=>({p:[...p],start:[...p],goal:[...p],t:1,lift:0})),next=old?.next??0;
 const active=feet.findIndex(f=>f.t<1),dist=i=>Math.hypot(feet[i].p[0]-nominal[i][0],feet[i].p[1]-nominal[i][1]);
 if(active<0&&e.hp>0&&Math.max(dist(0),dist(1))>.3){if(dist(next)<.2)next=1-next;const goal=nominal[next].map((v,i)=>v+[Math.cos(heading),Math.sin(heading)][i]*Math.min(.14,speed*.25));feet[next]={...feet[next],start:[...feet[next].p],goal,t:0,lift:0};next=1-next;}
 feet=feet.map(f=>{if(f.t>=1)return {...f,lift:0};const t=Math.min(1,f.t+dt/.38),u=.5-.5*Math.cos(Math.PI*t);return {...f,t,p:f.start.map((v,i)=>mix(v,f.goal[i],u)),lift:Math.sin(Math.PI*t)*.10};});
 e.golemMotion={heading,speed,feet,next};
}
export function golemMotionPose(e){
 const m=e.golemMotion,h=m?.heading??Math.atan2(e.fy,e.fx),fx=Math.cos(h),fy=Math.sin(h);
 const feet=m?m.feet.map(f=>{const x=f.p[0]-e.x,y=f.p[1]-e.y;return[fy*x-fx*y,fx*x+fy*y,f.lift];}):[[-.48,.12,0],[.48,.12,0]];
 return {heading:h,feet,bob:m?Math.sin((e.walkDistance??0)*5)*.012*Math.min(1,m.speed*2):0};
}
