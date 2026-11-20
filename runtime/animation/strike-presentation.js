const clamp=x=>Math.max(0,Math.min(1,x));
export function strikeProgress(progress,contact){
 const t=clamp(progress);
 if(contact<=0||contact>=1)return t;
 if(t<=contact){const x=t/contact;return contact*(x-.58*x*x*(1-x));}
 const x=(t-contact)/(1-contact);
 return contact+(1-contact)*(x+.58*x*(1-x)*(1-x));
}
export function blendEntry(module,sampled,progress,time){
 const t=clamp(progress/.12),weight=t*t*(3-2*t);
 if(weight>=1)return sampled;
 const from=module.sample('breath',(time/5)%1,time),to=sampled.pose;
 const mix=(a,b)=>a+(b-a)*weight;
 const vector=(a,b)=>a.map((value,i)=>mix(value,b[i]));
 const pose={...to,root:vector(from.root,to.root),right:vector(from.right,to.right),left:vector(from.left,to.left),lean:mix(from.lean,to.lean),head:mix(from.head,to.head),az:mix(from.az,to.az)};
 return {pose,rig:module.rig(pose)};
}
