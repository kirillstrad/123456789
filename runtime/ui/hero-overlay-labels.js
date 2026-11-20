import {heroHudBounds} from '../app/world-surface.js';
export function paintHeroOverlayLabels(ctx,s,{width,height=864,ready=false}={}){
 const r=heroHudBounds(width,height);if(r.width<=0||r.height<=0)return;
 ctx.save();try{ctx.font='10px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.shadowColor='#000';ctx.shadowBlur=2;
 const life=Math.max(0,Math.min(100,Number.isFinite(s.lamp)?s.lamp:0));ctx.fillStyle=life<=1?'#d68c79':'#d2b991';
 ctx.fillText(`LAMP ${Math.ceil(life)}/100`,r.x+r.width*.15,r.y+r.height*.94);
 ctx.fillStyle=ready?'#c2d4d8':'#89858a';ctx.fillText(ready?'DASH READY':'DASH',r.x+r.width*.85,r.y+r.height*.94);
 if(life<=15){ctx.fillStyle=life<=1?'#dd8a7b':'#c5a37a';ctx.fillText(life<=0?'THE FLAME IS OUT':life<=1?'LAST EMBER':'LOW EMBER',width/2,r.y+r.height*.82);}
 }finally{ctx.restore();}
}
