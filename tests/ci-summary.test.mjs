import test from 'node:test';import assert from 'node:assert/strict';
import {reportStatus,createSummary} from '../tools/ci-summary.mjs';
test('summary: missing data is never success',()=>assert.equal(reportStatus('desktop-check.json',null,'abc'),'missing'));
test('summary: source mismatch overrides a passed flag',()=>assert.equal(reportStatus('stability-check.json',{sourceCommit:'other',passed:true},'abc'),'source_mismatch'));
test('summary: runtime errors override a passed flag',()=>assert.equal(reportStatus('browser-check.json',{passed:true,errors:['failure']},'abc'),'failed'));
test('summary: unavailable security scan is not passed',()=>assert.equal(reportStatus('security-check.json',{status:'unavailable'},'abc'),'unavailable'));
test('summary: zero diagnostics is a typecheck pass',()=>assert.equal(reportStatus('typecheck.json',{diagnostics:0},'abc'),'passed'));
test('summary: unreadable files are recorded and acceptance stays pending',()=>{const s=createSummary(()=>{throw Error('bad JSON');},'abc');assert.ok(s.reports.every(r=>r.status==='unreadable'));assert.equal(s.observed_reports_passed,false);assert.equal(s.manual_report_review,'pending');assert.equal(s.iteration_closed,false);assert.equal(s.known_bug_confirmed,false);});
test('summary: all report flags passing never closes iteration',()=>{const s=createSummary(name=>name==='security-check.json'?{status:'passed'}:name==='typecheck.json'?{diagnostics:0}:{passed:true},'abc');assert.equal(s.observed_reports_passed,true);assert.equal(s.human_visual_acceptance,'pending');assert.equal(s.iteration_closed,false);});
