import {COMBAT} from '../combat/config.js';
import type {ActionView} from '../combat/types.js';
import type {HeroModule,Pose} from '../core/types.js';
type Vector=readonly number[];
type Profile={entry:string|null;prep:Vector;ready:Vector;contact:Vector;follow:Vector;direction:number};
const resting:Vector=[.28,-.02,.9,-1.2,-.66,.25,0,0];
const profiles:Record<string,Profile>={
light1:{entry:null,direction:1,prep:[.26,-.1,.84,-1.05,-.56,.40,-.17,.08],ready:[.30,.36,1.01,1.20,-.07,.42,-.13,.05],contact:[.12,.54,.92,1.51,-.15,.43,.06,.08],follow:[.06,.54,.83,1.82,-.20,.42,.18,.10]},
light2:{entry:'light1',direction:-1,prep:[.09,.49,.88,1.90,-.18,.42,.18,.10],ready:[.10,.48,.90,1.89,-.18,.42,.17,.10],contact:[.22,.51,.98,1.57,-.10,.41,-.01,.06],follow:[.30,.42,1.02,1.25,-.08,.40,-.16,.04]},
light3:{entry:'light2',direction:1,prep:[.30,.38,1.10,1.18,.02,.40,-.19,.03],ready:[.30,.38,1.12,1.18,.02,.40,-.19,.03],contact:[.20,.52,.96,1.50,-.14,.47,.04,.10],follow:[.08,.51,.79,1.83,-.21,.50,.18,.14]},
heavy1:{entry:null,direction:1,prep:[.35,-.18,.85,-1.05,-.52,.45,-.28,.10],ready:[.34,.12,1.15,.30,.08,.45,-.28,.08],contact:[.12,.53,1.01,1.50,-.20,.51,.10,.14],follow:[-.18,.49,.78,2.90,-.25,.48,.35,.16]},
heavy2:{entry:'heavy1',direction:-1,prep:[-.23,.33,1.05,2.95,-.04,.43,.35,.10],ready:[-.23,.33,1.05,2.95,-.04,.43,.35,.10],contact:[.02,.54,.98,1.57,-.20,.50,.03,.13],follow:[.33,.44,.76,.25,-.25,.48,-.30,.16]},
heavy3:{entry:'light2',direction:1,prep:[.38,.12,1.20,.15,.12,.44,-.30,.07],ready:[.38,.12,1.20,.15,.12,.44,-.30,.07],contact:[.12,.54,1.02,1.50,-.20,.51,.10,.14],follow:[-.18,.49,.78,2.90,-.25,.48,.35,.16]}
};
function end(profile:Profile):number[]{const p=[...profile.follow];p[1]+=.035;p[3]+=.08*profile.direction;p[5]+=.015;p[6]+=.03*profile.direction;return p;}
function smooth(t:number):number{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
export function sampleAttack4C(module:HeroModule,action:ActionView,t=action.progress):Pose{
const profile=profiles[action.clip];if(!profile)throw Error('Unknown 4C clip '+action.clip);t=Math.max(0,Math.min(1,t));const entry=profile.entry?end(profiles[profile.entry]):resting,exit=action.continuation?end(profile):resting,contact=(COMBAT.activeStart+COMBAT.activeEnd)/2,keys:readonly (readonly [number,Vector])[]=[[0,entry],[.20,profile.prep],[COMBAT.activeStart,profile.ready],[contact,profile.contact],[COMBAT.activeEnd,profile.follow],[1,exit]];
let i=1;while(i<keys.length-1&&t>keys[i][0])i++;const a=keys[i-1],b=keys[i],u=smooth((t-a[0])/(b[0]-a[0])),v=a[1].map((n,j)=>n+(b[1][j]-n)*u),p=module.sample('breath',0,0);
p.id=action.clip;p.root=[0,0,0];p.gait=null;p.breath=0;p.right=[v[0],v[1],v[2]];p.az=v[3];p.down=v[4];p.lean=v[5];p.twist=v[6];p.head=v[7];return p;
}
export function attack4CWeight(action:ActionView,t:number):number{const entry=action.stage===0?smooth(t/.12):1;return entry*(action.continuation?1:1-smooth((t-COMBAT.activeEnd)/(COMBAT.moveCancelAt-COMBAT.activeEnd)));}
