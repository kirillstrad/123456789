export const ASHEN_ROOMS=Object.freeze([{"id": "porch", "x": 4, "y": 9, "w": 8, "h": 6}, {"id": "entry-passage", "x": 12, "y": 10, "w": 3, "h": 4}, {"id": "nave", "x": 15, "y": 7, "w": 10, "h": 10}, {"id": "main-passage", "x": 25, "y": 10, "w": 4, "h": 4}, {"id": "warden-hall", "x": 29, "y": 7, "w": 10, "h": 10}, {"id": "altar", "x": 31, "y": 2, "w": 6, "h": 5}, {"id": "chapel-passage", "x": 18, "y": 17, "w": 4, "h": 5}, {"id": "chapel", "x": 16, "y": 22, "w": 8, "h": 8}, {"id": "burial-passage", "x": 24, "y": 24, "w": 5, "h": 4}, {"id": "burial-wing", "x": 29, "y": 22, "w": 8, "h": 8}, {"id": "return-passage", "x": 32, "y": 17, "w": 4, "h": 5}].map(r=>Object.freeze(r)));
export const ASHEN_PROPS=Object.freeze([["interior.textile.runner.b", 20, 12, 90], ["interior.furniture.split-bench.b", 18.5, 10, 0], ["interior.furniture.split-bench.b", 22, 14, 0], ["interior.textile.prayer-mat.a", 20, 25, 0], ["interior.ritual.open-prayer-book.a", 20, 23.7, 0], ["interior.remains.shrouded-body.b", 31, 26, 0], ["interior.remains.empty-stretcher.b", 34.5, 27, 0], ["interior.ritual.dried-flowers.b", 30.7, 27.4, 0], ["interior.decay.ash-pile.b", 32, 5, 0], ["interior.ritual.empty-pedestal.a", 34, 3.5, 0], ["interior.blood.drag-trail.b", 35.5, 14, 0]].map(([modelId,x,y,yaw],i)=>Object.freeze({modelId,x,y,yaw,z:0,instanceId:'ashen.prop.'+String(i+1).padStart(2,'0')})));
export const ASHEN_DOORS=Object.freeze([
 Object.freeze({id:'ashen.main-gate',modelId:'prison-door.a',x:27,y:12,yaw:90}),
 Object.freeze({id:'ashen.return-gate',modelId:'prison-door.a',x:34,y:19,yaw:0}),
]);
export const ASHEN_BOUNDS=Object.freeze({minX:2,maxX:42,minY:2,maxY:32});
export const ASHEN_LIGHTS=Object.freeze([[10.5,10],[16.5,8.5],[23.5,15.5],[17.5,28.5],[35.5,23.5],[37.5,8.5]].map(([x,y],i)=>Object.freeze({id:'ashen.light.'+(i+1),modelId:'brazier.a',initialStatus:'off',row:'lantern',transform:Object.freeze({x,y,yaw:0})})));
export const ashenWalkable=(x,y)=>ASHEN_ROOMS.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
export function createAshenPlan(){
 const tiles=[],voidRows=[];
 for(let y=2;y<32;y++){
  let start=null;
  for(let x=2;x<=42;x++){
   const walk=x<42&&ashenWalkable(x+.5,y+.5);
   if(walk)tiles.push({x,y});
   if(!walk&&x<42&&start===null)start=x;
   if((walk||x===42)&&start!==null){voidRows.push({minX:start,maxX:x,minY:y,maxY:y+1});start=null;}
  }
 }
 // Merge vertically adjacent spans with identical X extents.
 const merged=[],previous=new Map();
 for(const r of voidRows){const key=r.minX+':'+r.maxX,old=previous.get(key);if(old&&old.maxY===r.minY)old.maxY=r.maxY;else{const next={...r};merged.push(next);previous.set(key,next);}}
 return {id:'ashen-nave',tiles,rooms:ASHEN_ROOMS.map(r=>({...r})),doors:ASHEN_DOORS.map(d=>({...d})),lights:ASHEN_LIGHTS.map(l=>({...l,transform:{...l.transform}})),bounds:{...ASHEN_BOUNDS},obstacles:{circles:[{x:18,y:9,r:.32},{x:22,y:9,r:.32},{x:18,y:15,r:.32},{x:22,y:15,r:.32}],rects:merged}};
}
