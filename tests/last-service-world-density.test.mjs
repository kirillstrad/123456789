// LAST_SERVICE_THRESHOLDS_PASS4
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildLastServiceWorldDensity as build} from '../src/levels/last-service-world-density.js';
import {lastServiceLocalLights as lights,lightExposure} from '../src/render/last-service-local-light.js';
import {lastServiceInteractionCandidates as candidates,selectLastServiceInteraction as select,createLastServiceWorldPass as create} from '../src/ui/last-service-interaction-brand.js';
const state=(more={})=>({x:8,y:12,time:1,phase:'playing',action:null,sweepProgress:null,arrows:[],...more});
const door=(availability='ready')=>({id:'gate',kind:'door',availability,parts:[{v:[[7,11.5,0],[9,11.5,2.4]]}]});
const context=(s=state())=>({s,env:{targets:[door()],lights:[]},ritual:{parts:[],lights:[]},isBlocked:()=>false});
const project=(x,y,z)=>[504+(x-y)*8,430+(x+y)*4-z*45];
function drawing(){let saved=0;const rects=[];const ctx={globalAlpha:.4,fillStyle:'#000',save(){saved++;},restore(){saved--;},fillRect(...args){assert.ok(args.every(Number.isFinite));rects.push(args);}};return {ctx,rects,balance:()=>saved};}
for(const [name,status,wanted]of [['closed','ready',true],['opening','busy',false],['locked','locked',false]])test('door '+name+' has truthful action state',()=>{
 const q=context();q.env.targets=[door(status)];const c=candidates(q).find(c=>c.id==='door:gate');assert.equal(c.actionable,wanted);if(status==='busy')assert.equal(c.action,'ОТКРЫВАЕТСЯ...');
});
test('open doors no longer advertise F',()=>{const q=context();q.env.targets=[door('open')];assert.ok(!candidates(q).some(c=>c.id==='door:gate'));});
test('door can be highlighted from either side',()=>{for(const y of [10,13])assert.equal(candidates(context(state({y}))).find(c=>c.id==='door:gate').actionable,true);});
test('active combat actions remove F instead of promising an unavailable action',()=>{for(const extra of [{action:{}},{dash:{}},{interaction:{}},{execution:{}},{hitReaction:.2},{sweepProgress:.1}]){const c=candidates(context(state(extra))).find(c=>c.id==='door:gate');assert.equal(c.actionable,false);assert.equal(c.action,'ДЕЙСТВИЕ...');}});
test('dead actors get no interaction labels',()=>assert.deepEqual(candidates(context(state({phase:'dead'}))),[]));
test('boss chamber has no phantom book or wing-door prompts',()=>{const q=context(state({x:8,y:7}));q.chapter='boss';assert.deepEqual(candidates(q),[]);});
test('keeper book appears only with a clear line of sight and correct range',()=>{
 const q={...context(state({x:8,y:8})),chapter:'keeper'};let c=candidates(q).find(c=>c.id==='register');assert.equal(c.actionable,true);
 q.isBlocked=()=>true;assert.deepEqual(candidates(q),[]);
});
test('wing ledger uses its authored position and a 1.5 unit range',()=>{let q=context(state({x:8,y:-24}));assert.equal(candidates(q).find(c=>c.id==='ledger').actionable,true);q=context(state({x:8,y:-22}));assert.equal(candidates(q).find(c=>c.id==='ledger').actionable,false);});
test('chapel conditions remain controlled by the real gate snapshot',()=>{
 const q=context(state({x:8,y:-49.4}));q.gate={near:true,ready:false,reason:'route',text:'Осталась 1 встреча.'};
 assert.equal(candidates(q).find(c=>c.id==='chapel').actionable,false);
 q.gate={near:true,ready:false,reason:'lesson',text:'Прочитать предостережение.'};assert.equal(candidates(q).find(c=>c.id==='chapel').actionable,true);
 q.gate={near:true,ready:true,reason:'ready',text:'Войти.'};assert.equal(candidates(q).find(c=>c.id==='chapel').action,'ВОЙТИ');
 q.gate={near:false,ready:false,reason:'far'};assert.equal(candidates(q).find(c=>c.id==='chapel').actionable,false);
});
test('ritual distinguishes ignition, ritual and full lamp; it never invents an available F',()=>{
 const q=context(state({x:5,y:-24}));q.ritual={parts:[{kind:1,v:Array.from({length:49},(_,i)=>[5+Math.cos(i*Math.PI/24),-25+Math.sin(i*Math.PI/24),.01])}],hint:{text:'F · Зажечь'}};
 let c=candidates(q).find(c=>c.id==='ritual');assert.equal(c.action,'ЗАЖЕЧЬ');assert.equal(c.actionable,true);
 q.ritual.hint.text='F · Ритуал';assert.equal(candidates(q).find(c=>c.id==='ritual').action,'РИТУАЛ');
 q.ritual.hint.text='Лампа полна';assert.equal(candidates(q).find(c=>c.id==='ritual').actionable,false);
 q.ritual.hint=null;assert.equal(candidates(q).find(c=>c.id==='ritual').actionable,false);
});
test('selection is stable under small distance changes but yields to an actionable target',()=>{
 const a={id:'a',actionable:false,distance:1.2},b={id:'b',actionable:false,distance:1};
 assert.equal(select([a,b],'a').id,'a');assert.equal(select([a,{...b,actionable:true}],'a').id,'b');assert.equal(select([], 'a'),null);
});
test('modal/intro/pause hiding suppresses the label without removing local lights',()=>{
 const pass=create(),q={...context(),project,width:1008,height:864};q.env.lights=[{x:8,y:12,z:1,r:60,power:.4}];
 const frame=pass.frame({...q,hidden:true});assert.equal(frame.selected,null);assert.equal(frame.lights.length,1);
 const d=drawing();pass.paint(d.ctx,frame);assert.equal(d.rects.length,0);
});
test('small stamp draws finite geometry with balanced save/restore',()=>{
 const pass=create(),frame=pass.frame({...context(),project,width:1008,height:864});const d=drawing();
 pass.paint(d.ctx,frame,{drawStamp:(ctx,p)=>ctx.fillRect(p.x,p.y,p.size,p.size)});assert.equal(d.rects.length,1);assert.equal(d.balance(),0);
});
test('offscreen object anchors clamp their prompt inside the playfield',()=>{
 const pass=create(),frame=pass.frame({...context(),project:()=>[-100,-100],width:1008,height:864});const d=drawing();pass.paint(d.ctx,frame,{drawStamp:(ctx,p)=>ctx.fillRect(p.x,p.y,p.size,p.size)});
 for(const [x,y,w,h]of d.rects){assert.ok(x>=0&&x+w<=1008);assert.ok(y>=0&&y+h<750);}
});
test('local light gets +30 percent power and +16 percent radius without mutating its source',()=>{
 const source={x:8,y:12,z:1,r:100,power:.5},copy={...source},result=lights([source],project);
 assert.ok(Math.abs(result[0].power-.65)<1e-9);assert.ok(Math.abs(result[0].r-116)<1e-9);assert.deepEqual(source,copy);
});
test('lighting rejects malformed sources, caps hotspots, culls distant light and preserves groundZ',()=>{
 const seen=[];const p=(...v)=>{seen.push(v);return[v[0],v[1]];};
 const result=lights([{x:0,y:0,z:3,groundZ:0,r:1000,power:50},{x:10000,y:10000,z:1,r:20,power:.3},{x:0,y:0,z:0,r:0,power:1},{x:0,y:0,z:NaN,r:50,power:1}],p);
 assert.equal(result.length,1);assert.equal(result[0].r,156);assert.equal(result[0].power,1.7);assert.deepEqual(seen[0],[0,0,0]);
});
test('exposure keeps dark values unchanged and compresses highlights monotonically below 1.5',()=>{
 for(const n of [0,.065,.2,.5,.95])assert.equal(lightExposure(n),n);
 let last=0;for(let i=0;i<=200;i++){const n=lightExposure(i/10);assert.ok(n>=last&&n<=1.5);last=n;}
 assert.equal(lightExposure(NaN),0);
});
for(const kind of ['wing','chapel','keeper'])test(kind+' density is deterministic, finite and has bounded colour',()=>{
 const d=build(kind);assert.deepEqual(d,build(kind));assert.ok(d.parts.length>80);
 for(const p of d.parts){assert.ok(p.v.every(v=>v.length===3&&v.every(Number.isFinite)));assert.ok(Number.isFinite(p.d));assert.ok(p.c.every(c=>c>=0&&c<=255));}
});
test('solid density preserves all authored spawns and interaction points',()=>{
 const points={wing:[[8,18.2,.24],[8,11.5,2.5],[8,5.5,.32],[6.5,-5,.32],[9.5,-5,.32],[8,-15,.32],[8,-20.5,.28],[8,-29.5,.38],[8,-37,.4],[6.5,-46,.32],[9.5,-46,.32],[18.5,-35.5,.54],[5,-25,.24],[8,-25,.24],[8,-49.4,.24]],chapel:[[8,7,.85],[8,8.3,.24],[8,14.1,.24],[8,17,.24]],keeper:[[8,7,.24],[8,12,.24]]};
 for(const [kind,list]of Object.entries(points))for(const [x,y,r]of list)assert.ok(!build(kind).rects.some(o=>x>o.minX-r&&x<o.maxX+r&&y>o.minY-r&&y<o.maxY+r),`${kind}: ${x},${y}`);
});
test('central movement lanes remain free of new solid props',()=>{
 for(const [kind,from,to]of [['wing',-50,19],['chapel',5,18],['keeper',8,13]]){
  const d=build(kind);for(let y=from;y<=to;y+=.2)for(const x of [7,8,9])assert.ok(!d.rects.some(o=>x>o.minX-.24&&x<o.maxX+.24&&y>o.minY-.24&&y<o.maxY+.24),`${kind}: ${x},${y}`);
 }
});
test('production view hooks replace, rather than duplicate, the old prompts and lighting',()=>{
 const v=fs.readFileSync(new URL('../src/app/last-service-view.js',import.meta.url),'utf8');
 assert.ok(v.includes('const worldPass=createLastServiceWorldPass()'));assert.ok(v.includes('const lights=worldFrame.lights;'));assert.ok(v.includes('worldPass.paint(out,worldFrame);'));
 assert.ok(!v.includes('paintChapelPrompt(out,gate,'));assert.ok(!v.includes('...(ritual.hint?[ritual.hint]:[])'));assert.ok(!v.includes('ctx.globalAlpha*=.2'));
});

test('overlapping ledger and bonfire ranges follow the host F priority, not sticky selection',()=>{
 const q=context(state({x:6.55,y:-25}));
 q.ritual={parts:[{kind:1,v:Array.from({length:49},(_,i)=>[5+Math.cos(i*Math.PI/24),-25+Math.sin(i*Math.PI/24),.01])}],hint:{text:'F · Ритуал'}};
 const c=candidates(q);assert.ok(c.find(x=>x.id==='ritual').actionable);assert.ok(c.find(x=>x.id==='ledger').actionable);
 assert.equal(select(c,'ritual').id,'ledger');
});
