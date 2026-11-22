// LAST_SERVICE_WORLD_PASS3
// LAST_SERVICE_INTERIOR_PASS2
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {relicAlphabet,relicLetters,relicUnsupportedCharacters} from '../src/ui/relic-font.js';
import {buildLastServiceDressing,dressingEnvironment,dressLastServiceScene} from '../src/levels/last-service-dressing.js';
import {createLastServiceEntry} from '../src/levels/last-service-entry.js';
import {lastServiceEnemyName,lastServiceRoom,paintLastServiceLabels} from '../src/ui/last-service-localization.js';
const russian='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
test('all Russian letters and lowercase variants have embedded glyphs',()=>{
 assert.deepEqual(relicUnsupportedCharacters(russian+russian.toLowerCase()),[]);
 for(const c of russian){assert.notEqual(relicAlphabet[c],relicAlphabet['?']);assert.equal(relicAlphabet[c].length,7);for(const row of relicAlphabet[c])assert.match(row,/^[01]{5}$/);}
 assert.notDeepEqual(relicAlphabet['И'],relicAlphabet['Н']);assert.notDeepEqual(relicAlphabet['Е'],relicAlphabet['Ё']);
});
test('Russian punctuation and HUD instructions do not fall back to question marks',()=>{
 assert.deepEqual(relicUnsupportedCharacters('«Последняя служба» — огонь ещё тлеет… ЛКМ / ПКМ · ЛАМПА 70/100; РЫВОК ГОТОВ!'),[]);
 assert.deepEqual(relicUnsupportedCharacters('☃'),['☃']);
});
test('font drawing uses finite bitmap rectangles for Russian body and gothic headings',()=>{
 const rects=[],ctx={fillRect:(...a)=>rects.push(a)};
 relicLetters(ctx,'ПЕЧАТЬ ЦЕЛА',0,0,1.5,true);relicLetters(ctx,'Служба продолжается.',0,30,1.2);
 assert.ok(rects.length>100);assert.ok(rects.every(a=>a.every(Number.isFinite)&&a[2]>0&&a[3]>0));
});
for(const kind of ['wing','chapel','keeper']){
 test(kind+' has deterministic finite architectural and prop geometry',()=>{
  const d=buildLastServiceDressing(kind);assert.deepEqual(d,buildLastServiceDressing(kind));
  assert.ok(d.parts.length>200);assert.ok(d.features.length>=8);assert.ok(d.lights.length>0);
  for(const p of d.parts){assert.ok(Number.isFinite(p.d));assert.ok(p.v.every(v=>v.length===3&&v.every(Number.isFinite)));}
  for(const r of d.rects)assert.ok(r.minX<r.maxX&&r.minY<r.maxY);
  for(const l of d.lights)assert.ok([l.x,l.y,l.z,l.r,l.power].every(Number.isFinite)&&l.r>0&&l.power>0);
 });
}
const hits=(x,y,r,rect)=>x>rect.minX-r&&x<rect.maxX+r&&y>rect.minY-r&&y<rect.maxY+r;
test('dressing leaves all authored enemy spawns and key interactions free',()=>{
 const d=buildLastServiceDressing('wing');
 const points=[[8,5.5,.32],[6.5,-5,.32],[9.5,-5,.32],[8,-15,.32],[8,-20.5,.28],[8,-29.5,.38],[8,-37,.4],[6.5,-46,.32],[9.5,-46,.32],[18.5,-35.5,.54],[5,-24.2,.24],[5,-25,.24],[8,-25,.24],[8,18.2,.24],[8,-49,.24]];
 for(const [x,y,r]of points)assert.ok(!d.rects.some(rect=>hits(x,y,r,rect)),`Blocked key point ${x},${y}`);
 const protectedSweep={minX:6.65,maxX:9.35,minY:10.2,maxY:12.8};
 assert.ok(!d.rects.some(r=>r.minX<protectedSweep.maxX&&r.maxX>protectedSweep.minX&&r.minY<protectedSweep.maxY&&r.maxY>protectedSweep.minY));
});
test('entry installs furniture colliders before the door scene owns the map',()=>{
 let captured;const x=createLastServiceEntry((map,defs,options)=>{captured=map;return{map,defs,options};},()=>({parts:[],lights:[]}));
 for(const r of buildLastServiceDressing('wing').rects)assert.ok(captured.rects.some(q=>JSON.stringify(q)===JSON.stringify(r)));
 assert.ok(x.env.parts.length>200);assert.ok(x.env.lights.length>0);
});
test('dressing preserves environment delegation and live light identities',()=>{
 const light={x:1},original={parts:[],lights:[light],step(){this.called=true;},setView(s){this.actor=s;}};
 const d=buildLastServiceDressing('keeper'),env=dressingEnvironment(original,d);env.step(.1);env.setView('hero');
 assert.equal(original.called,true);assert.equal(original.actor,'hero');assert.equal(env.lights[0],light);
 const map={rects:[]},scene=dressLastServiceScene({map,env:original},'keeper');assert.equal(scene.map,map);assert.equal(map.rects.length,d.rects.length);
});
test('Russian enemy names and room labels remain presentation-only',()=>{
 const e={archetype:'corpse-golem',name:'CORPSE GOLEM',hp:600};assert.equal(lastServiceEnemyName(e),'Трупный голем');assert.equal(e.name,'CORPSE GOLEM');
 assert.equal(lastServiceRoom({x:8,y:18}),'ПРИТВОР');assert.equal(lastServiceRoom({},'keeper'),'ПОКОИ ХРАНИТЕЛЯ');
 const ctx={save(){},restore(){},fillRect(...a){assert.ok(a.every(Number.isFinite));}};
 paintLastServiceLabels(ctx,{x:8,y:18,lamp:1},{width:1008,height:864,ready:false});
});
test('view invokes the existing HUD with live state and localizes boss presentation',()=>{
 const source=fs.readFileSync(new URL('../src/app/last-service-view.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export function createLastServiceView','function createLastServiceView');
 const calls=[],ctx=new Proxy({},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)}),makeCanvas=()=>({getContext:()=>ctx});
 const hero=()=>({parts:[],lamp:[8,18,1]});let painted;
 const deps={arrowParts:()=>[],combatHero:hero,sealInspectionHero:hero,storyHero:hero,awakeningParts:a=>a,executionEnemyParts:()=>[],golemTelegraphs:()=>[],blocked:()=>false,paintGolemTrialHud:(c,s)=>calls.push(['boss',s.enemies[0]?.name]),composeCombatHud:(data,cols,rows,frameRows,skin,s,ready,cooldown)=>{calls.push(['hud',s.lamp,ready,cooldown]);const next=new Uint8ClampedArray(data);next[0]=231;return next;},paintLastServiceLabels:()=>{},paintChapelPrompt:()=>{},createLastServiceWorldPass:()=>({frame:()=>({lights:[],exposure:g=>g}),paint:()=>{}}),lastServiceEnemyName,DASH:{cooldown:1.2},relicUnsupportedCharacters,lampLighting:()=>({power:1,radiusScale:1}),ASCII:class{read(){return new Uint8ClampedArray(196*168*4);}paint(data){painted=data[0];}},createEngineHudPass:()=>({begin:()=>ctx,compose(){},annotations:()=>[]}),document:{createElement:makeCanvas}};
 const factory=Function(...Object.keys(deps),source+';return createLastServiceView;')(...Object.values(deps));
 const previous=globalThis.__ASH_LAST_SERVICE_PRESENTATION__;
 try{const view=factory(makeCanvas());view.paint({s:{x:8,y:18,cameraX:8,cameraY:18,lamp:37,phase:'playing',particles:[],enemies:[{archetype:'corpse-golem',hp:600,maxHp:600,x:8,y:7}]},intro:{intro:false},env:{parts:[],lights:[]},manifest:{blocking:()=>false,paint(){},text(){}},paused:false,ready:true,ritual:{parts:[],lights:[],hint:null},chapter:'boss'});
 assert.ok(calls.some(c=>c[0]==='hud'&&c[1]===37&&c[2]===true&&c[3]===1.2));assert.ok(calls.some(c=>c[0]==='boss'&&c[1]==='Трупный голем'));assert.equal(painted,231);assert.equal(globalThis.__ASH_LAST_SERVICE_PRESENTATION__.hudFrames(),1);
 }finally{if(previous===undefined)delete globalThis.__ASH_LAST_SERVICE_PRESENTATION__;else globalThis.__ASH_LAST_SERVICE_PRESENTATION__=previous;}
});

test('static furnished wing retains connected mandatory route and optional return loop',()=>{
 let map;createLastServiceEntry(base=>{map={...base,bounds:{minX:2,maxX:22,minY:-51,maxY:20}};return{map};},()=>({parts:[],lights:[]}));
 const h=.25,nx=81,ny=285,cell=(x,y)=>Math.round((y+51)/h)*nx+Math.round((x-2)/h),queue=[cell(8,18.2)],seen=new Set(queue);
 for(let k=0;k<queue.length;k++){const id=queue[k],X=id%nx,Y=Math.floor(id/nx);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=X+dx,y=Y+dy,q=y*nx+x;if(x<0||x>=nx||y<0||y>=ny||seen.has(q)||map.rects.some(r=>hits(2+x*h,-51+y*h,.24,r)))continue;seen.add(q);queue.push(q);}}
 for(const [x,y]of [[8,4],[8,-15],[5,-25],[18.5,-35.5],[8,-49]])assert.ok(seen.has(cell(x,y)),`Disconnected point ${x},${y}`);
});
test('chapel and keeper furnishings preserve boss, execution approach, exit and register',()=>{
 for(const [kind,points]of [['chapel',[[8,7,.85],[8,8.3,.24],[8,14.1,.24],[8,17,.24]]],['keeper',[[8,7,.24],[8,12,.24]]]]){
  const d=buildLastServiceDressing(kind);for(const [x,y,r]of points)assert.ok(!d.rects.some(o=>hits(x,y,r,o)),`Blocked ${kind} point ${x},${y}`);
 }
});
