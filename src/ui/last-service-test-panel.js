export const LAST_SERVICE_TEST_ROOMS=Object.freeze({entry:{label:'Притвор',art:'wing',x:8,y:18.2},guard:{label:'Караульная',art:'wing',x:8,y:7.8},gallery:{label:'Галерея',art:'wing',x:8,y:-12},sacristy:{label:'Ризница',art:'wing',x:8,y:-24},threshold:{label:'Порог часовни',art:'chapel',x:8,y:-49.4},chapel:{label:'Часовня — бой',art:'chapel'},keeper:{label:'Покои хранителя',art:'keeper'}});
export function lastServiceTestEnabled(location){return new URLSearchParams(location.search??'').get('lastServiceTest')==='1'||(location.hash??'').split('#').includes('last-service-test');}
export function installLastServiceTestPanel({location=window.location,jump,preview,restart,scope=null}){
 if(!lastServiceTestEnabled(location))return null;
 const panel=document.createElement('details');panel.open=true;panel.id='last-service-test-panel';panel.style.cssText='position:fixed;right:10px;top:10px;z-index:4000;width:210px;max-height:85vh;overflow:auto;padding:12px;background:#111116ed;border:1px solid #82735a;color:#d9c9a9;font:13px monospace;';
 const title=document.createElement('summary');title.textContent='ТЕСТ ПРОЛОГА';panel.append(title);
 const note=document.createElement('p');note.textContent='Переход в комнату сбрасывает попытку и включает осмотр без обучения. Просмотр заставки не меняет прохождение.';panel.append(note);
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='display:block;width:100%;margin:5px 0;padding:7px;color:#dfd1b7;background:#25232a;border:1px solid #655d50;cursor:pointer;';if(scope)scope.listen(b,'click',fn);else b.addEventListener('click',fn);panel.append(b);}
 for(const [id,r]of Object.entries(LAST_SERVICE_TEST_ROOMS))button(r.label,()=>jump(id));
 const heading=document.createElement('p');heading.textContent='ТОЛЬКО ЗАСТАВКА';panel.append(heading);
 for(const [id,label]of [['wing','Крыло'],['chapel','Часовня'],['keeper','Покои']])button('Арт: '+label,()=>preview(id));
 button('Начать обычное прохождение',restart);document.body.append(panel);if(scope)scope.ownNode(panel);return panel;
}
