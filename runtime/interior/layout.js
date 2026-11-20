import {listInteriorCards} from './catalogue.js';
export function createInteriorLayout(category='all'){
 const cards=listInteriorCards(category),entries=cards.map((card,index)=>{
  const x=8+(index%6)*8,y=10+Math.floor(index/6)*9;
  return {id:card.modelId,familyId:card.familyId,category:card.category,name:card.name,variant:card.variant,role:card.role,x,y,z:0,yaw:0,bounds:{minX:x-3,maxX:x+3,minY:y-3,maxY:y+3}};
 });
 return {stage:'layout-only',name:'INTERIOR CATALOGUE',rules:{combat:false,interactions:false},sectors:[],entries,
 bounds:{minX:0,minY:0,maxX:56,maxY:Math.ceil(entries.length/6)*9+18},spawn:{x:8,y:6},category};
}
