export const LAST_SERVICE_BOUNDS = Object.freeze({minX:2,maxX:14,minY:2,maxY:20});
export const LAST_SERVICE_DOOR = 'last-service.guardroom';
export function createLastServiceEntry(createDoorScene, createDoorEnvironment) {
 const bounds=LAST_SERVICE_BOUNDS;
 const rects=[{minX:1.6,maxX:2,minY:1.6,maxY:20.4},{minX:14,maxX:14.4,minY:1.6,maxY:20.4},{minX:2,maxX:14,minY:1.6,maxY:2},{minX:2,maxX:14,minY:20,maxY:20.4},{minX:2,maxX:6.8,minY:11.3,maxY:11.7},{minX:9.2,maxX:14,minY:11.3,maxY:11.7}];
 const lights=[{id:'last-service.wicks',modelId:'candlesticks.a',initialStatus:'off',transform:{x:6.3,y:15.1,yaw:0}}];
 const door=createDoorScene({circles:[],rects},[{id:LAST_SERVICE_DOOR,modelId:'iron-door.a',x:8,y:11.5,yaw:0}],{bounds,routeBounds:bounds,lights,legacyGate:false});
 const parts=[];
 const part=(kind,v,c,w=1)=>({kind,v,c,w,hero:false,d:v.reduce((sum,p)=>sum+p[0]+p[1]+p[2]*.006,0)/v.length});
 for(let x=2;x<14;x+=.75)for(let y=2;y<20;y+=.75){const X=x+.75,Y=y+.75,t=48+((x+y)*4%3)*4;parts.push(part(0,[[x,y,0],[X,y,0],[X,Y,0],[x,Y,0]],[t,t-4,t-9]));}
 for(const r of rects){const h=r.minY>=20||r.minX>=14?.45:2.4;for(const [a,b] of [[ [r.minX,r.minY],[r.maxX,r.minY] ],[[r.minX,r.minY],[r.minX,r.maxY]]])parts.push(part(0,[[...a,0],[...b,0],[...b,h],[...a,h]],[68,64,57]));}
 // Entrance seal on a freestanding iron lectern; no physical hand contact.
 parts.push(part(1,[[7.1,17.0,0],[7.1,17.0,1.3]],[92,85,72],4));
 parts.push(part(0,[[6.85,17,1.1],[7.35,17,1.1],[7.35,17,1.5],[6.85,17,1.5]],[102,39,29]));
 return {doorScene:door,env:createDoorEnvironment(door,()=>({parts,lights:[]}))};
}
