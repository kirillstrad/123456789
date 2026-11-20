const clean=s=>String(s).replace(/[^\x20-\x7e]/g,'?');
const center=(s,n)=>{s=clean(s).slice(0,n);const a=Math.floor((n-s.length)/2);return' '.repeat(a)+s+' '.repeat(n-a-s.length);};
const trackers=new WeakMap();
export function stoneHealthRows(e,cols=42,{fraction=null,boss=false}={}){
 if(!e||![e.hp,e.maxHp].every(Number.isFinite)||e.maxHp<=0||e.hp<0)return[];
 const n=Math.max(24,Math.min(96,Math.floor(cols))),slots=n-6,hp=Math.max(0,Math.min(e.maxHp,e.hp)),f=fraction===null?hp/e.maxHp:Math.max(0,Math.min(1,fraction)),fill=hp>0?Math.max(1,Math.round(slots*f)):0;
 const name=boss?'CORPSE GOLEM':clean(e.name??'UNDEAD').toUpperCase();
 return[' __'+'='.repeat(n-6)+'__ ','/##'+':'.repeat(n-6)+'##\\','|| '+center(name,n-6)+' ||','|| '+center(boss?'--<X>---{ + }---<X>--':':  :  :  :  :',n-6)+' ||','||['+'#'.repeat(fill)+'.'.repeat(slots-fill)+']||','|| '+center(`${Number(hp.toFixed(1))} / ${Number(e.maxHp.toFixed(1))}`,n-6)+' ||','\\##'+'='.repeat(n-6)+'##/',' ..'+':'.repeat(n-6)+'.. '].map(s=>s.padEnd(n).slice(0,n));
}
export function paintStoneHealth(ctx,e,{width,y=12,boss=false,time=null,available=false}={}){
 if(!e||!Number.isFinite(width)||width<100)return;
 let cache=trackers.get(ctx);if(!cache){cache=new Map();trackers.set(ctx,cache);}
 const now=Number.isFinite(time)?time:(globalThis.performance?.now?.()??0)/1000,key=(boss?'boss:':'mob:')+(e.id??e.name??'enemy'),target=Math.max(0,Math.min(1,e.hp/e.maxHp));
 const old=cache.get(key),dt=old?Math.max(0,Math.min(.1,now-old.time)):0,reset=!old||now<old.time||old.max!==e.maxHp;
 const fraction=reset?target:old.fraction+(target-old.fraction)*(1-Math.exp(-dt/.12));cache.set(key,{fraction,time:now,max:e.maxHp});if(cache.size>64)cache.delete(cache.keys().next().value);
 const cols=Math.max(24,Math.min(boss?92:44,Math.floor((width-16)/7.5))),rows=stoneHealthRows(e,cols,{fraction,boss});if(!rows.length)return;
 const font=Math.min(boss?13:11,Math.max(4,(width-16)/(cols*.64))),cw=font*.62,ch=font*1.05,x=(width-cols*cw)/2;
 ctx.save();ctx.globalAlpha=1;ctx.font=`${font}px monospace`;ctx.textAlign='left';ctx.textBaseline='top';
 for(let r=0;r<rows.length;r++)for(let c=0;c<cols;c++){
  const glyph=rows[r][c];if(glyph===' ')continue;const X=x+c*cw,Y=y+r*ch;ctx.fillStyle='#08090b';ctx.fillText(glyph,X+1,Y+2);
  ctx.fillStyle=r===4?(glyph==='#'?(boss?'#b92b3c':'#a95148'):glyph==='.'?'#30282b':'#81756a'):r===2||r===5?'#e0d1c5':r===7?'#353437':r===0||glyph==='='?'#a69d88':glyph===':'?'#4b4846':boss?'#88565b':'#736e64';ctx.fillText(glyph,X,Y);
 }
 if(boss&&available){ctx.fillStyle='#e4c9bc';const text='R — Последний уголь',left=(width-text.length*cw)/2;for(let i=0;i<text.length;i++)ctx.fillText(text[i],left+i*cw,y+rows.length*ch+3);}
 ctx.restore();
}
