import {mountLastService} from './last-service-mounted.js';
const scene=mountLastService({canvas:document.getElementById('game'),hosted:false});
let stopped=false,raf=null;
function frame(now){if(stopped||scene.stopped())return;scene.frame(now);if(!scene.stopped())raf=requestAnimationFrame(frame);}
function dispose(){if(stopped)return;stopped=true;if(raf!==null)cancelAnimationFrame(raf);window.removeEventListener('pagehide',dispose);scene.dispose();}
window.addEventListener('pagehide',dispose);raf=requestAnimationFrame(frame);
