import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const file=path.resolve('LAST_SERVICE.html');if(!fs.existsSync(file))throw Error('Run npm run build:prologue first');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:1000}});page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(pathToFileURL(file).href);
 await page.waitForFunction(()=>window.__ASH_LAST_SERVICE__&&!window.__ASH_LAST_SERVICE__.scene().intro,{},{timeout:30000});
 await page.waitForFunction(()=>window.__ASH_MANIFEST__?.state().dialogue?.id==='movement');
 await page.evaluate(()=>window.__ASH_MANIFEST__.close());
 await page.waitForFunction(()=>!window.__ASH_MANIFEST__.state().modal);
 await page.keyboard.down('KeyW');
 await page.waitForFunction(()=>window.__ASH_LAST_SERVICE__.tutorial().dialogue?.id==='light',{},{timeout:15000});
 await page.keyboard.up('KeyW');
 const before=await page.evaluate(()=>window.__ASH_LAST_SERVICE__.state());
 await page.keyboard.press('Digit1');await page.waitForTimeout(500);
 const after=await page.evaluate(()=>window.__ASH_LAST_SERVICE__.state());
 if(before.time!==after.time||before.x!==after.x||before.y!==after.y||after.action)throw Error('Tutorial did not freeze gameplay/input');
 const runtimeError=await page.evaluate(()=>window.__ASH_LAST_SERVICE_ERROR__??null);if(runtimeError)errors.push(runtimeError);
 if(errors.length)throw Error(errors.join('\n'));
 fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/last-service-browser-smoke.json',JSON.stringify({status:'intro-dialogue-smoke-passed',scope:'intro, movement lesson, first light lesson and input/simulation blocking; not full-route acceptance',errors},null,2));
}finally{await browser.close();}
