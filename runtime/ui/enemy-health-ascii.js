const ascii=s=>String(s).replace(/[^\x20-\x7e]/g,'?');
export function enemyHealthRows(e,cols=42){
 if(!e||![e.hp,e.maxHp].every(Number.isFinite)||e.hp<=0||e.maxHp<=0)return [];
 cols=Math.max(18,Math.min(90,Math.floor(cols)));const inner=cols-2,slots=cols-6,hp=Math.min(e.hp,e.maxHp),count=Math.max(1,Math.min(slots,Math.floor(hp/e.maxHp*slots)));
 const center=s=>{s=ascii(s).slice(0,inner);const left=Math.floor((inner-s.length)/2);return ' '.repeat(left)+s+' '.repeat(inner-s.length-left);};
 const name='[ '+ascii(e.name??'UNDEAD').toUpperCase().slice(0,cols-10)+' ]',left=Math.floor((inner-name.length)/2),numbers=String(Number(hp.toFixed(1)))+' / '+String(Number(e.maxHp.toFixed(1)));
 return ['+'+'-'.repeat(left)+name+'-'.repeat(inner-name.length-left)+'+','| ['+'#'.repeat(count)+':'.repeat(slots-count)+'] |','|'+center(numbers)+'|','+'+'='.repeat(inner)+'+'];
}
export function paintAsciiEnemyHealth(ctx,view,{width,height=720}={}){
 if(!ctx||!Number.isFinite(width)||!Number.isFinite(height)||width<160||height<100)return;
 ctx.save();try{ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.globalAlpha=1;ctx.textAlign='left';ctx.textBaseline='top';ctx.font='bold 12px monospace';
 const cell=ctx.measureText('M').width;if(!Number.isFinite(cell)||cell<=0)return;
 function plate(e,y,boss){const cols=Math.min(boss?76:42,Math.floor((width-20)/cell)),rows=enemyHealthRows(e,cols);if(!rows.length)return;const x=Math.round((width-cols*cell)/2);for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){const ch=rows[r][c];if(ch===' ')continue;const X=x+c*cell,Y=y+r*14;ctx.fillStyle='#09080c';ctx.fillText(ch,X+1,Y+2);ctx.fillStyle=r===1&&ch==='#'?'#b65c46':ch===':'?'#51434a':r===0||r===3?'#b3a38b':'#dccbb0';ctx.fillText(ch,X,Y);}}
 plate(view?.boss,12,true);plate(view?.target,view?.boss?86:12,false);
 }finally{ctx.restore();}
}
