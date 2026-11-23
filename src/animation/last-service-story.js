export function storyHero(s,scene,module=globalThis.IronPilgrim){
 if(!module||!scene)throw Error('Story hero requires a model and scene');
 const base=module.sample('breath',(s.time/5)%1,s.time),w=scene.weight;
 const book=scene.id==='ledger'||scene.id==='register',recoil=scene.id==='awakening';
 const mix=(a,b)=>a.map((v,i)=>v+(b[i]-v)*w);
 const pose={...base,id:'last-service-'+scene.id,root:[...base.root],gait:null,right:mix(base.right,book?[.24,.45,.72]:base.right),left:mix(base.left,book?[-.18,.5,1.32]:recoil?[-.28,.28,1.45]:[-.18,.65,1.4]),lean:base.lean+(recoil?-.14:book?.2:.08)*w,head:base.head+(book?.24:.08)*w,twist:(base.twist??0)+(recoil?-.16:0)*w};
 const rig=module.rig(pose),h=s.motion?.heading??Math.atan2(s.fy,s.fx),fx=Math.cos(h),fy=Math.sin(h);
 const transform=v=>{const x=v[0]-pose.root[0],y=v[1]-pose.root[1];return[s.x+fy*x+fx*y,s.y-fx*x+fy*y,v[2]];};
 const parts=[],push=(kind,v,c,w=1)=>{const points=v.map(transform);parts.push({kind,v:points,c,w,hero:true,d:points.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/points.length+(kind===1?.005:0)});};
 const lamp=module.emit(rig,s.time+scene.elapsed,{poly:(v,c)=>push(0,v,c),line:(v,c,w)=>push(1,v,c,w)},{cloth:0,chains:[0,0,0,0]},1);
 return {parts,lamp:transform(lamp),tip:transform(rig.tip),clip:pose.id};
}
export function awakeningParts(parts,scene){
 if(scene?.id!=='awakening')return parts;
 const u=Math.max(0,Math.min(1,scene.progress)),scale=.35+.65*u*u*(3-2*u);
 return parts.map(p=>({...p,v:p.v.map(([x,y,z])=>[x,y,z*scale])}));
}
