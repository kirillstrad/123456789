export function createLastServiceFinale(source,{createWorld,createArena,createKeeper,capture,restore}){
 const checkpoint=capture(source);let scene=createArena(),world=createWorld(scene.doorScene.map),chapter='boss',done=false;
 world.startGolemTrial();restore(world.current,checkpoint);
 Object.assign(world.current,{y:14.1,cameraY:14.1});world.previous=world.snapshot();
 // Enter fully before the presentation starts; this closes the existing gate.
 world.step(1/60,{x:0,y:0});
 return {
 get world(){return world;},
 snapshot:()=>({chapter,done}),
 frame:()=>({s:world.snapshot(),env:scene.env,map:scene.doorScene?.map??scene.map,chapter}),
 step(dt,input){
  if(done)return;world.step(dt,input);scene.env.step?.(dt);
  if(chapter!=='boss'||world.current.phase==='dead'||world.current.bossEncounter?.status!=='won'||world.current.execution||world.current.y<=16)return;
  const carried=capture(world.current),next=createKeeper(),nextWorld=createWorld(next.map);
  restore(nextWorld.current,carried);nextWorld.current.enemies=[];nextWorld.current.enemy={...nextWorld.current.enemy,hp:0,mode:'dead'};nextWorld.previous=nextWorld.snapshot();
  scene=next;world=nextWorld;chapter='keeper';
 },
 complete(){if(chapter!=='keeper'||world.current.phase!=='playing')return false;done=true;return true;}
 };
}
