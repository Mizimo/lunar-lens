const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../code/lens_measurements.js'),E=require('../code/lens_events.js'),P=require('../code/lens_presentation.js'),B=require('../code/lens_behaviours.js'),T=require('../code/lens_transition.js'),V=require('../code/lens_visual.js');
let passed=0;function test(name,fn){fn();passed++;console.log('✓ '+name);}
function frame(){return {counts:[0,0,0],transients:[0,0,0],roles:[0,.5,.4,.5,.2],bands:[.5,.7,.2],spectrum:Array(8).fill(.2),body:.5,behaviour:{phrase:.4,bed:.5,articulation:.5,persistence:.7},energy:.6,slow:.5,active:true};}
function measured(t,extra={}){return {time:t,active:true,level:{valid:true,rmsFast:.1,momentaryDb:-20,shortTermDb:-20},spectrum:{valid:true,entropy:.35,flatness:.01,change:0,spreadHz:500},space:{balance:0,correlation:1,sideRatio:.1},bandPowerShape:[0,.8,.2,0,0,0,0,0],...extra};}
test('Measurements preserve signed stereo values and reject stale FFT frames',()=>{
 const m=new M.Engine();m.contextual([.1,.05,-1,-.6,.1],1);m.spectrum([.1,.05,.3,.1,.3,.5,5],1);
 const f=m.step(Array(24).fill(.1),1,48000,true);assert.equal(f.spectrum.centroidHz,2400);assert.equal(f.space.correlation,-1);assert.equal(f.space.balance,-.6);assert(Math.abs(f.level.momentaryDb+20)<1e-9);
 m.spectrum([.1,.05,.3,.1,.3,.5,5],1.4);assert.equal(m.step([],1.4,48000,false).spectrum.valid,false);m.reset();assert.equal(m.step([],2,48000,false).spectrum.valid,false);
});
test('Event IDs are deduplicated, simultaneous bands share one density attack, reset changes epoch',()=>{
 const e=new E.Engine(),f=frame();f.counts=[1,1,1];f.transients=[.4,.6,.8];e.step(measured(.02),f,.02);e.step(measured(.04),f,.04);
 assert.equal(e.totals.onset,3);assert.equal(e.onsets.length,1);assert.equal(new Set(e.events.map(x=>x.id)).size,e.events.length);const old=e.epoch;e.reset();assert(e.epoch>old);assert.equal(e.events.length,0);
});
test('Persistent timbre change can emit a structural candidate at unchanged loudness',()=>{
 const e=new E.Engine(),f=frame();for(let i=1;i<=650;i++){
  const t=i*.02,m=measured(t);if(t>6){m.bandPowerShape=[0,0,0,0,.1,.2,.6,.1];m.spectrum.entropy=.7;}e.step(m,f,t);
 }
 assert.equal(e.totals['structure.change'],1);assert(e.lastBoundary>6.4&&e.lastBoundary<8);
});
test('A gain-only step cannot masquerade as structure, brief edits are not sustained boundaries',()=>{
 for(const kind of ['gain','short']){const e=new E.Engine();for(let i=1;i<=650;i++){
  const t=i*.02,m=measured(t);if(t>6&&kind==='gain')m.level={...m.level,momentaryDb:-8,shortTermDb:-8};
  if(t>6&&t<6.16&&kind==='short'){m.bandPowerShape=[0,0,0,0,0,0,.7,.3];m.spectrum.entropy=.8;}e.step(m,frame(),t);
 }assert.equal(e.totals['structure.change']||0,0,kind);}
});
test('Silence does not create onsets or structure, event memory remains bounded',()=>{
 const e=new E.Engine();for(let i=1;i<3000;i++){const m=measured(i*.02,{active:false});e.step(m,{...frame(),behaviour:{},energy:0},i*.02);}assert.equal(e.totals.onset||0,0);assert.equal(e.totals['structure.change']||0,0);assert(e.events.length<=96);
});
test('Presentation events act once, survive different render cadence, and clear on epoch',()=>{
 const p=new P.Engine(),q={epoch:1,time:1,state:{},events:[{id:'1:1',type:'structure.change',time:1,strength:.8}]};
 let a=p.step(frame(),q,.02,1);assert.equal(a.eventVisual.reframe,.8);let b=p.step(frame(),q,.02,1);assert(b.eventVisual.reframe<.8);assert.equal(p.direction,1);
 assert.equal(p.step(frame(),{...q,epoch:2,events:[]},.02,1).eventVisual.reframe,0);
});
test('Role settings are independent; default analysis is identical and masks affect only chosen role',()=>{
 const settings=B.defaults(),f=frame(),raw=Array(24).fill(.1);assert.deepEqual(B.apply(f,raw,settings),f);
 settings[2].bands=[];settings[2].sensitivity=2;let changed=B.apply(f,raw,settings);assert.equal(changed.roles[2],0);assert.equal(changed.roles[3],f.roles[3]);assert.deepEqual(changed.counts,f.counts);
 assert.deepEqual(settings[3],B.defaults()[3]);
});
test('A custom BODY can follow a high register while default BED stays unchanged',()=>{
 const e=new B.Engine(),settings=B.defaults(),raw=Array(24).fill(0);settings[1].bands=[6,7];raw[6]=.15;
 const f={...frame(),roles:[0,0,0,.3,.3],body:0,behaviour:{phrase:0,bed:.3,articulation:0,persistence:.7}};
 let a;for(let i=1;i<200;i++)a=e.step(f,raw,settings,i*.02);
 assert(a.body>.4);assert.equal(a.behaviour.bed,.3);assert.equal(a.counts[0],f.counts[0]);
});
test('Transition starts at the displayed image, retargets continuously, reaches endpoint and respects zero duration',()=>{
 const t=new T.Engine(),a=Array.from({length:64},()=>[.4,.1,0]),b=Array.from({length:64},()=>[0,.2,.5]);
 assert.deepEqual(t.step(a,'a',.02,.85,0),a);assert.deepEqual(t.step(b,'b',.02,.85,1),a);
 for(let i=0;i<15;i++)t.step(b,'b',.02,.85,1);const middle=t.frame;
 assert.deepEqual(t.step(a,'c',.02,.85,2),middle);
 for(let i=0;i<50;i++)t.step(a,'c',.02,.85,2);assert.deepEqual(t.frame,a);assert.equal(t.active,false);
 assert.deepEqual(t.step(b,'d',.02,0,0),b);
});
test('Impacts and touch remain immediate during transitions; blackout cannot resurrect the old frame',()=>{
 const v=new V.Engine(),f=frame(),p={scene:0,palette:0,brightness:.55,trails:.25,detail:.55,transition:1,roles:B.defaults()};
 for(let i=0;i<30;i++)v.step(f,.02,p);v.step(f,.02,{...p,scene:1});v.touch(11,127);
 const out=v.step({...f,counts:[1,0,0],transients:[.9,0,0]},.02,{...p,scene:1});assert(out[0]>20);assert(v.impacts.length>0);
 assert(v.step(f,.02,{...p,scene:2,black:true}).every(x=>x===0));v.clear();assert(v.step({...f,roles:[0,0,0,0,0],bands:[0,0,0],body:0,behaviour:{}},.02,{...p,scene:2}).every(x=>x===0));
});
test('Every role width and gain changes only its selected layer, with finite output',()=>{
 for(let role=0;role<5;role++){
  const a=new V.Engine(),b=new V.Engine(),rs=B.defaults(),p={scene:0,palette:0,brightness:.8,trails:.2,detail:.7,transition:0,focus:role+1,roles:rs};
  let aa,bb;for(let i=0;i<60;i++){const f={...frame(),counts:[i,i,i],transients:[.8,.7,.8]};aa=a.step(f,.02,p);const changed=B.defaults();changed[role].gain=0;bb=b.step(f,.02,{...p,roles:changed});}
  assert(aa.some(x=>x>0),'visible role '+role);assert(bb.every(x=>x===0),'muted role '+role);
 }
});
test('Role width changes horizontal geometry without changing measurement or other role settings',()=>{
 const f=frame(),saved=JSON.stringify(f),settings=B.defaults();settings[3].width=1.7;
 const a=new V.Engine(),b=new V.Engine(),params={scene:1,palette:0,brightness:.6,trails:.25,detail:.5,focus:4,transition:0};let aa,bb;
 for(let i=0;i<90;i++){aa=a.step(f,.02,{...params,roles:B.defaults()});bb=b.step(f,.02,{...params,roles:settings});}
 assert.notDeepEqual(aa,bb);assert.equal(JSON.stringify(f),saved);assert.equal(settings[2].width,1);
});
test('Generated spectral and contextual buses are before effects; they do not replace the low bus',()=>{
 const patch=JSON.parse(fs.readFileSync('patchers/Lunar Lens.maxpat')).patcher,lines=patch.lines.map(x=>x.patchline);
 for(const target of ['context','spectral'])for(let c=0;c<2;c++)for(const source of ['file'+c,'live'+c])assert(lines.some(l=>l.source[0]===source&&l.destination[0]===target&&l.destination[1]===c));
 assert(lines.find(l=>l.source[0]==='poll'&&l.destination[0]==='trig').order===2);
 const pfft=JSON.parse(fs.readFileSync('patchers/lens_spectral.maxpat')).patcher;assert(pfft.boxes.some(x=>x.box.text==='fftin~ 2'));assert(pfft.boxes.some(x=>x.box.text==='out 1'));
});
console.log('PASS '+passed+' event, measurement, role and transition groups');
