const clamp=x=>Math.max(0,Math.min(1,x));
const copy=x=>x?JSON.parse(JSON.stringify(x)):null;
const objective=x=>{
 if(!x||typeof x.title!=='string'||typeof x.text!=='string')throw TypeError('Objective requires title and text');
 return {id:String(x.id??''),title:x.title.slice(0,80),text:x.text.slice(0,1600)};
};

export function createManifestState(){
 let shown=null,wanted=null,dialogue=null,opened=false,amount=0,phase='idle',age=0,unread=false,selected=0;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const settle=()=>{shown=copy(wanted);phase='idle';age=0;};
 const begin=()=>{if(!same(shown,wanted)){phase=shown?'burn':'assemble';age=0;if(!shown)shown=copy(wanted);}};
 const api={
  setObjective(value){
   const next=objective(value);if(same(next,wanted))return false;
   wanted=next;unread=true;
   if(opened&&!dialogue&&amount>=.98&&phase!=='burn')begin();
   return true;
  },
  openDialogue(value){
   if(!value||typeof value.text!=='string'||!Array.isArray(value.choices)||value.choices.length>6)throw TypeError('Dialogue requires text and up to six choices');
   const choices=value.choices.map((c,i)=>{
    if(!c||typeof c.label!=='string')throw TypeError('Choice requires label');
    return {id:String(c.id??i),label:c.label.slice(0,180)};
   });
   if(new Set(choices.map(c=>c.id)).size!==choices.length)throw TypeError('Choice IDs must be unique');
   dialogue={id:String(value.id??''),speaker:String(value.speaker??'').slice(0,80),text:value.text.slice(0,2400),choices};
   selected=0;opened=true;return true;
  },
  choose(index){
   if(!opened||amount<.98||!dialogue||!Number.isInteger(index)||!dialogue.choices[index])return null;
   const event={dialogueId:dialogue.id,choiceId:dialogue.choices[index].id,index};
   dialogue=null;opened=false;return event;
  },
  select(index){if(dialogue&&Number.isInteger(index)&&dialogue.choices[index])selected=index;},
  toggle(){
   if(opened){opened=false;return;}
   dialogue=null;opened=true;
  },
  close(){opened=false;},
  reveal(){if(opened&&!dialogue){settle();unread=false;}},
  step(dt,reducedMotion=false){
   if(!Number.isFinite(dt)||dt<0)return;
   dt=Math.min(dt,.1);
   if(reducedMotion){amount=opened?1:0;if(opened&&!dialogue){settle();unread=false;}if(!opened)dialogue=null;return;}
   amount=clamp(amount+(opened?1:-1)*dt/(opened?.72:.58));
   if(!opened){if(amount===0)dialogue=null;return;}
   if(amount<.98||dialogue)return;
   unread=false;
   if(phase==='idle'&&!same(shown,wanted))begin();
   if(phase==='idle')return;
   age+=dt;
   if(phase==='burn'&&age>=.65){shown=copy(wanted);phase='assemble';age=0;}
   else if(phase==='assemble'&&age>=1.05){
    phase='idle';age=0;
    if(!same(shown,wanted))begin();
   }
  },
  reset(){shown=null;wanted=null;dialogue=null;opened=false;amount=0;phase='idle';age=0;unread=false;selected=0;},
  view(){return copy({shown,wanted,dialogue,opened,amount,phase,age,unread,selected});},
 };
 return api;
}
