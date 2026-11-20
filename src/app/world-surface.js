export const WORLD_SURFACE=Object.freeze({height:864,rows:168});
export function heroHudBounds(width,height=864){
 const cols=Math.round(196*width/1008),hudCols=Math.min(cols-2,Math.max(1,Math.round(cols*.65))),hudRows=Math.min(21,168-1),cellX=width/cols,cellY=height/168;
 if(cols<64)return{x:0,y:height,width:0,height:0};
 return {x:Math.floor((cols-hudCols)/2)*cellX,y:(168-hudRows-1)*cellY,width:hudCols*cellX,height:hudRows*cellY};
}
export function heroHudHit(point,width,height=864){if(!point||![point.x,point.y,width,height].every(Number.isFinite)||width<=0||height<=0)return false;const r=heroHudBounds(width,height);return r.width>0&&r.height>0&&point.x>=r.x&&point.x<=r.x+r.width&&point.y>=r.y&&point.y<=r.y+r.height;}
