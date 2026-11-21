export const LAST_SERVICE_BOUNDS=Object.freeze({minX:2,maxX:22,minY:-51,maxY:20});
export const LAST_SERVICE_DOOR='last-service.guardroom';
export function createLastServiceEntry(createDoorScene,createDoorEnvironment){
 const rects=[{minX:1.6,maxX:2,minY:-51.4,maxY:20.4},{minX:22,maxX:22.4,minY:-51.4,maxY:20.4},{minX:2,maxX:22,minY:-51.4,maxY:-51},{minX:2,maxX:22,minY:20,maxY:20.4},{minX:14,maxX:22,minY:-23,maxY:20},{minX:14,maxX:22,minY:-51,maxY:-39}];
 for(const y of [11.5,1,-10,-22,-33,-41])rects.push({minX:2,maxX:6.8,minY:y-.2,maxY:y+.2},{minX:9.2,maxX:14,minY:y-.2,maxY:y+.2});
 rects.push({minX:5.2,maxX:6.2,minY:-14,maxY:-12.8},{minX:9.8,maxX:10.8,minY:-17,maxY:-15.8},{minX:15.8,maxX:16.2,minY:-36,maxY:-26});
 const lights=[{id:'last-service.wicks',modelId:'candlesticks.a',initialStatus:'off',transform:{x:6.3,y:15.1,yaw:0}},...[-6,-18,-28,-38,-47].map((y,i)=>({id:'last-service.candles-'+i,modelId:'simple-candle.a',initialStatus:'off',transform:{x:4,y,yaw:0}}))];
 const doorScene=createDoorScene({circles:[],rects},[{id:LAST_SERVICE_DOOR,modelId:'iron-door.a',x:8,y:11.5,yaw:0}],{bounds:LAST_SERVICE_BOUNDS,routeBounds:LAST_SERVICE_BOUNDS,lights,legacyGate:false});
 const parts=[],part=(kind,v,c,w=1)=>({kind,v,c,w,hero:false,d:v.reduce((n,p)=>n+p[0]+p[1]+p[2]*.006,0)/v.length});
 for(let x=2;x<22;x+=.75)for(let y=-51;y<20;y+=.75){if(x>=14&&(y>=-23||y<-39))continue;const X=Math.min(22,x+.75),Y=Math.min(20,y+.75),t=48+((Math.round(x*4)+Math.round(y*4))%3)*4;parts.push(part(0,[[x,y,0],[X,y,0],[X,Y,0],[x,Y,0]],[t,t-4,t-9]));}
 for(const r of rects){const h=r.minX>=14?.5:2.4;for(const [a,b]of [[[r.minX,r.minY],[r.maxX,r.minY]],[[r.minX,r.minY],[r.minX,r.maxY]]])parts.push(part(0,[[...a,0],[...b,0],[...b,h],[...a,h]],[68,64,57]));}
 parts.push(part(1,[[7.1,17,0],[7.1,17,1.3]],[92,85,72],4),part(0,[[6.85,17,1.1],[7.35,17,1.1],[7.35,17,1.5],[6.85,17,1.5]],[102,39,29]));
 // The second opening around the side partition is a return loop to the shrine.
 return {doorScene,env:createDoorEnvironment(doorScene,()=>({parts,lights:[]}))};
}
