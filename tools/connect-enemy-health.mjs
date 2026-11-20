import fs from 'node:fs';
const file='src/app/main.js';let code=fs.readFileSync(file,'utf8');
if(code.includes('ENEMY_HEALTH_CONNECTED_V2')){console.log('HP integration already connected');process.exit(0);}
function edit(oldText,newText){if(code.split(oldText).length!==2)throw Error('Unexpected main.js context: '+oldText.slice(0,90));code=code.replace(oldText,newText);}
edit("import {gameLevel,GAME_LEVELS,applyLevelSpawn} from '../levels/registry.js';","import {gameLevel,GAME_LEVELS,applyLevelSpawn} from '../levels/registry.js';\nimport {createEnemyHealthRuntime} from './enemy-health-runtime.js'; // ENEMY_HEALTH_CONNECTED_V2");
edit('const dashHud={ready:false,at:-Infinity};','const dashHud={ready:false,at:-Infinity};\nconst enemyHealth=createEnemyHealthRuntime();');
edit('function resetWorld(){targeting.clear();','function resetWorld(){targeting.clear();enemyHealth.reset();');
edit(' const drawState={...s,visualZoom:view.zoom},',' const enemyGroups=galleryFrame?[]:enemyHealth.geometry(s,enemyParts);\n const drawState={...s,visualZoom:view.zoom},');
const oldMesh=code.includes('...enemiesOf(s).flatMap(e=>enemyParts(e,s)),')?'...enemiesOf(s).flatMap(e=>enemyParts(e,s)),':'...enemyParts(s.enemy,s),';
edit(oldMesh,'...enemyGroups.flatMap(g=>g.parts),');
edit('  const heroBackdropCells = galleryFrame',` if(!galleryFrame)enemyHealth.update({parts,groups:enemyGroups,project:pr,zoom:view.zoom,viewport:{width:W,height:H},cells:{data,cols:COLS,rows:ROWS},pointer:aimPoint?[aimPoint.x,aimPoint.y]:null,state:world.current,events:world.events,enabled:mode==='game'&&!manifest?.blocking()&&!document.hidden&&s.phase==='playing'});
  const heroBackdropCells = galleryFrame`);
edit(' if(!galleryFrame)manifest?.text(out,COLS,frameRows,frameHeight);'," if(!galleryFrame&&mode==='game'&&!manifest?.blocking())enemyHealth.paint(out,{width:W,height:H});\n if(!galleryFrame)manifest?.text(out,COLS,frameRows,frameHeight);");
edit('const targeting=installFrameTargeting(cv,{context:interactionContext,','const targeting=installFrameTargeting(cv,{enemyTarget:()=>enemyHealth.hoverId(),context:interactionContext,');
edit("function pause(){if(mode!=='game')return;","function pause(){if(mode!=='game')return;enemyHealth.reset();");
edit("function openGallery(){if(mode==='gallery')return galleryScene.stats();","function openGallery(){if(mode==='gallery')return galleryScene.stats();enemyHealth.reset();");
edit('worldReference.replace(nextWorld);','worldReference.replace(nextWorld);enemyHealth.reset();');

const targetingFile='src/app/frame-targeting.js';let targeting=fs.readFileSync(targetingFile,'utf8');
const signature="context=()=>''}={})";if(targeting.split(signature).length!==2)throw Error('Unexpected targeting signature');targeting=targeting.replace(signature,"context=()=>'',enemyTarget=null}={})");
const ret='  return{mode,target:selected,allowed:canRequest(),';if(targeting.split(ret).length!==2)throw Error('Unexpected cursor return');targeting=targeting.replace(ret,"  if(typeof enemyTarget==='function')enemy=mode==='game'&&enemyTarget()!==null;\n"+ret);
const patchFile='patches/bestiary-patch-1.apply.mjs';let patch=fs.readFileSync(patchFile,'utf8');
const editMesh="edit(main,'...enemyParts(s.enemy,s),','...enemiesOf(s).flatMap(e=>enemyParts(e,s)),');";
if(patch.includes(editMesh))patch=patch.replace(editMesh,"if(read(main).includes('...enemyParts(s.enemy,s),'))"+editMesh);
// Every source context is validated before the first write.
fs.writeFileSync(file,code);fs.writeFileSync(targetingFile,targeting);fs.writeFileSync(patchFile,patch);
console.log('Connected HP update, painting, cursor, reset, modal and gallery lifecycle.');
