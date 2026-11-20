const neighbors=[[-1,0,.6],[1,0,.6],[0,-1,.6],[0,1,.6],[-1,-1,.25],[1,-1,.25],[-1,1,.25],[1,1,.25],[-2,0,.12],[2,0,.12],[0,-2,.12],[0,2,.12]];
export function applyHeroBackdrop(data,mask,cols,rows,strength=.15){
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<1||rows<1||data.length!==cols*rows*4||mask.length!==data.length||!Number.isFinite(strength)||strength<0||strength>.2)throw Error('Invalid hero backdrop input');
 if(strength===0)return 0;let minX=cols,maxX=-1,minY=rows,maxY=-1,affected=0;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(mask[(y*cols+x)*4]>127){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 if(maxX<0)return 0;
 for(let y=Math.max(0,minY-2);y<=Math.min(rows-1,maxY+2);y++)for(let x=Math.max(0,minX-2);x<=Math.min(cols-1,maxX+2);x++){
  const k=(y*cols+x)*4;if(mask[k]>127)continue;let weight=0;
  for(const [dx,dy,w]of neighbors){const X=x+dx,Y=y+dy;if(X>=0&&X<cols&&Y>=0&&Y<rows&&mask[(Y*cols+X)*4]>127)weight+=w;}
  if(weight===0)continue;const gain=1-strength*Math.min(1,weight);for(let c=0;c<3;c++)data[k+c]*=gain;affected++;
 }
 return affected;
}
