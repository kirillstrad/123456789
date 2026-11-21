const encounters=[
 {id:'guard',at:10.9,lessons:['attack'],enemies:[['bonebound',101,8,5.5]]},
 {id:'series',at:1.8,lessons:['combo','heavy'],enemies:[['bonebound',102,6.5,-5],['bonebound',103,9.5,-5]]},
 {id:'archer',at:-9,lessons:['dodge','archer'],enemies:[['marrow-archer',104,8,-15]]},
 {id:'ash',at:-18,lessons:['cancel'],enemies:[['ashbound',105,8,-20.5]]},
 {id:'ossuary',at:-26.5,lessons:['execution'],enemies:[['ossuary-guard',106,8,-29.5]]},
 {id:'bearer',at:-33,lessons:[],enemies:[['gravebearer',107,8,-37]]},
 {id:'mixed',at:-41,lessons:[],enemies:[['bonebound',108,6.5,-46],['marrow-archer',109,9.5,-46]]}
];
export const LAST_SERVICE_ENCOUNTERS=Object.freeze(encounters.map(e=>Object.freeze({...e,lessons:Object.freeze(e.lessons),enemies:Object.freeze(e.enemies.map(Object.freeze))})));
// Conservative radius ceiling; the runtime verifier checks it against the real bestiary.
export const LAST_SERVICE_SPAWN_RADIUS=1.25;
function spawnClear(s,planned){
 const living=(s.enemies??[]).filter(e=>e.hp>0),radius=e=>Number.isFinite(e.radius)?e.radius:LAST_SERVICE_SPAWN_RADIUS;
 if(living.some(e=>Math.hypot(s.x-e.x,s.y-e.y)<radius(e)+.26))return false;
 for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++)if(Math.hypot(living[i].x-living[j].x,living[i].y-living[j].y)<radius(living[i])+radius(living[j])+.02)return false;
 return planned.every(e=>Math.hypot(s.x-e[2],s.y-e[3])>=LAST_SERVICE_SPAWN_RADIUS+.26&&living.every(o=>Math.hypot(o.x-e[2],o.y-e[3])>=radius(o)+LAST_SERVICE_SPAWN_RADIUS+.02));
}
export function createLastServiceRoute(tutorial){
 let index=0,running=null,optional=false;
 const learned=id=>{const s=tutorial.snapshot();return s.read.includes(id)||s.completed.includes(id);};
 return {
 snapshot:()=>({index,running,optionalStarted:optional,finished:index===encounters.length}),
 observe(s){
  if(s.phase==='dead'||s.lamp===0)return;
  // These effects persist across ticks; command events can precede world.step().
  if(s.execution&&s.execution.phase!=='cancelled')tutorial.record?.('execution-started');
  if(s.interaction?.kind==='campfire'&&s.interaction.recoveryGranted>0)tutorial.record?.('ritual-completed');
  if(!running)return;
  const enemies=s.enemies??[];
  const expected=encounters[index].enemies.map(e=>e[1]);
  if(!(s.arrows??[]).length&&!s.execution&&expected.every(id=>enemies.some(e=>e.id===id&&e.hp<=0))){index++;running=null;}
 },
 next(s){
  if(s.phase!=='playing'||tutorial.snapshot().blocksWorld)return null;
  if(!learned('ritual')&&s.y<-22&&s.y>-27&&index>=4){if(tutorial.enter('ritual'))return {kind:'lesson',lesson:tutorial.snapshot().dialogue};}
  if(!running&&!optional&&index>=6&&s.x>15&&s.y<-30&&s.y>-39&&spawnClear(s,[['bloated-remnant',190,18.5,-35.5]]))return {kind:'optional',id:'remnant',enemies:[['bloated-remnant',190,18.5,-35.5]]};
  if(running||index===encounters.length)return null;
  const entry=encounters[index];if(s.y>=entry.at||s.x>14)return null;
  for(const id of entry.lessons)if(!learned(id)){if(tutorial.enter(id))return {kind:'lesson',lesson:tutorial.snapshot().dialogue};return null;}
  return spawnClear(s,entry.enemies)?{kind:'encounter',id:entry.id,enemies:entry.enemies}:null;
 },
 commit(action){
  if(action.kind==='optional'){if(optional||action.id!=='remnant')throw Error('Invalid optional encounter');optional=true;return;}
  if(action.kind!=='encounter'||running||index>=encounters.length||action.id!==encounters[index].id)throw Error('Invalid route encounter');
  running=action.id;
 },
 reset(){index=0;running=null;optional=false;}
 };
}
