import {GOLEM_ATTACKS,golemFinisherFrame} from '../combat/corpse-golem.js';
import {sculptLighting} from './golem-volume-light.js';
import {golemMotionPose} from '../animation/golem-motion.js';
import {bossAccentPose} from '../animation/undead-motion.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mix=(a,b,t)=>t<=0?[...a]:t>=1?[...b]:a.map((v,i)=>v+(b[i]-v)*t);
const unit=v=>{const d=Math.hypot(...v);return d>1e-8?v.map(x=>x/d):[0,0,1];};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function golemAttackPose(e){
 const name=Object.hasOwn(GOLEM_ATTACKS,e.golemAttack)?e.golemAttack:'slam',a=GOLEM_ATTACKS[name];
 const rest=[.86,.04,.95],raised=name==='slam'?[.8,-.25,3.2]:name==='sweep'?[2.4,-.4,1.65]:[.7,.25,1.5];
 const impact=name==='slam'?[.18,2.1,.35]:name==='sweep'?[-2.1,1.25,1.4]:[.45,1.25,1.3],t=Math.max(0,Number.isFinite(e.timer)?e.timer:0);
 let hand=rest,lean=0;
 if(e.mode==='windup'){const u=Math.min(1,t/a.windup),ready=smooth(u/.75),strike=smooth((u-.78)/.22);hand=mix(mix(rest,raised,ready),impact,strike);lean=.12*ready;}
 else if(e.mode==='recover'){const u=smooth(t/a.recover);hand=mix(impact,rest,u);lean=.12*(1-u);}
 return {right:hand,left:[-.8,.3,.85],lean};
}
export function corpseGolemParts(e,state={}){
 const locomotion=e.hp>0&&!state.execution?golemMotionPose(e):null;
 const entry=state.execution?.kind==='corpse-golem'&&state.execution.targetId===e.id?state.execution:null;
 const dead=e.hp<=0&&!entry,fall=dead?(Number.isFinite(e.deathElapsed)?smooth(e.deathElapsed/.9):1):0;
 const f=entry?golemFinisherFrame(entry):{kneel:dead?1:0,open:0,burn:e.charred?1:0,fall,withdraw:0};
 const attack=entry?{right:[.86,.04,.95],left:[-.8,.3,.85],lean:0}:golemAttackPose(e);
 const rawX=entry?-entry.fx:locomotion?Math.cos(locomotion.heading):e.fx,rawY=entry?-entry.fy:locomotion?Math.sin(locomotion.heading):e.fy,n=Math.hypot(rawX,rawY),fx=n?rawX/n:0,fy=n?rawY/n:1;
 const accent=entry||dead?{head:0,jaw:0,grip:0,shoulder:0}:bossAccentPose(e,state.time??0);
 const tilt=f.fall*1.5,co=Math.cos(tilt),si=Math.sin(tilt),parts=[],char=Math.max(e.charred?1:0,f.burn);
 const P=(x,y,z)=>{z+=(entry||dead?0:Math.sin((state.time??0)*1.7)*.012)*Math.max(0,Math.min(1,(z-.8)/1.8))+(locomotion?.bob??0)*Math.max(0,Math.min(1,(z-.3)/1.5));z-=f.kneel*.75*Math.max(0,Math.min(1,(z-.1)));y+=attack.lean*Math.max(0,z-.5);const X=x*co+z*si,Z=Math.max(.035,z*co-x*si);return[e.x+fy*X+fx*y,e.y-fx*X+fy*y,Z];};
 function add(kind,local,color,w=1,tag='tissue',normal=null,extra={}){
  const v=local.map(p=>P(...p)),center=v[0].map((_,i)=>v.reduce((s,p)=>s+p[i]/v.length,0));
  let c=color;
  if(normal){const o=local[0],a=P(...o),b=P(...o.map((x,i)=>x+normal[i]*.02));c=sculptLighting(center,b.map((x,i)=>x-a[i]),color,state);}
  c=c.map(x=>Math.round(x*(1-char)+29*char));
  parts.push({kind,v,c,w,hero:false,golemDetail:tag,d:v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length+(kind===1?.006:0),...extra});
 }
 function blob(c,r,color,tag,rings=3,segs=8){
  const point=(j,i)=>{const lat=-Math.PI/2+j/rings*Math.PI,a=i/segs*Math.PI*2;return[c[0]+Math.cos(lat)*Math.cos(a)*r[0],c[1]+Math.cos(lat)*Math.sin(a)*r[1],c[2]+Math.sin(lat)*r[2]];};
  for(let j=0;j<rings;j++)for(let i=0;i<segs;i++){
   const v=[point(j,i),point(j,i+1),point(j+1,i+1),point(j+1,i)],lat=-Math.PI/2+(j+.5)/rings*Math.PI,a=(i+.5)/segs*Math.PI*2;
   add(0,v,color,1,tag,[Math.cos(lat)*Math.cos(a)/r[0],Math.cos(lat)*Math.sin(a)/r[1],Math.sin(lat)/r[2]]);
  }
 }
 function limb(a,b,ra,rb,color,tag){
  const dir=unit(b.map((v,i)=>v-a[i])),u=unit(cross(dir,Math.abs(dir[2])<.9?[0,0,1]:[0,1,0])),v=cross(dir,u),ring=(p,r,t)=>p.map((x,i)=>x+r*(u[i]*Math.cos(t)+v[i]*Math.sin(t)));
  for(let i=0;i<8;i++){const t=i*Math.PI/4,T=(i+1)*Math.PI/4,m=(t+T)/2;add(0,[ring(a,ra,t),ring(a,ra,T),ring(b,rb,T),ring(b,rb,t)],color,1,tag,u.map((x,k)=>x*Math.cos(m)+v[k]*Math.sin(m)));}
 }
 const line=(v,c=[52,39,48],w=2,tag='seam')=>add(1,v,c,w,tag);
 const skin=[119,108,117],old=[103,105,107],dark=[91,78,88],bone=[167,154,129],iron=[80,77,75];
 const planted=locomotion?.feet??[[-.48,.12,0],[.48,.12,0]];
 for(let i=0;i<2;i++){
  const side=i===0?-1:1,F=planted[i],hip=[side*.32,-.08,1.03],knee=[(side*.32+F[0])*.5,F[1]*.45,.62+F[2]*.45],ankle=[F[0],F[1],.15+F[2]];
  limb(hip,knee,side===1?.3:.24,.23,side===1?skin:old,'leg');limb(knee,ankle,.23,.15,dark,'leg');
  blob(knee,[.22,.2,.21],old,'knee',2,6);blob([F[0],F[1],.11+F[2]],[.23,.32,.1],dark,'foot',2,8);
  for(let k=0;k<3;k++)line([[F[0]-.12+k*.1,F[1]+.17,.1+F[2]],[F[0]-.12+k*.1,F[1]+.31,.07+F[2]]],bone,2,'toe');
 }
 blob([.03,-.11,1.02],[.52,.38,.4],dark,'hip');
 blob([.04,-.13,1.72],[.65,.5,.85],skin,'main-torso',4,10);
 blob([.47,-.16,2.06],[.42,.42,.63],[115,102,109],'second-torso');
 blob([-.43,-.05,1.55],[.37,.36,.57],old,'third-torso');
 blob([.61,-.14,2.39],[.46,.44,.5],skin,'high-shoulder');
 blob([-.58,-.11,2.16],[.34,.36,.4],dark,'low-shoulder');
 function face(c,scale,tag,back=false){
  const z=c[2],y=c[1],x=c[0],front=back?-1:1;
  blob(c,[.18*scale,.17*scale,.24*scale],[134,126,123],tag,3,8);
  blob([x,y+front*.025,z-.14*scale-(tag==='face-main'?accent.jaw:0)],[.145*scale,.14*scale,.1*scale],[118,110,109],tag+'-jaw',2,6);
  for(const side of [-1,1]){const X=x+side*.075*scale,Y=y+front*.16*scale;add(0,[[X-.04*scale,Y,z+.035*scale],[X+.035*scale,Y,z+.02*scale],[X+.025*scale,Y,z-.025*scale],[X-.03*scale,Y,z-.03*scale]],[27,25,30],1,tag+'-eye');}
  line([[x-.09*scale,y+front*.16*scale,z-.11*scale],[x,y+front*.18*scale,z-.125*scale],[x+.09*scale,y+front*.16*scale,z-.11*scale]],[44,34,40],1.5,tag+'-mouth');
  line([[x,y+front*.165*scale,z+.04*scale],[x+.025*scale,y+front*.19*scale,z-.06*scale]],bone,1.4,tag+'-nose');
 }
 face([-.06+accent.head,.12,2.6+accent.shoulder],1.1,'face-main');
 face([.65,.26,2.53],.78,'face-shoulder');
 face([-.48,.25,1.65],.77,'face-side');
 face([.06,-.58,1.95],.73,'face-back',true);
 const right=entry?mix(attack.right,[.9,.6,.06],f.kneel):attack.right;
 const left=entry?[-.8,.3,.85]:[-.8,.3,.85+Math.sin((e.walkDistance??0)*2)*.035];
 const elbowR=[1.01,right[1]*.4,(right[2]+2.48)/2],elbowL=[-.87,.09,1.56];
 limb([.65,-.02,2.43],elbowR,.27,.22,skin,'right-arm');limb(elbowR,right,.25,.2,skin,'right-arm');
 limb([-.59,-.03,2.18],elbowL,.2,.15,old,'left-arm');limb(elbowL,left,.17,.11,old,'left-arm');
 function hand(c,scale,tag){
  blob(c,[.17*scale,.13*scale,.19*scale],skin,tag,2,6);
  for(let i=0;i<5;i++){const x=c[0]+(i-2)*.066*scale,L=(i===0?.19:.28-Math.abs(i-2)*.025)*scale*(1-(tag==='hand-right'?accent.grip:0)*.13);line([[x,c[1]+.04,c[2]-.1*scale],[x+(i-2)*.018,c[1]+.075,c[2]-L],[x+(i-2)*.026,c[1]+.12,c[2]-L-.065*scale]],i%2?old:skin,2.8*scale,tag+'-finger');}
 }
 hand(right,1.18,'hand-right');hand(left,.9,'hand-left');
 const lag=entry||dead?0:Math.sin((state.time??0)*1.7+(e.walkDistance??0)*1.6)*.045;
 limb([.77,-.25,2.48],[1,-.24,2.59],.12,.1,dark,'extra-arm-shoulder');limb([1,-.24,2.59],[.72,-.04,2.75],.1,.075,old,'extra-arm-shoulder');hand([.72,-.04,2.75],.53,'hand-extra-shoulder');
 limb([-.61,.02,1.9],[-.77,.13,1.29],.12,.075,old,'extra-arm-hanging');limb([-.77,.13,1.29],[-.61,.2+lag,.96],.075,.06,dark,'extra-arm-hanging');hand([-.61,.2+lag,.96],.55,'hand-extra-hanging');
 for(let i=0;i<5;i++){
  const z=1.28+i*.19,spread=f.open*.12;
  for(const side of [-1,1])line([[side*(.12+spread),.4,z+.04],[side*(.3+spread),.36,z+.1],[side*.47,.26,z+.02]],bone,2.1,'rib');
 }
 const gap=.025+f.open*.23;
 add(0,[[-gap,.425,1.8],[gap,.425,1.8],[gap,.425,2.2],[-gap,.425,2.2]],[25,22,29],1,'chest',null,{golemChest:true});
 for(let i=0;i<5;i++){const z=1.82+i*.075;line([[-gap-.025,.438,z-.02],[-gap-.045,.455,z+.025],[gap+.045,.455,z+.025],[gap+.025,.438,z-.02]],iron,1.7,'chest-staple');}
 for(const [a,b]of [[[.84,-.2,2.45],[-.38,.32,1.03]],[[-.56,.16,2.15],[-.29,.34,1.14]],[[.5,-.29,2.36],[.15,-.61,1.12]]]){
  const strip=Array.from({length:7},(_,i)=>a.map((v,k)=>v+(b[k]-v)*i/6));line(strip,[54,42,49],3,'major-seam');
  for(let i=1;i<6;i++){const c=strip[i];line([[c[0]-.05,c[1]+.012,c[2]-.025],[c[0]+.05,c[1]+.012,c[2]+.025]],[132,119,105],1.4,'stitch');}
 }
 for(let i=0;i<5;i++)blob([.1,-.53,1.28+i*.22],[.075,.09,.11],bone,'spine',2,5);
 hand([.35,-.43,.95],.5,'back-hand');
 // UNDEAD_V5_BOSS_ARMOR: incomplete foreign plates leave faces and chest slit exposed.
 add(0,[[.38,.18,2.6],[.85,.13,2.7],[1,.04,2.47],[.54,.25,2.4]],[92,94,101],1,'boss-pauldron',[0,1,1]);
 line([[.38,.18,2.6],[.85,.13,2.7],[1,.04,2.47]],[144,139,126],2,'boss-pauldron-rim');
 add(0,[[-.65,.32,1.88],[-.31,.39,1.92],[-.28,.4,1.57],[-.53,.36,1.53]],[76,78,84],1,'boss-chest-fragment',[0,1,0]);
 for(const x of [-.25,.32])line([[x,.31,1.52],[x+.05,.32,1.33],[x-.02,.25,1.14]],[76,71,69],2,'boss-chain');
 // CLARITY_V4_SURFACE_DETAIL: larger readable folds and attachment scars.
 for(let i=0;i<10;i++){
  const side=i%2?1:-1,z=1.18+Math.floor(i/2)*.22;
  blob([side*(.36+.035*Math.sin(i)),.23,z],[.13,.075,.09],i%3?old:skin,'grafted-scar',2,6);
  line([[side*.22,.35,z-.03],[side*.39,.34,z+.025],[side*.5,.22,z]],dark,1.5,'fold');
 }
 for(let i=0;i<7;i++){
  const z=1.17+i*.18;line([[.25,-.5,z],[.08,-.6,z+.04],[-.12,-.55,z+.025]],dark,1.5,'back-fold');
 }
 for(const [x,y,z,scale] of [[-.06,.12,2.6,1.1],[.65,.26,2.53,.78],[-.48,.25,1.65,.77]]){
  for(const side of [-1,1])line([[x+side*.035*scale,y+.17*scale,z+.095*scale],[x+side*.12*scale,y+.125*scale,z+.07*scale]],bone,1.5,'brow');
  for(let i=0;i<4;i++)line([[x+(i-1.5)*.038*scale,y+.175*scale,z-.10*scale],[x+(i-1.5)*.038*scale,y+.177*scale,z-.14*scale]],bone,1.1,'teeth');
 }
 const glow=entry?f.burn*(1-smooth((entry.elapsed-4.8)/.7)):0;
 if(glow>0)for(const side of [-1,1])add(1,[[side*gap,.465,1.83],[side*(gap+.04),.465,2],[side*gap,.465,2.18]],[252,224,164],2,'ember',null,{c:[252,224,164].map(v=>Math.round(v*glow)),golemGlow:true});
 return parts;
}
