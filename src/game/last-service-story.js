import {dressLastServiceScene} from '../levels/last-service-dressing.js';
const durations=Object.freeze({'first-spark':2.4,ledger:3,awakening:3.2,register:3});
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function storyWeight(progress){return smooth(progress/.25)*(1-smooth((progress-.72)/.28));}
export function createLastServiceStory(){
 let current=null,finished=null;const played=new Set();
 const finish=()=>{if(!current)return false;played.add(current.id);finished=current.id;current=null;return true;};
 return {
 play(id){if(!Object.hasOwn(durations,id))throw Error('Unknown story scene');if(current||finished)return false;current={id,elapsed:0,duration:durations[id]};return true;},
 snapshot:()=>current?Object.freeze({...current,progress:current.elapsed/current.duration,weight:storyWeight(current.elapsed/current.duration)}):null,
 hasPlayed:id=>played.has(id),
 tick(dt,{paused=false}={}){if(!Number.isFinite(dt)||dt<0)throw Error('Invalid story tick');if(!current||paused)return;current.elapsed=Math.min(current.duration,current.elapsed+dt);if(current.elapsed>=current.duration)finish();},
 skip:finish,
 takeFinished(){const id=finished;finished=null;return id;},
 reset({keepPlayed=false}={}){current=null;finished=null;if(!keepPlayed)played.clear();}
 };
}
export function createKeeperScene(){
 const map={bounds:{minX:2,maxX:14,minY:2,maxY:14},circles:[],rects:[{minX:1.6,maxX:2,minY:1.6,maxY:14.4},{minX:14,maxX:14.4,minY:1.6,maxY:14.4},{minX:2,maxX:14,minY:1.6,maxY:2},{minX:2,maxX:14,minY:14,maxY:14.4}]};
 const part=(kind,v,c,w=1)=>({kind,v,c,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length});
 const parts=[];for(let x=2;x<14;x+=.75)for(let y=2;y<14;y+=.75)parts.push(part(0,[[x,y,0],[x+.75,y,0],[x+.75,y+.75,0],[x,y+.75,0]],[54,48,41]));
 for(const p of parts){p.floor=true;p.d-=1000000;}
 for(const r of map.rects)parts.push(part(0,[[r.minX,r.minY,0],[r.maxX,r.maxY,0],[r.maxX,r.maxY,.6],[r.minX,r.minY,.6]],[76,69,59]));
 return dressLastServiceScene({map,env:{parts,lights:[{x:8,y:7,z:1.3,r:85,power:.65}]}},'keeper');
}
export function storyBookParts(x,y){
 const v=[[x-.32,y-.22,1],[x+.32,y-.22,1],[x+.32,y+.22,1],[x-.32,y+.22,1]];
 return [{kind:1,v:[[x-.28,y-.2,0],[x-.28,y-.2,1],[x+.28,y+.2,1],[x+.28,y+.2,0]],c:'#706052',w:4,d:x+y},{kind:0,v,c:'#b39a70',w:1,d:x+y+.01}];
}
