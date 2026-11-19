import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const dir=mkdtempSync(join(tmpdir(),'ash-combat-check-'));
const read=p=>readFileSync(resolve(p),'utf8');
const write=(p,s)=>writeFileSync(join(dir,p),s);
let groups=0;
try {
write('package.json','{"type":"module"}');
write('config.js',read('src/combat/config.ts').replaceAll(' as const','').replace(" as 'cursor-at-press'|'movement'",''));
write('attack-timing.js',read('src/combat/attack-timing.ts').replace(/import type .*?;\n/g,'').replace('kind:AttackKind','kind'));
// State/pose checks are isolated: collision and inertia displacement are not exercised.
write('mechanics-4c.js',"export function allowedContinuation(chain,kind){return ['LL','LLL','LLH','HH'].includes(chain+(kind==='light'?'L':'H'));}\nexport function inertiaDelta(){return {x:0,y:0};}\n");
let a=read('src/combat/action-machine.ts').replace(/import type .*?;\n/g,'');
for(const [x,y] of [['current:Strike|null','current'],['queued:AttackCommand|null','queued'],['private ',''],["kind?:AttackCommand['kind']",'kind'],['command:AttackCommand','command'],['hooks:AttackHooks','hooks'],['stage:number','stage'],['dt:number','dt'],['movingInput:boolean','movingInput'],[':boolean{','{'],[':void{','{'],['view():ActionView|null','view()']]) a=a.replaceAll(x,y);
write('action-machine.js',a);
let p=read('src/animation/attack-poses-4c.ts').replace(/import type .*?;\n/g,'').replace(/^type .*?;\n/gm,'').replace("'../combat/attack-timing.js'","'./attack-timing.js'");
for(const [x,y] of [[':Record<string,Profile>',''],[':Vector',''],['profile:Profile','profile'],['):number[]',')'],['t:number','t'],['u:number','u'],['clip:string','clip'],['segment:number','segment'],['channel:number','channel'],['):number',')'],['module:HeroModule','module'],['action:ActionView','action'],['):Pose',')'],['keys:readonly (readonly [number,Vector])[]','keys']]) p=p.replaceAll(x,y);
write('attack-poses-4c.js',p);
write('attack-input.js',read('src/app/attack-input.js'));
const load=f=>import(pathToFileURL(join(dir,f)).href);
const {ActionMachine}=await load('action-machine.js');
const {attackTiming}=await load('attack-timing.js');
const {sampleAttack4C,attack4CWeight}=await load('attack-poses-4c.js');
const {keyboardAttackKind,installAttackInput}=await load('attack-input.js');
let hits=0;
const hooks={position:()=>({x:0,y:0}),facing:()=>({x:1,y:0}),hit:()=>hits++,lunge:()=>{}};
const command=kind=>({kind,aim:null});
const module={sample:()=>({})};
for(const kind of ['light','heavy']){
 const timing=attackTiming(kind);
 assert(timing.prep<timing.ready&&timing.ready<timing.contact&&timing.contact<timing.follow&&timing.follow<timing.queueEnd&&timing.queueEnd<timing.release);groups++;
 const m=new ActionMachine();m.request(command(kind),hooks);
 for(const [t,expected] of [[timing.queueStart-.001,false],[timing.queueStart+.001,true],[timing.queueEnd-.001,true],[timing.queueEnd+.001,false]]){
  m.current.elapsed=m.current.duration*t;assert.equal(m.canContinue(),expected);
 }groups++;
 const h=new ActionMachine();h.request(command(kind),hooks);hits=0;
 h.step(h.current.duration*(timing.contact-.001),false,hooks);assert.equal(hits,0);
 h.step(.01,false,hooks);assert.equal(hits,1);h.step(10,false,hooks);assert.equal(hits,1);groups++;
 const v={kind,stage:0,clip:kind+'1',progress:timing.queueEnd,continuation:null};
 assert.equal(attack4CWeight(v,timing.queueEnd),1);assert.equal(attack4CWeight(v,timing.release),0);groups++;
 assert.deepEqual(sampleAttack4C(module,v),sampleAttack4C(module,{...v,continuation:kind}));groups++;
 for(let i=0;i<=1000;i++){
  const pose=sampleAttack4C(module,v,i/1000);
  for(const n of [...pose.right,pose.az,pose.down,pose.lean,pose.twist,pose.head])assert(Number.isFinite(n));
 }groups++;
 // Initial segment: normalized torso motion leads normalized blade motion.
 const start=sampleAttack4C(module,v,0),end=sampleAttack4C(module,v,timing.prep),mid=sampleAttack4C(module,v,timing.prep*.5);
 const body=(mid.lean-start.lean)/(end.lean-start.lean);
 const blade=(mid.down-start.down)/(end.down-start.down);
 assert(body>blade);groups++;
 const moving=new ActionMachine();moving.request(command(kind),hooks);
 moving.step(moving.current.duration*(timing.release-.001),true,hooks);assert(moving.current);
 moving.step(.01,true,hooks);assert.equal(moving.current,null);groups++;
}
for(const chain of [['light','light','light'],['light','light','heavy'],['heavy','heavy']]){
 const m=new ActionMachine();m.request(command(chain[0]),hooks);
 for(let i=1;i<chain.length;i++){
  m.current.elapsed=m.current.duration*.5;
  assert(m.request(command(chain[i]),hooks));assert(!m.request(command(chain[i]),hooks));
  const end=sampleAttack4C(module,m.view(),1);
  m.step(10,false,hooks);assert.equal(m.current.kind,chain[i]);
  const start=sampleAttack4C(module,m.view(),0);
  for(const key of ['right','az','down','lean','twist','head'])assert.deepEqual(end[key],start[key]);
 }
 m.current.elapsed=m.current.duration*.5;
 assert(!m.canContinue('light')&&!m.canContinue('heavy'));
 m.clear();assert.equal(m.current,null);assert.equal(m.queued,null);groups++;
}
for(const [code,expected] of [['Digit1','light'],['Digit2','heavy'],['Numpad1','light'],['Numpad2','heavy'],['KeyE',null]])assert.equal(keyboardAttackKind({code}),expected);
groups++;
for(const block of [{repeat:true},{defaultPrevented:true},{ctrlKey:true},{altKey:true},{metaKey:true},{target:{isContentEditable:true}},{target:{closest:()=>({})}}])assert.equal(keyboardAttackKind({code:'Digit1',...block}),null);
groups++;
let handler,removed=false,active=true,prevented=0;
const queue=[],point={x:3,y:4};
const target={addEventListener:(name,fn)=>handler=fn,removeEventListener:(name,fn)=>removed=fn===handler};
const dispose=installAttackInput({active:()=>active,commands:queue,aim:()=>point,target});
const event={code:'Digit1',preventDefault:()=>prevented++};
handler(event);assert.equal(queue.length,1);assert.deepEqual(queue[0],{kind:'light',aim:point});assert.notEqual(queue[0].aim,point);
active=false;handler(event);assert.equal(queue.length,1);
active=true;while(queue.length<8)handler(event);handler(event);assert.equal(queue.length,8);
dispose();assert(removed);groups++;
assert(read('src/animation/combat-hero.ts').includes('t=s.action.animation4C?s.action.progress:strikeProgress('));
assert(read('src/app/main.js').includes('installAttackInput({'));
assert(read('src/app/main.js').includes("e.button===0?'light':e.button===2?'heavy'"));groups++;
console.log(`PASS: ${groups} isolated assertion groups. No full build, browser or collision validation.`);
} finally {rmSync(dir,{recursive:true,force:true});}
