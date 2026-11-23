import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const report={status:'running',scope:'portable entry, movement dialogue, actual light dialogue, Russian glyph coverage, HUD invocation and frozen gameplay/input; not full-route visual acceptance',errors:[],humanVisualAcceptance:false};let browser,page;
fs.mkdirSync('docs',{recursive:true});
try{
 const file=path.resolve('LAST_SERVICE.html');if(!fs.existsSync(file))throw Error('Run npm run build:prologue first');
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});page=await browser.newPage({viewport:{width:1100,height:1000}});page.on('pageerror',e=>report.errors.push(String(e)));
 await page.goto(pathToFileURL(file).href);
 await page.waitForFunction(()=>window.__ASH_LAST_SERVICE__&&!window.__ASH_LAST_SERVICE__.scene().intro,{},{timeout:30000});
 await page.waitForFunction(()=>window.__ASH_MANIFEST__?.state().dialogue?.id==='movement');
 await page.evaluate(()=>window.__ASH_MANIFEST__.close());await page.waitForFunction(()=>!window.__ASH_MANIFEST__.state().modal);
 await page.keyboard.down('KeyW');
 // A queued tutorial can still be playing its introductory story scene.
 await page.waitForFunction(()=>window.__ASH_MANIFEST__?.state().dialogue?.id==='light'&&window.__ASH_LAST_SERVICE__.tutorial().dialogue?.id==='light',{},{timeout:20000});
 await page.keyboard.up('KeyW');const before=await page.evaluate(()=>window.__ASH_LAST_SERVICE__.state());
 await page.keyboard.press('Digit1');await page.waitForTimeout(500);const after=await page.evaluate(()=>window.__ASH_LAST_SERVICE__.state());
 if(before.time!==after.time||before.x!==after.x||before.y!==after.y||after.action)throw Error('Dialogue did not freeze gameplay/input');
 const error=await page.evaluate(()=>window.__ASH_LAST_SERVICE_ERROR__??null);if(error)report.errors.push(error);if(report.errors.length)throw Error('Browser runtime errors');
 report.presentation=await page.evaluate(()=>{
  const p=window.__ASH_LAST_SERVICE_PRESENTATION__,d=window.__ASH_MANIFEST__.state().dialogue;
  const text=d.speaker+' '+d.text;
  return {language:p?.language,cyrillic:/[А-Яа-яЁё]/.test(text),glyphCoverage:p?.supportsText(text),hudFrames:p?.hudFrames()??0};
 });
 if(report.presentation.language!=='ru'||!report.presentation.cyrillic||!report.presentation.glyphCoverage||report.presentation.hudFrames<1)throw Error('Russian glyph coverage or existing HUD integration failed');
 report.status='intro-dialogue-smoke-passed';
}catch(error){report.status='failed';report.errors.push(String(error.stack??error));process.exitCode=1;}
finally{
 if(page){try{await page.screenshot({path:'docs/last-service-browser-smoke.png'});}catch{}}
 if(browser){try{await browser.close();}catch{}}
 fs.writeFileSync('docs/last-service-browser-smoke.json',JSON.stringify(report,null,2));
}
