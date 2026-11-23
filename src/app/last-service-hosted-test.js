import './main.js';
import {mountLastService} from './last-service-mounted.js';
const host=window.__ASH_SCENES__;if(!host)throw Error('Embedded scene host is unavailable');
const controls=document.createElement('div'),start=document.createElement('button');controls.id='last-service-hosted-test-controls';start.textContent='Тест 2.1: встроенный пролог';controls.append(start);document.body.append(controls);
const unregister=host.register('last-service-lifecycle-test',({canvas,exit})=>mountLastService({canvas,hosted:true,onExit:exit}));
start.addEventListener('click',()=>{delete window.__ASH_SCENE_ERROR__;host.start('last-service-lifecycle-test');});
window.addEventListener('pagehide',()=>{host.exit();unregister();controls.remove();},{once:true});
