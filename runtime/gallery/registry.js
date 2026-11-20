// Approved catalogue references. Native meshes are a separate implementation step.
const GROUPS=[
['GENERAL',[['floor-fractures','FLOOR FRACTURES','decor'],['wall-fractures','DAMAGED MASONRY','obstacle'],['arches','STONE ARCH','frame'],['rubble','RUBBLE','obstacle']]],
['STAIRS',[['straight-stair','STONE STAIR','visual-stair'],['l-stair','L STAIR','visual-stair'],['u-stair','U STAIR','visual-stair'],['split-stair','SPLIT STAIR','visual-stair'],['iron-stair','IRON STAIR','visual-stair'],['broken-stair','BROKEN STAIR','visual-stair']]],
['CATHEDRAL',[['altar','ALTAR','obstacle'],['sarcophagus','SARCOPHAGUS','obstacle'],['pew','PEW','obstacle'],['burial-niche','BURIAL NICHE','frame']]],
['LABORATORY',[['lab-workbench','LAB WORKBENCH','obstacle'],['lab-bier','EXAMINATION TABLE','obstacle'],['lab-shelf','LAB SHELVES','obstacle'],['lab-apparatus','LAB APPARATUS','obstacle']]],
['PRISON',[['prison-door','PRISON DOOR','door'],['cage','CAGE','obstacle'],['chains','CHAINS','decor'],['prison-cot','PRISON COT','obstacle']]],
['TORTURE',[['restraint-frame','RESTRAINT FRAME','obstacle'],['iron-table','IRON TABLE','obstacle'],['ceiling-hooks','HANGING CHAINS','obstacle']]],
['HALL',[['column','COLUMN','obstacle'],['iron-door','IRON DOOR','door'],['weapon-rack','WEAPON RACK','obstacle']]],
['EXECUTION',[['stakes','STAKES','obstacle'],['execution-platform','STONE PLATFORM','obstacle'],['empty-gallows','EMPTY GALLOWS','obstacle']]],
['BODIES',[['single-body','SINGLE BODY','decor'],['shrouds','SHROUDS AND REMAINS','decor'],['body-pile','BODY PILE','obstacle']]],
['LIGHTING',[['brazier','BRAZIER','light'],['candlesticks','CANDLESTICKS','light'],['wall-light','WALL LIGHT','light']]],
['LIBRARY',[['bookcase','BOOKCASE','obstacle'],['wall-bookshelves','WALL BOOKSHELVES','obstacle'],['single-books','SINGLE BOOKS','decor'],['book-stacks','BOOK STACKS','decor'],['scattered-books','SCATTERED BOOKS','decor'],['lectern','LECTERN','obstacle'],['writing-desk','WRITING DESK','obstacle'],['scrolls','ARCHIVE SCROLLS','decor']]],
['TEXTILES',[['tapestries','TAPESTRIES','decor'],['banners','BANNERS','decor']]],
['BLOCKED PASSAGES',[['boarded-door','BOARDED DOOR','obstacle'],['blocked-arch','BLOCKED ARCH','obstacle'],['collapsed-arch','COLLAPSED ARCH','obstacle'],['barricade','BARRICADE','obstacle'],['fallen-portcullis','FALLEN PORTCULLIS','obstacle']]],
['BLOOD TRACES',[['blood-floor','BLOOD ON FLOOR','decor'],['blood-wall','BLOOD ON MASONRY','obstacle'],['blood-cloth','BLOODSTAINED CLOTH','decor'],['blood-table','BLOODSTAINED TABLE','obstacle'],['blood-basin','BLOOD BASIN','obstacle']]]
];
export const FAMILIES=Object.freeze(GROUPS.flatMap(([zone,rows])=>rows.map(([id,label,role])=>Object.freeze({id,label,zone,role,geometryStatus:'pending-native',variantCount:3}))));
export const ZONES=Object.freeze(GROUPS.map(([id])=>id));
export const OBJECTS=Object.freeze(FAMILIES.flatMap(f=>[0,1,2].map(variant=>Object.freeze({id:f.id+'.'+String.fromCharCode(97+variant),familyId:f.id,label:f.label+' / '+String.fromCharCode(65+variant),zone:f.zone,role:f.role,variant,geometryStatus:f.geometryStatus,previewInteraction:f.role==='door'?'door-state':f.role==='light'?'light-state':null}))));
export const GALLERY_RULES=Object.freeze({combat:false,enemyNavigation:false,stairTraversal:false,stationBoundsAreColliders:false,saveGame:false});
// Project environment palette, not the brighter HTML-studio presentation.
export const PALETTE=Object.freeze({stone:Object.freeze([89,91,99]),stoneTrim:Object.freeze([120,111,108]),iron:Object.freeze([90,81,93]),cloth:Object.freeze([120,99,109]),blood:Object.freeze([61,16,27]),remains:Object.freeze([139,113,115]),candle:Object.freeze([173,113,53])});
export function objectById(id){return OBJECTS.find(o=>o.id===id)??null;}
