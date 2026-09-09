const assert=require('node:assert/strict'),fs=require('node:fs');
const F=require('../code/lens_features.js'),V=require('../code/lens_visual.js');
const p={brightness:.55,trails:.25,detail:.55,bassWeight:1.2,focus:0,scene:0,freeze:false,black:false};
let groups=0;function test(name,fn){fn();groups++;console.log('✓ '+name);}
const input=(spec,rms=.12)=>[...spec,rms,rms*2,rms,0];
function base(){return {bands:[0,0,0],body:0,midContour:.5,energy:0,slow:0,width:0,brightness:.5,counts:[0,0,0],transients:[0,0,0],active:true};}
function stats(a){let sum=0,x=0,y=0,lit=0,ys=[];for(let i=0;i<64;i++){let v=Math.max(...a.slice(i*3,i*3+3));sum+=v;x+=(i%8)*v;y+=Math.floor(i/8)*v;if(v>5){lit++;ys.push(Math.floor(i/8));}}return {sum,x:x/Math.max(1,sum),y:y/Math.max(1,sum),lit};}
test('Band-specific events remain independent in isolated low, mid and high material',()=>{
 for(let band of [1,4,7]){let e=new F.Engine();for(let i=1;i<250;i++){let a=Array(8).fill(0);a[band]=i%25<3?.12:.00005;e.step(input(a,Math.max(.0001,a[band])),i*.02,1);}
 let counts=e.counts;assert(counts[band===1?0:band===4?1:2]>=7,JSON.stringify(counts));counts.forEach((v,i)=>{if(i!==(band===1?0:band===4?1:2))assert.equal(v,0);});}
});
test('Quiet noise stays below the event floor, even after level adaptation',()=>{
 let e=new F.Engine();for(let i=1;i<3000;i++){let a=Array.from({length:8},(_,j)=>.00004*(1+Math.sin(i*.73+j)));e.step(input(a,.00018),i*.02,2.5);}
 assert.equal(e.count,0);assert.equal(e.body,0);assert.equal(e.energy,0);
});
test('A held low tone has a body without being retriggered as repeated kicks',()=>{
 let e=new F.Engine();for(let i=1;i<300;i++)e.step(input([0,.1,0,0,0,0,0,0]),i*.02,1);
 assert(e.body>.4);assert(e.transients[0]<.001);assert(e.counts[0]<=1);assert.equal(e.counts[2],0);
});
test('Attacks surviving between render frames still generate a visible front',()=>{
 let e=new F.Engine(),v=new V.Engine();for(let i=1;i<=20;i++)e.step(Array(12).fill(0),i*.02,1);
 v.step(e.snapshot(),.033,p);e.step(input([0,.2,0,0,0,0,0,0],.2),.42,1);
 e.step(Array(12).fill(0),.44,1);const a=v.step(e.snapshot(),.04,p);
 assert(stats(a).sum>50);assert(v.impacts.length>0);
});
test('Low-frequency body retains a substantial shape in every composition',()=>{
 for(let scene=0;scene<6;scene++){let a=new V.Engine(),b=new V.Engine(),fa={...base(),bands:[.1,0,0],body:.1},fb={...base(),bands:[.9,0,0],body:.9};
 let aa,bb;for(let i=0;i<60;i++){aa=a.step(fa,.033,{...p,scene,focus:2});bb=b.step(fb,.033,{...p,scene,focus:2});}
 const small=stats(aa),large=stats(bb);assert(large.sum>small.sum*3,JSON.stringify({scene,small,large}));assert(large.lit>=5);
 }
});
test('Low body, mid line and high detail occupy different grayscale structures',()=>{
 const s=[];for(let focus of [2,3,5]){let v=new V.Engine(),a;
 for(let i=0;i<40;i++)a=v.step({...base(),bands:[.85,.8,.8],body:.85,midContour:.55,counts:[0,0,i],transients:[0,0,.9]},.033,{...p,focus});
 s.push(stats(a));}assert(s[1].y-s[0].y>1.8,JSON.stringify(s));assert(s[2].y-s[1].y>1.0,JSON.stringify(s));
});
test('High attacks disappear sooner than low impact fronts; long trails cannot erase that distinction',()=>{
 let v=new V.Engine(),f={...base(),counts:[1,0,1],transients:[1,0,1],bands:[0,0,.1]};
 v.step(f,.033,{...p,trails:1});
 for(let i=0;i<7;i++)v.step({...f,transients:[0,0,0],bands:[0,0,0]},.033,{...p,trails:1});
 let low=v.layers[0].reduce((a,b)=>a+b,0),high=v.layers[4].reduce((a,b)=>a+b,0);
 assert(low>.04);assert(high<low*.2,JSON.stringify({low,high}));
});
test('Silence reaches complete darkness without an idle scene drawing phantom music',()=>{
 for(let scene=0;scene<6;scene++){let v=new V.Engine();v.step({...base(),bands:[1,1,1],body:1,counts:[1,1,1],transients:[1,1,1]},.033,{...p,scene});
 let a;for(let i=0;i<300;i++)a=v.step({...base(),active:false},.033,{...p,scene});assert(a.every(x=>x===0));}
});
test('Independent mid attacks cannot produce high-frequency particles or a low impact',()=>{
 let v=new V.Engine();for(let i=0;i<30;i++)v.step({...base(),counts:[0,i,0],bands:[0,.8,0],transients:[0,1,0]},.033,p);
 assert.equal(v.particles.length,0);assert.equal(v.impacts.length,0);
});
test('Single-layer focus masks every other audio role without muting touch feedback',()=>{
 let v=new V.Engine(),f={...base(),bands:[.8,.8,.8],body:.8,counts:[1,1,1],transients:[1,1,1]};
 v.step(f,.033,p);let before=v.step(f,.033,{...p,freeze:true,focus:2});v.touch(88,127);
 let after=v.step(f,.033,{...p,freeze:true,focus:2});assert(stats(after).sum>stats(before).sum+40);
 assert(Math.max(...after.slice(189,192))>35);
});
test('Unfreezing consumes old attacks rather than replaying an accumulated burst',()=>{
 let v=new V.Engine();v.step(base(),.033,p);for(let i=1;i<100;i++)v.step({...base(),counts:[i,i,i],transients:[1,1,1]},.033,{...p,freeze:true});
 v.step({...base(),counts:[99,99,99]},.033,p);assert.equal(v.impacts.length,0);assert.equal(v.particles.length,0);
});
test('Saturated mixed input remains bounded and leaves dark cells in all scenes',()=>{
 for(let scene=0;scene<6;scene++){let v=new V.Engine(),a;for(let i=0;i<180;i++){a=v.step({...base(),bands:[1,1,1],body:1,slow:1,energy:1,counts:[Math.floor(i/9),i,Math.floor(i/3)],transients:[.8,.7,.9]},.033,{...p,scene});
 assert(a.every(n=>Number.isInteger(n)&&n>=0&&n<=127));let lit=stats(a).lit;assert(lit<=56,'Fewer than eight dark cells under saturated input: '+lit);assert(stats(a).sum<1200);}
 }
});
test('Measured filter leakage from a middle-register chord cannot trigger low impacts',()=>{
 let e=new F.Engine();for(let i=1;i<300;i++){
  const env=i%25<12?1:.001;
  e.step(input([.0001,.0004,.0018,.0134,.0087,.001,.0001,0].map(x=>x*env),.025*env),i*.02,1);
 }
 assert.equal(e.counts[0],0);assert(e.body<.02);assert(e.counts[1]>3);
});
test('Silent input cannot keep re-locking BPM from old rhythmic history',()=>{
 let e=new F.Engine();for(let i=1;i<=500;i++){let phase=(i*.02)%.5,a=.22*Math.exp(-phase/.04);e.step(input([a*.1,a,a*.2,0,0,0,0,0],a),i*.02,1);}
 for(let i=501;i<=560;i++)e.step(Array(12).fill(0),i*.02,1);
 assert(e.confidence<.25);assert.equal(e.pulse,0);
});
console.log('PASS '+groups+' role acceptance groups');
