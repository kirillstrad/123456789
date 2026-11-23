// LAST_SERVICE_THRESHOLDS_PASS4
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lastServiceChapelStatus as status} from '../src/game/last-service-chapel-entry.js';
import {createLastServiceRoute,LAST_SERVICE_ENCOUNTERS} from '../src/game/last-service-route.js';
import {createLastServiceFinale as realFinale} from '../src/game/last-service-finale.js';
import {buildLastServiceInteriorPass2 as build} from '../src/levels/last-service-interior-pass2.js';
const ready=()=>({s:{x:8,y:-49.4,phase:'playing',lamp:37,hitReaction:0,arrows:[]},route:{finished:true,index:7},tutorial:{read:['boss'],completed:[],blocksWorld:false},idle:true,blocked:false});
for(const [name,modify,reason]of [
 ['unfinished route',q=>q.route.finished=false,'route'],
 ['unread warning',q=>q.tutorial.read=[],'lesson'],
 ['arrows',q=>q.s.arrows=[{}],'busy'],
 ['active action',q=>q.idle=false,'busy'],
 ['hit recovery',q=>q.s.hitReaction=.2,'busy'],
 ['pause',q=>q.blocked=true,'blocked'],
 ['tutorial pause',q=>q.tutorial.blocksWorld=true,'blocked'],
 ['dead actor',q=>q.s.phase='dead','not-alive'],
 ['zero lamp',q=>q.s.lamp=0,'not-alive'],
 ['outside portal',q=>q.s.x=12,'far'],
 ['already in finale',q=>q.hasFinale=true,'far']
])test('chapel reports '+name+' without bypass',()=>{const q=ready();modify(q);const g=status(q);assert.equal(g.ready,false);assert.equal(g.reason,reason);assert.ok(g.text.length>0);});
test('completed lesson counts as learned and all valid conditions permit entry',()=>{assert.equal(status(ready()).ready,true);const q=ready();q.tutorial.read=[];q.tutorial.completed=['boss'];assert.equal(status(q).ready,true);});
function hostFixture(){
 const read=new Set(['attack','combo','heavy','dodge','archer','cancel','execution','ritual','door','light']);
 let lesson=null,opened=null,creates=0,decorates=0;
 const tutorial={snapshot:()=>({read:[...read],completed:[],blocksWorld:!!lesson,dialogue:lesson}),enter(id){if(read.has(id)||lesson)return false;lesson={id};return true;},dismiss(){read.add(lesson.id);lesson=null;}};
 const route=createLastServiceRoute(tutorial),s={x:8,y:-49.4,lamp:37,phase:'playing',arrows:[],execution:null,sweepProgress:null,hitReaction:0,enemies:[]},world={current:s};
 const raw=fs.readFileSync(new URL('../src/app/last-service-mounted.js',import.meta.url),'utf8'),start=raw.indexOf('function enterChapel(){'),end=raw.indexOf('function pressBook(){',start);
 assert.ok(start>=0&&end>start);const source=raw.slice(start,end);
 const deps={loading:{start(_id,load){load();return true;}},world,chapelStatus:()=>status({s,route:route.snapshot(),tutorial:tutorial.snapshot(),hasFinale:!!opened}),segment:{tutorial},dialogue(){},objective(){},clear(){},controller:{cancel(){}},makeWorld:map=>({current:{x:8,y:12,phase:'playing',lamp:100,enemies:[],enemy:{hp:0}},startGolemTrial(){assert.equal(map.dressed,true);this.current.bossEncounter={status:'waiting'};},step(){if(this.current.y<14.25)this.current.bossEncounter={status:'preparing',locked:true};},snapshot(){return structuredClone(this.current);}}),createGolemTrialScene:()=>({doorScene:{map:{rects:[]}},env:{}}),dressLastServiceScene:(scene,kind)=>{assert.equal(kind,'chapel');decorates++;scene.doorScene.map.dressed=true;return scene;},createKeeperScene:()=>({map:{rects:[]},env:{}}),captureGolemLoadout:s=>({lamp:s.lamp}),restoreGolemLoadout:(s,c)=>Object.assign(s,c),story:{play:id=>assert.equal(id,'awakening')},createLastServiceFinale:(...args)=>{creates++;opened=realFinale(...args);return opened;}};
 const api=Function(...Object.keys(deps),'let finale=null;const blocked=()=>false;const idle=()=>true;const route={snapshot:()=>({finished:true})};'+source+';return {press:enterChapel};')(...Object.values(deps));
 return {s,route,tutorial,api,opened:()=>opened,counts:()=>({creates,decorates}),complete(){for(const entry of LAST_SERVICE_ENCOUNTERS){const a=route.next(s);assert.equal(a?.id,entry.id);route.commit(a);route.observe({...s,enemies:a.enemies.map(e=>({id:e[1],hp:0}))});}}};
}
test('real host entry consumes locked F, completes actual route, reads warning and opens boss exactly once',()=>{
 const f=hostFixture();assert.equal(f.api.press(),true);assert.equal(f.opened(),null);
 f.complete();assert.equal(f.route.snapshot().finished,true);
 assert.equal(f.api.press(),true);assert.equal(f.opened(),null);assert.equal(f.tutorial.snapshot().dialogue.id,'boss');
 f.tutorial.dismiss();assert.equal(f.api.press(),true);assert.equal(f.opened().snapshot().chapter,'boss');
 assert.equal(f.opened().world.current.lamp,37);assert.equal(f.opened().world.current.bossEncounter.locked,true);
 assert.equal(f.api.press(),false);assert.deepEqual(f.counts(),{creates:1,decorates:1});
});
const hit=(x,y,r,o)=>x>o.minX-r&&x<o.maxX+r&&y>o.minY-r&&y<o.maxY+r;
for(const kind of ['wing','chapel','keeper'])test(kind+' enrichment is deterministic, finite and composition-based',()=>{
 const d=build(kind);assert.deepEqual(d,build(kind));assert.ok(d.parts.length>200);assert.ok(d.features.length>10);
 for(const p of d.parts){assert.ok(Number.isFinite(p.d));assert.ok(p.v.every(v=>v.length===3&&v.every(Number.isFinite)));}
 for(const r of d.rects)assert.ok(r.minX<r.maxX&&r.minY<r.maxY);
});
test('new furniture preserves authored spawns, shrine, book, boss, exit and portal',()=>{
 const sets={wing:[[8,5.5,.32],[6.5,-5,.32],[9.5,-5,.32],[8,-15,.32],[8,-20.5,.28],[8,-29.5,.38],[8,-37,.4],[6.5,-46,.32],[9.5,-46,.32],[18.5,-35.5,.54],[5,-25,.24],[8,-25,.24],[8,-49.4,.24],[8,18.2,.24]],chapel:[[8,7,.85],[8,8.3,.24],[8,14.1,.24],[8,17,.24]],keeper:[[8,7,.24],[8,12,.24]]};
 for(const [kind,points]of Object.entries(sets)){const d=build(kind);for(const [x,y,r]of points)assert.ok(!d.rects.some(o=>hit(x,y,r,o)),`Blocked ${kind}: ${x},${y}`);}
 assert.ok(build('wing').features.some(f=>f.type==='chapel-portal'));
});
test('wall visibility no longer depends on projected hero overlap or a 0.2 alpha multiplier',()=>{
 const view=fs.readFileSync(new URL('../src/app/last-service-view.js',import.meta.url),'utf8');
 assert.ok(!view.includes('ctx.globalAlpha*=.2'));assert.ok(!view.includes('heroScreen'));
 assert.ok(view.includes('ctx.globalAlpha=(p.wall||p.occluder)?1:(p.alpha??1)'));
 const entry=fs.readFileSync(new URL('../src/levels/last-service-entry.js',import.meta.url),'utf8');
 assert.ok(entry.includes('const h=near?.75:partition?1.1:2.4;'));
});
