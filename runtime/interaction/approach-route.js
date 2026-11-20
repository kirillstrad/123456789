import {createGalleryCollisionWorld} from '../gallery/collision.js';

// Pure, bounded ground-plane planning. No actor, input or intent mutation.
export function planApproachRoute({start,goal,colliders,bounds,radius=.24,cellSize=.5,maxVisited=4096}={}){
 const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.z??0)===0;
 if(!point(start)||!point(goal)||!bounds||!['minX','maxX','minY','maxY'].every(k=>Number.isFinite(bounds[k]))||![radius,cellSize,maxVisited].every(Number.isFinite)||radius<.1||radius>2||cellSize<.1||cellSize>2||!Number.isInteger(maxVisited)||maxVisited<1||maxVisited>16384||bounds.maxX-bounds.minX>128||bounds.maxY-bounds.minY>128)throw Error('Invalid approach route request');
 const world=createGalleryCollisionWorld(colliders,bounds,{radius});
 const same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-8;
 const result=(status,points=[],visited=0)=>{
  let previous=start;const waypoints=[];
  for(const p of points)if(!same(previous,p)){waypoints.push(Object.freeze({x:p.x,y:p.y}));previous=p;}
  return Object.freeze({status,waypoints:Object.freeze(waypoints),visited});
 };
 if(!world.isFree(start.x,start.y)||!world.isFree(goal.x,goal.y))return result('unreachable');
 if(same(start,goal))return result('arrived');
 function link(a,b){
  for(const corner of [{x:b.x,y:a.y},{x:a.x,y:b.y}]){
   let p=a;const points=[];let valid=true;
   for(const q of [corner,b]){
    if(same(p,q))continue;
    const next=world.move(p.x,p.y,q.x-p.x,q.y-p.y);
    if(next.blocked||!same(next,q)){valid=false;break;}
    points.push(q);p=q;
   }
   if(valid)return points;
  }
  return null;
 }
 const direct=link(start,goal);if(direct)return result('ready',direct);
 const minX=bounds.minX+radius,minY=bounds.minY+radius;
 const nx=Math.floor((bounds.maxX-radius-minX)/cellSize),ny=Math.floor((bounds.maxY-radius-minY)/cellSize),cols=nx+1;
 if(cols*(ny+1)>65536)return result('budget-exceeded');
 const position=id=>({x:minX+(id%cols)*cellSize,y:minY+Math.floor(id/cols)*cellSize});
 function attachments(p,reverse=false){
  const x=(p.x-minX)/cellSize,y=(p.y-minY)/cellSize,found=new Map();
  for(const i of new Set([Math.max(0,Math.min(nx,Math.floor(x))),Math.max(0,Math.min(nx,Math.ceil(x)))]))
   for(const j of new Set([Math.max(0,Math.min(ny,Math.floor(y))),Math.max(0,Math.min(ny,Math.ceil(y)))])){
    const id=j*cols+i,q=position(id);if(!world.isFree(q.x,q.y))continue;
    const path=reverse?link(q,p):link(p,q);if(path)found.set(id,path);
   }
  return found;
 }
 const seeds=attachments(start),ends=attachments(goal,true),parents=new Map(),queue=[];
 if(!seeds.size||!ends.size)return result('unreachable');
 for(const id of seeds.keys()){parents.set(id,null);queue.push(id);}
 let head=0,visited=0;
 while(head<queue.length){
  if(visited>=maxVisited)return result('budget-exceeded',[],visited);
  const id=queue[head++];visited++;
  if(ends.has(id)){
   const chain=[];let root=id;
   for(let k=id;k!==null;k=parents.get(k)){chain.push(k);root=k;}
   chain.reverse();
   return result('ready',[...seeds.get(root),...chain.slice(1).map(position),...ends.get(id)],visited);
  }
  const x=id%cols,y=Math.floor(id/cols),p=position(id);
  for(const [i,j] of [[x+1,y],[x,y+1],[x-1,y],[x,y-1]]){
   if(i<0||i>nx||j<0||j>ny)continue;
   const next=j*cols+i;if(parents.has(next))continue;
   const q=position(next);if(!world.isFree(q.x,q.y))continue;
   const moved=world.move(p.x,p.y,q.x-p.x,q.y-p.y);
   if(moved.blocked||!same(moved,q))continue;
   parents.set(next,id);queue.push(next);
  }
 }
 return result('unreachable',[],visited);
}
