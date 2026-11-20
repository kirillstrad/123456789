import {createInteriorGeometry} from '../interior/geometry.js';
import {VISUAL_MATERIALS as M,ashenWallOpening} from './ashen-visual-data.js';
export function buildAshenWallDress(plan,walkable){
 const parts=[],banners=[],records=[];
 for(const t of plan.tiles)for(const side of ['north','west']){
  if(side==='north'?walkable(t.x+.5,t.y-.5):walkable(t.x-.5,t.y+.5))continue;
  if(ashenWallOpening(t.x,t.y,side))continue;
  const x=t.x+(side==='north'?.5:0),y=t.y+(side==='west'?.5:0);
  if(plan.doors.some(d=>Math.hypot(d.x-x,d.y-y)<3))continue;
  const yaw=side==='west'?-90:0,g=createInteriorGeometry({x,y,yaw}),seed=t.x*7+t.y*11;
  // All wall trim fits the existing wall/hero clearance; it adds no collision.
  g.box(-.5,-.05,.08,1,.11,.17,g.shade(M.stone,.85));
  if(seed%3===0){
   g.box(-.13,-.13,.25,.26,.18,2.03,M.stone);g.box(-.23,-.14,2.14,.46,.21,.14,M.trim);
   g.box(-.2,-.14,.23,.4,.21,.12,M.trim);
   if(seed%2===0){
    g.box(-.38,-.02,1.1,.76,.07,.7,M.dark);g.line([[-.3,.06,1.1],[0,.06,1.87],[.3,.06,1.1]],M.trim,2.5);
    for(let k=0;k<3;k++)g.line([[-.24+k*.24,.065,1.18],[-.24+k*.24,.065,1.62]],M.iron,1.5);
   }
   records.push({id:'ashen.wall.'+side+'.'+t.x+'.'+t.y,x,y,type:'pilaster-and-niche'});
  }else if(seed%5===0){
   g.box(-.35,-.015,1.25,.7,.05,.67,M.stone);g.line([[0,.045,1.36],[0,.045,1.83]],M.trim,3);g.line([[-.2,.045,1.6],[.2,.045,1.6]],M.trim,3);
   records.push({id:'ashen.wall.'+side+'.'+t.x+'.'+t.y,x,y,type:'relief'});
  }else if(seed%7===0){
   g.line([[-.4,.05,2.1],[.4,.05,2.1]],M.iron,3);
   banners.push({id:'ashen.banner.'+side+'.'+t.x+'.'+t.y,x,y,yaw,phase:seed%17});
   records.push({id:'ashen.wall.'+side+'.'+t.x+'.'+t.y,x,y,type:'hanging-banner'});
  }
  if(seed%11===0){
   for(let i=0;i<4;i++){const z=1.6-i*.14;g.line([[-.045,.09,z],[0,.11,z-.07],[.045,.09,z],[0,.07,z+.07],[-.045,.09,z]],M.iron,2);}
   records.push({id:'ashen.wall.iron.'+side+'.'+t.x+'.'+t.y,x,y,type:'iron-ring-and-chain'});
  }
  if(seed%13===0){g.box(-.07,.02,1.2,.14,.05,.3,M.iron);g.line([[0,.05,1.26],[0,.24,1.26],[0,.24,1.36]],M.iron,3);records.push({id:'ashen.wall.bracket.'+side+'.'+t.x+'.'+t.y,x,y,type:'empty-iron-bracket'});}
  if(seed%4===0){g.line([[-.3,.065,.35],[-.05,.07,.8],[-.17,.07,1.1]],M.dark,2);}
  if(seed%6===0){for(let i=0;i<3;i++)g.line([[-.25+i*.15,.07,.2],[-.25+i*.15,.07,.8-i*.12]],[43,55,48],2);}
  parts.push(...g.finish().parts.map(p=>({...p,wallDressing:true})));
 }
 return {parts,banners,records};
}
