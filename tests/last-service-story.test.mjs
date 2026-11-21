import test from 'node:test';
import assert from 'node:assert/strict';
import {createLastServiceStory,createKeeperScene,storyWeight} from '../src/game/last-service-story.js';
import {createLastServiceFinale} from '../src/game/last-service-finale.js';
test('story pause and completion are deterministic',()=>{
 const s=createLastServiceStory();assert.equal(s.play('ledger'),true);assert.equal(s.play('register'),false);
 s.tick(10,{paused:true});assert.equal(s.snapshot().elapsed,0);s.tick(10);assert.equal(s.snapshot(),null);assert.equal(s.takeFinished(),'ledger');assert.equal(s.takeFinished(),null);assert.equal(s.hasPlayed('ledger'),true);
});
test('skip and full playback have identical completion state',()=>{
 for(const id of ['first-spark','ledger','awakening','register']){
  const a=createLastServiceStory(),b=createLastServiceStory();a.play(id);b.play(id);a.tick(10);assert.equal(b.skip(),true);
  assert.equal(a.snapshot(),b.snapshot());assert.equal(a.takeFinished(),b.takeFinished());assert.equal(a.hasPlayed(id),b.hasPlayed(id));assert.equal(b.skip(),false);
 }
});
test('retry retains viewed scenes but fresh reset clears them',()=>{
 const s=createLastServiceStory();s.play('ledger');s.skip();s.reset({keepPlayed:true});assert.equal(s.hasPlayed('ledger'),true);assert.equal(s.takeFinished(),null);s.reset();assert.equal(s.hasPlayed('ledger'),false);
});
test('invalid scene/timing fail and animation envelope returns to rest',()=>{
 const s=createLastServiceStory();assert.throws(()=>s.play('missing'));for(const dt of [-1,NaN,Infinity])assert.throws(()=>s.tick(dt));assert.equal(storyWeight(0),0);assert.equal(storyWeight(1),0);for(let t=0;t<1;t+=.01)assert.ok(storyWeight(t)>=0&&storyWeight(t)<=1);
});
test('keeper room encloses its spawn and book',()=>{
 const {map,env}=createKeeperScene();for(const [x,y]of [[8,12],[8,7]])assert.ok(x>map.bounds.minX&&x<map.bounds.maxX&&y>map.bounds.minY&&y<map.bounds.maxY);assert.ok(env.parts.length>0);
});
function fixture(){
 const worlds=[];
 const createWorld=()=>{
  const w={current:{lamp:100,x:8,y:12,cameraX:8,cameraY:12,phase:'playing',enemies:[],enemy:{id:1,hp:10}},snapshot(){return structuredClone(this.current);},startGolemTrial(){this.current.y=17;this.current.bossEncounter={status:'waiting'};},step(){if(this.current.bossEncounter?.status==='waiting'&&this.current.y<14.25)this.current.bossEncounter.status='preparing';}};
  worlds.push(w);return w;
 };
 const dependencies={createWorld,createArena:()=>({doorScene:{map:{}},env:{}}),createKeeper:createKeeperScene,capture:s=>{if(s.lamp<=0)throw Error('Dead hero');return {lamp:s.lamp};},restore:(s,c)=>Object.assign(s,c)};
 return {worlds,dependencies};
}
test('arena entry carries lamp and does not finish merely on boss HP/death',()=>{
 const {dependencies}=fixture(),f=createLastServiceFinale({lamp:23},dependencies);assert.equal(f.world.current.lamp,23);assert.equal(f.world.current.bossEncounter.status,'preparing');assert.equal(f.complete(),false);
 f.world.current.y=17;f.world.current.bossEncounter.status='dying';f.step(1/60,{});assert.equal(f.snapshot().chapter,'boss');
 f.world.current.bossEncounter.status='won';f.world.current.execution={};f.step(1/60,{});assert.equal(f.snapshot().chapter,'boss');
});
test('won arena requires exit and preserves remaining lamp in keeper room',()=>{
 const {dependencies}=fixture(),f=createLastServiceFinale({lamp:37},dependencies);f.world.current.lamp=11;f.world.current.bossEncounter.status='won';f.world.current.y=10;f.step(1/60,{});assert.equal(f.snapshot().chapter,'boss');
 f.world.current.y=17;f.step(1/60,{});assert.equal(f.snapshot().chapter,'keeper');assert.equal(f.world.current.lamp,11);assert.deepEqual(f.world.current.enemies,[]);assert.equal(f.complete(),true);assert.equal(f.snapshot().done,true);
});
