import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=process.cwd(),parent=path.join(root,'combat-door-reports');fs.mkdirSync(parent,{recursive:true});
const output=fs.mkdtempSync(path.join(parent,'run-'));
let commit=null,browser=null,server=null,page=null,failure=null,passage=null;
const frames=[],errors=[],checks=[];
try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
try{
 assert.ok(fs.existsSync('runtime/index.html'),'Build first');
 server=http.createServer(async(req,res)=>{try{const f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const body=await fs.promises.readFile(f);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(f)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end();}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 browser=await chromium.launch({headless:true});page=await browser.newPage({viewport:{width:1160,height:1120}});page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(`http://127.0.0.1:${server.address().port}/runtime/index.html`);
 await page.waitForFunction(()=>window.__ASH_ITERATION_2__?.combatDoor);
 await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
 await page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;a.start();a.place(8,5.3,15,15);a.render();});
 const sample=()=>page.evaluate(()=>{const a=window.__ASH_ITERATION_2__;return{state:a.state(),door:a.combatDoor()};});
 const capture=async stage=>{await page.evaluate(()=>window.__ASH_ITERATION_2__.render());await page.locator('#game').screenshot({path:path.join(output,stage+'.png'),animations:'disabled',timeout:15000});frames.push({stage,...await sample()});};
 await capture('closed');
 const rect=await page.locator('#game').boundingBox(),size=await page.locator('#game').evaluate(c=>({w:c.width,h:c.height}));let hovered=false;
 for(const z of [.4,1,1.6]){for(let x=7.25;x<8.8;x+=.05){const q=await page.evaluate(({x,z})=>window.__ASH_ITERATION_2__.project(x,2.8,z),{x,z});await page.mouse.move(rect.x+q[0]*rect.width/size.w,rect.y+q[1]*rect.height/size.h);await page.evaluate(()=>window.__ASH_ITERATION_2__.render());if(await page.evaluate(()=>window.__ASH_ITERATION_2__.target()?.id==='nave.exit-door')){hovered=true;break;}}if(hovered)break;}
 assert.ok(hovered,'Cannot hover actual combat door');await page.locator('#game').focus();await page.keyboard.press('KeyF');
 let opened=false,contact=false;
 for(let i=0;i<900;i++){await page.clock.runFor(17);const s=await sample();assert.equal(s.state.phase,'playing','Fixture player died');if(s.state.interactionAnimation&&!contact){contact=true;await capture('hero-interaction');}if(s.door.scene.status==='open'&&!s.door.interaction){opened=true;break;}}
 assert.ok(contact,'Missing hero animation');assert.ok(opened,'Combat door did not finish opening');await capture('open');
 const before=await sample();assert.equal(before.door.events.filter(e=>e.type==='interaction-effect').length,1);assert.equal(before.door.events.filter(e=>e.type==='interaction-end').length,1);checks.push('one combat-world interaction effect and completion');
 passage={keys:['KeyW','KeyD'],before:{x:before.state.x,y:before.state.y},doorY:2.8};
 await page.keyboard.down('KeyW');try{await page.keyboard.down('KeyD');try{await page.clock.runFor(1800);}finally{await page.keyboard.up('KeyD');}}finally{await page.keyboard.up('KeyW');}
 await page.clock.runFor(200);const after=await sample();
 passage.after={x:after.state.x,y:after.state.y};passage.lateralDrift=Math.abs(after.state.x-before.state.x);passage.crossed=after.state.y<2.3;
 await capture('passage-attempt');assert.ok(before.state.y>2.8);assert.ok(passage.lateralDrift<.1,'Lateral bypass');assert.ok(passage.crossed,'Combat player did not pass doorway');
 checks.push('same combat player crosses through aperture');assert.equal(after.state.lamp,before.state.lamp,'Unexpected lamp change in controlled fixture');assert.deepEqual(errors,[]);await capture('passed-through');
 await page.evaluate(()=>window.__ASH_ITERATION_2__.start());const reset=await sample();assert.equal(reset.door.scene.status,'closed');assert.equal(reset.door.scene.angle,0);assert.equal(reset.door.interaction,null);checks.push('restart restores closed door');
}catch(e){failure=String(e.stack??e);if(page)try{await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,timeout:5000});}catch{}}
finally{fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({commit,automationPassed:failure===null,visualAccepted:false,visualReview:'pending',fixture:{playerPlacedNearDoor:true,enemyPlacedFarAway:true,normalCombatWorld:true,portablePlayHtmlTested:false,normalSpawnRouteTested:false},failure,errors,checks,passage,frames},null,2));if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}
if(failure)throw Error(failure);
