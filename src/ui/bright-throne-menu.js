import {throneMenu as renderMenu} from './throne-menu.js';
const inks=Object.freeze({'#70513b':'#aa7449','#d1a16b':'#f4bc76','#b6a48c':'#ead0a7','#ffc079':'#ffd18a','#fff0c4':'#fff8df','#e5c18e':'#ffe0a8','#c9a97a':'#ffe0a8','#c29b70':'#e8bd87','#e4b57d':'#ffd18a','#795337':'#b07846','#e1bc84':'#ffe5b5','#f2ca8c':'#ffdd97','#e4bd86':'#ffe0a3','#a58564':'#c7a279','#89735c':'#a28b73','#ffe2ad':'#fff5d8','#cfad7f':'#efd0a0','#edc38b':'#ffe1a8','#c9a475':'#e4bd8b','#ad8a66':'#d5b38c','rgba(8,4,3,.66)':'rgba(8,4,3,.72)','rgba(8,4,3,.3)':'rgba(8,4,3,.22)'});
export const menuContrastColor=value=>typeof value==='string'?(inks[value.toLowerCase()]??value):value;
const contexts=new WeakMap();
export function menuContrastContext(out){let proxy=contexts.get(out);if(!proxy){proxy=new Proxy(out,{get(target,key){const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},set(target,key,value){return Reflect.set(target,key,key==='fillStyle'||key==='strokeStyle'?menuContrastColor(value):value,target);}});contexts.set(out,proxy);}return proxy;}
// Only menu inks are remapped. The fire renderer, HUD and gameplay are untouched.
export function throneMenu(out,api){return renderMenu(menuContrastContext(out),api);}
