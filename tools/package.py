from pathlib import Path
import os,hashlib,json,zipfile
root=Path.cwd();ignore={'node_modules','.git','.migration','__pycache__'}
paths=[p for p in root.rglob('*') if p.is_file() and not any(x in ignore for x in p.relative_to(root).parts) and p.name not in {'MANIFEST.json'} and p.suffix!='.zip']
manifest={str(p.relative_to(root)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(paths)}
(root/'MANIFEST.json').write_text(json.dumps({'build':'ASH_IRON_ITERATION_2_CANVAS2D','files':manifest},indent=2),encoding='utf-8')
target=Path(os.environ.get('RUNNER_TEMP',str(root.parent)))/'ASH_IRON_ITERATION_2_CANVAS2D.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in paths+[root/'MANIFEST.json']:z.write(p,'ASH_IRON_ITERATION_2_CANVAS2D/'+str(p.relative_to(root)))
with zipfile.ZipFile(target) as z:assert z.testzip() is None
assert target.stat().st_size>0
print('Packaged',target.stat().st_size,'bytes')
