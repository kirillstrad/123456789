import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
if(!fs.existsSync('runtime/game/combat-world.js'))throw Error('Run the main build before building Last Service');
function walk(dir){return fs.readdirSync(dir).flatMap(name=>{const p=path.join(dir,name);return fs.statSync(p).isDirectory()?walk(p):[p];});}
const entries=walk('runtime').filter(p=>p.endsWith('.js')&&!p.split(path.sep).includes('vendor')).map(p=>{
 const id=path.relative('runtime',p).split(path.sep).join('/');
 const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,allowJs:true},fileName:p}).outputText;
 return JSON.stringify(id)+':function(require,module,exports){\n'+code+'\n}';
});
const bundle=`(function(){const modules={${entries.join(',\n')}},cache={};function norm(s){const o=[];for(const p of s.split('/')){if(p==='..')o.pop();else if(p&&p!=='.')o.push(p);}return o.join('/');}function load(n,from=''){const id=norm(n.startsWith('.')?from.split('/').slice(0,-1).join('/')+'/'+n:n);if(cache[id])return cache[id].exports;if(!modules[id])throw Error('Missing module '+id);const m={exports:{}};cache[id]=m;modules[id](n=>load(n,id),m,m.exports);return m.exports;}load('app/last-service.js');})();`;
let html=fs.readFileSync('src/app/last-service.html','utf8');
fs.writeFileSync('runtime/last-service.html',html);
html=html.replace('<script src="./vendor/hero.js"></script>',()=>'<script>\n'+fs.readFileSync('public/vendor/hero.js','utf8')+'\n</script>').replace('<script type="module" src="./app/last-service.js"></script>',()=>'<script>\n'+bundle+'\n</script>');
if(/<script[^>]*src=/.test(html))throw Error('Last Service portable HTML has external scripts');
fs.writeFileSync('LAST_SERVICE.html',html);
console.log('Last Service iteration 1 build created');
