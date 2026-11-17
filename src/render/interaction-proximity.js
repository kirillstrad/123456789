const clamp=x=>Math.max(0,Math.min(1,x));
const base=p=>p.interactionSource??p;
function tint(c,amount){const rgb=Array.isArray(c)?c:typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)):null;return rgb?.length===3?rgb.map((n,i)=>Math.round(n+( [214,174,126][i]-n)*amount)):c;}
const depth=v=>v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length+.005;
export function proximityFeedback({parts=[],targets=[],actor=null,time=0,enabled=true,reducedMotion=false,radius=2.8}={}){
 const clean=parts.filter(p=>!p.interactionVapor).map(base);
 if(!enabled||!actor||![actor.x,actor.y,time,radius].every(Number.isFinite)||radius<=0)return clean;
 const present=new Set(clean),counts=new Map();for(const t of targets)counts.set(t.id,(counts.get(t.id)??0)+1);
 const nearby=targets.filter(t=>counts.get(t.id)===1&&t.availability==='ready'&&t.visible!==false&&t.enabled!==false&&!t.removed&&t.approach&&[t.approach.x,t.approach.y].every(Number.isFinite)&&Array.isArray(t.parts)&&t.parts.some(p=>present.has(p)&&(p.alpha??1)>0)).map(t=>({t,d:Math.hypot(actor.x-t.approach.x,actor.y-t.approach.y)})).filter(q=>q.d<radius).sort((a,b)=>a.d-b.d||String(a.t.id).localeCompare(String(b.t.id))).slice(0,3);
 const boosts=new Map(),vapor=[];
 for(const {t,d}of nearby){const strength=clamp(1-d/radius)**2;for(const p of t.parts)if(present.has(p))boosts.set(p,Math.max(boosts.get(p)??0,strength));let seed=0;for(const c of String(t.id))seed=(seed*31+c.charCodeAt(0))>>>0;
  for(let i=0;i<5;i++){const phase=reducedMotion?(i+.5)/5:((time*.24+i/5+(seed%97)/97)%1+1)%1,fade=Math.sin(Math.PI*phase)*strength;if(fade<.015)continue;const sway=Math.sin(phase*5+i+seed)*.065,x=t.approach.x+Math.cos(i*2.4+seed)*.13+sway,y=t.approach.y+Math.sin(i*2.4+seed)*.13,z=(t.approach.z??0)+.12+phase*.72,v=[[x,y,z],[x+.025,y-.015,z+.045],[x+.012,y+.02,z+.09]];vapor.push({kind:1,v,c:[204,157,107],w:1.3,alpha:.42*fade,hero:false,d:depth(v),interactionVapor:true});}
 }
 return[...clean.map(p=>boosts.has(p)?{...p,c:tint(p.c,.2*boosts.get(p)),interactionSource:p}:p),...vapor].sort((a,b)=>a.d-b.d);
}
