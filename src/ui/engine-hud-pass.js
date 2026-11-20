export function blendHudCells(frame,cells){
 if(frame.length!==cells.length)throw Error('HUD/world grids must match');
 for(let k=0;k<frame.length;k+=4){const a=cells[k+3]/255;if(a<=0)continue;for(let c=0;c<3;c++)frame[k+c]=cells[k+c]*a+frame[k+c]*(1-a);frame[k+3]=Math.round((a+(frame[k+3]/255)*(1-a))*255);}
 return frame;
}
function rgb(style){if(typeof style==='string'&&/^#[0-9a-f]{6}$/i.test(style))return[1,3,5].map(i=>parseInt(style.slice(i,i+2),16));return[220,205,180];}
export function createEngineHudPass(makeCanvas){
 const layer=makeCanvas(1,1),small=makeCanvas(1,1),ctx=layer.getContext('2d',{willReadFrequently:true}),read=small.getContext('2d',{willReadFrequently:true});let labels=[];
 const target=new Proxy(ctx,{get(o,k){if(k==='fillText')return(text,x,y)=>{const size=Number.parseFloat(o.font)||12;labels.push({text:String(text),x,y,size:Math.max(8,Math.min(18,size)),color:rgb(o.fillStyle),align:o.textAlign,baseline:o.textBaseline,alpha:o.globalAlpha});};const v=Reflect.get(o,k,o);return typeof v==='function'?v.bind(o):v;},set(o,k,v){return Reflect.set(o,k,v,o);}});
 return {
  begin(width,height){if(layer.width!==width||layer.height!==height){layer.width=width;layer.height=height;}ctx.clearRect(0,0,width,height);labels=[];return target;},
  compose(frame,cols,rows){if(small.width!==cols||small.height!==rows){small.width=cols;small.height=rows;}read.clearRect(0,0,cols,rows);read.drawImage(layer,0,0,cols,rows);return blendHudCells(frame,read.getImageData(0,0,cols,rows).data);},
  annotations(){return labels.map(p=>({...p,color:[...p.color]}));}
 };
}
