export const INTERACTION_ROOM=Object.freeze({width:44,height:26});
export const ROOM_WORLD_BOUNDS=Object.freeze({minX:1.7,maxX:43.3,minY:1.7,maxY:25.3});
export const ROOM_ROUTE_BOUNDS=Object.freeze({minX:1.46,maxX:43.54,minY:1.46,maxY:25.54});
const doorIds=['nave.exit-door','nave.prison-b','nave.prison-c','nave.iron-a','nave.iron-b','nave.iron-c'];
export const ROOM_DOORS=Object.freeze(['prison-door.a','prison-door.b','prison-door.c','iron-door.a','iron-door.b','iron-door.c'].map((modelId,i)=>Object.freeze({id:doorIds[i],modelId,x:20+i*4,y:6,yaw:0})));
const light=(id,modelId,x,y,yaw=0,row='')=>Object.freeze({id,modelId,initialStatus:'off',row,transform:Object.freeze({x,y,yaw})});
export const ROOM_LIGHTS=Object.freeze([
 light('nave.test-brazier','brazier.a',20,11,0,'lantern'),light('nave.brazier-b','brazier.b',24,11,0,'lantern'),light('nave.brazier-c','brazier.c',28,11,0,'lantern'),
 light('nave.candlestick-a','candlesticks.a',20,14,0,'sparks'),light('nave.candlestick-b','candlesticks.b',24,14,0,'sparks'),light('nave.candlestick-c','candlesticks.c',28,14,0,'sparks'),
 light('nave.wall-light-a','wall-light.a',20.6,1.55,180,'wall'),light('nave.wall-light-b','wall-light.b',28.6,1.55,180,'wall'),light('nave.wall-light-c','wall-light.c',36.6,1.55,180,'wall'),
 light('nave.oven','oven.a',32,11,0,'lantern'),light('nave.campfire','campfire.a',36,11,0,'lantern'),
 ...Array.from({length:18},(_,i)=>light('nave.candle-'+String(i+1).padStart(2,'0'),'simple-candle.'+(i%2?'b':'a'),20+i%6*4,17+Math.floor(i/6)*3,0,'sparks'))
]);
