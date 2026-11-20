import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {interiorCard} from '../src/interior/catalogue.js';
import {NAVE_COMPOSITIONS,naveInteriorPlacements,NAVE_INTERIOR_PROTECTED} from '../src/interior/nave-compositions.js';
import {placementBounds,validateNaveInterior} from '../src/interior/nave-placement.js';
import {createNaveInterior} from '../src/interior/nave-interior.js';
const circles=[{x:5,y:5,r:.57},{x:11,y:5,r:.57},{x:5,y:12.8,r:.57},{x:11,y:12.8,r:.57},{x:3.2,y:8,r:.85},{x:12.7,y:9.2,r:.85},{x:3,y:14.5,r:.65},{x:13.3,y:5.7,r:.65}];
const gate={minX:7.15,maxX:8.85,minY:2.52,maxY:3.08};
const placed=()=>createNaveInterior({circles,rects:[gate]});
const overlap=(a,b)=>a.minX<b.maxX&&a.maxX>b.minX&&a.minY<b.maxY&&a.maxY>b.minY;

test('ten authored compositions contain 69 unique instance IDs and no interaction prompts',()=>{
 const p=naveInteriorPlacements();assert.equal(NAVE_COMPOSITIONS.length,10);assert.equal(p.length,69);assert.equal(new Set(p.map(p=>p.instanceId)).size,69);
 for(const e of p){assert(interiorCard(e.modelId));assert.deepEqual(e.interaction,{type:'none',prompt:null});}
});
test('composition data is immutable and repeated placements are independent',()=>{
 assert(Object.isFrozen(NAVE_COMPOSITIONS[0].items[0]));const a=naveInteriorPlacements(),b=naveInteriorPlacements();a[0].x=999;a[0].interaction.type='read';assert.notEqual(b[0].x,999);assert.equal(b[0].interaction.type,'none');
});
test('authored dimensions leave protected combat and door/light zones clear',()=>{
 assert.deepEqual(validateNaveInterior(undefined,{circles,rects:[gate]}),{compositions:10,objects:69,obstacles:10});
 for(const p of naveInteriorPlacements())for(const zone of NAVE_INTERIOR_PROTECTED)assert(!overlap(placementBounds(p),zone),p.instanceId);
});
test('validation rejects duplicate IDs unknown models protected placement and invalid transform',()=>{
 const p=naveInteriorPlacements();assert.throws(()=>validateNaveInterior([p[0],p[0]]));assert.throws(()=>validateNaveInterior([{...p[0],modelId:'bad'}]));assert.throws(()=>validateNaveInterior([{...p[0],x:8,y:12}]));assert.throws(()=>validateNaveInterior([{...p[0],yaw:NaN}]));
});
test('validation rejects solid overlap with pillars or existing static walls',()=>{
 const p=naveInteriorPlacements()[0];assert.throws(()=>validateNaveInterior([p],{circles:[{x:p.x,y:p.y,r:.5}]}));assert.throws(()=>validateNaveInterior([p],{rects:[{minX:p.x-.1,maxX:p.x+.1,minY:p.y-.1,maxY:p.y+.1}]}));
});
test('all meshes build and publish instance ownership with ten persistent colliders',()=>{
 const a=placed(),s=a.snapshot();assert.equal(s.placements.length,69);assert.equal(s.compositions.length,10);assert.equal(a.rects.length,10);assert(a.parts.length>=69);
 assert(a.parts.every(p=>p.interiorInstanceId&&p.compositionId));assert(a.rects.every(r=>r.interiorId));
});
test('interior does not publish preview lights or interactive targets',()=>{
 const a=placed();assert.equal(a.lights,undefined);assert.equal(a.targets,undefined);assert(naveInteriorPlacements().filter(p=>p.modelId.includes('candle')).every(p=>p.modelId.endsWith('.b')));
});
test('snapshots are read-only copies and building again never accumulates geometry',()=>{
 const a=placed(),before=a.snapshot(),copy=a.snapshot();copy.placements[0].x=999;assert.deepEqual(a.snapshot(),before);const b=placed();assert.deepEqual(a.snapshot(),b.snapshot());assert.equal(a.parts.length,b.parts.length);
});
test('bodies on cots and tray on table carry authored elevation',()=>{
 const p=naveInteriorPlacements();assert(p.find(p=>p.compositionId==='last-refuge'&&p.modelId.includes('body')).z>0);assert(p.find(p=>p.modelId.includes('metal-tray')).z>.95);
});
test('new obstacles leave walking routes to every composition and the existing core',()=>{
 const rects=placed().rects,radius=.24,step=.25,minX=1.7,minY=1.7,nx=Math.floor((43.3-minX)/step)+1,ny=Math.floor((25.3-minY)/step)+1;
 const solid=(x,y)=>circles.some(c=>Math.hypot(c.x-x,c.y-y)<c.r+radius)||rects.some(r=>x>r.minX-radius&&x<r.maxX+radius&&y>r.minY-radius&&y<r.maxY+radius);
 const cell=(x,y)=>[Math.round((x-minX)/step),Math.round((y-minY)/step)];const key=(x,y)=>y*nx+x,start=cell(8,12),queue=[start],seen=new Set([key(...start)]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=queue[i][0]+dx,y=queue[i][1]+dy,k=key(x,y);if(x<0||y<0||x>=nx||y>=ny||seen.has(k)||solid(minX+x*step,minY+y*step))continue;seen.add(k);queue.push([x,y]);
 }
 for(const [x,y]of [[4.5,10.3],[8,5.6],[5.4,19],[16,7.3],[13.8,18.8],[9.8,21.3],[15.4,11.5],[14.4,16.9],[18,22],[8.8,17.5],[6.8,10.7],[9.5,12],[20,8],[36,12.5]])assert(seen.has(key(...cell(x,y))),'unreachable inspection point '+x+','+y);
});
test('actual door sync retains interior collision during closed/opening/open transitions',()=>{
 const src=fs.readFileSync('src/game/combat-door-scene.js','utf8'),sync=src.match(/function sync\(\)\{[^\n]*\}/)?.[0];assert(sync);
 assert(src.includes('if(interior)staticRects.push(...interior.rects);'));assert(src.includes('definitions===COMBAT_DOORS?createNaveInterior('));
 const staticRects=placed().rects.map(r=>({...r})),map={rects:[]},rect=c=>({minX:c.points[0][0],maxX:c.points[1][0],minY:c.points[0][1],maxY:c.points[2][1]}),collider={points:[[20,6],[21,6],[21,7],[20,7]]};
 const door={status:'closed',mesh:{frameColliders:[collider],leafColliders:[collider]},closed:{frameColliders:[collider]},reservation:[{minX:19,maxX:22,minY:5,maxY:8}]},doors=[door];
 const run=new Function('staticRects','map','doors','physical','rect',sync+';sync();');
 for(const status of ['closed','opening','open','closed']){door.status=status;run(staticRects,map,doors,d=>[...d.mesh.frameColliders,...d.mesh.leafColliders],rect);assert.equal(map.rects.filter(r=>r.interiorId).length,10);}
});
test('environment exposes cached interior geometry without changing light targets',()=>{
 const src=fs.readFileSync('src/render/combat-door-environment.js','utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
 const floor={kind:0,v:[[0,0,0],[1,0,0],[1,1,0]],d:1},wall={kind:0,v:[[0,0,0],[1,0,1],[1,0,2]],d:2},interior=placed();let envBuilds=0;
 const ctx=vm.createContext({createEnvironment:()=>{envBuilds++;return {parts:[floor,wall]};},enableCombatLights:()=>({getFrame:()=>({parts:[],lights:[],targets:[]})})});vm.runInContext(src+';globalThis.make=createCombatDoorEnvironment;',ctx);
 const door={interior,parts:[],targets:[],snapshot:()=>({doors:[]})},env=ctx.make(door),a=env.parts,b=env.parts;
 assert(a.includes(interior.parts[0]));assert.equal(a[0].d,floor.d-10000);assert.equal(a[1],wall);assert.equal(floor.d,1);assert.equal(envBuilds,1);assert.equal(a.length,b.length);assert.equal(env.lights.length,0);assert.equal(env.targets.length,0);
});

test('built model bounds remain inside room and outside protected gameplay zones',()=>{
 for(const p of placed().snapshot().placements){const b=p.bounds;assert(b&&[b.minX,b.maxX,b.minY,b.maxY].every(Number.isFinite));assert(b.minX>=1.7&&b.maxX<=43.3&&b.minY>=1.7&&b.maxY<=25.3,p.instanceId);for(const zone of NAVE_INTERIOR_PROTECTED)assert(!overlap(b,zone),p.instanceId+' enters '+zone.id);}
});
