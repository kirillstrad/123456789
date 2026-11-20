import {createGeometry} from '../geometry.js';
import {objectById,PALETTE} from '../registry.js';
import {buildRemaining} from './remaining.js';
// Explicit opt-in adapter; the catalogue builder remains unchanged.
export function buildLightGeometry({modelId,status='off',transform={}}={}){
 const spec=objectById(modelId);
 if(!spec||spec.role!=='light'||!['brazier','candlesticks','wall-light'].includes(spec.familyId))throw Error('Invalid light model');
 if(!['off','smoldering','igniting','lit'].includes(status))throw Error('Invalid light geometry state');
 if(!transform||typeof transform!=='object'||Array.isArray(transform))throw Error('Invalid light transform');
 const g=createGeometry(transform),flameIndices=new Set(),emitters=[];let pending=null;
 // The existing flame author emits dot -> triangle -> light. Verify each
 // sequence rather than guessing from arbitrary part indices or colours alone.
 const recorder=new Proxy(g,{get(target,key){const value=target[key];if(typeof value!=='function')return value;return(...args)=>{
  if(pending){
   const expected=pending.phase===0?'poly':'light';if(key!==expected)throw Error('Light flame authoring changed');
   if(key==='poly'){
    const [x,y,z]=pending.local,want=[[x-.04,y,z],[x+.04,y,z],[x+.015,y,z+.18]];
    if(args[1]!==PALETTE.candle||JSON.stringify(args[0])!==JSON.stringify(want))throw Error('Light flame triangle changed');
    flameIndices.add(g.parts.length);pending.phase=1;
   }else{
    if(args[0]!==pending.local[0]||args[1]!==pending.local[1]||args[2]!==pending.local[2])throw Error('Light emission position changed');
    const result=value(...args);emitters.push({point:[...g.parts[pending.dot].v[0]],dot:g.parts[pending.dot],light:g.lights.at(-1)});pending=null;return result;
   }
  }else if(key==='dot'&&args[3]===2.5&&args[4]===PALETTE.candle){pending={local:args.slice(0,3),dot:g.parts.length,phase:0};flameIndices.add(g.parts.length);}
  return value(...args);
 };}});
 buildRemaining(spec.familyId,spec.variant,recorder);
 if(pending||emitters.length===0||emitters.length!==g.lights.length)throw Error('Incomplete light flame authoring');
 const authored=g.finish(),bodyParts=authored.parts.filter((_,i)=>!flameIndices.has(i)),flameParts=authored.parts.filter((_,i)=>flameIndices.has(i));
 const emberParts=status==='smoldering'?emitters.map(e=>({...e.dot,c:[65,27,16],r:.8})):[];
 const parts=status==='lit'?authored.parts:[...bodyParts,...emberParts],lights=status==='lit'?authored.lights.map(l=>({...l})):[];
 const x=transform.x??0,y=transform.y??0,z=transform.z??0,a=(transform.yaw??0)*Math.PI/180;
 const world=([px,py,pz])=>[x+px*Math.cos(a)-py*Math.sin(a),y+px*Math.sin(a)+py*Math.cos(a),z+pz];
 const distance=spec.familyId==='brazier'?1.1:spec.familyId==='wall-light'?.95:.85;
 const p=world([0,-distance,0]),contactPoint=[...emitters[0].point];
 const vertices=parts.flatMap(p=>p.v),bounds={};
 for(const [axis,i]of [['X',0],['Y',1],['Z',2]]){bounds['min'+axis]=Math.min(...vertices.map(p=>p[i]));bounds['max'+axis]=Math.max(...vertices.map(p=>p[i]));}
 return{...authored,modelId,familyId:spec.familyId,variant:spec.variant,status,parts,lights,bounds,bodyParts,flameParts,emberParts,emissionPoints:emitters.map(e=>[...e.point]),contactPoint,approach:{x:p[0],y:p[1],z:p[2]},facePoint:{x:contactPoint[0],y:contactPoint[1]}};
}
