import {createGalleryLayout} from './layout.js';import {buildObjectGeometry} from './models.js';import {assembleGalleryScene} from './scene-core.js';
import {createRequestedInteriorScene,installInteriorCatalogue} from '../interior/viewer.js';
export function createGalleryScene(){
 const interior=createRequestedInteriorScene(assembleGalleryScene);
 if(interior)return interior;
 return assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);
}
if(typeof window!=='undefined')installInteriorCatalogue(window);
