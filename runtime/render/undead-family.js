import {UNDEAD_KINDS,undeadPose,ease,archerReady} from '../animation/undead-motion.js';
import {MARROW_ARCHER} from '../combat/marrow-archer.js';
import {sculptLighting} from './golem-volume-light.js';
export const UNDEAD_SHAPES=Object.freeze({bonebound:{w:.18,h:1.65},'ossuary-guard':{w:.25,h:1.9},'marrow-archer':{w:.16,h:1.65},gravebearer:{w:.23,h:1.56},'bloated-remnant':{w:.43,h:1.48},ashbound:{w:.15,h:1.7}});
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function archerTipLocal(e){return[-.25,.79,1.22];}
export function undeadReadyLights(s){
 if(s.phase!=='playing'||s.execution)return[];
 return(s.enemies??[s.enemy]).filter(e=>e&&archerReady(e)).map(e=>{const p=archerTipLocal(e),h=undeadPose(e)?.heading??Math.atan2(e.fy,e.fx),fx=Math.cos(h),fy=Math.sin(h);return{x:e.x+fy*p[0]+fx*p[1],y:e.y-fx*p[0]+fy*p[1],z:p[2],r:9,power:1.15,fireWarmth:.55,lightColor:[1,.9,.65],undeadArrowReady:true,ownerId:e.id};});
}
export function renderUndead(e,state={}){
 const shape=UNDEAD_SHAPES[e.archetype],pose=undeadPose(e);if(!shape||!pose)return null;
 const kind=e.archetype,guard=kind==='ossuary-guard',grave=kind==='gravebearer',bloated=kind==='bloated-remnant',ash=kind==='ashbound',archer=kind==='marrow-archer',bone=kind==='bonebound',dead=e.hp<=0||e.mode==='dead';
 const h=shape.h,w=shape.w,heading=pose.heading,fx=Math.cos(heading),fy=Math.sin(heading),parts=[],skin=bloated?[119,112,106]:ash?[79,76,83]:[137,127,112],ivory=[172,161,137],metal=guard?[101,106,114]:[87,88,94],cloth=ash?[48,47,54]:[67,57,65];
 const death=dead?(Number.isFinite(e.visualDeathAt)&&Number.isFinite(state.time)?ease((state.time-e.visualDeathAt)/.7):1):0;
 const P=(x,y,z)=>{
  if(!dead){z+=pose.breath*Math.max(0,Math.min(1,(z-.5)));y+=(grave?.15:bloated?.035:.015)*Math.max(0,z-.5)+pose.hit*Math.max(0,z-.5);}
  if(death){const a=death*1.48,co=Math.cos(a),si=Math.sin(a),side=(e.id??0)%2?1:-1,X=x*co+side*z*si;z=Math.max(.025,z*co-side*x*si);x=X;}
  return[e.x+fy*x+fx*y,e.y-fx*x+fy*y,Math.max(.025,z)];
 };
 function add(kind,v,c,width=1,tag='body',normal=null,extra={}){
  const V=v.map(p=>P(...p)),center=V[0].map((_,i)=>V.reduce((s,p)=>s+p[i]/V.length,0));
  let color=c;if(normal){const a=P(0,0,1),b=P(...normal.map((v,i)=>v*.05+(i===2?1:0)));color=sculptLighting(center,b.map((v,i)=>v-a[i]),c,state);}
  if(e.charred)color=color.map(()=>31);
  parts.push({kind,v:V,c:color,w:width,hero:false,undeadDetail:tag,undeadKind:e.archetype,d:V.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/V.length+(kind===1?.006:0),...extra});
 }
 const line=(v,c=ivory,W=2,tag='detail')=>add(1,v,c,W,tag);
 function blob(c,r,color,tag,rings=2,segs=6){const point=(j,i)=>{const lat=-Math.PI/2+j/rings*Math.PI,a=i/segs*Math.PI*2;return[c[0]+Math.cos(lat)*Math.cos(a)*r[0],c[1]+Math.cos(lat)*Math.sin(a)*r[1],c[2]+Math.sin(lat)*r[2]];};for(let j=0;j<rings;j++)for(let i=0;i<segs;i++){const lat=-Math.PI/2+(j+.5)/rings*Math.PI,a=(i+.5)/segs*Math.PI*2;add(0,[point(j,i),point(j,i+1),point(j+1,i+1),point(j+1,i)],color,1,tag,[Math.cos(lat)*Math.cos(a),Math.cos(lat)*Math.sin(a),Math.sin(lat)]);}}
 function plate(x,y,z,W,H,color,tag='armor'){
  const v=[[x-W*.42,y,z],[x+W*.42,y,z],[x+W*.5,y,z+H*.8],[x+W*.3,y,z+H],[x-W*.3,y,z+H],[x-W*.5,y,z+H*.8]];
  add(0,v,color,1,tag,tag.includes('back')?[0,-1,.15]:[0,1,.15]);line([v[3],v[4],v[5]],color.map(v=>Math.min(200,v*1.27)),1.25,tag+'-rim');
 }
 const legTop=bloated?.68:.76;
 for(let i=0;i<2;i++){const F=dead?[i===0?-w:w,0,0]:pose.feet[i],hip=[(i===0?-1:1)*w*.6,0,legTop],knee=[F[0]*.88,F[1]*.45,.37+F[2]*.4],ankle=[F[0],F[1],.09+F[2]];line([hip,knee,ankle],skin,bloated?10:guard?6:4,'leg');blob([F[0],F[1]+.055,.065+F[2]],[bloated?.14:.095,.15,.055],ash?cloth:skin,'foot');if(guard||i===0&&!archer)plate(F[0],F[1]+.06,.18+F[2],bloated?.2:.13,.25,metal,'greave');}
 if(bone||archer){line([[0,0,.68],[0,0,h-.3]],ivory,3,'spine');for(let i=0;i<5;i++){const z=.87+i*.075;line([[-w,.01,z],[0,.09,z-.045],[w,.01,z]],ivory,1.8,'ribs');}}
 else blob([0,-.025,h*.58],[w,bloated?.3:.18,h*.25],bloated?skin:cloth,'torso',3,8);
 if(bloated)blob([.025,.10,.83],[.39,.27,.37],skin,'belly',3,8);
 const headShift=!dead?pose.idle*.035*(pose.gestureVariant?1:-1):0,headZ=h-.14;
 blob([headShift,.045,headZ],[bloated?.13:.13,.12,guard?.18:.16],skin,'head');
 for(const side of [-1,1])add(0,[[headShift+side*.052-.025,.153,headZ+.025],[headShift+side*.052+.025,.153,headZ+.025],[headShift+side*.052+.02,.155,headZ-.015],[headShift+side*.052-.02,.155,headZ-.02]],[22,23,29],1,'eye');
 line([[headShift-.065,.155,headZ-.065],[headShift+.06,.155,headZ-.075]],cloth,1.5,'mouth');
 let restR=[w+.12,.10,1.0],restL=[-w-.12,.12,.86],raisedR=[w+.14,-.12,h-.10],impactR=[w*.35,.62,1.01];
 if(ash){raisedR=[.2,-.03,1.3];impactR=[.12,.66,1.05];}
 if(grave){restR=[.25,.25,1.1];restL=[-.24,.12,1.05];raisedR=[.32,-.05,1.32];impactR=[.2,.68,1.03];}
 if(bloated){restR=[.49,.1,.72];restL=[-.48,.1,.72];raisedR=[.5,-.02,1.05];impactR=[.28,.65,.76];}
 let R=restR,L=restL,funeralTip=null,archRaise=0;
 if(e.mode==='windup')R=mix(mix(restR,raisedR,pose.raise),impactR,pose.strike);else if(e.mode==='recover')R=mix(impactR,restR,pose.recover);
 if(bloated)L=[-R[0],R[1],R[2]];
 if(!dead&&['wait','chase'].includes(e.mode)){R=[R[0],R[1]-pose.idle*.035,R[2]+pose.idle*.05];L=[L[0],L[1],L[2]+Math.sin(pose.time*1.3)*.012];}
 if(grave){const rest=[.58,-.12,1.83],raised=[.88,-.18,1.6],hit=[0,1.95,.94];funeralTip=e.mode==='windup'?mix(mix(rest,raised,pose.raise),hit,pose.strike):e.mode==='recover'?mix(hit,rest,pose.recover):rest;const d=funeralTip.map((v,i)=>v-R[i]),n=Math.hypot(...d);L=R.map((v,i)=>v-d[i]/n*.36);}
 if(archer){
  archRaise=e.mode==='windup'?ease(e.timer/.35):e.mode==='recover'?1-ease((e.timer-.12)/.4):0;
  L=mix([-.25,.30,.92],[-.25,.45,1.22],archRaise);
  if(e.mode==='windup'){
   const draw=ease((e.timer-.28)/Math.max(.01,MARROW_ARCHER.aimLock-.28));
   R=e.timer<.28?mix([.25,-.18,1.4],[-.25,.12,1.22],ease(e.timer/.28)):[-.25,.12-.44*draw,1.22];
  }else if(e.mode==='recover')R=mix([-.25,-.32,1.22],[.23,-.16,1.21],ease(e.timer/.7));else R=[.23,-.16,1.21];
 }
 for(const [side,hand]of [[1,R],[-1,L]]){const shoulder=[side*w,0,h-.42],elbow=[side*(w+.13),hand[1]*.4,(shoulder[2]+hand[2])/2];line([shoulder,elbow,hand],skin,bloated?8:4,'arm');blob(hand,[bloated?.12:.075,.075,.09],skin,'hand');for(let k=0;k<3;k++)line([[hand[0]+(k-1)*.035,hand[1]+.03,hand[2]-.035],[hand[0]+(k-1)*.045,hand[1]+.09,hand[2]-.09]],skin,1.5,'finger');}
 if(bone){plate(.17,.055,1.17,.23,.22,metal,'shoulder-armor');plate(-.085,.12,.94,.16,.24,metal,'broken-breastplate');line([[-.19,.16,1.3],[.15,.13,.67]],cloth,5,'chest-binding');}
 if(guard){plate(0,.16,.85,.43,.58,metal,'breastplate');plate(0,.16,headZ-.08,.25,.29,metal,'helmet');line([[-.095,.175,headZ+.035],[.095,.175,headZ+.035]],[23,23,28],2,'visor');plate(.26,0,1.4,.27,.22,metal,'pauldron');plate(-.28,0,1.36,.23,.19,metal,'pauldron');const shieldY=.22-pose.raise*.10;plate(-.34,shieldY,.65,.36,.84,metal,'shield');for(let i=0;i<3;i++)line([[-.46+i*.11,shieldY+.01,.76],[-.44+i*.11,shieldY+.01,1.34]],ivory,2,'shield-rib');}
 if(grave){
  plate(0,-.27,.68,.60,1.56,[76,67,64],'coffin');
  // Back-facing lid has visible metal strips from the rear view.
  plate(0,-.43,.68,.56,1.48,[70,61,59],'coffin-back');
  for(const side of [-1,1])add(0,[[side*.3,-.27,.68],[side*.3,-.43,.68],[side*.3,-.43,2.1],[side*.3,-.27,2.16]],[65,60,60],1,'coffin-side',[side,0,0]);
  for(const z of [.91,1.75])line([[-.26,-.45,z],[.26,-.45,z]],metal,4,'coffin-clamp');
  for(const side of [-1,1])line([[side*.23,-.25,1.8],[side*.14,.15,1.25],[side*.16,.12,.7]],cloth,5,'coffin-strap');
  add(0,[[-.2,.12,1.46],[0,-.08,1.83],[.2,.12,1.46]],cloth,1,'coffin-hood');
  const shaft=funeralTip.map((v,i)=>v-R[i]),N=Math.hypot(...shaft),butt=R.map((v,i)=>v-shaft[i]/N*.8);line([butt,funeralTip],metal,3,'funeral-pole');line([[funeralTip[0]-.29,funeralTip[1],funeralTip[2]],[funeralTip[0]+.29,funeralTip[1],funeralTip[2]]],ivory,5,'pole-crosspiece');
  plate(.22,.03,1.23,.2,.22,metal,'shoulder-armor');
 }
 if(bloated){for(const side of [-1,1]){plate(side*.25,.29,.82,.24,.37,metal,'split-armor');line([[side*.39,.11,.72],[side*.25,.31,.79],[0,.36,.78]],cloth,4,'belly-strap');}line([[-.03,.38,.65],[.025,.4,.89],[-.02,.34,1.13]],cloth,2,'belly-seam');}
 if(ash){plate(.16,.02,1.25,.18,.22,metal,'burned-pauldron');for(let i=0;i<3;i++){const x=(i-1)*.12;add(0,[[x-.04,-.04,.8],[x+.04,-.04,.8],[x+.045,Math.sin(pose.time+i)*.012,.42]],cloth,1,'burned-cloth');}line([[-.08,.13,1.16],[.04,.14,1.04],[0,.13,.92]],[117,67,58],1,'coal-crack');}
 if(archer){
  add(0,[[-.17,.02,1.46],[0,-.08,1.8],[.17,.02,1.46]],cloth,1,'hood');
  plate(.12,.12,1.02,.19,.3,metal,'light-breastplate');plate(-.2,.05,1.24,.19,.17,metal,'bow-shoulder');
  line([[.18,-.15,.75],[.27,-.18,1.44]],cloth,6,'quiver');
  for(let i=0;i<3;i++)line([[.2+i*.045,-.18,1.2],[.24+i*.045,-.18,1.62]],ivory,1,'quiver-arrow');
  const angle=.55*(1-archRaise),co=Math.cos(angle),si=Math.sin(angle),bow=[[0,0,-.72],[0,.18,-.37],[0,.23,0],[0,.15,.4],[0,0,.72]].map(([x,y,z])=>[L[0]+x,L[1]+y*co-z*si,L[2]+y*si+z*co]);
  line(bow,[137,126,103],3,'bow');line([bow[0],R,bow.at(-1)],[181,171,147],1,'bow-string');
  if(e.mode==='windup'&&!e.hitFired){const tip=e.timer<.22?[R[0],R[1]+.4,R[2]]:archerTipLocal(e);line([R,tip],ivory,1.4,'nocked-arrow');if(archerReady(e)){line([[tip[0],tip[1]-.07,tip[2]],tip],[244,205,119],3,'ready-arrow');add(2,[tip],[255,239,190],1,'ready-arrow',null,{r:2,arrowReady:true});}}
 }
 if(!guard&&!grave&&!archer&&!bloated){line([R,[R[0]+.04,R[1]+.04,R[2]+(ash?.32:.43)]],metal,3,'blade');}
 if(guard)line([R,[R[0]+.06,R[1]+.1,R[2]+.47]],ivory,4,'sword');
 if(!archer&&!dead&&((e.mode==='windup'&&pose.strike>.15)||(e.mode==='recover'&&e.timer<.12))){const tip=grave?funeralTip:bloated?[R[0]+.12,R[1]+.04,R[2]]:[R[0]+.04,R[1]+.05,R[2]+.32];line([mix(R,tip,.55),tip],[196,166,127],1.6,'attack-accent');}
 return parts;
}
