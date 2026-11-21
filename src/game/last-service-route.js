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
export function createLastServiceRoute(tutorial){
 let index=0,running=null,optional=false;
 const learned=id=>{const s=tutorial.snapshot();return s.read.includes(id)||s.completed.includes(id);};
 return {
 snapshot:()=>({index,running,optionalStarted:optional,finished:index===encounters.length}),
 observe(s){
  if(!running)return;
  const enemies=s.enemies??[];
  const expected=encounters[index].enemies.map(e=>e[1]);
  if(!(s.arrows??[]).length&&!s.execution&&expected.every(id=>enemies.some(e=>e.id===id&&e.hp<=0))){index++;running=null;}
 },
 next(s){
  if(s.phase!=='playing'||tutorial.snapshot().blocksWorld)return null;
  if(!learned('ritual')&&s.y<-22&&s.y>-27&&index>=4){if(tutorial.enter('ritual'))return {kind:'lesson',lesson:tutorial.snapshot().dialogue};}
  if(!running&&!optional&&index>=6&&s.x>15&&s.y<-30&&s.y>-39)return {kind:'optional',id:'remnant',enemies:[['bloated-remnant',190,18.5,-35.5]]};
  if(running||index===encounters.length)return null;
  const entry=encounters[index];if(s.y>=entry.at||s.x>14)return null;
  for(const id of entry.lessons)if(!learned(id)){if(tutorial.enter(id))return {kind:'lesson',lesson:tutorial.snapshot().dialogue};return null;}
  return {kind:'encounter',id:entry.id,enemies:entry.enemies};
 },
 commit(action){
  if(action.kind==='optional'){if(optional||action.id!=='remnant')throw Error('Invalid optional encounter');optional=true;return;}
  if(action.kind!=='encounter'||running||index>=encounters.length||action.id!==encounters[index].id)throw Error('Invalid route encounter');
  running=action.id;
 },
 reset(){index=0;running=null;optional=false;}
 };
}
