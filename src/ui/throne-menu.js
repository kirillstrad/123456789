const CHARS="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /-%.",BITS=["errvrrr","urrurru","fooooof","urrrrru","voouoov","voouooo","foorrrf","rrrvrrr","veeeeev","7333rre","rqssurr","oooooov","rvvrrrr","rvvvrrr","errrrre","urruooo","errrve3","urrusqr","fooe33u","veeeeee","rrrrrre","rrrrre4","rrrrvvr","rre4err","rre4444","v36coov","errrrre","4c4444e","er36cov","u33e33u","rrrv333","voou33u","eoourre","v36cccc","errerre","errf33e","0000000","136cog0","000v000","pr6corj","00000cc"];
const FONT=Object.fromEntries([...CHARS].map((c,i)=>[c,[...BITS[i]].map(n=>parseInt(n,32).toString(2).padStart(5,'0'))]));
// Authored seven-by-nine book capitals. No external font or smoothing.
export const CARVED_CAPS=Object.freeze(Object.fromEntries(Object.entries({
 A:'0011100/0110110/1100011/1100011/1111111/1100011/1100011/1100011/1110111',
 B:'1111110/0110011/0110011/0110110/0111110/0110011/0110011/0110011/1111110',
 C:'0011111/0110011/1100001/1100000/1100000/1100000/1100001/0110011/0011110',
 D:'1111100/0110110/0110011/0110011/0110011/0110011/0110011/0110110/1111100',
 E:'1111111/0110011/0110001/0110100/0111100/0110100/0110001/0110011/1111111',
 F:'1111111/0110011/0110001/0110100/0111100/0110100/0110000/0110000/1111000',
 G:'0011110/0110011/1100001/1100000/1101111/1100011/1100011/0110011/0011110',
 H:'1110111/0110010/0110010/0110010/0111110/0110010/0110010/0110010/1110111',
 I:'0111110/0001100/0001100/0001100/0001100/0001100/0001100/0001100/0111110',
 J:'0001111/0000110/0000110/0000110/0000110/1100110/1100110/0110110/0011100',
 K:'1110111/0110010/0110110/0111100/0111000/0111100/0110110/0110010/1110111',
 L:'1111000/0110000/0110000/0110000/0110000/0110000/0110001/0110011/1111111',
 M:'1100011/1110111/1111111/1101011/1101011/1100011/1100011/1100011/1110111',
 N:'1110111/0110010/0111010/0111010/0111110/0110110/0110110/0110010/1110111',
 O:'0011100/0110110/1100011/1100011/1100011/1100011/1100011/0110110/0011100',
 P:'1111110/0110011/0110011/0110011/0111110/0110000/0110000/0110000/1111000',
 Q:'0011100/0110110/1100011/1100011/1100011/1101011/1100111/0110110/0011011',
 R:'1111110/0110011/0110011/0110011/0111110/0111100/0110110/0110011/1110011',
 S:'0011111/0110011/1100001/0110000/0011100/0000110/1000011/1100110/1111100',
 T:'1111111/1101011/1001001/0001000/0001000/0001000/0001000/0001000/0011100',
 U:'1110111/0110010/0110010/0110010/0110010/0110010/0110010/0110110/0011100',
 V:'1110111/1100011/1100011/1100011/0110110/0110110/0011100/0011100/0001000',
 W:'1110111/1100011/1100011/1100011/1101011/1101011/1111111/0110110/0100010',
 X:'1110111/0110110/0110110/0011100/0001000/0011100/0110110/0110110/1110111',
 Y:'1110111/1100011/0110110/0011100/0001000/0001000/0001000/0001000/0011100',
 Z:'1111111/1100011/1000110/0001100/0011100/0011000/0110001/1100011/1111111'
}).map(([k,v])=>[k,Object.freeze(v.split('/'))])));
export const LABELS=Object.freeze(['NEW GAME','CONTINUE','LEVEL SELECT','SETTINGS','EXIT']);
export const LEVELS=Object.freeze(['THE NAVE','OBJECT GALLERY','BACK']);
export const menuActive=mode=>['menu','pause','dead','won'].includes(mode);
export const defaults=()=>({page:'main',selected:0,brightness:.86,motion:true,hasRun:false});
export const covered=s=>[...s].every(c=>FONT[c]);
export const resumable=(s,phase)=>s.hasRun&&phase==='playing';
export const menuRects=n=>Array.from({length:n},(_,i)=>({x:220,y:n>5?330+i*39:395+i*49,w:568,h:n>5?35:43}));
export function prayerLetter(char,index,time,{selected=false,motion=true,row=0}={}){
 if(selected||!motion||char===' ')return{glyph:char,alpha:1,heat:0};
 const t=((Math.max(0,Number.isFinite(time)?time:0)+row*2.7)%18),reveal=1.4+index*.025;
 if(t<reveal)return{glyph:CHARS[(index*13+row*7+Math.floor(t*9))%26],alpha:.22,heat:.15};
 if(t<reveal+.65){const p=(t-reveal)/.65;return{glyph:char,alpha:.45+.55*Math.sin(p*Math.PI/2),heat:1-p};}
 return{glyph:char,alpha:t>16.5?.85-(t-16.5)*.35:.85,heat:0};
}
let app;
function install(out,api){const s=defaults(),cv=out.canvas;try{const v=JSON.parse(localStorage.getItem('ash4e-legacy'));if(v){s.brightness=Math.max(.2,Math.min(1.4,Number(v.brightness)||.86));s.motion=v.motion!==false;}}catch{}if(matchMedia('(prefers-reduced-motion: reduce)').matches)s.motion=false;
app={s,cv,cpuMs:0,notice:''};
const cursor=()=>window.__ASH_CURSOR__,styles=()=>cursor()?.styles?.()??[{id:'thorn-crown',label:'THORN CROWN'}],cursorId=()=>cursor()?.getTheme?.()??'thorn-crown';
const apply=()=>{const p=document.getElementById('power'),f=document.getElementById('fireFreeze');if(p)p.value=String(s.brightness*100);if(f)f.checked=!s.motion;};apply();
const save=()=>{apply();try{localStorage.setItem('ash4e-legacy',JSON.stringify({brightness:s.brightness,motion:s.motion}));}catch{}};
const choices=()=>s.page==='levels'?LEVELS:s.page==='settings'?['BRIGHTNESS '+Math.round(s.brightness*100)+'%','MOTION '+(s.motion?'ON':'OFF'),'CURSOR STYLE','BACK']:s.page==='cursors'?[...styles().map((v,i)=>String(i+1).padStart(2,'0')+' '+v.label+(v.id===cursorId()?' / ON':'')),'BACK']:s.page==='exit'?['CANCEL','EXIT']:s.page==='notice'?['BACK']:LABELS;
const page=p=>{s.page=p;s.selected=0;app.notice='';};
const cycleCursor=delta=>{const list=styles(),i=list.findIndex(v=>v.id===cursorId());cursor()?.setTheme?.(list[(i+delta+list.length)%list.length].id);};
function enterGallery(){const g=globalThis.__ASH_GALLERY__;if(typeof g?.walk!=='function'){page('notice');app.notice='GALLERY UNAVAILABLE';return;}page('main');try{g.walk();}catch(error){g.close?.();page('notice');app.notice='GALLERY COULD NOT START';throw error;}}
function go(){const i=s.selected;if(s.page==='main'){if(i===0){s.hasRun=true;api.start();}else if(i===1){if(resumable(s,api.state().phase))api.resume();else{page('notice');app.notice='NO ACTIVE RUN';}}else page(['','','levels','settings','exit'][i]);}else if(s.page==='levels'){if(i===0){s.hasRun=true;api.start();page('main');}else if(i===1)enterGallery();else page('main');}else if(s.page==='settings'){if(i===0)s.brightness=s.brightness>=1.4?.2:Math.min(1.4,Math.round((s.brightness+.1)*100)/100);else if(i===1)s.motion=!s.motion;else if(i===2){page('cursors');s.selected=Math.max(0,styles().findIndex(v=>v.id===cursorId()));}else page('main');save();}else if(s.page==='cursors'){const style=styles()[i];if(style){if(cursor()?.setTheme?.(style.id))app.notice='CURSOR APPLIED';}else page('settings');}else if(s.page==='exit'){if(!i)page('main');else if(new URLSearchParams(location.search).get('desktop')==='1')window.close();else{page('notice');app.notice='CLOSE THIS BROWSER TAB';}}else page('main');}
const active=()=>menuActive(api.mode());window.addEventListener('keydown',e=>{if(!active()||e.target.matches?.('input,select,button,textarea'))return;if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape'].includes(e.code))return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&e.code==='Enter')return;if(e.code==='Escape'){if(s.page==='cursors')page('settings');else if(s.page!=='main')page('main');else if(api.mode()==='pause'&&resumable(s,api.state().phase))api.resume();return;}if(e.code==='ArrowDown')s.selected=(s.selected+1)%choices().length;if(e.code==='ArrowUp')s.selected=(s.selected+choices().length-1)%choices().length;if(e.code==='Enter')go();if(s.page==='settings'&&['ArrowLeft','ArrowRight'].includes(e.code)){if(s.selected===0){s.brightness=Math.max(.2,Math.min(1.4,Math.round((s.brightness+(e.code==='ArrowRight'?.1:-.1))*100)/100));save();}else if(s.selected===2)cycleCursor(e.code==='ArrowRight'?1:-1);}},true);
function hit(e){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width-(cv.width-1008)/2,y=(e.clientY-r.top)*864/r.height;return menuRects(choices().length).findIndex(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);}
cv.addEventListener('pointermove',e=>{if(!active())return;e.stopImmediatePropagation();const i=hit(e);if(i>=0)s.selected=i;},true);cv.addEventListener('pointerdown',e=>{if(!active())return;e.preventDefault();e.stopImmediatePropagation();cv.focus();const i=hit(e);if(e.button===0&&i>=0){s.selected=i;go();}},true);
app.choices=choices;window.__ASH_THRONE__=Object.freeze({state:()=>({...s,cursor:cursorId()}),choices:()=>[...choices()],cpuMs:()=>app.cpuMs,open:()=>{api.pause();page('main');}});}
export function throneMenu(out,api){
 if(!api)return false;if(!app)install(out,api);const begin=performance.now(),{s}=app,time=begin/1000,motion=s.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches,offset=(out.canvas.width-1008)/2;
 // main.drawMenu has already painted the original animated ASCII fire.
 out.save();out.translate(offset,0);out.imageSmoothingEnabled=false;
 // Broken, heavy thorn borders; deliberately no full-screen background fill.
 for(const side of [-1,1])for(let i=0;i<78;i++){const x=504+side*(320+(i%7===0?12:i%3===0?4:0)),y=92+i*8;out.fillStyle='#080506';out.fillRect(x-5,y-2,12,12);out.fillStyle=i%5?'#70513b':'#d1a16b';out.fillRect(x,y,4,8);if(i%7===0){out.fillRect(x-side*8,y+4,12,4);out.fillRect(x-side*12,y+8,4,8);}}
 function txt(word,x,y,cell=3,color='#b6a48c',animated=false,row=0,selected=false,carved=false){out.font=Math.ceil(cell*1.16)+'px monospace';out.textBaseline='top';out.textAlign='left';[...word].forEach((ch,k)=>{const f=animated?prayerLetter(ch,k,time,{motion,row,selected}):{glyph:ch,alpha:1,heat:0};out.globalAlpha=f.alpha;const ink=f.heat>.1?'#ffc079':color,grid=carved?(CARVED_CAPS[f.glyph]??['0000000',...(FONT[f.glyph]??FONT[' ']).map(r=>'0'+r+'0'),'0000000']):(FONT[f.glyph]??FONT[' ']);grid.forEach((line,j)=>[...line].forEach((bit,i)=>{if(bit!=='1')return;const px=x+(k*(carved?8:6)+i)*cell,py=y+j*cell;if(carved){out.fillStyle='#090506';out.fillRect(px-1,py-1,cell+2,cell+2);}}));out.fillStyle=ink;grid.forEach((line,j)=>[...line].forEach((bit,i)=>{if(bit!=='1')return;const px=x+(k*(carved?8:6)+i)*cell,py=y+j*cell;if(carved){out.fillStyle=ink;out.fillRect(px,py,cell,cell);if(cell>=3&&grid[j-1]?.[i]!=='1'){out.fillStyle=selected?'#fff0c4':'#e5c18e';out.fillRect(px,py,Math.max(1,cell-1),1);}}else{out.fillStyle='#090506';out.fillText('#',px+1,py+1);out.fillStyle=ink;out.fillText('#',px,py);}}));});out.globalAlpha=1;}
 txt('ASH / IRON',226,105,7,'#c9a97a',false,0,true,true);txt('NO SAINTS. NO ABSOLUTION.',223,199,2,'#c29b70');
 for(let i=0;i<70;i++){out.fillStyle=i%9===0?'#e4b57d':'#795337';out.fillRect(223+i*8,232+(i%9===0?-4:0),6,i%9===0?12:4);}
 const mode=api.mode(),title=mode==='dead'?'THE FLAME HAS GONE OUT':mode==='won'?'THE NAVE IS SILENT':s.page==='main'?'MAIN MENU':s.page==='levels'?'LEVEL SELECT':s.page==='settings'?'SETTINGS':s.page==='cursors'?'CURSOR STYLE':s.page==='exit'?'EXIT':'CONTINUE';txt(title,223,268,3,'#e1bc84',false,0,true,true);
 const list=app.choices(),rects=menuRects(list.length),roman=['I','II','III','IV','V','VI','VII','VIII'];
 list.forEach((label,i)=>{const r=rects[i],chosen=i===s.selected,disabled=s.page==='main'&&i===1&&!resumable(s,api.state().phase),cell=list.length>5||label.length>20?2:3;out.fillStyle=chosen?'rgba(8,4,3,.66)':'rgba(8,4,3,.3)';out.fillRect(r.x-12,r.y,r.w+24,r.h);if(chosen){out.fillStyle='#f2ca8c';out.fillRect(r.x-12,r.y+10,6,r.h-20);out.fillRect(r.x-18,r.y+14,18,6);for(let j=0;j<Math.floor(r.w/12);j++)out.fillRect(r.x+j*12,r.y+r.h-3,j%4?8:4,3);}txt(roman[i]??String(i+1),r.x+4,r.y+11,2,chosen?'#e4bd86':'#a58564');txt(label,r.x+58,r.y+Math.floor((r.h-9*cell)/2),cell,disabled?'#89735c':chosen?'#ffe2ad':'#cfad7f',!disabled,i,chosen,true);});
 if(app.notice)txt(app.notice,223,668,2,'#edc38b');if(s.page==='levels')txt('NAVE / OBJECT GALLERY',223,641,2,'#c29b70');if(s.page==='settings')txt('CURSOR STYLE / LEFT - RIGHT TO CYCLE',223,641,2,'#c29b70');
 txt('WHAT REMAINS MUST WALK.',223,758,2,'#c9a475',true,8,false);txt('UP / DOWN - CHOOSE   ENTER - SELECT',223,794,2,'#ad8a66');if(s.brightness!==.86){out.fillStyle=s.brightness<.86?'#000':'#fff';out.globalAlpha=s.brightness<.86?(.86-s.brightness)*.7:(s.brightness-.86)*.14;out.fillRect(-offset,0,out.canvas.width,864);out.globalAlpha=1;}out.restore();app.cpuMs=performance.now()-begin;return true;
}
