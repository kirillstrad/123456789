import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createSceneHost} from '../src/app/scene-host.js';
const source=fs.readFileSync('src/ui/ornaments.js','utf8').replace(/^import[^\n]*\n/gm,'').replace('export function makeUI','function makeUI');
function fixture(){const texts=[],frames=[];let canvases=0,menus=0;const document={documentElement:{dataset:{}},createElement(){canvases++;const context=new Proxy({fillText:t=>texts.push(t)},{get:(o,k)=>k in o?o[k]:(()=>{})});return{getContext:()=>context};}},out={},window={__ASH_ITERATION_2__:{}};const box={createSceneHost,document,window,out,glyph:(...a)=>frames.push(a),throneMenu:()=>menus++};vm.runInNewContext(source+';globalThis.ui=makeUI(out,glyph);',box);return{ui:box.ui,texts,frames,get canvases(){return canvases},get menus(){return menus}};}
test('lamp HUD: one LAMP label, no mirrored HEALTH',()=>{const f=fixture();f.ui.hud(75);assert.equal(f.texts.filter(t=>t==='LAMP').length,1);assert.equal(f.texts.includes('HEALTH'),false);assert.ok(f.texts.includes('75/100'));});
test('lamp HUD: critical, low and extinguished warnings are ASCII',()=>{for(const [hp,label] of [[1,'LAST EMBER - ONE HIT LEFT'],[15,'LOW EMBER'],[0,'THE FLAME IS OUT']]){const f=fixture();f.ui.hud(hp);assert.ok(f.texts.includes(label));assert.ok(f.texts.every(t=>/^[\x20-\x7e]*$/.test(t)));}});
test('lamp HUD: input is clamped for display',()=>{for(const [hp,label] of [[200,'100/100'],[-5,'0/100'],[NaN,'0/100']]){const f=fixture();f.ui.hud(hp);assert.ok(f.texts.includes(label));}});
test('lamp HUD: stable glyph contract and reused canvases',()=>{const f=fixture();f.ui.hud(100);f.ui.hud(50);assert.equal(f.canvases,2);assert.equal(f.frames[0][0],f.frames[1][0]);assert.deepEqual(f.frames[0].slice(1),[196,28,720,144,true,true]);});
test('lamp HUD: throne menu delegation remains available',()=>{const f=fixture();f.ui.menu();assert.equal(f.menus,1);});
