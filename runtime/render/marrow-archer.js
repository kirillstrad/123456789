import {renderUndead} from './undead-family.js';
export function marrowArcherParts(e,state={}){return renderUndead({...e,archetype:'marrow-archer'},state);}
export function arrowParts(shots,alpha=1){alpha=Math.max(0,Math.min(1,alpha));return shots.map(s=>{const x=s.previousX+(s.x-s.previousX)*alpha,y=s.previousY+(s.y-s.previousY)*alpha,v=[[x-s.fx*.27,y-s.fy*.27,1.05],[x,y,1.05]];return{kind:1,v,c:'#b7b1a2',w:1.5,hero:false,d:x+y+.0063};});}
