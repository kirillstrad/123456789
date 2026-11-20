import {attackTiming} from '../combat/attack-timing.js';

const STYLE=Object.freeze({color:'#ff4460',width:2.2});

// The simulation owns eligibility; rendered/interpolated progress can only
// narrow that signal, never invent a continuation for a terminal chain.
export function comboEdgeStyle(s) {
 const a=s.action;
 if(s.comboEdgeActive!==true||s.phase!=='playing'||!a||s.dash||s.execution||s.interaction)return null;
 if(s.sweepProgress!=null||a.continuation!=null)return null;
 if(a.kind!=='light'&&a.kind!=='heavy')return null;
 if(!Number.isFinite(a.progress))return null;
 const q=attackTiming(a.kind);
 return a.progress>=q.queueStart&&a.progress<=q.queueEnd?STYLE:null;
}
