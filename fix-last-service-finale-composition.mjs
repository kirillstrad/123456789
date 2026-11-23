import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const finale='src/game/last-service-finale.js',app='src/app/last-service.js';
const oldImport="import {dressLastServiceScene} from '../levels/last-service-dressing.js';";
const oldScene="let scene=dressLastServiceScene(createArena(),'chapel'),";
const newScene='let scene=createArena(),';
const anchor="import {createLastServiceFinale} from '../game/last-service-finale.js';";
const oldFactory='createArena:createGolemTrialScene';
const newFactory="createArena:()=>dressLastServiceScene(createGolemTrialScene(),'chapel')";
const count=(s,a)=>s.split(a).length-1;
const beforeFinale=fs.readFileSync(finale,'utf8'),beforeApp=fs.readFileSync(app,'utf8');
if(count(beforeFinale,newScene)===1&&count(beforeFinale,oldImport)===0&&count(beforeApp,oldImport)===1&&count(beforeApp,newFactory)===1){
 console.log('Finale composition is already repaired. No files changed.');
}else{
 for(const [text,part,label]of [[beforeFinale,oldImport,finale+' import'],[beforeFinale,oldScene,finale+' scene'],[beforeApp,anchor,app+' import'],[beforeApp,oldFactory,app+' arena factory']]){
  if(count(text,part)!==1)throw Error('Unexpected context: '+label+'. No files have been written.');
 }
 if(beforeApp.includes(oldImport)||beforeApp.includes(newFactory))throw Error('Mixed migration state. No files have been written.');
 const afterFinale=beforeFinale.replace(oldImport+'\r\n','').replace(oldImport+'\n','').replace(oldScene,newScene);
 if(afterFinale.includes(oldImport))throw Error('Unexpected import line ending. No files have been written.');
 const eol=beforeApp.includes('\r\n')?'\r\n':'\n';
 const afterApp=beforeApp.replace(anchor,anchor+eol+oldImport).replace(oldFactory,newFactory);
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'last-service-composition-backup-'));
 fs.writeFileSync(path.join(backup,'last-service-finale.js'),beforeFinale);
 fs.writeFileSync(path.join(backup,'last-service.js'),beforeApp);
 fs.writeFileSync(finale,afterFinale,'utf8');fs.writeFileSync(app,afterApp,'utf8');
 console.log('Repaired: finale stays independent of visual dressing; gameplay factory still dresses the chapel.');
 console.log('Backups: '+backup);
 console.log('Run: node --test tests/last-service-story.test.mjs tests/last-service-presentation.test.mjs');
}
