from pathlib import Path
import os,hashlib,json,zipfile,re
root=Path.cwd();ignore={'node_modules','.git','.migration','__pycache__'}
info=json.loads((root/'BUILD_INFO.json').read_text(encoding='utf-8'));build=info['build']
assert re.fullmatch(r'[A-Z0-9_]+',build),'Unsafe build identifier'
paths=[p for p in root.rglob('*') if p.is_file() and not any(x in ignore for x in p.relative_to(root).parts) and p.name!='MANIFEST.json' and p.suffix!='.zip']
manifest={p.relative_to(root).as_posix():{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(paths)}
(root/'MANIFEST.json').write_text(json.dumps({'build':build,'files':manifest},indent=2),encoding='utf-8')
target=Path(os.environ.get('RUNNER_TEMP',str(root.parent)))/(build+'.zip')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 for p in paths+[root/'MANIFEST.json']:z.write(p,build+'/'+p.relative_to(root).as_posix())
with zipfile.ZipFile(target) as z:assert z.testzip() is None
assert target.stat().st_size>0
print('Packaged',target.stat().st_size,'bytes')
