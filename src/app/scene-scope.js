// Owns the mounted scene's listeners, DOM and temporary globals.
export function createSceneScope({window:win,document:doc,canvas,hosted=false}){
 let disposed=false;const cleanup=[],listeners=[],nodes=new Set(),globals=new Map();
 const capture=o=>typeof o==='boolean'?o:!!o?.capture;
 const forms=t=>t?.isContentEditable||t?.closest?.('button,input,select,textarea,[contenteditable]');
 const owned=t=>[...nodes].some(n=>n===t||n.contains?.(t));
 const keys=new Set(['KeyW','KeyA','KeyS','KeyD','KeyE','KeyF','KeyR','KeyQ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','Digit1','Digit2','Numpad1','Numpad2','Enter','Escape','Space','Tab','PageUp','PageDown']);
 function defer(fn){if(disposed){fn();return fn;}cleanup.push(fn);return fn;}
 function unlisten(target,type,fn,options){for(const r of [...listeners])if(r.target===target&&r.type===type&&r.fn===fn&&r.capture===capture(options))r.off();}
 function listen(target,type,fn,options){
  if(disposed)throw Error('Scene scope disposed');if(!target?.addEventListener)return ()=>{};
  const cap=capture(options),old=listeners.find(r=>r.target===target&&r.type===type&&r.fn===fn&&r.capture===cap);if(old)return old.off;
  const routed=hosted&&((target===win&&['keydown','keyup','pointerdown','pointermove','wheel'].includes(type))||(target===canvas&&['pointerdown','pointermove','contextmenu'].includes(type)));
  const r={target,type,fn,capture:cap,once:!!options?.once,routed,off(){const i=listeners.indexOf(r);if(i<0)return;listeners.splice(i,1);if(!routed)target.removeEventListener(type,fn,options);}};
  listeners.push(r);if(!routed)target.addEventListener(type,fn,options);return r.off;
 }
 function route(e){
  if(disposed)return;
  const keyboard=e.type==='keydown'||e.type==='keyup';
  if(keyboard&&(!keys.has(e.code)||e.ctrlKey||e.metaKey||e.altKey))return;
  if(!keyboard&&e.target!==canvas){if(forms(e.target)&&!owned(e.target)){e.preventDefault();e.stopImmediatePropagation();}return;}
  e.stopImmediatePropagation();let immediate=false;
  const event=new Proxy(e,{get(t,k){if(k==='stopImmediatePropagation')return ()=>{immediate=true;t.stopImmediatePropagation();};const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v;}});
  const order=r=>r.capture?(r.target===win?0:1):(r.target===canvas?2:3);
  const batch=listeners.filter(r=>r.routed&&r.type===e.type).sort((a,b)=>order(a)-order(b));
  for(const r of batch){if(immediate)break;if(!listeners.includes(r))continue;if(r.once)r.off();if(typeof r.fn==='function')r.fn(event);else r.fn.handleEvent(event);}
  if(keyboard&&!forms(e.target))e.preventDefault();
 }
 if(hosted){for(const type of ['keydown','keyup','pointerdown','pointermove','contextmenu','wheel','click']){win.addEventListener(type,route,{capture:true,passive:false});defer(()=>win.removeEventListener(type,route,true));}}
 function trackGlobal(target,key,install){const previous=Object.getOwnPropertyDescriptor(target,key);let value;try{return install();}finally{value=target[key];defer(()=>{if(target[key]!==value)return;if(previous)Object.defineProperty(target,key,previous);else delete target[key];});}}
 function setGlobal(target,key,value){let records=globals.get(target);if(!records){records=new Map();globals.set(target,records);}let r=records.get(key);if(!r){r={previous:Object.getOwnPropertyDescriptor(target,key),value};records.set(key,r);defer(()=>{if(target[key]!==r.value)return;if(r.previous)Object.defineProperty(target,key,r.previous);else delete target[key];});}r.value=value;target[key]=value;return value;}
 const api={defer,listen,unlisten,trackGlobal,setGlobal,active:()=>!disposed,
  ownNode(node){nodes.add(node);defer(()=>{nodes.delete(node);node.remove?.();});return node;},
  eventRoot(){return new Proxy(win,{get(t,k){if(k==='addEventListener')return (type,fn,o)=>listen(win,type,fn,o);if(k==='removeEventListener')return (type,fn,o)=>unlisten(win,type,fn,o);const v=Reflect.get(t,k,t);return typeof v==='function'?v.bind(t):v;},set(t,k,v){return Reflect.set(t,k,v,t);}});},
  dispose(){if(disposed)return;disposed=true;const errors=[];for(const r of [...listeners])try{r.off();}catch(e){errors.push(e);}for(const fn of cleanup.splice(0).reverse())try{fn();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'Scene resource cleanup failed');}
 };return Object.freeze(api);
}
