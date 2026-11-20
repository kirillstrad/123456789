export function createWorldReference(initial){
 let current=initial;const methods=new Map();
 const valid=value=>{if(!value||typeof value!=='object'||typeof value.step!=='function'||typeof value.snapshot!=='function')throw TypeError('Invalid world reference');};
 valid(current);
 const proxy=new Proxy({}, {
  get(_target,key){
   const value=Reflect.get(current,key,current);if(typeof value!=='function')return value;
   if(!methods.has(key))methods.set(key,(...args)=>{const fn=Reflect.get(current,key,current);if(typeof fn!=='function')throw TypeError('World method unavailable: '+String(key));return Reflect.apply(fn,current,args);});
   return methods.get(key);
  },
  set(_target,key,value){return Reflect.set(current,key,value,current);},
  getPrototypeOf(){return Object.getPrototypeOf(current);},
 });
 return {proxy,replace(next){valid(next);const old=current;current=next;return old;}};
}
