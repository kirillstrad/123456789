const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
export const ASHEN_DRESSING=freeze([["wardrobe",4.55,10.2,0,0],["desk",7.9,9.6,0,0],["crate",11.2,14.2,0,0],["rug",8,11,0,0],["pages",8,9.65,0.87,0],["pot",7.4,9.7,0.87,0],["rags",10.7,13.8,0,20],["bench",17.2,13.8,0,0],["bench",23.1,10.4,0,0],["shelf",20,7.45,0,0],["candles",16.1,15.8,0,0],["wax",16.4,16,0,0],["rug",20,15.2,0,90],["rubble",24.2,16.2,0,0],["sideboard",20,29.4,0,0],["shelf",16.55,25.5,0,90],["lectern",21.6,24.4,0,0],["candles",19.2,29.3,0.86,0],["pot",20.6,29.3,0.86,0],["pages",21.6,24.4,1,0],["wax",22.6,28.8,0,0],["rags",16.8,27.4,0,0],["grate",22.9,23.5,0,0],["rubble",23.2,29.2,0,0],["coffin",36.45,27.3,0,0],["memorial",31.2,22.3,0,0],["bones",30,28.6,0,0],["candles",32,29.2,0,0],["wax",32.3,29.1,0,0],["rags",36,29.3,0,0],["pot",29.6,23.3,0,0],["shelf",29.5,15,0,90],["bench",34,7.6,0,0],["rubble",38,15.8,0,0],["chain",38.5,13.8,0,0],["wax",30,8.2,0,0],["rug",34,15.7,0,90],["sideboard",31.7,5.3,0,90],["candles",31.65,5.7,0.86,0],["pot",31.65,4.8,0.86,0],["rags",36.3,5.6,0,0],["rubble",35.9,2.7,0,0]].map(([type,x,y,z,yaw],i)=>({type,x,y,z,yaw,id:'ashen.dress.'+String(i+1).padStart(3,'0')})));
export const ASHEN_ACCENT_LIGHTS=freeze([
 {x:20.5,y:6.9,z:3.2,r:65,power:.025,architectural:true},
 {x:34,y:1.6,z:4.4,r:65,power:.025,architectural:true},
]);
export const VISUAL_MATERIALS=freeze({stone:[74,79,86],trim:[105,101,91],wood:[87,61,43],cloth:[108,42,43],wax:[151,131,94],iron:[64,65,68],paper:[141,125,93],dark:[22,23,26]});
export function ashenFloorColour(x,y){
 const n=((x*31+y*17)%5+5)%5;
 const base=y>=22&&x>=29?[43,48,51]:y>=22?[57,50,43]:y<7&&x>=31?[54,53,48]:x<12?[51,46,43]:[48,49,53];
 return base.map(v=>v+n);
}
export function ashenWallOpening(x,y,side){return side==='north'&&((y===7&&(x===20||x===21))||(y===2&&(x===33||x===34)))||side==='west'&&x===29&&y===29;}
