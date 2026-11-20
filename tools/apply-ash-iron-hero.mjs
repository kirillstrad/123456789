import fs from 'node:fs';
const pending=new Map();function edit(p,a,b){const s=pending.get(p)??fs.readFileSync(p,'utf8');if(s.includes(b))return;if(s.split(a).length!==2)throw Error('Unexpected palette context: '+p);pending.set(p,s.replace(a,b));}
const p='src/render/hero-appearance.ts';
edit(p,"HERO_ACCENT_COLOR='#cf4b45'","HERO_ACCENT_COLOR='#873b3b'");
edit(p,"HERO_GLINT_COLOR='#dce8f3'","HERO_GLINT_COLOR='#a8adb3'");
edit(p,"{'#413b3b':'#433b3d','#5b4f4b':'#60514e','#95806e':'#9b8272','#6e5d51':'#755f55'}","{'#413b3b':'#29262b','#5b4f4b':'#373139','#95806e':'#514741','#6e5d51':'#403832'}");
edit(p,"{'#b4a087':'#8c8e99','#efd3a2':'#b5bcc7','#d4ae75':'#99959b','#e0c69c':'#9997a0','#937554':'#69636b','#eed7ad':'#a7a7b0'}","{'#b4a087':'#858b93','#efd3a2':'#a8adb3','#d4ae75':'#8f959d','#e0c69c':'#999fa6','#937554':'#626771','#eed7ad':'#a8adb3'}");
edit(p,'return warm.map((n,i)=>Math.max(0,Math.min(255,Math.round(n*.8+luma*[1.08,1.02,1][i]!*.2))));',"const lift=hand?1:forearm?.55:center[2]>1.3?.8:0,shade=.65+.35*Math.max(0,Math.min(1,luma/120));return [139,129,117].map((n,i)=>Math.round((n+([200,185,158][i]!-n)*lift)*shade));");
edit('tests/hero-appearance.test.mjs',"'#b5bcc7'","'#a8adb3'");
edit('tests/hero-appearance.test.mjs',"'#433b3d'","'#29262b'");
for(const [path,text]of pending)fs.writeFileSync(path,text);
console.log('Ash and Iron materials applied; lamp light, geometry and gameplay unchanged');
