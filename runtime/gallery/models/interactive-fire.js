import {createGeometry} from '../geometry.js';
export const NATIVE_FIRE_MODELS=Object.freeze(['simple-candle.a','simple-candle.b','oven.a','campfire.a']);
export function buildInteractiveFire({modelId,status='off',transform={}}={}){
 if(!NATIVE_FIRE_MODELS.includes(modelId))throw Error('Invalid native fire model');if(!['off','smoldering','igniting','lit'].includes(status))throw Error('Invalid fire state');
 const g=createGeometry(transform),iron=[77,75,85],stone=[101,96,103];let local,approachDistance;
 if(modelId.startsWith('simple-candle.')){const h=modelId.endsWith('.b')?.3:.15;g.box(-.025,-.025,.035,.05,.05,h,[130,108,77]);local=[0,0,.035+h];approachDistance=.65;}
 else if(modelId==='oven.a'){g.solidBox(-.55,-.45,0,1.1,.9,1.2,stone);g.box(-.63,-.51,1.2,1.26,1.02,.13,iron);g.box(-.15,-.12,1.33,.3,.3,.55,iron);g.poly([[-.34,.455,.18],[.34,.455,.18],[.34,.455,.94],[-.34,.455,.94]],[12,10,14]);local=[0,.48,.65];approachDistance=1.25;}
 else{g.box(-.45,-.1,.02,.9,.2,.12,[65,45,42]);g.box(-.1,-.45,.035,.2,.9,.12,[73,49,43]);g.collision(-.5,-.5,0,1,1,.2);local=[0,.12,.35];approachDistance=1.25;}
 const bodyParts=[...g.parts],flameParts=[],emberParts=[];
 if(status==='lit'){const [x,y,z]=local,start=g.parts.length;g.dot(x,y,z,2.5,[173,113,53]);g.poly([[x-.04,y,z],[x+.04,y,z],[x+.015,y,z+.18]],[173,113,53]);g.light(x,y,z,modelId==='oven.a'||modelId==='campfire.a'?60:32,modelId.startsWith('simple-candle.')?.3:.5);flameParts.push(...g.parts.slice(start));}
 if(status==='smoldering'){const start=g.parts.length;g.dot(...local,.8,[65,27,16]);emberParts.push(...g.parts.slice(start));}
 const mesh=g.finish(),a=(transform.yaw??0)*Math.PI/180,world=([x,y,z])=>[(transform.x??0)+x*Math.cos(a)-y*Math.sin(a),(transform.y??0)+x*Math.sin(a)+y*Math.cos(a),(transform.z??0)+z],contactPoint=world(local),p=world([0,approachDistance,0]);
 return{...mesh,modelId,status,bodyParts,flameParts,emberParts,contactPoint,emissionPoints:[contactPoint],approach:{x:p[0],y:p[1],z:p[2]},facePoint:{x:contactPoint[0],y:contactPoint[1]}};
}
