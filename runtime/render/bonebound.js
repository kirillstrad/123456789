export function boneboundParts(e){
const parts=[],P=(x,y,z)=>[e.x+x,e.y+y,z];
const line=(v,c='#b9ab8c',w=3)=>parts.push({kind:1,v,c,w,hero:false,d:v.reduce((a,p)=>a+p[0]+p[1]+p[2]*.006,0)/v.length+.005});
const dot=(v,r,c)=>parts.push({kind:2,v:[v],r,c,hero:false,d:v[0]+v[1]+v[2]*.006+.01});
if(e.hp<=0){line([P(0,-.45,.06),P(0,.4,.06)]);for(const s of [-1,1]){line([P(0,0,.06),P(s*.3,.4,.03)]);line([P(0,-.2,.06),P(s*.28,-.5,.03)]);}dot(P(0,-.55,.08),7,'#b9ab8c');return parts;}
const walk=e.walkDistance*5.13,wind=e.mode==='windup'?Math.min(1,e.timer/.72):0,strike=e.mode==='recover'?Math.max(0,1-e.timer/.8):0;
for(const s of [-1,1]){const step=Math.sin(walk)*.1*s;line([P(s*.1,0,.68),P(s*.14,step*.5,.35),P(s*.16,step,.05)],'#a99c81',4);}
line([P(0,0,.65),P(0,0,1.27)],'#c9bc9e',4);
for(let i=0;i<5;i++){const z=.87+i*.075,w=.19-i*.014;line([P(-w,0,z),P(0,.09,z-.06),P(w,0,z)],'#b9ab8c',2.5);}
line([P(-.19,0,1.24),P(.19,0,1.24)]);dot(P(0,0,1.45),9,'#c9bc9e');dot(P(-.06,.035,1.48),2,'#17151a');dot(P(.06,.035,1.48),2,'#17151a');
const hand=P(.3+e.fx*strike*.4,e.fy*strike*.4,1.02+wind*.3);line([P(.19,0,1.24),hand],'#b9ab8c',4);line([hand,[hand[0]+.08,hand[1]-.03,hand[2]+.48]],'#97979c',4);line([P(-.19,0,1.24),P(-.3,.05,1),P(-.25,.14,.79)]);
if(wind)dot(P(0,0,1.85),3,'#c58a52');return parts;
}
