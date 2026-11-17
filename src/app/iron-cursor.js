export function cursorState({mode='game',target=null,allowed=false,busy=false,enemy=false,progress=0}={}){
 const kind=['menu','pause','dead','won'].includes(mode)?'menu':busy?'busy':target?allowed&&target.availability==='ready'?'interact':'blocked':enemy?'enemy':'idle';
 return{kind,progress:Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0};
}
export function cursorMarkup({kind,progress=0}){
 if(!['menu','busy','interact','blocked','enemy','idle'].includes(kind))throw Error('Invalid cursor state');
 progress=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
 const color={menu:'#d3c3a2',idle:'#b6aca0',interact:'#ffc477',blocked:'#82756b',enemy:'#e08479',busy:'#e7ad68'}[kind],ring=kind==='busy'?`<circle cx="19" cy="21" r="11" stroke-dasharray="${(progress*69.12).toFixed(2)} 69.12" transform="rotate(-90 19 21)"/>`:kind==='enemy'?'<path d="M8 17V10H15M23 10H30V17M30 25V32H23M15 32H8V25M16 21H22M19 18V24"/>':kind==='interact'||kind==='blocked'?'<path d="M8 17L8 11L14 9M24 9L30 11V17M30 25V31L24 33M14 33L8 31V25"/>':'';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="44" viewBox="-3 -3 42 44" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><g style="filter:drop-shadow(1px 0 #080607) drop-shadow(-1px 0 #080607) drop-shadow(0 1px #080607) drop-shadow(0 -1px #080607)"><path d="M0 0L6 24L10 16L18 13Z" fill="#332c2a"/><path d="M3 4L8 17L10 13L14 12"/>${ring}${kind==='blocked'?'<path d="M10 31L29 11"/>':''}${kind==='interact'?'<path d="M33 29V21H38M33 25H37"/>':''}<path d="M18 19L21 21L19 24L17 21Z" fill="${color}"/></g></svg>`;
}
export function installIronCursor(canvas,{read=()=>({})}={}){
 const doc=canvas.ownerDocument,win=doc?.defaultView;if(!doc?.head?.appendChild||!doc?.body?.appendChild||!win?.requestAnimationFrame)return null;
 const style=doc.createElement('style'),overlay=doc.createElement('div');style.textContent='canvas[data-iron-cursor="on"]{cursor:none!important}';
 overlay.setAttribute('aria-hidden','true');overlay.setAttribute('data-iron-cursor-overlay','');overlay.style.cssText='position:fixed;left:0;top:0;width:42px;height:44px;pointer-events:none;z-index:2147483647;display:none;contain:layout style;';
 doc.head.appendChild(style);doc.body.appendChild(overlay);const original=canvas.getAttribute('data-iron-cursor');canvas.setAttribute('data-iron-cursor','on');
 let inside=false,disposed=false,raf=0,stamp='';
 const hide=()=>{inside=false;overlay.style.display='none';},move=e=>{if(e.pointerType==='touch'){hide();return;}inside=true;overlay.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;overlay.style.display='block';},visibility=()=>{if(doc.hidden)hide();};
 function dispose(){if(disposed)return;disposed=true;win.cancelAnimationFrame(raf);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',hide);win.removeEventListener('blur',hide);doc.removeEventListener('visibilitychange',visibility);if(original===null)canvas.removeAttribute('data-iron-cursor');else canvas.setAttribute('data-iron-cursor',original);overlay.remove();style.remove();}
 function tick(){if(disposed)return;if(inside&&!doc.hidden){try{const state=cursorState(read()),next=state.kind+':'+Math.round(state.progress*100);if(next!==stamp){overlay.innerHTML=cursorMarkup(state);overlay.setAttribute('data-state',state.kind);stamp=next;}}catch(error){dispose();win.console?.error('Iron cursor disabled after error',error);return;}}raf=win.requestAnimationFrame(tick);}
 canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',hide);win.addEventListener('blur',hide);doc.addEventListener('visibilitychange',visibility);raf=win.requestAnimationFrame(tick);return Object.freeze({dispose});
}
