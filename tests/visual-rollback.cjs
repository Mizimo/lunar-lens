const assert=require('node:assert/strict'),V=require('../code/lens_visual.js'),Old=require('./reference/lens_visual-v1.3.0.cjs'),B=require('../code/lens_behaviours.js');
let checked=0;
for(let scene=0;scene<6;scene++)for(let focus=0;focus<6;focus++){
 const a=new V.Engine(),b=new Old.Engine(),roles=B.defaults();
 for(let t=0;t<100;t++){
  const phi=t*.13,level=.3+.2*Math.sin(phi),spatial={valid:true,amount:1,contrast:1,roles:Array(5).fill([.8,.01,.19]),displayRoles:Array(5).fill([.8,.01,.19])};
  const f={bands:[level,.5,.4],body:level,behaviour:{phrase:.6,bed:.4,articulation:.65},width:.4,midContour:.5+.35*Math.sin(phi),counts:[Math.floor(t/15),Math.floor(t/9),Math.floor(t/5)],transients:[.6,.4,.5],energy:.6,slow:.5,active:true,spatial,eventVisual:{pan:Math.sin(phi),spread:.4,entry:.2,reframe:.3,direction:0,texture:.2,release:.1}};
  roles[2].width=.6+Math.abs(Math.sin(phi))*.9;roles[3].gain=.5+t/100;
  const p={scene,focus,palette:2,brightness:.65,trails:.4,detail:.55,bassWeight:1.2,transition:.85,roles,freeze:t>=80&&t<86,black:t===90};
  if(t===35){a.touch(44,80);b.touch(44,80);}if(t===42){a.release(44);b.release(44);}
  assert.deepEqual(a.step(f,.033,p),b.step(f,.033,p),`Historical visual mismatch: scene ${scene}, focus ${focus}, frame ${t}`);checked++;
 }
}
console.log(`PASS original visual rollback: ${checked} exact RGB frames across all six scenes and every focus, including PHRASE motion, width, trails, events, touch, freeze and blackout.`);
