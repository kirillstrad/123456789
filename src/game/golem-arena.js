export const GOLEM_BOUNDS=Object.freeze({minX:2.4,maxX:13.6,minY:2.4,maxY:19.6});
export function golemArenaMap(){
  return {bounds:{...GOLEM_BOUNDS},circles:[],rects:[
    {minX:2,maxX:2.4,minY:2,maxY:20},
    {minX:13.6,maxX:14,minY:2,maxY:20},
    {minX:2,maxX:14,minY:2,maxY:2.4},
    {minX:2,maxX:14,minY:19.6,maxY:20},
    {minX:2.4,maxX:6.8,minY:14.5,maxY:14.75},
    {minX:9.2,maxX:13.6,minY:14.5,maxY:14.75},
  ]};
}
export function createGolemArena(map,bossId){
  if(!Array.isArray(map?.rects)||!Number.isSafeInteger(bossId))throw Error('Invalid golem arena owner');
  const rects=map.rects;
  if(map.rects!==rects||Object.isFrozen(rects))throw Error('Arena requires stable mutable collision rectangles');
  let status='waiting',inRoom=false;
  const gate={minX:6.8,maxX:9.2,minY:14.5,maxY:14.75,golemGate:true};
  function sync(){
    const i=map.rects.indexOf(gate),locked=status==='fighting'||status==='failed';
    if(locked&&i<0){map.rects.push(gate);map.golemRevision=(map.golemRevision??0)+1;}
    if(!locked&&i>=0){map.rects.splice(i,1);map.golemRevision=(map.golemRevision??0)+1;}
  }
  const snapshot=()=>({bossId,status,inRoom,active:status==='fighting',
    locked:status==='fighting'||status==='failed'});
  return Object.freeze({
    snapshot,
    reset(){status='waiting';inRoom=false;sync();},
    update(hero,boss){
      if(map.rects!==rects)throw Error('Arena collision owner changed');
      if(!boss||boss.id!==bossId)throw Error('Golem arena lost its boss');
      if(!hero||![hero.x,hero.y,hero.lamp,boss.hp].every(Number.isFinite))throw Error('Invalid arena state');
      inRoom=hero.x>=2.65&&hero.x<=13.35&&hero.y>=2.65&&hero.y<=14.25;
      if(status==='fighting'&&(hero.phase==='dead'||hero.lamp<=0))status='failed';
      if(status==='waiting'&&inRoom&&hero.y<=13.8&&hero.lamp>0&&hero.phase==='playing'&&boss.hp>0)status='fighting';
      if(status==='fighting'&&boss.hp<=0&&!hero.execution&&hero.lamp>0&&hero.phase!=='dead')status='won';
      sync();
      if((status==='fighting'||status==='failed')&&hero.phase!=='dead'){
        hero.x=Math.max(2.65,Math.min(13.35,hero.x));
        hero.y=Math.max(2.65,Math.min(14.25,hero.y));inRoom=true;
      }
      return snapshot();
    },
  });
}
