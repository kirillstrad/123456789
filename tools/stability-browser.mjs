import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1160,height:1120}}),checks=[],errors=[];
const report={sourceCommit:process.env.GITHUB_SHA??null,passed:false,checks,errors,environment:'Headless Chromium desktop-mode emulation, not native window/F11 or user hardware',notes:['Native fullscreen/F11 checks remain in desktop smoke.','Frame intervals include the existing render pacing. No FPS acceptance threshold is claimed.']};
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(pathToFileURL(path.resolve('PLAY.html')).href+'?desktop=1');await page.waitForFunction(()=>window.__ASH_ITERATION_2__&&document.documentElement.dataset.ashDesktop==='active');
  for(const [kind,target] of [['light',.03],['heavy',.5],['heavy',.8]]){
    await page.evaluate(kind=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(8,12,15,15);d.attack(kind,8,8);},kind);
    await page.waitForFunction(t=>{const a=window.__ASH_ITERATION_2__.state().action;return a&&a.progress>=t&&a.progress<.98;},target);
    const before=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.pause();return JSON.stringify(d.state());});
    await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>JSON.stringify(window.__ASH_ITERATION_2__.state())),before);
    await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.mode()),'game');checks.push(`pause freezes full state: ${kind} at progress >= ${target}`);
  }
  await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(8,12,15,15);});await page.locator('#game').focus();await page.keyboard.down('KeyW');await page.waitForTimeout(100);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await page.evaluate(()=>window.__ASH_ITERATION_2__.mode()),'pause');
  await page.evaluate(()=>window.__ASH_ITERATION_2__.resume());await page.waitForTimeout(450);const stopped=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());await page.waitForTimeout(250);const later=await page.evaluate(()=>window.__ASH_ITERATION_2__.state());
  assert.ok(Math.hypot(later.x-stopped.x,later.y-stopped.y)<1e-6);await page.keyboard.up('KeyW');checks.push('blur pauses and resume clears held movement input');
  await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.start();d.place(8,12,15,15);});await page.waitForTimeout(3000);
  const observed=await page.evaluate(()=>{const d=window.__ASH_ITERATION_2__;d.pause();const r=d.report();return {summary:r.summary,frames:r.frames,memory:performance.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize}:null,errors:r.errors};});
  assert.ok(observed.frames.length>=10);assert.deepEqual(observed.errors,[]);assert.deepEqual(errors,[]);report.measurements=observed;checks.push('render measurements collected without recorded errors');report.passed=true;
}catch(e){report.error=e.stack??String(e);throw e;}
finally{fs.writeFileSync('docs/stability-browser.json',JSON.stringify(report,null,2));await browser.close();}
