export function lastServiceChapelStatus({s,route,tutorial,blocked=false,idle=true,hasFinale=false}){
 const near=!hasFinale&&Number.isFinite(s?.x)&&Number.isFinite(s?.y)&&s.y<=-47.2&&Math.hypot(s.x-8,s.y+49.4)<=2.2;
 const state=(reason,text,ready=false)=>({near,ready:near&&ready,reason,title:'НИЖНЯЯ ЧАСОВНЯ',text});
 if(!near)return state('far','Подойди к порталу нижней часовни.');
 if(s.phase!=='playing'||!Number.isFinite(s.lamp)||s.lamp<=0)return state('not-alive','Огонь погас. Повтори попытку.');
 if(!route?.finished){
  const remaining=Math.max(0,7-(Number.isInteger(route?.index)?route.index:0));
  return state('route',`Печать держится. Незавершённых встреч: ${remaining}. Вернись по погребальному крылу.`);
 }
 if(blocked||tutorial?.blocksWorld)return state('blocked','Закончи чтение или сцену и сними паузу.');
 if(!idle||s.hitReaction>0||(s.arrows??[]).length)return state('busy','Заверши действие и дождись, пока путь станет безопасным.');
 if(![...(tutorial?.read??[]),...(tutorial?.completed??[])].includes('boss'))return state('lesson','F — прочитать предостережение у входа.');
 return state('ready','F — войти в нижнюю часовню. За порогом ждёт трупный голем.',true);
}
