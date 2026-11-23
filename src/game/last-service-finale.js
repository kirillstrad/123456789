// LAST_SERVICE_THRESHOLDS_PASS4
export function createLastServiceFinale(source,{createWorld,createArena,createKeeper,capture,restore,transition=null,startChapter='boss'}){
 if(!['boss','keeper'].includes(startChapter))throw Error('Invalid finale chapter');
 const checkpoint=capture(source);let scene=startChapter==='boss'?createArena():createKeeper(),world=createWorld(scene.doorScene?.map??scene.map),chapter=startChapter,done=false,migrating=false;
 if(chapter==='boss'){
  world.startGolemTrial();restore(world.current,checkpoint);
  Object.assign(world.current,{y:14.1,cameraY:14.1});world.previous=world.snapshot();world.step(1/60,{x:0,y:0});
 }else{
  restore(world.current,checkpoint);Object.assign(world.current,{x:8,y:12,cameraX:8,cameraY:12,enemies:[],enemy:{...world.current.enemy,hp:0,mode:'dead'}});world.previous=world.snapshot();
 }
 return {
 get world(){return world;},
 snapshot:()=>({chapter,done}),
 frame:()=>({s:world.snapshot(),env:scene.env,map:scene.doorScene?.map??scene.map,chapter}),
 step(dt,input){
  if(done||migrating)return;world.step(dt,input);scene.env.step?.(dt);
  if(chapter!=='boss'||world.current.phase==='dead'||world.current.bossEncounter?.status!=='won'||world.current.execution||world.current.y<=16)return;
  const move=()=>{try{
   const carried=capture(world.current),next=createKeeper(),nextWorld=createWorld(next.map);
   restore(nextWorld.current,carried);nextWorld.current.enemies=[];nextWorld.current.enemy={...nextWorld.current.enemy,hp:0,mode:'dead'};nextWorld.previous=nextWorld.snapshot();
   scene=next;world=nextWorld;chapter='keeper';
  }finally{migrating=false;}};
  if(transition){migrating=true;try{if(transition('keeper',move)===false)migrating=false;}catch(error){migrating=false;throw error;}}else move();
 },
 complete(){if(chapter!=='keeper'||world.current.phase!=='playing')return false;done=true;return true;}
 };
}
