import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const runner=new URL('../tools/run-last-service-core.mjs',import.meta.url);
function fixture(t,source,stale){
 const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'last-service-core-'));
 t.after(()=>fs.rmSync(cwd,{recursive:true,force:true}));
 fs.mkdirSync(path.join(cwd,'tools'));fs.mkdirSync(path.join(cwd,'docs'));
 fs.copyFileSync(runner,path.join(cwd,'tools/run-last-service-core.mjs'));
 fs.writeFileSync(path.join(cwd,'tools/verify-last-service-runtime.mjs'),source);
 const reportPath=path.join(cwd,'docs/last-service-runtime-verification.json');
 if(stale)fs.writeFileSync(reportPath,JSON.stringify(stale));
 const result=spawnSync(process.execPath,['tools/run-last-service-core.mjs'],{cwd,encoding:'utf8',env:{...process.env,GITHUB_SHA:'fixture-sha',GITHUB_RUN_ID:'fixture-run'}});
 return {...result,report:JSON.parse(fs.readFileSync(reportPath,'utf8'))};
}
const write=report=>`import fs from 'node:fs';fs.writeFileSync('docs/last-service-runtime-verification.json',${JSON.stringify(JSON.stringify(report))});`;
test('core runner prints the original failure and preserves failure status',t=>{
 const r=fixture(t,write({status:'failed',checks:['spawn geometry'],error:'AssertionError: Door sweep is blocked'})+'process.exitCode=1;');
 assert.equal(r.status,1);assert.match(r.stderr,/Door sweep is blocked/);assert.match(r.stdout,/PASS spawn geometry/);
 assert.equal(r.report.testedSourceCommit,'fixture-sha');assert.equal(r.report.humanVisualAcceptance,false);
});
test('core runner rejects a stale successful report after an import failure',t=>{
 const r=fixture(t,"import './missing.mjs';",{status:'compiled-core-checks-passed',checks:['stale']});
 assert.equal(r.status,1);assert.equal(r.report.status,'failed');assert.deepEqual(r.report.checks,[]);assert.match(r.stderr,/missing/);
});
test('core runner accepts a fresh successful report without granting visual acceptance',t=>{
 const r=fixture(t,write({status:'compiled-core-checks-passed',checks:['fixture'],humanVisualAcceptance:true}));
 assert.equal(r.status,0);assert.equal(r.report.humanVisualAcceptance,false);assert.equal(r.report.processExitCode,0);
});
test('core runner rejects zero exit without a report',t=>{const r=fixture(t,'');assert.equal(r.status,1);assert.equal(r.report.status,'failed');});
test('core runner rejects malformed JSON',t=>{
 const r=fixture(t,"import fs from 'node:fs';fs.writeFileSync('docs/last-service-runtime-verification.json','{');");
 assert.equal(r.status,1);assert.equal(r.report.status,'failed');
});
test('core runner rejects success in JSON when the process failed',t=>{
 const r=fixture(t,write({status:'compiled-core-checks-passed',checks:[]})+'process.exitCode=2;');
 assert.equal(r.status,1);assert.equal(r.report.status,'failed');assert.equal(r.report.processExitCode,2);
});
test('core runner rejects a failed report even when the process exits zero',t=>{
 const r=fixture(t,write({status:'failed',checks:[],error:'fixture failure'}));
 assert.equal(r.status,1);assert.match(r.stderr,/fixture failure/);
});
