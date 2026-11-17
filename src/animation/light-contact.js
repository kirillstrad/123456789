import {doorContactToPose,doorContactToWorld} from './door-contact.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// The authored lamp flame is 0.08 world units below the left hand.
export const LAMP_HAND_OFFSET=.08;
export function sampleLightContact(pose,frame,module){
 const bind=frame.lightContact,point=bind?.point,actor=bind?.actor;
 if(!actor||![actor.x,actor.y,actor.heading].every(Number.isFinite)||!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite))throw Error('Invalid light contact binding');
 const weight=smooth((frame.progress-.15)/.35)*(1-smooth((frame.progress-.65)/.3));
 if(weight<=0)return{pose,rig:module.rig(pose),clip:frame.clip};
 const hand=doorContactToPose(actor,pose.root,[point[0],point[1],point[2]+LAMP_HAND_OFFSET]);let fitted=null,best=Infinity;
 for(let c=0;c<=8;c++)for(let l=0;l<=4;l++){const crouch=c*.1,lean=l*.15,candidate={...pose,root:[pose.root[0],pose.root[1],pose.root[2]-crouch],lean:pose.lean+lean},shoulder=module.body(candidate,[-.18,.02,1.42]),reach=Math.hypot(...shoulder.map((v,i)=>v-hand[i])),score=crouch+lean*.45;if(reach>.695||reach<.025||score>=best)continue;candidate.left=[hand[0]-candidate.root[0],hand[1]-candidate.root[1],hand[2]-candidate.root[2]];fitted=candidate;best=score;}
 if(!fitted)throw Error('Unreachable light contact: check approach and source height');
 const mixed={...pose,root:pose.root.map((v,i)=>v+(fitted.root[i]-v)*weight),lean:pose.lean+(fitted.lean-pose.lean)*weight,left:pose.left.map((v,i)=>v+(fitted.left[i]-v)*weight)},rig=module.rig(mixed);
 if(frame.progress>=.5&&frame.progress<=.65){const actual=doorContactToWorld(actor,mixed.root,rig.arms[0].end);actual[2]-=LAMP_HAND_OFFSET;if(Math.hypot(...actual.map((v,i)=>v-point[i]))>.04)throw Error('Light lamp contact error');}
 return{pose:mixed,rig,clip:frame.clip};
}
