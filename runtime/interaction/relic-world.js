const NPC={id:'nave.ash-keeper',kind:'npc',x:6.8,y:11.7,radius:.28,title:'THE ASH KEEPER'};
const TABLET={id:'nave.ember-inscription',kind:'tablet',x:9.5,y:12.2,radius:.3,title:'THE FIRST EMBER'};
export const RELIC_OBJECTS=Object.freeze([Object.freeze(NPC),Object.freeze(TABLET)]);
const graph={
 intro:{text:'You carry a dying flame. Beyond these stones, the warden keeps the passage. What would you ask of me?',choices:[
  {id:'inscription',label:'Tell me about the inscription.',next:'inscription'},
  {id:'vow',label:'I will face the warden.',unless:'vow',effects:[{flag:'vow'},{objective:{id:'warden',title:'THE WARDEN',text:'Defeat the warden and reclaim the passage.'}}],next:'vow'},
  {id:'leave',label:'Leave the keeper.'}
 ]},
 inscription:{text:'The tablet beside you speaks of the first ember. Read it. Stone remembers what the living choose to forget.',choices:[{id:'back',label:'I have another question.',next:'intro'},{id:'leave',label:'I will read the tablet.'}]},
 vow:{text:'Then keep your flame close. I have no blessing to offer, only a warning: do not mistake the dark for an empty room.',transition:'burn',choices:[{id:'leave',label:'End the conversation.'}]}
};
const tabletText='Before the first gate was raised, a keeper set an ember beneath this stone. It was not a promise of safety. It was a promise that someone would return.\n\nCarry no borrowed flame beyond the threshold. What you take into the dark must be yours to lose.\n\nThe names below were cut away. The empty lines remain.\n\nA later hand has scratched a warning into the lower edge:\n\nTHE WARDEN DOES NOT GUARD THE LIGHT.\nTHE WARDEN GUARDS THE WAY OUT.';
function obstructed(a,b,map,owner){
 const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;
 for(const c of map?.circles??[]){if(c.relicOwner===owner)continue;const t=n?Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.y-a.y)*dy)/n)):0;if(Math.hypot(a.x+dx*t-c.x,a.y+dy*t-c.y)<c.r)return true;}
 for(const r of map?.rects??[]){
  let lo=0,hi=1;
  for(const [axis,min,max]of [['x',r.minX,r.maxX],['y',r.minY,r.maxY]]){
   const d=b[axis]-a[axis];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max){hi=-1;break;}}
   else{let p=(min-a[axis])/d,q=(max-a[axis])/d;if(p>q)[p,q]=[q,p];lo=Math.max(lo,p);hi=Math.min(hi,q);}
  }
  if(lo<=hi)return true;
 }
 return false;
}
export function createRelicWorld({map,openDialogue,openReading,setObjective}){
 const flags=new Set(),events=[];let active=null;
 for(const object of RELIC_OBJECTS)if(map?.circles&&!map.circles.some(c=>c.relicOwner===object.id))map.circles.push({x:object.x,y:object.y,r:object.radius,relicOwner:object.id});
 const record=x=>{events.push(x);if(events.length>64)events.shift();};
 const eligible=actor=>actor?.phase==='playing'&&!actor.dash&&!actor.interaction;
 const nearest=actor=>eligible(actor)?RELIC_OBJECTS.map(object=>({object,distance:Math.hypot(actor.x-object.x,actor.y-object.y)})).filter(x=>x.distance<=1.9&&!obstructed(actor,x.object,map,x.object.id)).sort((a,b)=>a.distance-b.distance||a.object.id.localeCompare(b.object.id))[0]?.object??null:null;
 const show=nodeId=>{
  const node=graph[nodeId];if(!node)throw Error('Unknown dialogue node');
  const choices=node.choices.filter(c=>(!c.unless||!flags.has(c.unless))&&(!c.requires||flags.has(c.requires)));
  const id=NPC.id+':'+nodeId;
  const ok=openDialogue({id,speaker:NPC.title,text:node.text,transition:node.transition??'quiet',choices:choices.map(c=>({id:c.id,label:c.label}))});
  if(ok!==false)active={id,nodeId,choices};else active=null;
  return ok!==false;
 };
 return {
  reset(){flags.clear();events.length=0;active=null;},
  cancel(){active=null;},
  nearest,
  press(actor){
   const object=nearest(actor);if(!object)return false;
   if(object.kind==='npc')return show('intro');
   active=null;return openReading({id:object.id,title:object.title,text:tabletText,transition:'quiet'})!==false;
  },
  choose(event){
   if(!active||event.dialogueId!==active.id)return false;
   const c=active.choices.find(x=>x.id===event.choiceId);if(!c)return false;
   active=null;
   for(const effect of c.effects??[]){if(effect.flag)flags.add(effect.flag);if(effect.objective)setObjective(effect.objective);}
   record({type:'choice',dialogueId:event.dialogueId,choiceId:c.id});
   if(c.next)show(c.next);return true;
  },
  snapshot:()=>({flags:[...flags],active:active?{id:active.id,nodeId:active.nodeId}:null,events:events.map(e=>({...e}))}),
  parts(actor){
   const parts=[],near=nearest(actor);
   const poly=(object,points,c)=>parts.push({kind:0,v:points.map(([x,y,z])=>[object.x+x,object.y+y,z]),c,d:object.x+object.y+.01+parts.length*.0001});
   for(const o of RELIC_OBJECTS){
    if(o.kind==='npc'){
     poly(o,[[-.29,0,0],[.29,0,0],[.18,0,1.2],[0,0,1.55],[-.18,0,1.2]],[49,43,40]);
     poly(o,[[-.18,0,1.2],[0,0,1.6],[.18,0,1.2],[.11,-.03,1.02],[-.1,-.03,1.02]],[73,65,54]);
     poly(o,[[-.09,-.04,1.29],[.09,-.04,1.29],[.07,-.04,1.11],[-.07,-.04,1.11]],[12,12,14]);
     poly(o,[[-.03,-.05,.15],[.035,-.05,.15],[.025,-.05,1.05],[-.025,-.05,1.05]],[105,76,43]);
    }else{
     poly(o,[[-.34,.12,0],[.34,.12,0],[.34,.12,.85],[-.34,.12,.85]],[47,48,47]);
     poly(o,[[-.34,.12,.85],[.34,.12,.85],[.34,-.15,.67],[-.34,-.15,.67]],[100,96,82]);
     for(let i=0;i<4;i++)poly(o,[[-.22,-.151,.62-i*.1],[.21,-.151,.62-i*.1],[.21,-.151,.64-i*.1],[-.22,-.151,.64-i*.1]],[111,86,50]);
    }
    if(near?.id===o.id)parts.push({kind:3,v:[[o.x,o.y,o.kind==='npc'?1.95:1.2]],c:[219,185,128],d:o.x+o.y+.2,size:11,text:o.kind==='npc'?'F - SPEAK':'F - READ'});
   }
   return parts;
  }
 };
}
