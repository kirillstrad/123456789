// The existing application loop drives the hosted scene. No RAF or navigation here.
export function createSceneHost({onEnter=()=>{}}={}){
 const factories=new Map();let phase='idle',session=null,restore=null,exitRequested=false,disposed=false;
 function finish(){
  const current=session,leave=restore,errors=[];session=null;restore=null;phase='stopping';
  try{current?.scene?.dispose?.();}catch(e){errors.push(e);}
  try{leave?.();}catch(e){errors.push(e);}
  phase='idle';if(errors.length)throw new AggregateError(errors,'Scene cleanup failed');
 }
 const api={
  active:()=>phase==='active',current:()=>session?.id??null,list:()=>[...factories.keys()],
  register(id,factory){
   if(disposed)throw Error('Scene host disposed');if(phase!=='idle')throw Error('Stop the current scene before registering');
   if(typeof id!=='string'||!id.trim()||typeof factory!=='function')throw Error('Invalid scene registration');
   if(factories.has(id))throw Error('Scene already registered: '+id);factories.set(id,factory);
   return ()=>{if(phase!=='idle')throw Error('Stop the current scene before unregistering');if(factories.get(id)===factory)factories.delete(id);};
  },
  start(id,context={}){
   if(disposed)throw Error('Scene host disposed');const factory=factories.get(id);if(!factory)throw Error('Unknown hosted scene: '+id);
   if(phase!=='idle')return false;phase='starting';exitRequested=false;
   try{
    const cleanup=onEnter(id);restore=typeof cleanup==='function'?cleanup:null;
    const scene=factory({...context,exit:()=>api.exit()});session={id,scene,lastFrame:null};
    if(!scene||typeof scene.frame!=='function'||typeof scene.dispose!=='function')throw Error('Scene must provide frame and dispose');
    if(exitRequested){finish();return false;}phase='active';return true;
   }catch(error){
    if(phase!=='idle')try{finish();}catch(cleanup){throw new AggregateError([error,cleanup],'Scene startup and cleanup failed');}
    throw error;
   }
  },
  frame(now){
   if(!api.active())return false;if(!Number.isFinite(now))throw Error('Invalid scene clock');
   const current=session;if(current.lastFrame!==null&&now<=current.lastFrame)return true;current.lastFrame=now;
   try{current.scene.frame(now);}catch(error){
    if(session===current)try{finish();}catch(cleanup){throw new AggregateError([error,cleanup],'Scene frame and cleanup failed');}
    throw error;
   }return true;
  },
  exit(){if(phase==='starting'){exitRequested=true;return true;}if(phase!=='active')return false;finish();return true;},
  dispose(){if(disposed)return;if(phase==='starting')throw Error('Cannot dispose during scene startup');try{if(phase==='active')finish();}finally{disposed=true;factories.clear();}}
 };return Object.freeze(api);
}
