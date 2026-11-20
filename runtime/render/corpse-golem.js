import {GOLEM_ATTACKS,golemFinisherFrame} from '../combat/corpse-golem.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const mix=(a,b,t)=>t<=0?[...a]:t>=1?[...b]:a.map((v,i)=>v+(b[i]-v)*t);
export function golemAttackPose(e){
  const name=Object.hasOwn(GOLEM_ATTACKS,e.golemAttack)?e.golemAttack:'slam',a=GOLEM_ATTACKS[name];
  const rest=[.86,.04,.95],raised=name==='slam'?[.8,-.25,3.2]:name==='sweep'?[2.4,-.4,1.65]:[.7,.25,1.5];
  const impact=name==='slam'?[.18,2.1,.35]:name==='sweep'?[-2.1,1.25,1.4]:[.45,1.25,1.3];
  const t=Math.max(0,Number.isFinite(e.timer)?e.timer:0);
  let hand=rest,lean=0;
  if(e.mode==='windup'){
    const u=Math.min(1,t/a.windup),ready=smooth(u/.75),strike=smooth((u-.78)/.22);
    hand=mix(mix(rest,raised,ready),impact,strike);lean=.12*ready;
  }else if(e.mode==='recover'){
    const u=smooth(t/a.recover);hand=mix(impact,rest,u);lean=.12*(1-u);
  }
  return {right:hand,left:[-.8,.3,.85],lean};
}
export function corpseGolemParts(e,state={}){
  const entry=state.execution?.kind==='corpse-golem'&&state.execution.targetId===e.id?state.execution:null;
  const dead=e.hp<=0&&!entry,fall=dead?(Number.isFinite(e.deathElapsed)?smooth(e.deathElapsed/.9):1):0;
  const f=entry?golemFinisherFrame(entry):{kneel:dead?1:0,open:0,burn:e.charred?1:0,fall,withdraw:0};
  const attack=entry?{right:[.86,.04,.95],left:[-.8,.3,.85],lean:0}:golemAttackPose(e);
  const rawX=entry?-entry.fx:e.fx,rawY=entry?-entry.fy:e.fy,n=Math.hypot(rawX,rawY),fx=n?rawX/n:0,fy=n?rawY/n:1;
  const tilt=f.fall*1.5,co=Math.cos(tilt),si=Math.sin(tilt),parts=[];
  const P=(side,forward,z)=>{
    z-=f.kneel*.75*Math.max(0,Math.min(1,(z-.1)/1));
    forward+=attack.lean*Math.max(0,z-.5);
    const S=side*co+z*si,Z=Math.max(.035,z*co-side*si);
    return [e.x+fy*S+fx*forward,e.y-fx*S+fy*forward,Z];
  };
  const char=Math.max(e.charred?1:0,f.burn),colour=c=>c.map(v=>Math.round(v*(1-char)+31*char));
  const add=(kind,v,c,w=1,extra={})=>parts.push({kind,v,c:colour(c),w,hero:false,
    d:v.reduce((s,p)=>s+p[0]+p[1]+p[2]*.006,0)/v.length+(kind===1?.005:0),...extra});
  const line=(v,c=[126,115,101],w=4)=>add(1,v,c,w);
  function box(x,y,z,w,d,h,c){
    const v=[P(x-w/2,y-d/2,z),P(x+w/2,y-d/2,z),P(x+w/2,y+d/2,z),P(x-w/2,y+d/2,z),P(x-w/2,y-d/2,z+h),P(x+w/2,y-d/2,z+h),P(x+w/2,y+d/2,z+h),P(x-w/2,y+d/2,z+h)];
    [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((face,i)=>add(0,face.map(j=>v[j]),c.map(n=>n*[.65,.85,.72,.55,1][i])));
  }
  const walk=Math.sin((e.walkDistance??0)*3)*.065;
  for(const side of [-1,1]){
    line([P(side*.35,0,1.08),P(side*.46,side*walk,.57),P(side*.51,side*walk,.08)],[105,94,88],18);
    box(side*.51,side*walk+.09,.035,.34,.49,.14,[83,77,73]);
  }
  box(0,0,1.02,1.1,.72,1.55,[105,91,85]);
  box(.3,-.02,2.45,.79,.75,.44,[121,104,93]);
  box(-.45,-.04,2.4,.56,.62,.3,[96,87,84]);
  box(-.12,.05,2.7,.37,.4,.39,[139,123,101]);
  const right=entry?mix(attack.right,[.9,.6,.06],f.kneel):attack.right;
  line([P(.62,0,2.55),P(1.02,right[1]*.4,(right[2]+2.55)/2),P(...right)],[118,100,91],17);
  line([P(-.58,0,2.4),P(-.9,.17,1.7),P(...attack.left)],[99,88,83],11);
  box(right[0],right[1],Math.max(.04,right[2]-.12),.34,.3,.26,[112,98,88]);
  const gap=.025+f.open*.23;
  add(0,[P(-gap,.43,1.8),P(gap,.43,1.8),P(gap,.43,2.2),P(-gap,.43,2.2)],[30,23,26],1,{golemChest:true});
  for(let i=0;i<5;i++){
    const z=1.25+i*.27,spread=f.open*.12;
    line([P(-.19-spread,.445,z),P(-.19-spread,.46,z+.06),P(.13+spread,.46,z+.06),P(.13+spread,.445,z)],[137,129,115],3);
  }
  line([P(-.5,.38,2.42),P(-.24,.42,2.12),P(-.33,.42,1.23)],[64,48,47],3);
  const glow=entry?f.burn*(1-smooth((entry.elapsed-4.8)/.7)):0;
  if(glow>0){
    for(const side of [-1,1]){
      const v=[P(side*gap,.465,1.83),P(side*(gap+.06),.465,2),P(side*gap,.465,2.18)];
      add(1,v,[243,161,59],2,{c:[Math.round(243*glow),Math.round(161*glow),Math.round(59*glow)],golemGlow:true});
    }
  }
  return parts;
}
