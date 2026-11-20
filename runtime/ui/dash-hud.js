const clamp=value=>Math.max(0,Math.min(1,value));
const flashSeconds=.22;
export function drawDashHud(out,hud,s,ready,cooldown){
 if(ready&&!hud.ready)hud.at=s.time;
 hud.ready=ready;
 const flash=ready&&s.time-hud.at<flashSeconds;
 const fill=s.dash?0:clamp(1-s.dashCooldown/cooldown);
 out.save();
 out.font='13px monospace';
 out.textBaseline='middle';
 out.fillStyle='#100c0b';
 out.fillRect(16,821,144,28);
 out.fillStyle=flash?'#fff0c0':ready?'#e7ae70':'#8d7770';
 out.fillText(ready?'» РЫВОК ГОТОВ':fill===1?'» РЫВОК ЗАНЯТ':'» РЫВОК',24,830);
 out.fillStyle='#49362f';
 out.fillRect(24,841,126,3);
 out.fillStyle=flash?'#fff0c0':ready?'#e7ae70':'#a16c50';
 out.fillRect(24,841,126*fill,3);
 out.restore();
}
