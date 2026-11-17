const ARROW=['#','##','###','####','#####','######','#######','########','#########','######','###.###','##...##','#.....##','......##'];
const MOTIFS={
 thorn:['....#....','...##....','..##..#..','#####.#..','..######.','...##....','..##.....','.##......','##.......'],
 seal:['...###...','..#####..','.###.###.','###...###','##..#..##','##.###.##','##..#..##','###...###','.#######.','..#####..','...###...'],
 talon:['.#####...','###.###..','##...###.','.#....##.','......##.','.....###.','....###..','...###...','..###....','..##.....','...#.....'],
 lantern:['...###...','..##.##..','..#...#..','.#######.','.#.....#.','.#..#..#.','.#.###.#.','.#..#..#.','.##...##.','..#####..','...###...'],
 spear:['##.......','.##......','..##.....','...##....','..#####..','....##...','...#####.','.....##..','......##.','.......##'],
 crown:['....#.....','#...#....#','##.###..##','.####.###.','.##.#..##.','.##....##.','..######..','..######..','..........','..######..'],
 'thorn-crown':['....#.....','#...#....#','##.###..##','.####.###.','.##.#..##.','.##....##.','..######..','..##.###..','.#........','..######..']
};
function pixelBody(id){const pixels=new Set(),add=(x,y)=>{if(x>=0&&x<20&&y>=0&&y<21)pixels.add(x+','+y);};ARROW.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='#')add(x,y);}));if(id==='thorn'||id==='thorn-crown')for(const [x,y]of [[5,2],[5,3],[6,3],[8,5],[8,6],[9,5]])add(x,y);MOTIFS[id].forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='#')add(x+7,y+10);}));const rect=(x,y,c)=>`<rect x="${x*2}" y="${y*2}" width="2" height="2" fill="${c}"/>`;let border='',body='';for(const p of pixels){const[x,y]=p.split(',').map(Number);for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(x+dx>=0&&y+dy>=0)border+=rect(x+dx,y+dy,'#080506');body+=rect(x,y,!pixels.has(x+','+(y-1))?'var(--edge)':(x+y)%5===0?'#7c492d':'var(--metal)');}return border+body;}
export const CURSOR_STYLES=Object.freeze([['thorn','THORN BLADE'],['seal','INQUISITOR SEAL'],['talon','RELIQUARY TALON'],['lantern','EMBER KEEPER'],['spear','SPEAR SHARD'],['crown','ASH CROWN'],['thorn-crown','THORN CROWN']].map(([id,label])=>Object.freeze({id,label,body:pixelBody(id)})));
export const CURSOR_STORAGE_KEY='ash-iron-cursor-v1';
export function createCursorPreferences(storage){let value='thorn-crown';try{const saved=storage?.getItem(CURSOR_STORAGE_KEY);if(CURSOR_STYLES.some(s=>s.id===saved))value=saved;}catch{}return Object.freeze({get:()=>value,set(id){if(!CURSOR_STYLES.some(s=>s.id===id))return false;value=id;try{storage?.setItem(CURSOR_STORAGE_KEY,id);}catch{}return true;}});}
export function cursorState({mode='game',target=null,allowed=false,busy=false,enemy=false,progress=0}={}){const kind=['menu','pause','dead','won'].includes(mode)?'menu':busy?'busy':target?allowed&&target.availability==='ready'?'interact':'blocked':enemy?'enemy':'idle';return{kind,progress:Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0};}
export function cursorMarkup({kind,progress=0,theme='thorn-crown'}){
 if(!['menu','busy','interact','blocked','enemy','idle'].includes(kind))throw Error('Invalid cursor state');const spec=CURSOR_STYLES.find(s=>s.id===theme);if(!spec)throw Error('Invalid cursor theme');progress=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
 const color={menu:'#e5c89a',idle:'#c6b7a2',interact:'#ffd08a',blocked:'#998777',enemy:'#ef9180',busy:'#f5b96d'}[kind],tiles=[];
 const tile=(x,y,c=color)=>tiles.push(`<rect x="${x*2}" y="${y*2}" width="2" height="2" fill="${c}" stroke="#080506" stroke-width="0.5"/>`);
 if(kind==='busy'){const rim=[];for(let x=9;x<=19;x++)rim.push([x,9]);for(let y=10;y<=20;y++)rim.push([19,y]);for(let x=18;x>=9;x--)rim.push([x,20]);for(let y=19;y>9;y--)rim.push([9,y]);rim.forEach(([x,y],i)=>tile(x,y,i<Math.round(progress*rim.length)?color:'#4e372c'));}
 if(kind==='enemy'){for(let i=0;i<6;i++){tile(13+i,10+i);tile(18-i,10+i);}}
 if(kind==='blocked')for(let i=0;i<11;i++)tile(9+i,20-i);
 if(kind==='interact'){for(let i=16;i<=20;i++)tile(i,19);for(let i=17;i<=21;i++)tile(18,i);}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="44" viewBox="0 0 42 44" data-cursor-theme="${spec.id}" data-pixel-grid="2" shape-rendering="crispEdges" style="--edge:#fff0cc;--metal:${color};image-rendering:pixelated">${spec.body}${tiles.join('')}</svg>`;
}
export function installIronCursor(canvas,{read=()=>({})}={}){
 const doc=canvas.ownerDocument,win=doc?.defaultView;if(!doc?.head?.appendChild||!doc?.body?.appendChild||!win?.requestAnimationFrame)return null;
 let storage;try{storage=win.localStorage;}catch{}const preferences=createCursorPreferences(storage),previousAPI=win.__ASH_CURSOR__,settings=Object.freeze({styles:()=>CURSOR_STYLES.map(({id,label})=>({id,label})),getTheme:preferences.get,setTheme(id){const changed=preferences.set(id);if(changed)paint();return changed;}});win.__ASH_CURSOR__=settings;
 const style=doc.createElement('style'),overlay=doc.createElement('div');style.textContent='canvas[data-iron-cursor="on"]{cursor:none!important}';
 overlay.setAttribute('aria-hidden','true');overlay.setAttribute('data-iron-cursor-overlay','');overlay.style.cssText='position:fixed;left:0;top:0;width:42px;height:44px;pointer-events:none;z-index:2147483647;display:none;contain:layout style;image-rendering:pixelated;';
 doc.head.appendChild(style);doc.body.appendChild(overlay);const original=canvas.getAttribute('data-iron-cursor');canvas.setAttribute('data-iron-cursor','on');let inside=false,disposed=false,raf=0,stamp='';
 const hide=()=>{inside=false;overlay.style.display='none';},move=e=>{if(disposed)return;if(e.pointerType==='touch'||e.target!==canvas){hide();return;}inside=true;overlay.style.transform=`translate(${Math.round(e.clientX)}px,${Math.round(e.clientY)}px)`;overlay.style.display='block';paint();},visibility=()=>{if(doc.hidden)hide();};
 function dispose(){if(disposed)return;disposed=true;win.cancelAnimationFrame(raf);doc.removeEventListener('pointermove',move,true);canvas.removeEventListener('pointermove',move,true);canvas.removeEventListener('pointerleave',hide,true);win.removeEventListener('blur',hide);doc.removeEventListener('visibilitychange',visibility);if(original===null)canvas.removeAttribute('data-iron-cursor');else canvas.setAttribute('data-iron-cursor',original);if(win.__ASH_CURSOR__===settings){if(previousAPI===undefined)delete win.__ASH_CURSOR__;else win.__ASH_CURSOR__=previousAPI;}overlay.remove();style.remove();}
 function paint(){if(disposed||!inside||doc.hidden)return;try{const state=cursorState(read()),theme=preferences.get(),next=theme+':'+state.kind+':'+Math.round(state.progress*100);if(next!==stamp){overlay.innerHTML=cursorMarkup({...state,theme});overlay.setAttribute('data-state',state.kind);overlay.setAttribute('data-theme',theme);stamp=next;}}catch(error){dispose();win.console?.error('Iron cursor disabled after error',error);}}
 function tick(){if(disposed)return;paint();if(!disposed)raf=win.requestAnimationFrame(tick);}
 doc.addEventListener('pointermove',move,true);canvas.addEventListener('pointermove',move,true);canvas.addEventListener('pointerleave',hide,true);win.addEventListener('blur',hide);doc.addEventListener('visibilitychange',visibility);raf=win.requestAnimationFrame(tick);return Object.freeze({dispose});
}
