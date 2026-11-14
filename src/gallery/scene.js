import {createGalleryLayout} from './layout.js';import {buildObjectGeometry} from './models.js';import {assembleGalleryScene} from './scene-core.js';
export function createGalleryScene(){return assembleGalleryScene(createGalleryLayout(),buildObjectGeometry);}
