const palettes=[
 {id:'legacy',body:'255,166,78',core:'255,245,220'},
 {id:'amber',body:'243,161,59',core:'255,208,120'},
 {id:'spectral',body:'237,204,143',core:'255,235,187'}
];
const oldAssertion='assert.ok(flames.some(p=>p.kind===2&&p.c[1]===245));';
const coreAssertion=color=>`assert.ok(flames.some(p=>p.kind===2&&p.c.every((n,i)=>n===[${color}][i])));`;
const warmAssertion='assert.ok(flames.every(p=>p.c[0]>p.c[1]&&p.c[1]>p.c[2]));';
const count=(text,part)=>text.split(part).length-1;
export function reconcileFirePresentation(renderer,test){
 const bodyMatches=palettes.filter(p=>count(renderer,`c:[${p.body}]`)>0);
 const coreMatches=palettes.filter(p=>count(renderer,`c:[${p.core}]`)>0);
 if(bodyMatches.length!==1||coreMatches.length!==1||bodyMatches[0]!==coreMatches[0])throw Error('Unexpected fire renderer palette: unknown, mixed or ambiguous version');
 const source=bodyMatches[0],target=source.id==='legacy'?palettes[1]:source;
 if(count(renderer,`c:[${source.body}]`)!==1||count(renderer,`c:[${source.core}]`)!==1)throw Error('Unexpected fire renderer palette: duplicate color anchors');
 const known=[oldAssertion,coreAssertion(palettes[1].core),coreAssertion(palettes[2].core)];
 if(known.reduce((n,a)=>n+count(test,a),0)!==1||count(test,warmAssertion)>1)throw Error('Unexpected fire presentation test: unknown or duplicate assertions');
 const existing=known.find(a=>test.includes(a)),expected=coreAssertion(target.core);
 let nextTest=test.replace(existing,expected);
 if(!nextTest.includes(warmAssertion))nextTest=nextTest.replace(expected,expected+warmAssertion);
 const nextRenderer=renderer.replace(`c:[${source.body}]`,`c:[${target.body}]`).replace(`c:[${source.core}]`,`c:[${target.core}]`);
 return {renderer:nextRenderer,test:nextTest,palette:target.id};
}
