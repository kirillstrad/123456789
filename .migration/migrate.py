from pathlib import Path
import os,shutil,tempfile,subprocess,json,hashlib
root=Path.cwd().resolve()
assert os.environ.get('GITHUB_REPOSITORY')=='kirillstrad/123456789'
assert os.environ.get('GITHUB_REF')=='refs/heads/iteration-2-canvas2d'
assert root==Path(os.environ['GITHUB_WORKSPACE']).resolve()
base=root/'ASH_IRON_ITERATION_2_DRAFT'
assert base.is_dir(),'Bootstrap source missing; do not delete anything'
for p,h in [('hero.js','96a7de64ec52577f69aa3ca0ae3ca49edd4ff795b315e61ef1df6d13c243a1e8'),('environment.js','52abae03531417bf5a49ba420a6cd584e61c537154878d54e2a51cbb8f57015d')]:
 assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h,'Reference changed: '+p
stage=Path(tempfile.mkdtemp(prefix='ash-iron-iteration2-'))
def put(p,text):
 q=stage/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(text,encoding='utf-8')
def copy(a,b):
 q=stage/b;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/a,q)
shutil.copytree(base/'src',stage/'src');shutil.copytree(base/'tests',stage/'tests')
copy('hero.js','public/vendor/hero.js');copy('environment.js','src/render/environment.js');copy('environment.d.ts','src/render/environment.d.ts');copy('FONT_LICENSE.txt','FONT_LICENSE.txt');copy('visual-reference.html','reference/visual-reference.html');copy('.github/workflows/iteration-2-canvas2d.yml','.github/workflows/iteration-2-canvas2d.yml')
for a,b in [('client.js','src/app/main.js'),('ascii.js','src/render/ascii.js'),('build.mjs','tools/build.mjs'),('browser-check.mjs','tools/browser-check.mjs'),('server.mjs','server.mjs'),('index.html','src/app/index.html')]:copy('.migration/'+a,b)
# Preserve old enemy geometry and menu ornaments, not the old game loop.
reference=(root/'visual-reference.html').read_text(encoding='utf-8')
def function(name):
 start=reference.index('function '+name+'(');opening=reference.index('{',start);depth=1;i=opening+1
 while depth:
  if reference[i]=='{':depth+=1
  elif reference[i]=='}':depth-=1
  i+=1
 return reference[start:i]+'\n'
helpers=''.join(function(n) for n in ['poly','line','dot','box','limb','corpse','drawEnemy'])
put('src/render/enemy.js',"export function enemyParts(e){let parts=[],heroPart=false;function smooth(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}\n"+helpers+"drawEnemy({...e,state:e.mode,timer:e.timer,walk:e.walkDistance*5.13});return parts;}\n")
ornaments=reference[reference.index('function uiText('):reference.index('let menuRects=[];')]
hud=function('drawHUD').replace("'ЗДОРОВЬЕ'","'HEALTH'").replace("'ЛАМПА'","'LAMP'").replace('glyph(hudView,168,24,720,144,true,true)','glyph(hudView,196,28,720,144,true,true)')
menu="""function drawMenu(mode,selected,labels,rites){u.clearRect(0,0,1008,864);logo('ASH',504,58,13);logo('IRON',504,164,11);flourish(504,284,560);branch(160,308,1);branch(848,308,-1);branch(160,690,1,190,true);branch(848,690,-1,190,true);uiText(mode==='dead'?'THE FLAME HAS GONE OUT.':mode==='won'?'THE NAVE IS SILENT.':'ASH / IRON',504,327,17,'#bbb');uiText('NO SAINTS. NO ABSOLUTION.',504,355,12,'#858585');if(rites){['WASD / ARROWS - MOVE','LMB - LIGHT / RMB - HEAVY','PRESS AGAIN TO CHAIN UP TO THREE','E / MIDDLE CLICK - LIGHT-CASTING SWEEP','ESC - PAUSE','THE LAMP IS YOUR ONLY LIFE.','ENTER / ESC / CLICK - RETURN'].forEach((v,i)=>uiText(v,504,410+i*30,12,'#aaa'));}else labels.forEach((text,i)=>uiText(i===selected?'[ '+text+' ]':text,504,422+i*49,16,i===selected?'#ddd':'#888'));flourish(504,675,450,true);uiText('FIRE IN THE LEFT. IRON IN THE RIGHT.',504,732,12,'#888');uiText('UP / DOWN - CHOOSE    ENTER - DESCEND',504,767,12,'#777');u.fillStyle='#999';u.fillRect(78,809,352,4);u.fillRect(578,809,352,4);uiText('ASH / IRON',504,818,12,'#aaa');glyph(ui,196,168,0,864,true,true);}\n"""
put('src/ui/ornaments.js',"export function makeUI(out,glyph){const ui=document.createElement('canvas');ui.width=1008;ui.height=864;const u=ui.getContext('2d',{willReadFrequently:true});let pl={hp:100,lamp:100};\n"+ornaments+hud+menu+"return{menu:drawMenu,hud(lamp){pl={hp:lamp,lamp};drawHUD();}};}\n")
# Fix handedness without changing the vendor model.
p=stage/'src/animation/combat-hero.ts';s=p.read_text();old='s.x-s.fy*x+s.fx*y,s.y+s.fx*x+s.fy*y';assert old in s;s=s.replace(old,'s.x+s.fy*x+s.fx*y,s.y-s.fx*x+s.fy*y');p.write_text(s)
# A chain has at most three separately requested strikes; one queued input only.
p=stage/'src/combat/action-machine.ts';s=p.read_text();s=s.replace('if(this.current.elapsed/this.current.duration<COMBAT.queueStart)return false;','if(this.current.elapsed/this.current.duration<COMBAT.queueStart||this.queued||this.current.stage>=COMBAT.maxChain-1)return false;');s=s.replace('this.begin(next,(a.stage+1)%COMBAT.maxChain,hooks);','this.begin(next,a.stage+1,hooks);');p.write_text(s)
put('package.json',json.dumps({'name':'ash-iron-iteration-2-canvas2d','version':'2.0.0','private':True,'type':'module','engines':{'node':'>=22'},'scripts':{'start':'node server.mjs','build':'node tools/build.mjs','test':'node --test tests/*.test.mjs','test:browser':'node tools/browser-check.mjs','typecheck':'tsc --noEmit'},'devDependencies':{'typescript':'5.8.2','playwright':'1.49.1'}},indent=2))
put('tsconfig.json',json.dumps({'compilerOptions':{'strict':True,'target':'ES2022','module':'ES2022','moduleResolution':'Bundler','lib':['ES2022','DOM','DOM.Iterable'],'skipLibCheck':True,'rootDir':'src','outDir':'runtime'},'include':['src/**/*.ts']},indent=2))
put('.gitignore','node_modules/\n*.log\n.DS_Store\n')
put('START.bat','@echo off\r\ncd /d "%~dp0"\r\nstart "" "%~dp0PLAY.html"\r\n')
put('BUILD.bat','@echo off\r\ncd /d "%~dp0"\r\nif not exist node_modules call npm ci\r\nif errorlevel 1 goto end\r\ncall npm run build\r\n:end\r\npause\r\n')
put('TEST.bat','@echo off\r\ncd /d "%~dp0"\r\ncall npm test\r\npause\r\n')
put('BUILD_INFO.json',json.dumps({'build':'ASH_IRON_ITERATION_2_CANVAS2D','sourceCommit':os.environ['GITHUB_SHA'],'originalBaseCommit':'c727a02ad98ef0c537484f664777997a2ffc56e0','renderer':'Canvas2D','grid':[196,140],'status':'integration-build','approved':'Canvas2D migration','rules':'DRAFT_RULES remain provisional'},indent=2))
# These text files are included in the reviewed payload.
for a,b in [('README_RU.md','README_RU.md'),('package.py','tools/package.py'),('integration.test.mjs','tests/integration.test.mjs')]:copy('.migration/'+a,b)
subprocess.run(['npm','install','--no-audit','--no-fund'],cwd=stage,check=True)
subprocess.run(['npm','run','build'],cwd=stage,check=True)
result=subprocess.run(['npm','test'],cwd=stage,text=True,capture_output=True);put('docs/unit-tests.tap',result.stdout+result.stderr);print(result.stdout);assert result.returncode==0,'Unit tests failed; branch unchanged'
subprocess.run(['npx','playwright','install','--with-deps','chromium'],cwd=stage,check=True)
subprocess.run(['npm','run','test:browser'],cwd=stage,check=True)
assert json.loads((stage/'docs/browser-check.json').read_text())['passed'],'Browser checks failed'
subprocess.run(['python','tools/package.py'],cwd=stage,check=True)
# Only now replace this workflow's checked-out branch tree. No force push is used.
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==os.environ['GITHUB_SHA']
for p in root.iterdir():
 if p.name=='.git':continue
 if p.is_dir() and not p.is_symlink():shutil.rmtree(p)
 else:p.unlink()
shutil.copytree(stage,root,dirs_exist_ok=True,ignore=shutil.ignore_patterns('node_modules','.git','__pycache__'))
print('Clean Canvas2D tree ready for commit; main was not touched')
