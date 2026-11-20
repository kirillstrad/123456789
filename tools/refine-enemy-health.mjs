import fs from 'node:fs';
const file='src/app/main.js',original=fs.readFileSync(file,'utf8');let code=original;
function replaceOrVerify(from,to){if(code.includes(to)){if(code.split(to).length!==2)throw Error('Ambiguous integrated source');return;}if(code.split(from).length!==2)throw Error('Unexpected HP integration context: '+from);code=code.replace(from,to);}
replaceOrVerify('const enemyHealth=createEnemyHealthRuntime();','const enemyHealth=createEnemyHealthRuntime({diagnosticsTarget:window});');
replaceOrVerify('function resetWorld(){targeting.clear();enemyHealth.reset();relicWorld?.reset();manifest?.reset();','function resetWorld(){targeting.clear();relicWorld?.reset();manifest?.reset();enemyHealth.reset();');
if(code!==original)fs.writeFileSync(file,code);
console.log(code===original?'HP lifecycle already correct':'HP diagnostics and relic reset order corrected');
