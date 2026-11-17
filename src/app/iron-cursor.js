export const CURSOR_STYLES=Object.freeze([
 ['thorn','THORN BLADE','<path d="M0 0L8 30L13 19L26 15L19 12L22 8L14 9L13 3L9 7Z"/>'],
 ['seal','INQUISITOR SEAL','<path d="M0 0L8 26L13 16L24 13Z"/><path d="M17 20L24 15L31 20V29L24 34L17 29Z"/><path d="M24 20V29M20 24H28"/>'],
 ['talon','RELIQUARY TALON','<path d="M0 0Q18 4 22 17Q26 27 19 36L14 30Q18 21 11 14L8 25L4 20Q8 9 0 0Z"/><path d="M10 11L18 9M13 16L22 13M15 21L24 19"/>'],
 ['lantern','EMBER KEEPER','<path d="M0 0L7 26L12 17L21 13Z"/><path d="M17 19L24 23V27M18 27H30L28 39H20ZM20 27L22 23H26L28 27M22 28V37M26 28V37"/><path d="M23 35L25 30L27 35L25 37Z"/>'],
 ['spear','SPEAR SHARD','<path d="M0 0L22 13L15 15L17 25L11 21L8 27Z"/><path d="M0 0L13 18L23 36M14 26L19 23M17 31L22 28"/>'],
 ['crown','ASH CROWN','<path d="M0 0L9 28L14 18L26 14Z"/><path d="M17 23L19 34H33L36 23L29 28L26 20L23 28ZM20 37H32"/>'],
 ['thorn-crown','THORN CROWN','<path d="M0 0L6 24L10 16L18 13Z"/><path d="M6 9L12 5L11 12L18 9L15 16M13 22L16 33H30L33 22L26 27L23 19L20 27ZM17 36H29"/>']
].map(([id,label,body])=>Object.freeze({id,label,body})));
export const CURSOR_STORAGE_KEY='ash-iron-cursor-v1';
export function createCursorPreferences(storage){
 let value='thorn-crown';try{const saved=storage?.getItem(CURSOR_STORAGE_KEY);if(CURSOR_STYLES.some(s=>s.id===saved))value=saved;}catch{}
 return Object.freeze({get:()=>value,set(id){if(!CURSOR_STYLES.some(s=>s.id===id))return false;value=id;try{storage?.setItem(CURSOR_STORAGE_KEY,id);}catch{}return true;}});
}
export function cursorState({mode='game',target=null,allowed=false,busy=false,enemy=false,progress=0}={}){
 const kind=['menu','pause','dead','won'].includes(mode)?'menu':busy?'busy':target?allowed&&target.availability==='ready'?'interact':'blocked':enemy?'enemy':'idle';
 return{kind,progress:Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0};
}
export function cursorMarkup({kind,progress=0,theme='thorn-crown'}){
 if(!['menu','busy','interact','blocked','enemy','idle'].includes(kind))throw Error('Invalid cursor state');
 const spec=CURSOR_STYLES.find(s=>s.id===theme);if(!spec)throw Error('Invalid cursor theme');progress=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
 const color={menu:'#d3c3a2',idle:'#b6aca0',interact:'#ffc477',blocked:'#82756b',enemy:'#e08479',busy:'#e7ad68'}[kind],ring=kind==='busy'?`<circle cx="25" cy="24" r="12" stroke-dasharray="${(progress*75.4).toFixed(2)} 75.4" transform="rotate(-90 25 24)"/>`:kind==='enemy'?'<path d="M17 14V9H23M30 9H36V15M36 29V35H30M23 35H17V29M23 22H30M26 18V26"/>':kind==='interact'||kind==='blocked'?'<path d="M17 15V9L23 7M30 7L36 9V15M36 29V35L30 37"/>':'';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="44" viewBox="0 0 42 44" data-cursor-theme="${spec.id}" fill="#292326" stroke="${color}" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="miter"><g style="filter:drop-shadow(1px 0 #080607) drop-shadow(-1px 0 #080607) drop-shadow(0 1px #080607) drop-shadow(0 -1px #080607)">${spec.body}<g fill="none">${ring}${kind==='blocked'?'<path d="M17 35L36 12"/>':''}${kind==='interact'?'<path d="M35 42V34H40M35 38H39"/>':''}</g></g></svg>`;
}
export function installIronCursor(canvas,{read=()=>({})}={}){
 const doc=canvas.ownerDocument,win=doc?.defaultView;if(!doc?.head?.appendChild||!doc?.body?.appendChild||!win?.requestAnimationFrame)return null;
 let storage;try{storage=win.localStorage;}catch{}const preferences=createCursorPreferences(storage),previousAPI=win.__ASH_CURSOR__,settings=Object.freeze({styles:()=>CURSOR_STYLES.map(({id,label})=>({id,label})),getTheme:preferences.get,setTheme(id){const changed=preferences.set(id);if(changed)paint();return changed;}});win.__ASH_CURSOR__=settings;
 const style=doc.createElement('style'),overlay=doc.createElement('div');style.textContent='canvas[data-iron-cursor="on"]{cursor:none!important}';
 overlay.setAttribute('aria-hidden','true');overlay.setAttribute('data-iron-cursor-overlay','');overlay.style.cssText='position:fixed;left:0;top:0;width:42px;height:44px;pointer-events:none;z-index:2147483647;display:none;contain:layout style;';
 doc.head.appendChild(style);doc.body.appendChild(overlay);const original=canvas.getAttribute('data-iron-cursor');canvas.setAttribute('data-iron-cursor','on');let inside=false,disposed=false,raf=0,stamp='';
 const hide=()=>{inside=false;overlay.style.display='none';},move=e=>{if(disposed)return;if(e.pointerType==='touch'||e.target!==canvas){hide();return;}inside=true;overlay.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;overlay.style.display='block';paint();},visibility=()=>{if(doc.hidden)hide();};
 function dispose(){if(disposed)return;disposed=true;win.cancelAnimationFrame(raf);doc.removeEventListener('pointermove',move,true);canvas.removeEventListener('pointermove',move,true);canvas.removeEventListener('pointerleave',hide,true);win.removeEventListener('blur',hide);doc.removeEventListener('visibilitychange',visibility);if(original===null)canvas.removeAttribute('data-iron-cursor');else canvas.setAttribute('data-iron-cursor',original);if(win.__ASH_CURSOR__===settings){if(previousAPI===undefined)delete win.__ASH_CURSOR__;else win.__ASH_CURSOR__=previousAPI;}overlay.remove();style.remove();}
 function paint(){if(disposed||!inside||doc.hidden)return;try{const state=cursorState(read()),theme=preferences.get(),next=theme+':'+state.kind+':'+Math.round(state.progress*100);if(next!==stamp){overlay.innerHTML=cursorMarkup({...state,theme});overlay.setAttribute('data-state',state.kind);overlay.setAttribute('data-theme',theme);stamp=next;}}catch(error){dispose();win.console?.error('Iron cursor disabled after error',error);}}
 function tick(){if(disposed)return;paint();if(!disposed)raf=win.requestAnimationFrame(tick);}
 doc.addEventListener('pointermove',move,true);canvas.addEventListener('pointermove',move,true);canvas.addEventListener('pointerleave',hide,true);win.addEventListener('blur',hide);doc.addEventListener('visibilitychange',visibility);raf=win.requestAnimationFrame(tick);return Object.freeze({dispose});
}
