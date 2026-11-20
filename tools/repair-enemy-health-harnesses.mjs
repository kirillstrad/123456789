import fs from 'node:fs';
const staged=new Map();
function prepare(file,changes,extra){let text=fs.readFileSync(file,'utf8');if(text.includes('HP_HARNESS_V1'))return;for(const [before,after]of changes){if(text.split(before).length!==2)throw Error('Unexpected test fixture context: '+file+' / '+before.slice(0,70));text=text.replace(before,after);}staged.set(file,text+'\n// HP_HARNESS_V1\n'+extra+'\n');}
const dependency="import {createEnemyHealthRuntime} from '../src/app/enemy-health-runtime.js';";
prepare('tests/levels-v1.test.mjs',[
 ["import vm from 'node:vm';","import vm from 'node:vm';\n"+dependency],
 ['const ctx=vm.createContext({createWorldReference,applyLevelSpawn,gameLevel});','let healthResets=0;const hp=createEnemyHealthRuntime(),enemyHealth={...hp,reset(){healthResets++;hp.reset();}};\n const ctx=vm.createContext({createWorldReference,applyLevelSpawn,gameLevel,enemyHealth});'],
 ['return ctx.p;','return Object.assign(ctx.p,{healthResets:()=>healthResets});']
],"test('HP state resets on launch and restart without weakening world assertions',()=>{const p=appHarness();let n=p.healthResets();p.launch('test-chamber');assert.ok(p.healthResets()>n);n=p.healthResets();p.restart();assert.ok(p.healthResets()>n);n=p.healthResets();assert.throws(()=>p.launch('missing'));assert.equal(p.healthResets(),n);});");
prepare('tests/gallery-door-app-lifecycle.test.mjs',[
 ["import vm from 'node:vm';","import vm from 'node:vm';\n"+dependency],
 ['const context=vm.createContext({structuredClone,window:{},document:{hidden:false,activeElement:null}});','let healthResets=0;const hp=createEnemyHealthRuntime(),enemyHealth={...hp,reset(){healthResets++;hp.reset();}};\n const context=vm.createContext({structuredClone,enemyHealth,window:{},document:{hidden:false,activeElement:null}});'],
 ['return{api:context.window.__ASH_GALLERY__,probe:context.probe};','return{api:context.window.__ASH_GALLERY__,probe:context.probe,healthResets:()=>healthResets};']
],"test('gallery entry resets HP once and repeated open stays idempotent',()=>{const h=harness(),before=h.healthResets();h.api.open();assert.equal(h.healthResets(),before+1);h.api.open();assert.equal(h.healthResets(),before+1);});");
for(const [file,text]of staged)fs.writeFileSync(file,text);
console.log('HP VM fixture dependencies updated: '+staged.size+' files; all existing assertions retained.');
