const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const F=require('../code/lens_features.js'),V=require('../code/lens_visual.js');
let n=0;function test(name,f){f();n++;console.log('✓ '+name);}
function model(kind){let e=new F.Engine(),a;for(let i=1;i<=700;i++){
 const base=[.024,.033,.02,.017],shape=[[.085,.006,.009,.008],[.006,.074,.008,.015],[.003,.008,.08,.013]][Math.floor(i/15)%3];
 const env=i%15<8?1:0;let mid=base.map((v,j)=>kind==='held'?v:kind==='swell'?v*(.6+.4*Math.sin(i*.006)):kind==='articulated'?shape[j]*env:v+shape[j]*env);
 a=e.step([0,0,...mid,0,0,Math.hypot(...mid),.17,.1,0,0,0,0],i*.02,1);
 }return a;}
test('Same-register stable and articulated material form different behaviours',()=>{
 const held=model('held'),phrase=model('articulated'),swell=model('swell');
 assert(held.roles[3]>.4&&held.roles[2]<.08);assert(phrase.roles[2]>.30&&phrase.roles[3]<.08);
 assert(swell.roles[3]>.25&&swell.roles[2]<.10);
});
test('Foreground and bed coexist rather than dividing one meter into complementary halves',()=>{
 const a=model('combined');assert(a.roles[2]>.25&&a.roles[3]>.2,JSON.stringify(a.behaviour));assert.equal(a.behaviour.states.length,5);
});
function impact(signal,gap=.16,sens=1){let e=new F.Engine(),slow=0,out=[];for(let i=1;i<=800;i++){
 const t=i*.02,v=signal(t),fast=v[0],rms=v[1]||fast;slow+=(fast-slow)*(1-Math.exp(-.02/.09));
 const s=e.step([fast*.2,fast,fast*.1,0,0,0,0,0,rms,Math.max(rms,fast)*1.5,rms,0,fast,slow,fast*1.5],t,1,sens,gap);
 out.push(s);
 }return {engine:e,out};}
test('Slow bass swells have mass without becoming short impacts',()=>{
 const a=impact(t=>{let p=t%4;return [p<3?.2*Math.sin(Math.PI*p/3)**2:0];});
 assert.equal(a.engine.counts[0],0);assert(Math.max(...a.out.map(s=>s.body))>.5);
});
test('Known short pulses trigger once each; minimum interval intentionally rejects faster repeats',()=>{
 const signal=t=>{let q=(t-1+.000001)%.5;return [t>=1&&t<6?.16*Math.exp(-q/.04):0];};
 assert.equal(impact(signal).engine.counts[0],10);
 assert(impact(signal,.65).engine.counts[0]<=5);
});
test('Out-of-band leakage cannot become an impact; wider-band input restores detection',()=>{
 const a=impact(t=>{const full=t>1&&t<6?.16*Math.exp(-(t%.5)/.04):0;return [full*.18,full];});
 const b=impact(t=>{const full=t>1&&t<6?.16*Math.exp(-(t%.5)/.04):0;return [full*.70,full];});
 assert.equal(a.engine.counts[0],0);assert(b.engine.counts[0]>=8);
});
const p={brightness:.55,detail:.55,trails:.25,bassWeight:1.2,scene:0,palette:0,focus:0};
const f={...model('combined'),bands:[.8,.8,.5],body:.8,energy:.8,slow:.6,width:.2,counts:[0,0,0],transients:[0,0,0]};
test('All six compositions have different grayscale geometry under the same colour palette',()=>{
 let fields=[];for(let scene=0;scene<6;scene++){
  let v=new V.Engine(),a;for(let i=0;i<80;i++)a=v.step({...f,counts:[Math.floor(i/14),Math.floor(i/7),Math.floor(i/5)],transients:[.8,.8,.8]},.033,{...p,scene,palette:1});
  const gray=Array.from({length:64},(_,k)=>Math.max(...a.slice(k*3,k*3+3)));const total=gray.reduce((a,b)=>a+b);fields.push(gray.map(x=>x/total));
 }
 for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)assert(fields[i].reduce((s,v,k)=>s+Math.abs(v-fields[j][k]),0)>.50,`Similar geometry: ${i},${j}`);
});
test('Palette overrides change colours without changing geometry or event histories',()=>{
 let a=new V.Engine(),b=new V.Engine(),aa,bb;for(let i=0;i<60;i++){
  aa=a.step(f,.033,{...p,scene:3,palette:2});bb=b.step(f,.033,{...p,scene:3,palette:5});
 }assert.deepEqual(a.layers,b.layers);assert.notDeepEqual(aa,bb);
});
function controller(){const calls=[],output=[];function Task(fn,ctx){this.fn=fn.bind(ctx);this.repeat=this.schedule=this.cancel=()=>{};}
 const c={Task,post:()=>{},arrayfromargs:x=>Array.from(x),outlet:(...a)=>output.push(a),File:function(){this.isopen=false;},patcher:{filepath:__dirname+'/../patchers/Lunar Lens.maxpat',getnamed:name=>({message:(...a)=>calls.push([name,...a])})}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(__dirname+'/../patchers/lens_runtime.js','utf8'),c);return {c,calls};}
test('Frequency limits stay ordered, reach the native filter, and clear calibration transients',()=>{
 const {c,calls}=controller();c.param('impactHi',70);c.param('impactLo',160);assert.equal(c.P.impactLo,45);c.param('impactHi',400);c.param('impactLo',160);c.param('impactHi',70);assert.equal(c.P.impactHi,185);
 assert(calls.some(a=>a[0]==='analysis'&&a[1]==='impactHi'&&a[2]===185));assert(c.analysis.impactCooldown>0);
 c.defaults();assert.equal(c.P.impactHi,185);c.detectorreset();assert.equal(c.P.impactLo,35);assert.equal(c.P.impactHi,160);
});
test('All six Launchpad scenes, five focuses, palette and detector controls are reachable',()=>{
 const {c}=controller();[89,79,69,59,49,39].forEach((cc,i)=>{c.cc(cc,127);assert.equal(c.P.scene,i);});
 for(let i=2;i<=6;i++){c.cc(i,127);assert.equal(c.P.focus,i-1);}
 c.cc(29,127);assert.equal(c.P.palette,1);c.cc(19,127);assert(c.P.detector);
});
test('Resume clears stale event counters so the first new attack is immediately visible',()=>{
 const {c}=controller();c.visual.lastCounts=[90,90,90];c.loaded=true;c.paused=true;c.play();assert.deepEqual(Array.from(c.visual.lastCounts),[0,0,0]);
});
test('Both native JSUI panels paint finite controls; pointer actions dispatch and release',()=>{
 const {c}=controller(),events=[];const graphics=new Proxy({},{get:(_,name)=>name==='set_source_rgba'?(a)=>{assert(Array.isArray(a)&&a.length===4&&a.every(Number.isFinite));}:()=>{}});
 const u={mgraphics:graphics,post:e=>{throw Error(e);},outlet:(...a)=>{if(a[1]!=='uiperf')events.push(a);}};vm.createContext(u);vm.runInContext(fs.readFileSync(__dirname+'/../code/lens_ui.js','utf8'),u);
 c.render();u.state(JSON.stringify(c.snapshot()));u.paint();assert.equal(u.hit.filter(h=>h.args[0]==='scene').length,6);assert.equal(u.hit.filter(h=>h.cmd==='pad').length,64);
 const h=u.hit.find(h=>h.cmd==='pad');u.onclick(h.x+4,h.y+4);u.ondrag(h.x+4,h.y-30,1);u.ondrag(h.x,h.y,0);assert.equal(events[0][1],'pad');assert.equal(events.at(-1)[1],'padup');
 c.P.detector=true;u.state(JSON.stringify(c.snapshot()));u.paint();for(const name of ['impactLo','impactHi','impactGap']){
  const h=u.hit.find(h=>h.args[0]===name);assert(h);u.onclick(h.x+h.w,h.y+4);assert.equal(events.at(-1)[2],name);assert.equal(events.at(-1)[3],h.hi);
 }
 const sensitivity=u.hit.find(h=>h.cmd==='roleparam'&&h.args[0]==='sensitivity');assert(sensitivity);u.onclick(sensitivity.x+sensitivity.w,sensitivity.y+4);assert.equal(events.at(-1)[1],'roleparam');
});
test('The independent fast preview maps all 64 cells and releases mouse pressure',()=>{
 const events=[],g={mgraphics:new Proxy({},{get:()=>()=>{}}),arrayfromargs:a=>Array.from(a),outlet:(...a)=>events.push(a)};
 vm.createContext(g);vm.runInContext(fs.readFileSync(__dirname+'/../code/lens_grid.js','utf8'),g);
 g.list(...Array(192).fill(30));g.paint();
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
  g.onclick(25+x*53,25+y*53);assert.equal(events.at(-1)[2],11+x+(7-y)*10);
  g.ondrag(25+x*53,5+y*53,1);assert.equal(events.at(-1)[1],'pressure');
  g.ondrag(0,0,0);assert.equal(events.at(-1)[1],'padup');assert.equal(g.held,null);
 }
 const n=events.length;g.onclick(0,0);assert.equal(events.length,n);
});
console.log('PASS '+n+' behaviour / interaction groups');
