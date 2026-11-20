const clamp=x=>Math.max(0,Math.min(1,x));
const base=p=>p.interactionSource??p;
function tint(c,amount){const rgb=Array.isArray(c)?c:typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)):null;return rgb?.length===3?rgb.map((n,i)=>Math.round(n+([239,191,128][i]-n)*amount)):c;}
const depth=v=>v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length+.005;
export function proximityFeedback({parts=[],targets=[],actor=null,time=0,enabled=true,reducedMotion=false,radius=2.8}={}){
 const clean=parts.filter(p=>!p.interactionVapor).map(base);
 if(!enabled||!actor||![actor.x,actor.y,time,radius].every(Number.isFinite)||radius<=0)return clean;
 const present=new Set(clean),counts=new Map();for(const t of targets)counts.set(t.id,(counts.get(t.id)??0)+1);
 const nearby=targets.filter(t=>counts.get(t.id)===1&&t.availability==='ready'&&t.visible!==false&&t.enabled!==false&&!t.removed&&t.approach&&[t.approach.x,t.approach.y].every(Number.isFinite)&&Array.isArray(t.parts)&&t.parts.some(p=>present.has(p)&&(p.alpha??1)>0)).map(t=>({t,d:Math.hypot(actor.x-t.approach.x,actor.y-t.approach.y)})).filter(q=>q.d<radius).sort((a,b)=>a.d-b.d||String(a.t.id).localeCompare(String(b.t.id))).slice(0,3);
 const boosts=new Map(),vapor=[];
 for(const {t,d}of nearby){const strength=clamp(1-d/radius)**1.4;for(const p of t.parts)if(present.has(p))boosts.set(p,Math.max(boosts.get(p)??0,strength));let seed=0;for(const c of String(t.id))seed=(seed*31+c.charCodeAt(0))>>>0;
  const contact=t.contactPoint,anchor=Array.isArray(contact)&&contact.length===3&&contact.every(Number.isFinite)?contact:[t.approach.x,t.approach.y,Number.isFinite(t.approach.z)?t.approach.z:0];
  for(let i=0;i<5;i++){const spark=i>=3,phase=reducedMotion?(i+.5)/5:((time*(spark?.57:.22)+i/5+(seed%97)/97)%1+1)%1,fade=Math.sin(Math.PI*phase)*strength;if(fade<.015)continue;const sway=Math.sin(phase*5+i+seed)*.09,x=anchor[0]+Math.cos(i*2.4+seed)*.18+sway,y=anchor[1]+Math.sin(i*2.4+seed)*.18,z=anchor[2]+.1+phase*(spark?.85:.65),v=spark?[[x-.035,y,z],[x+.035,y,z],[x,y,z],[x,y,z+.09]]:[[x,y,z],[x+.055,y-.035,z+.07],[x+.025,y+.035,z+.15]];vapor.push({kind:1,v,c:spark?[255,205,123]:[216,176,130],w:spark?2:2.2,alpha:.4*fade,hero:false,d:depth(v),interactionVapor:true,effectKind:spark?'spark':'smoke'});}
 }
 return[...clean.map(p=>boosts.has(p)?{...p,c:tint(p.c,.32*boosts.get(p)),interactionSource:p}:p),...vapor].sort((a,b)=>a.d-b.d);
}
