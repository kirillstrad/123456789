import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
export function reportStatus(name,data,sha){
  if(!data)return 'missing';
  const source=data.sourceCommit??data.source_commit;
  if(sha&&source&&source!==sha)return 'source_mismatch';
  if(data.error||(Array.isArray(data.errors)&&data.errors.length))return 'failed';
  if(name==='security-check.json')return data.status==='passed'?'passed':data.status??'unknown';
  if(name==='typecheck.json')return data.diagnostics===0?'passed':typeof data.diagnostics==='number'?'failed':'unknown';
  return data.passed===true?'passed':data.passed===false?'failed':'unknown';
}
const names=['typecheck.json','browser-check.json','desktop-check.json','stability-check.json','stability-browser.json','security-check.json'];
export function createSummary(read,sha){
  const reports=names.map(name=>{try{const data=read(name);return {name,status:reportStatus(name,data,sha),source:data?.sourceCommit??data?.source_commit??null,data};}catch(e){return {name,status:'unreadable',error:String(e)};}});
  return {source_commit:sha??null,reports,observed_reports_passed:reports.every(r=>r.status==='passed'),manual_report_review:'pending',human_visual_acceptance:'pending',iteration_closed:false,known_bug_confirmed:false,notes:['3C.4 is an unreviewed risk area, not an established defect.','Summary reads reports; it is not an independent rerun or a security audit.','Reports without their own source SHA are not independently bound to a commit by this summary.','Unit tests are in unit-tests.tap and workflow step logs; this summary does not parse TAP.','Do not merge solely because this summary or CI is green.']};
}
export function writeSummary(){
  const summary=createSummary(name=>{const p=path.join('docs',name);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null;},process.env.GITHUB_SHA);
  const clean=v=>String(v??'not recorded').replace(/[\r\n|`]/g,' ');
  const lines=['## Verification summary - acceptance remains pending','',`Source: ${clean(summary.source_commit)}`,'','| Report | Observed status | Report source |','|---|---|---|',...summary.reports.map(r=>`| ${r.name} | ${clean(r.status)} | ${clean(r.source)} |`),'','Unit-test result: see unit-tests.tap and Unit and integration tests step.','Manual report review: pending. Human visual acceptance: pending. Iteration closed: no.',''];
  for(const name of ['stability-check.json','stability-browser.json']){const data=summary.reports.find(r=>r.name===name)?.data;if(data)lines.push(`### ${name}`,'','```json',JSON.stringify({simulation:data.simulation,animation:data.animation,frameSummary:data.measurements?.summary,environment:data.environment},null,2),'```','');}
  const security=summary.reports.find(r=>r.name==='security-check.json')?.data;
  if(security)lines.push('### Security observations','','```json',JSON.stringify({status:security.status,reason:security.reason,scan_exit_code:security.scan_exit_code,definition_version:security.definition_version,definition_date:security.definition_date,signature:security.signature},null,2),'```','');
  lines.push(...summary.notes.map(n=>`- ${n}`));
  const markdown=lines.join('\n')+'\n';fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/acceptance-summary.json',JSON.stringify(summary,null,2));fs.writeFileSync('docs/acceptance-summary.md',markdown);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))writeSummary();
