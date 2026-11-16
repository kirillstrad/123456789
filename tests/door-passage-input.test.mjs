import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {movementInput} from '../src/app/movement-input.js';
import {createGalleryCollisionWorld} from '../src/gallery/collision.js';
import {driveDoorPassage} from '../tools/door-visual-check.mjs';

// Actual input mapping and collision engine; keyboard, clock and speed are test hooks.
function pageFixture({failClock=false,failD=false,physical=false}={}){
 const held=new Set(),events=[],samples=[];
 const box=(x,y,w,d)=>({kind:'polygon',points:[[x,y],[x+w,y],[x+w,y+d],[x,y+d]],minZ:0,maxZ:2.3});
 const world=createGalleryCollisionWorld([box(7.05,7.84,.15,.32),box(8.8,7.84,.15,.32),box(7.125,6.4,.15,1.6)],{minX:0,maxX:20,minY:0,maxY:20});
 let position={x:8,y:8.96};
 const page={keyboard:{async down(key){events.push('down:'+key);if(key==='KeyD'&&failD)throw Error('D failed');held.add(key);},async up(key){events.push('up:'+key);held.delete(key);}},clock:{async runFor(ms){samples.push({ms,keys:[...held],input:movementInput(held)});if(failClock)throw Error('clock failed');if(physical)for(let i=0;i<Math.round(ms*60/1000);i++){const v=movementInput(held),n=Math.hypot(v.x,v.y);if(n)position=world.move(position.x,position.y,v.x/n*1.65/60,v.y/n*1.65/60);}}}};
 return{page,held,events,samples,position:()=>position};
}

test('W alone is diagonal, not world -Y',()=>{const v=movementInput(new Set(['KeyW']));assert.ok(v.x<0&&v.y<0);assert.equal(v.x,v.y);});
test('passage helper holds W and D together only during movement',async()=>{const f=pageFixture();await driveDoorPassage(f.page);assert.deepEqual(f.samples[0].keys,['KeyW','KeyD']);assert.equal(f.samples[0].input.x,0);assert.ok(f.samples[0].input.y<0);assert.equal(f.samples[0].ms,1800);assert.deepEqual(f.samples[1].keys,[]);assert.equal(f.samples[1].ms,200);assert.equal(f.held.size,0);});
test('both keys are released even when clock advancement fails',async()=>{const f=pageFixture({failClock:true});await assert.rejects(driveDoorPassage(f.page),/clock failed/);assert.equal(f.held.size,0);assert.deepEqual(f.events.slice(-2),['up:KeyD','up:KeyW']);});
test('W is released if pressing D fails',async()=>{const f=pageFixture({failD:true});await assert.rejects(driveDoorPassage(f.page),/D failed/);assert.equal(f.held.size,0);assert.equal(f.events.at(-1),'up:KeyW');});
test('old W-only drive reproduces the missed passage against the real collision engine',async()=>{const f=pageFixture({physical:true});await f.page.keyboard.down('KeyW');await f.page.clock.runFor(1800);await f.page.keyboard.up('KeyW');assert.ok(f.position().y>=7.5);assert.ok(f.position().x<8);});
test('W+D crosses the same open aperture without lateral bypass',async()=>{const f=pageFixture({physical:true});await driveDoorPassage(f.page);assert.ok(f.position().y<7.5);assert.ok(Math.abs(f.position().x-8)<1e-10);});
test('runner retains the crossing threshold and saves diagnostics before asserting it',()=>{const s=fs.readFileSync('tools/door-visual-check.mjs','utf8');assert.ok(s.includes('await driveDoorPassage(page)'));const assertion=s.indexOf("assert.ok(traversed.hero.y<traversed.doorY-.5");assert.ok(assertion>0);assert.ok(s.indexOf('passage.after=traversed.hero')<assertion);assert.ok(s.indexOf("capture('passage-attempt'")<assertion);assert.ok(s.includes("passage.lateralDrift<.1"));assert.ok(s.includes('failure,passage,frames,trace'));assert.ok(s.includes('visualAccepted:false'));});
