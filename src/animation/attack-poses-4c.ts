import {attackTiming} from '../combat/attack-timing.js';
import type {ActionView} from '../combat/types.js';
import type {HeroModule,Pose} from '../core/types.js';
type Vector=readonly number[];
type Profile={entry:string|null;prep:Vector;ready:Vector;contact:Vector;follow:Vector;direction:number};
const resting:Vector=[.28,-.02,.9,-1.2,-.66,.25,0,0];
const profiles:Record<string,Profile>={
light1:{entry:null,direction:1,prep:[.25,-.12,.83,-1.20,-.64,.43,-.20,.08],ready:[.30,.36,1.01,1.20,-.07,.42,-.13,.05],contact:[.12,.54,.92,1.51,-.15,.43,.06,.08],follow:[.06,.54,.83,1.82,-.20,.42,.18,.10]},
light2:{entry:'light1',direction:-1,prep:[.09,.49,.88,1.90,-.18,.42,.18,.10],ready:[.10,.48,.90,1.89,-.18,.42,.17,.10],contact:[.22,.51,.98,1.57,-.10,.41,-.01,.06],follow:[.30,.42,1.02,1.25,-.08,.40,-.16,.04]},
light3:{entry:'light2',direction:1,prep:[.30,.38,1.10,1.18,.02,.40,-.19,.03],ready:[.30,.38,1.12,1.18,.02,.40,-.19,.03],contact:[.20,.52,.96,1.50,-.14,.47,.04,.10],follow:[.08,.51,.79,1.83,-.21,.50,.18,.14]},
heavy1:{entry:null,direction:1,prep:[.33,-.20,.81,-1.24,-.65,.49,-.31,.10],ready:[.34,.12,1.15,.30,.08,.45,-.28,.08],contact:[.12,.53,1.01,1.50,-.20,.51,.10,.14],follow:[-.18,.49,.78,2.90,-.25,.48,.35,.16]},
heavy2:{entry:'heavy1',direction:-1,prep:[-.23,.33,1.05,2.95,-.04,.43,.35,.10],ready:[-.23,.33,1.05,2.95,-.04,.43,.35,.10],contact:[.02,.54,.98,1.57,-.20,.50,.03,.13],follow:[.33,.44,.76,.25,-.25,.48,-.30,.16]},
heavy3:{entry:'light2',direction:1,prep:[.38,.12,1.20,.15,.12,.44,-.30,.07],ready:[.38,.12,1.20,.15,.12,.44,-.30,.07],contact:[.12,.54,1.02,1.50,-.20,.51,.10,.14],follow:[-.18,.49,.78,2.90,-.25,.48,.35,.16]}
};
function end(profile:Profile):number[]{const p=[...profile.follow];p[1]+=.035;p[3]+=.08*profile.direction;p[5]+=.015;p[6]+=.03*profile.direction;return p;}
function smooth(t:number):number{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
// Endpoints stay exact, so combo joins retain positional continuity.
function channelWeight(clip:string,segment:number,channel:number,u:number):number{
if(clip!=='light1'&&clip!=='heavy1')return smooth(u);
const heavy=clip==='heavy1',blade=channel===3||channel===4,body=channel>=5;
let exponent=1;
if(segment<=2){
  exponent=blade?(heavy?1.55:1.32):body?.78:1.10;
}else if(segment===3){
  exponent=blade?1.15:body?.88:1;
}else if(segment===4){
  exponent=blade?.78:body?1.18:1;
}else{
  exponent=blade?.84:body?1.10:1;
}
return smooth(Math.pow(Math.max(0,Math.min(1,u)),exponent));
}
export function sampleAttack4C(module:HeroModule,action:ActionView,t=action.progress):Pose{
const timing=attackTiming(action.kind);
const profile=profiles[action.clip];if(!profile)throw Error('Unknown 4C clip '+action.clip);t=Math.max(0,Math.min(1,t));const entry=profile.entry?end(profiles[profile.entry]):resting,exit=end(profile),keys:readonly (readonly [number,Vector])[]=[[0,entry],[timing.prep,profile.prep],[timing.ready,profile.ready],[timing.contact,profile.contact],[timing.follow,profile.follow],[1,exit]];
let i=1;while(i<keys.length-1&&t>keys[i][0])i++;const a=keys[i-1],b=keys[i],u=(t-a[0])/(b[0]-a[0]),v=a[1].map((n,j)=>n+(b[1][j]-n)*channelWeight(action.clip,i,j,u)),p=module.sample('breath',0,0);
p.id=action.clip;p.root=[0,0,0];p.gait=null;p.breath=0;p.right=[v[0],v[1],v[2]];p.az=v[3];p.down=v[4];p.lean=v[5];p.twist=v[6];p.head=v[7];return p;
}
export function attack4CWeight(action:ActionView,t:number):number{
const timing=attackTiming(action.kind),entry=action.stage===0?smooth(t/.12):1;
// Do not fade while continuation can still be queued: accepting input
// must not abruptly restore a partially faded attack pose.
return entry*(action.continuation?1:1-smooth((t-timing.queueEnd)/(timing.release-timing.queueEnd)));
}
