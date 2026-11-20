import fs from 'node:fs';import {spawnSync} from 'node:child_process';
fs.mkdirSync('docs',{recursive:true});
const result=spawnSync(process.platform==='win32'?'cmd.exe':'npm',process.platform==='win32'?['/d','/s','/c','npm test']:['test'],{encoding:'utf8',maxBuffer:64*1024*1024,env:{...process.env,NO_COLOR:'1'}});
const log=(result.stdout??'')+(result.stderr??'');fs.writeFileSync('docs/enemy-health-regression.log',log);process.stdout.write(log);
const lines=log.split(/\r?\n/),failures=[];for(let i=0;i<lines.length;i++)if(/^\s*not ok \d+/.test(lines[i]))failures.push({test:lines[i].trim(),context:lines.slice(i+1,i+20).join('\n')});
fs.writeFileSync('docs/enemy-health-regression-failures.json',JSON.stringify({exitCode:result.status,signal:result.signal,error:result.error?String(result.error):null,totalFailures:failures.length,failures:failures.slice(0,20)},null,2));
process.exitCode=result.status===0&&!result.error?0:1;
