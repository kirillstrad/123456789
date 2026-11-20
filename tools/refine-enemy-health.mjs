import fs from 'node:fs';
const file='src/app/main.js',old=fs.readFileSync(file,'utf8'),from='const enemyHealth=createEnemyHealthRuntime();',to='const enemyHealth=createEnemyHealthRuntime({diagnosticsTarget:window});';
if(old.includes(to)){console.log('HP diagnostics already connected');process.exit(0);}
if(old.split(from).length!==2)throw Error('Unexpected HP runtime creation');
fs.writeFileSync(file,old.replace(from,to));
