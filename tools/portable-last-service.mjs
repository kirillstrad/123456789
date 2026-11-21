import vm from 'node:vm';
import path from 'node:path';
export function portableBundle(entries,entry='app/last-service.js'){
 const byId=new Map(entries.map(e=>[e.id,e]));if(byId.size!==entries.length)throw Error('Duplicate module ID');
 const selected=new Map();
 function visit(id){
  if(selected.has(id))return;const e=byId.get(id);if(!e)throw Error('Missing module '+id);selected.set(id,e);
  for(const spec of e.dependencies){if(!spec.startsWith('.'))throw Error('External dependency '+spec);const target=path.posix.normalize(path.posix.join(path.posix.dirname(id),spec));if(target.startsWith('../'))throw Error('Dependency escapes runtime');visit(target);}
 }
 visit(entry);
 const wrappers=[...selected.values()].map(e=>JSON.stringify(e.id)+':function(require,module,exports){\n'+e.code+'\n}');
 const bundle=`(function(){const modules={${wrappers.join(',\n')}},cache={};function norm(s){const o=[];for(const p of s.split('/')){if(p==='..')o.pop();else if(p&&p!=='.')o.push(p);}return o.join('/');}function load(n,from=''){const id=norm(n.startsWith('.')?from.split('/').slice(0,-1).join('/')+'/'+n:n);if(cache[id])return cache[id].exports;if(!Object.hasOwn(modules,id))throw Error('Missing module '+id);const m={exports:{}};cache[id]=m;modules[id](n=>load(n,id),m,m.exports);return m.exports;}load(${JSON.stringify(entry)});})();`;
 new vm.Script(bundle,{filename:'LAST_SERVICE.bundle.js'});return bundle;
}
export function inlineScript(code){
 const safe=code.replace(/<\/script/gi,match=>'<'+String.fromCharCode(92)+match.slice(1));
 new vm.Script(safe,{filename:'LAST_SERVICE.inline.js'});return '<script>\n'+safe+'\n</script>';
}
