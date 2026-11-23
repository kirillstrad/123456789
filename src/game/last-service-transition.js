export const LAST_SERVICE_DESTINATIONS=Object.freeze(['wing','chapel','keeper']);
export function createLastServiceTransition({minimumMs=650,onClose=()=>{}}={}){
 let state=null,serial=0;
 const snapshot=()=>state?{id:state.id,preview:state.preview,started:state.started,ready:state.ready,error:state.error,frames:state.frames}:null;
 return {
  active:()=>!!state,snapshot,
  start(id,load=()=>{},options={}){
   if(!LAST_SERVICE_DESTINATIONS.includes(id))throw Error('Unknown destination');
   if(state)return false;
   if(typeof load!=='function')throw Error('Invalid transition loader');
   state={id,load,preview:!!options.preview,started:null,ready:false,error:null,frames:0,work:false,token:++serial};return true;
  },
  painted(now){
   const s=state;if(!s)return;
   if(!Number.isFinite(now))throw Error('Invalid transition clock');
   s.started??=now;s.frames++;
   if(!s.preview&&s.frames>=2&&!s.work){
    s.work=true;
    Promise.resolve().then(()=>{if(state===s&&!s.error)return s.load();}).then(()=>{if(state===s)s.ready=true;},e=>{if(state===s)s.error=String(e?.message??e);});
   }
   if(state===s&&!s.preview&&!s.error&&s.ready&&now-s.started>=minimumMs){state=null;onClose();}
  },
  fail(error){if(state){state.error=String(error?.message??error);state.work=true;}},
  close(){if(!state)return false;if(!state.preview&&!state.error)return false;state=null;serial++;onClose();return true;},
  cancel(){if(!state)return;state=null;serial++;onClose();}
 };
}
