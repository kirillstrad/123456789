import test from 'node:test';
import assert from 'node:assert/strict';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {createRitualBonfire} from '../runtime/interaction/ritual-bonfire.js';
import {LAMP_LIFE} from '../runtime/combat/lamp-life.js';

function startRitual(){
 const map={circles:[],rects:[]};
 const world=new CombatWorld(map);
 const fire=createRitualBonfire(world,map);
 world.current.lamp=10;
 Object.assign(world.current.enemy,{x:30,y:30});
 const step=()=>{world.step(1/60);fire.step();};
 assert.equal(fire.press(),true);
 for(let i=0;i<240&&fire.frame();i++)step();
 assert.equal(fire.frame(),null);
 assert.equal(world.current.interaction,null);
 assert.equal(world.current.lamp,10);
 assert.equal(fire.press(),true);
 assert.equal(fire.frame()?.kind,'campfire');
 assert.equal(fire.frame()?.effectDue,false);
 return {world,fire,step};
}
const restored=world=>world.events.filter(event=>event.type==='lamp-restored');

test('death before prayer prevents restoration',()=>{
 const {world,fire,step}=startRitual();
 for(let i=0;i<60;i++)step();
 assert.equal(fire.frame()?.effectDue,false);
 world.damage(20);
 assert.equal(world.current.lamp,1);
 assert.equal(world.current.phase,'playing');
 world.damage(1);
 step();
 assert.equal(world.current.phase,'dead');
 assert.equal(world.current.lamp,0);
 assert.equal(world.current.interaction,null);
 assert.equal(restored(world).length,0);
});

test('prayer restores only once',()=>{
 const {world,fire,step}=startRitual();
 for(let i=0;i<60;i++)step();
 assert.equal(fire.frame()?.effectDue,false);
 assert.equal(world.current.lamp,10);
 assert.equal(restored(world).length,0);
 for(let i=0;i<120&&!fire.frame()?.effectDue;i++)step();
 assert.equal(fire.frame()?.effectDue,true);
 assert.equal(world.current.lamp,LAMP_LIFE.max);
 assert.equal(restored(world).length,1);
 step();
 assert.equal(restored(world).length,1);
});

test('repeated partial recovery is not hidden by the lamp cap',()=>{
 const world=new CombatWorld({circles:[],rects:[]});
 world.current.lamp=50;
 const id=world.beginInteraction('campfire');
 assert.ok(id);
 assert.equal(world.restoreInteractionLamp(id,20),true);
 assert.equal(world.restoreInteractionLamp(id,20),false);
 assert.equal(world.current.lamp,70);
});
