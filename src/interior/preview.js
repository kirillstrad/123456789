import {buildInteriorModel} from './models.js';
export function buildInteriorPreviewModel(id,transform={}){
 const mesh=buildInteriorModel(id,transform),x=transform.x??0,y=transform.y??0,z=transform.z??0;
 // Catalogue-only fill light. Never stored in an authored gameplay model.
 mesh.lights.push({x,y,z:z+1.8,r:145,power:.4,previewOnly:true});
 return mesh;
}
