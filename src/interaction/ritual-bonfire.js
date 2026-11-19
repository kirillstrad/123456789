import {interactionFrame} from '../animation/interaction.js';
import {blocked,solid} from '../combat/geometry.js';
import {LAMP_LIFE} from '../combat/lamp-life.js';

const origin={x:8,y:12};
const positions=[[9.5,12],[6.5,12],[8,13.5],[8,10.5]];
const range=1.65;

export function createRitualBonfire(world,map){
 const position=positions.find(([x,y])=>!solid(x,y,map)&&!blocked(origin,{x,y},map));
 let lit=false;
 let active=null;
 const available=s=>!!position&&s.phase==='playing'&&!s.interaction&&Math.hypot(s.x-position[0],s.y-position[1])<=range&&!blocked(s,{x:position[0],y:position[1]},map);
 const frame=()=>active&&world.current.interaction?.id===active.id?interactionFrame(active.kind,Math.max(0,world.current.time-active.start)):null;
 return {
  frame,
  reset(){lit=false;active=null;},
  press(){
   const s=world.current;
   if(active||!available(s)||(lit&&s.lamp>=LAMP_LIFE.max))return false;
   const kind=lit?'campfire':'ignite';
   const id=world.beginInteraction(kind);
   if(id===null)return false;
   active={id,kind,start:s.time,committed:false};
   return true;
  },
  step(){
   const current=frame();
   if(!current||world.current.phase!=='playing'){active=null;return;}
   if(current.effectDue&&!active.committed){
    active.committed=true;
    if(active.kind==='campfire')world.restoreInteractionLamp(active.id,LAMP_LIFE.max-world.current.lamp);
    else lit=true;
   }
   if(current.complete){world.finishInteraction(active.id);active=null;}
  },
  art(s,showHint){
   if(!position)return {parts:[],lights:[],hint:null};
   const [x,y]=position;
   const parts=[];
   const line=(v,c,w)=>parts.push({kind:1,v,c,w,d:v.reduce((sum,[a,b,z])=>sum+a+b+z*.006,0)/v.length});
   const ring=(radius,count)=>Array.from({length:count+1},(_,i)=>[x+radius*Math.cos(i/count*2*Math.PI),y+radius*Math.sin(i/count*2*Math.PI),.012]);
   line(ring(1.05,48),'#e12b40',3);
   line(ring(.83,6),'#a52638',2);
   line([[x-.44,y-.21,.12],[x+.43,y+.22,.19]],'#875948',5);
   line([[x-.44,y+.23,.14],[x+.41,y-.22,.21]],'#885744',5);
   const flameColors=['#ff713b','#ffb657','#fff0b1'];
   for(let i=0;i<(lit?9:2);i++){
    const wave=Math.sin(s.time*11+i*2.4);
    const dx=(i%3-1)*.16;
    const dy=(Math.floor(i/3)-1)*.13;
    line([[x+dx,y+dy,.21],[x+dx*.6+.06*wave,y+dy*.8,lit?.48+(i%4)*.14+.12*wave:.29]],lit?flameColors[i%3]:'#a8442b',lit?4:2);
   }
   const hint=showHint&&available(s)?{kind:3,v:[[x,y,1.28]],c:'#ffdab5',size:12,text:!lit?'F · Зажечь':s.lamp<LAMP_LIFE.max?'F · Ритуал':'Лампа полна'}:null;
   return {parts,lights:lit?[{x,y,z:.58,r:112,power:1.15}]:[],hint};
  }
 };
}
