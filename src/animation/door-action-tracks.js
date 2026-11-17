const rest={lean:.25,twist:0,crouch:0,left:[-.28,.3,1.04],right:[.28,-.02,.9],feet:[[-.14,-.04,.065],[.14,.04,.065]],latch:0,wings:[0,0],lift:0};
const key=(at,values)=>({at,...values});
const actions=[
 ['bar-unlock-push','prison-door.a',3.4,[key(0,{}),key(.22,{left:[-.1,.58,1.15],twist:-.1}),key(.42,{left:[-.1,.62,1.15],latch:1}),key(.65,{lean:.46,left:[-.05,.64,1.15],wings:[1,0],feet:[[-.2,-.1,.065],[.14,.22,.065]]}),key(1,{wings:[1,0],latch:1})]],
 ['bar-pull-step','prison-door.a',3.8,[key(0,{}),key(.25,{left:[-.1,.6,1.15]}),key(.5,{lean:.12,twist:.3,left:[-.2,.4,1.15],latch:1,feet:[[-.24,-.3,.065],[.2,.02,.065]]}),key(.78,{twist:.5,left:[-.4,.15,1.15],wings:[1,0]}),key(1,{wings:[1,0],latch:1})]],
 ['shoulder-drive','prison-door.b',3.5,[key(0,{}),key(.25,{twist:-.5,crouch:-.08,right:[.15,.15,1.3],feet:[[-.22,-.22,.065],[.2,.12,.065]]}),key(.43,{lean:.68,twist:-.45,crouch:-.06}),key(.7,{lean:.48,wings:[1,0],feet:[[-.22,-.08,.065],[.2,.28,.065]]}),key(1,{wings:[1,0]})]],
 ['heel-kick','prison-door.b',2.8,[key(0,{}),key(.2,{lean:.12,twist:-.2,feet:[[-.16,-.05,.065],[.15,.08,.5]]}),key(.4,{lean:.02,feet:[[-.16,-.05,.065],[.15,.62,.8]],wings:[.12,0]}),key(.58,{lean:.18,feet:[[-.16,-.05,.065],[.15,.2,.35]],wings:[.85,0]}),key(1,{wings:[1,0]})]],
 ['bolt-two-hand-heave','prison-door.c',4.4,[key(0,{}),key(.2,{left:[-.2,.56,1.12],right:[.2,.56,1.12],crouch:-.08}),key(.4,{left:[-.4,.56,1.12],right:[0,.56,1.12],latch:1,twist:-.25}),key(.7,{left:[-.22,.68,1.15],right:[.22,.68,1.15],lean:.65,crouch:-.05,wings:[1,0]}),key(1,{wings:[1,0],latch:1})]],
 ['jammed-two-jerks','prison-door.c',4.8,[key(0,{}),key(.2,{left:[-.2,.55,1.2],right:[.2,.55,1.2]}),key(.34,{lean:.6,crouch:-.1,wings:[.08,0]}),key(.46,{lean:.15,wings:[.02,0]}),key(.6,{lean:.7,crouch:-.12,wings:[.2,0]}),key(.7,{lean:.25,wings:[.12,0]}),key(.85,{lean:.58,wings:[1,0]}),key(1,{wings:[1,0]})]],
 ['paired-spread','iron-door.a',3.8,[key(0,{}),key(.25,{left:[-.38,.55,1.2],right:[.38,.55,1.2],feet:[[-.28,-.08,.065],[.28,.08,.065]]}),key(.58,{left:[-.55,.48,1.2],right:[.55,.48,1.2],lean:.48,wings:[.5,.5]}),key(.78,{left:[-.6,.18,1.2],right:[.6,.18,1.2],wings:[1,1]}),key(1,{wings:[1,1]})]],
 ['paired-one-then-other','iron-door.a',4.2,[key(0,{}),key(.2,{left:[-.4,.58,1.2],twist:-.2}),key(.45,{left:[-.6,.12,1.2],twist:-.35,wings:[1,0]}),key(.6,{right:[.4,.58,1.2],twist:.2,wings:[1,0]}),key(.82,{right:[.6,.12,1.2],twist:.35,wings:[1,1]}),key(1,{wings:[1,1]})]],
 ['gate-squat-lift','iron-door.b',4.5,[key(0,{}),key(.22,{crouch:-.4,lean:.5,left:[-.38,.5,.6],right:[.38,.5,.6],feet:[[-.26,-.1,.065],[.26,.1,.065]]}),key(.42,{crouch:-.32,left:[-.38,.5,.85],right:[.38,.5,.85],lift:.12}),key(.7,{crouch:0,left:[-.38,.45,1.8],right:[.38,.45,1.8],lift:.65}),key(1,{lift:1})]],
 ['gate-lift-regrip','iron-door.b',5.2,[key(0,{}),key(.2,{crouch:-.35,left:[-.4,.5,.7],right:[.4,.5,.7]}),key(.4,{crouch:-.12,left:[-.4,.5,1.25],right:[.4,.5,1.25],lift:.3}),key(.52,{left:[-.4,.5,1.55],right:[.4,.5,1.25],lift:.3}),key(.62,{left:[-.4,.5,1.55],right:[.4,.5,1.55],lift:.3}),key(.84,{left:[-.4,.4,1.9],right:[.4,.4,1.9],lift:1}),key(1,{lift:1})]],
 ['heavy-braced-drive','iron-door.c',5,[key(0,{}),key(.25,{left:[-.4,.55,1.2],right:[.4,.55,1.2],crouch:-.16,feet:[[-.28,-.28,.065],[.25,.16,.065]]}),key(.5,{lean:.75,crouch:-.13,wings:[.1,.1]}),key(.8,{lean:.55,left:[-.6,.4,1.2],right:[.6,.4,1.2],feet:[[-.28,-.06,.065],[.25,.32,.065]],wings:[1,1]}),key(1,{wings:[1,1]})]],
 ['heavy-shoulder-follow','iron-door.c',4.8,[key(0,{}),key(.23,{twist:-.5,lean:.55,crouch:-.1}),key(.43,{twist:-.4,lean:.7,wings:[.75,0]}),key(.6,{twist:.2,right:[.4,.6,1.2],wings:[1,0]}),key(.82,{twist:.35,right:[.6,.15,1.2],wings:[1,1]}),key(1,{wings:[1,1]})]]
];
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export const DOOR_ACTION_TRACKS=freeze(actions.map(([id,modelId,duration,keys])=>{let previous={...rest};return{id,modelId,duration,keys:keys.map((k,i)=>{previous={...previous,...(i===keys.length-1?rest:{}),...k};return{...previous};})};}));
function blend(a,b,t){return Array.isArray(a)?a.map((v,i)=>blend(v,b[i],t)):a+(b-a)*t;}
export function sampleDoorTrack(id,progress){
 const action=DOOR_ACTION_TRACKS.find(a=>a.id===id);if(!action||!Number.isFinite(progress)||progress<0||progress>1)throw Error('Invalid door action sample');
 let index=0;while(index<action.keys.length-2&&progress>action.keys[index+1].at)index++;
 const a=action.keys[index],b=action.keys[index+1],u=(progress-a.at)/(b.at-a.at),t=u*u*(3-2*u),result={};
 for(const name of Object.keys(rest))result[name]=blend(a[name]??rest[name],b[name]??rest[name],t);
 return{id:action.id,modelId:action.modelId,duration:action.duration,...result};
}
