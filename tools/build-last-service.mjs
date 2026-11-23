import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {portableBundle,inlineScript} from './portable-last-service.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
if(!fs.existsSync('runtime/game/combat-world.js'))throw Error('Run the main build before Last Service');
function walk(dir){return fs.readdirSync(dir).flatMap(name=>{const p=path.join(dir,name);return fs.statSync(p).isDirectory()?walk(p):[p];});}
const entries=walk('runtime').filter(p=>p.endsWith('.js')&&!p.split(path.sep).includes('vendor')).map(p=>{
 const id=path.relative('runtime',p).split(path.sep).join('/'),code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,allowJs:true},fileName:p}).outputText;
 const source=ts.createSourceFile(id,code,ts.ScriptTarget.ES2022,true,ts.ScriptKind.JS),dependencies=[];
 function visit(node){if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='require'){if(node.arguments.length!==1||!ts.isStringLiteral(node.arguments[0]))throw Error('Dynamic require in '+id);dependencies.push(node.arguments[0].text);}ts.forEachChild(node,visit);}visit(source);
 return {id,code,dependencies};
});
const bundle=portableBundle(entries,'app/last-service-standalone.js'),template=fs.readFileSync('src/app/last-service.html','utf8');
const vendor='<script src="./vendor/hero.js"></script>',entry='<script type="module" src="./app/last-service-standalone.js"></script>';
if(template.split(vendor).length!==2||template.split(entry).length!==2)throw Error('Last Service HTML entry contract changed');
const html=template.replace(vendor,()=>inlineScript(fs.readFileSync('public/vendor/hero.js','utf8'))).replace(entry,()=>inlineScript(bundle));
if(/<script[^>]*src=/.test(html))throw Error('Portable HTML has external scripts');
fs.writeFileSync('runtime/last-service.html',template);fs.writeFileSync('LAST_SERVICE.html',html);
console.log('Last Service portable candidate created; gameplay acceptance pending');
