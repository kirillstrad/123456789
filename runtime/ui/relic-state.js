const clamp=x=>Math.max(0,Math.min(1,x));
const copy=x=>JSON.parse(JSON.stringify(x));
const transitions=new Set(['quiet','burn','instant']);
function goal(x){
 if(!x||typeof x.title!=='string'||typeof x.text!=='string')throw TypeError('Objective requires title and text');
 return {id:String(x.id??''),title:x.title,text:x.text};
}
function document(value,kind){
 if(!value||typeof value.text!=='string')throw TypeError('Document requires text');
 const choices=(value.choices??[]).map((c,i)=>{
  if(!c||typeof c.label!=='string')throw TypeError('Choice requires label');
  return {id:String(c.id??i),label:c.label};
 });
 if(choices.length>6||new Set(choices.map(c=>c.id)).size!==choices.length)throw TypeError('Invalid choices');
 const transition=value.transition??'quiet';
 if(!transitions.has(transition))throw TypeError('Unknown text transition');
 return {id:String(value.id??''),kind,speaker:String(value.speaker??value.title??''),text:value.text,choices:kind==='reading'?[]:choices,transition};
}
export function createRelicState(){
 let shown=null,wanted=null,doc=null,nextDoc=null,opened=false,amount=0,spread=0;
 let phase='idle',age=0,unread=false,selected=0,page=0,heat=null,docPhase='idle',docAge=0;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const settle=()=>{shown=copy(wanted);phase='idle';age=0;};
 const begin=()=>{if(!same(shown,wanted)){phase=shown?'burn':'assemble';age=0;page=0;if(!shown)shown=copy(wanted);}};
 const open=(value,kind)=>{
  const incoming=document(value,kind);
  if(doc&&amount>.98&&incoming.transition==='burn'){nextDoc=incoming;docPhase='burn';docAge=0;}
  else{doc=incoming;nextDoc=null;docPhase=incoming.transition==='instant'?'idle':'quiet';docAge=0;}
  opened=true;page=0;selected=0;heat=null;
 };
 const api={
  setObjective(value){const next=goal(value);if(same(next,wanted))return false;wanted=next;unread=true;if(opened&&!doc&&amount>.98&&phase!=='burn')begin();return true;},
  openDialogue(value){open(value,'dialogue');},openReading(value){open(value,'reading');},
  close(){opened=false;heat=null;nextDoc=null;docPhase='idle';},
  dismiss(){opened=false;amount=0;spread=0;doc=null;nextDoc=null;heat=null;page=0;},
  toggle(){if(doc||opened)api.close();else opened=true;},
  reveal(){if(doc){docPhase='idle';if(nextDoc){doc=nextDoc;nextDoc=null;}}else{settle();unread=false;}},
  select(i){if(!heat&&doc&&doc.choices[i])selected=i;},
  turnPage(delta,total){if(!heat&&Number.isInteger(total)&&total>0)page=Math.max(0,Math.min(total-1,page+Math.sign(delta)));},
  confirm(i){if(!opened||amount<.999||spread<.999||heat||!doc||!Number.isInteger(i)||!doc.choices[i])return false;selected=i;heat={index:i,age:0};return true;},
  takeChoice(){
   if(!heat||heat.age<.24||!doc)return null;
   const result={dialogueId:doc.id,choiceId:doc.choices[heat.index].id,index:heat.index};
   heat=null;opened=false;return result;
  },
  step(dt,reduced=false){
   if(!Number.isFinite(dt)||dt<0)return;dt=Math.min(dt,.1);
   amount=reduced?(opened?1:0):clamp(amount+(opened?1:-1)*dt/(opened?1.25:1.05));
   const target=doc?1:0;spread=reduced?target:Math.max(0,Math.min(1,spread+Math.sign(target-spread)*Math.min(Math.abs(target-spread),dt/.55)));
   if(!opened&&amount===0){doc=null;nextDoc=null;spread=0;page=0;}
   if(heat)heat.age=reduced?.24:heat.age+dt;
   if(doc){
    docAge+=dt;
    if(reduced){if(nextDoc){doc=nextDoc;nextDoc=null;}docPhase='idle';}
    else if(docPhase==='burn'&&docAge>=.6){doc=nextDoc;nextDoc=null;docPhase='assemble';docAge=0;page=0;}
    else if((docPhase==='assemble'&&docAge>=.9)||(docPhase==='quiet'&&docAge>=.18))docPhase='idle';
    return;
   }
   if(!opened||amount<.999)return;
   unread=false;
   if(reduced){settle();return;}
   if(phase==='idle'&&!same(shown,wanted))begin();
   if(phase==='idle')return;
   age+=dt;
   if(phase==='burn'&&age>=.65){shown=copy(wanted);phase='assemble';age=0;page=0;}
   else if(phase==='assemble'&&age>=1.05){phase='idle';age=0;if(!same(shown,wanted))begin();}
  },
  reset(){shown=null;wanted=null;doc=null;nextDoc=null;opened=false;amount=0;spread=0;phase='idle';age=0;unread=false;selected=0;page=0;heat=null;docPhase='idle';docAge=0;},
  blocking:()=>!!doc,
  view:()=>copy({shown,wanted,dialogue:doc,opened,amount,spread,phase,age,unread,selected,page,heat,docPhase,docAge,modal:!!doc}),
 };
 return api;
}
