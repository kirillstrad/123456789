import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export function runCoreVerification({cwd=process.cwd(),verifier='tools/verify-last-service-runtime.mjs',reportPath='docs/last-service-runtime-verification.json',env=process.env}={}){
 const file=path.resolve(cwd,reportPath);
 try{fs.rmSync(file,{force:true});}catch(error){console.error('[core] Cannot remove old report:',error);return 1;}
 const result=spawnSync(process.execPath,[verifier],{cwd,env,stdio:'inherit'});
 let report;
 try{
  report=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!report||!Array.isArray(report.checks))throw Error('Invalid core report: checks must be an array');
 }catch(error){
  report={status:'failed',checks:[],error:String(result.error?.stack??error.stack??error),humanVisualAcceptance:false};
 }
 const childPassed=!result.error&&!result.signal&&result.status===0;
 const passed=childPassed&&report.status==='compiled-core-checks-passed';
 if(!passed){
  report.status='failed';
  report.error??=String(result.error?.stack??`Verifier exited with status ${result.status}, signal ${result.signal??'none'}`);
 }
 report.testedSourceCommit=env.GITHUB_SHA??null;
 report.workflowRun=env.GITHUB_RUN_ID??null;
 report.processExitCode=result.status;
 report.processSignal=result.signal;
 report.humanVisualAcceptance=false;
 console.log('[core] Completed checks:');
 for(const check of report.checks)console.log('  PASS '+check);
 if(!passed)console.error('[core] FAILED\n'+report.error);
 else console.log('[core] Compiled-core checks passed; human visual acceptance remains pending.');
 try{
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 }catch(error){console.error('[core] Cannot write report:',error);return 1;}
 return passed?0:1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 process.exitCode=runCoreVerification();
}
