const entries=[
 {id:'test-chamber',title:'TEST CHAMBER',description:'Combat, lighting and interior test room.',status:'ready'},
 {id:'ashen-nave',title:'THE ASHEN NAVE',description:'Explore the nave, its chapel and burial wing. Defeat the warden.',status:'prototype'},
 {id:'bonebound-trial',title:'BONEBOUND TRIAL',description:'Three undead. Development combat encounter.',status:'prototype'},
 {id:'undead-trial',title:'UNDEAD TRIAL',description:'Five distinct melee undead. Provisional balance.',status:'prototype'},
];
export const GAME_LEVELS=Object.freeze(entries.map(e=>Object.freeze(e)));
export function gameLevel(id){const level=GAME_LEVELS.find(l=>l.id===id);if(!level)throw Error('Unknown game level: '+id);return level;}
export function applyLevelSpawn(world,id){
 gameLevel(id);if(id==='undead-trial'){world.startUndeadTrial();return;}if(id==='bonebound-trial'){world.startBoneboundTrial();return;}if(id==='test-chamber')return;
 for(const s of [world.current,world.previous]){
  Object.assign(s,{x:8,y:12,cameraX:8,cameraY:12,fx:1,fy:0,note:'Explore the ashen nave. The warden waits beyond the gate.'});
  Object.assign(s.enemy,{x:34,y:12});
  if(s.motion){s.motion.heading=0;if('facing' in s.motion)s.motion.facing=0;}
 }
}
