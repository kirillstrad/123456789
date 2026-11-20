import {createGeometry} from '../gallery/geometry.js';
import {OBSTACLES} from '../combat/geometry.js';
import {INTERACTION_ROOM} from '../game/interaction-room-layout.js';
export function createEnvironment(){
 const g=createGeometry();
 for(let x=1;x<INTERACTION_ROOM.width;x++)for(let y=1;y<INTERACTION_ROOM.height;y++){const c=46+(x*31+y*17)%11;g.poly([[x+.018,y+.018,0],[x+.982,y+.018,0],[x+.982,y+.982,0],[x+.018,y+.982,0]],[c,c-3,c+2]);}
 for(let x=1;x<INTERACTION_ROOM.width;x++){g.box(x,1,0,.95,.28,2.65,[79,77,89]);g.box(x,.98,2.65,.95,.34,.15,[106,98,99]);}
 for(let y=1;y<INTERACTION_ROOM.height;y++)g.box(1,y,0,.28,.95,2.7,[73,78,92]);
 // Keep visible structural footprints for the inherited arena colliders.
 for(const [i,o]of OBSTACLES.circles.entries()){const h=i<4?2.4:.6,low=[],high=[];for(let n=0;n<12;n++){const a=n*Math.PI/6;low.push([o.x+Math.cos(a)*o.r,o.y+Math.sin(a)*o.r,0]);high.push([o.x+Math.cos(a)*o.r,o.y+Math.sin(a)*o.r,h]);}for(let n=0;n<12;n++)g.poly([low[n],low[(n+1)%12],high[(n+1)%12],high[n]],[66+n%3*7,67+n%3*7,79+n%3*7]);g.poly(high,[110,103,111]);}
 // Decorative candle flames are deliberately absent: all 18 candles are now
 // stateful sources in ROOM_LIGHTS, initially off, in the floor-source rows.
 const mesh=g.finish();return{parts:mesh.parts,lights:[]};
}
