// Known onset times test behaviour, not implementation details. Optional old engine comparison.
const assert=require('node:assert/strict');
const F=require(process.env.LENS_FEATURES||'../code/lens_features.js');
let n=0;function test(name,fn){fn();n++;console.log('✓ '+name);}
function run(signal,dt=.02,seconds=16){
 const e=new F.Engine(),events=[[],[],[]],perBand=Array.from({length:8},()=>[]),frames=[];let slow=0,counts=[0,0,0],bc=Array(8).fill(0);
 for(let i=1;i<=Math.round(seconds/dt);i++){
  const time=i*dt,{spec,fast=spec[1],rms=Math.max(.0001,Math.hypot(...spec))}=signal(time);
  slow+=(fast-slow)*(1-Math.exp(-dt/.09));
  const s=e.step([...spec,rms,rms*1.5,rms,0,fast,slow,fast*1.5],time,1,1,.16);
  s.counts.forEach((c,j)=>{if(c>counts[j])events[j].push(time);});counts=s.counts;
  if(s.bandDynamics)s.bandDynamics.forEach((b,j)=>{if(b.count>bc[j])perBand[j].push(time);bc[j]=b.count;});
  frames.push({time,...s});
 }
 return {events,perBand,frames};
}
function low(fast){return {spec:[0,fast,0,0,0,0,0,0],fast};}
function pulses(t,onsets,amplitude=.05,tau=.035){return onsets.reduce((v,on)=>v+(t>=on?amplitude*Math.exp(-(t-on)/tau):0),0);}
function match(events,onsets,tolerance=.081){return onsets.filter(t=>events.some(x=>x>=t-.001&&x-t<=tolerance)).length;}
const known=Array.from({length:16},(_,i)=>2+i*.5);
test('Fixed low band retains small accents; the rolled-back Impact respects its 1.35 energy gate',()=>{
 const r=run(t=>low(.16+pulses(t,known,.035)));
 assert.equal(match(r.perBand[1],known),known.length);
 assert.equal(r.events[0].length,0);
});
const before=Array.from({length:32},(_,i)=>1+i*.2),after=Array.from({length:12},(_,i)=>7.4+i*.5);
test('Fixed band dynamics retain following small accents after a dense passage',()=>{
 const r=run(t=>low(.16+pulses(t,before,.15)+pulses(t,after,.035)));
 assert.equal(match(r.perBand[1],before),before.length);
 assert.equal(match(r.perBand[1],after),after.length,JSON.stringify(r.events[0]));
 assert.equal(r.perBand[1].filter(t=>t>7.3).length,after.length);
});
test('All eight registers latch their own onsets; simultaneous bass and treble do not inhibit one another',()=>{
 for(let band=0;band<8;band++){
  const r=run(t=>{let spec=Array(8).fill(0);spec[band]=.045+pulses(t,known,.045);return {spec,fast:band<3?spec[band]:0};});
  assert(r.frames[0].bandDynamics,'Missing per-band dynamics');
  assert.equal(match(r.perBand[band],known),known.length,'band '+band);
  r.perBand.forEach((ev,j)=>{if(j!==band)assert.equal(ev.length,0);});
 }
 const both=run(t=>{let p=pulses(t,known,.12);return {spec:[0,.10+p,0,0,0,0,0,.10+p],fast:.10+p};});
 assert.equal(match(both.events[0],known),16);assert.equal(match(both.events[2],known),16);
});
test('Slow swells and small periodic level modulation do not become repeated impacts',()=>{
 const r=run(t=>low(.16*(1+.05*Math.sin(t*2*Math.PI*5))));
 assert.equal(r.events[0].length,0);
 const swell=run(t=>low(.2*Math.sin(Math.PI*(t%4)/4)**2));assert.equal(swell.events[0].length,0);
});
test('Fixed band onset peaks remain stable across analysis update rates',()=>{
 for(const dt of [.01,.02,.025,.033]){
  const r=run(t=>low(.16+pulses(t,known,.09,.08)),dt);
  assert.equal(match(r.perBand[1],known,.10),known.length,dt+' '+JSON.stringify(r.events[0]));
 }
 const ramp=run(t=>low(t<2?0:t<2.1?(t-2)*2:t<4?.2:0));assert.equal(ramp.perBand[1].length,1);
});
test('Soft, medium and heavy accents retain continuous ordered strengths in every register',()=>{
 for(let band=0;band<8;band++){
  const r=run(t=>{let spec=Array(8).fill(0);spec[band]=.08+pulses(t,[2],.025)+pulses(t,[4],.065)+pulses(t,[6],.16);return {spec,fast:band<3?spec[band]:0};});
  const strengths=[2,4,6].map(t=>Math.max(...r.frames.filter(f=>f.time>=t&&f.time<t+.15).map(f=>f.bandDynamics[band].impact)));
  assert(strengths[0]>.03&&strengths[1]>strengths[0]*1.4&&strengths[2]>strengths[1]*1.3,band+' '+strengths);
 }
});
test('Changing detection sensitivity does not turn the same accepted accent into a heavier hit',()=>{
 let peaks=[];
 for(const sensitivity of [.8,1,1.6]){
  const e=new F.Engine();let slow=0,peak=0;
  for(let i=1;i<=160;i++){let t=i*.02,fast=.10+pulses(t,[2],.08);slow+=(fast-slow)*.2;
   const s=e.step([0,fast,0,0,0,0,0,0,fast,fast*1.5,fast,0,fast,slow,fast*1.5],t,1,sensitivity,.16);
   if(t>=2)peak=Math.max(peak,s.transients[0]);
  }peaks.push(peak);
 }
 assert(Math.max(...peaks)-Math.min(...peaks)<.001,peaks.join(','));assert(peaks[0]>.1);
});
test('Impact weight controls visible energy and lifetime in all six compositions',()=>{
 const V=require('../code/lens_visual.js');
 for(let scene=0;scene<6;scene++){
  const results=[.12,.35,.75].map(strength=>{
   let e=new V.Engine(),sum=0,last=0;
   for(let i=0;i<22;i++){
    const a=e.step({bands:[0,0,0],body:0,behaviour:{phrase:0,bed:0,articulation:0},counts:[1,0,0],transients:[strength,0,0],energy:0,slow:0,width:0},.033,{scene,focus:1,brightness:.55,bassWeight:1.2,trails:.25,detail:.55});
    const power=a.reduce((s,x)=>s+x,0);sum+=power;if(power>0)last=i;
   }return {sum,last};
  });
  assert(results[1].sum>results[0].sum*1.5&&results[2].sum>results[1].sum*1.5,JSON.stringify({scene,results}));
  assert(results[2].last>results[0].last);
 }
});
test('Steady DSP novelty from a held chord cannot turn tiny numerical peaks into new attacks',()=>{
 const e=new F.Engine();let events=[];for(let i=1;i<=600;i++){
  const t=i*.02,spec=[0,0,0,0,.08,0,0,0],novelty=Array(9).fill(0);
  novelty[4]=.085*(1+.001*Math.sin(i*.7))+pulses(t,[3,5,7],.20,.03);
  const f=e.step([...spec,.1,.14,.1,0,0,0,0,...novelty],t,1,1,.16);
  if(f.counts[1]>events.length)events.push(t);
 }
 assert.equal(events.length,3,JSON.stringify(events));assert.equal(match(events,[3,5,7]),3);
});
test('Native low attacks retain immediate rendering when the restored energy gate is satisfied',()=>{
 const e=new F.Engine();let counts=0,events=[];
 for(let i=1;i<400;i++){
  const t=i*.02,attack=pulses(t,[2,4,6],.7,.04),spec=[0,.12,0,0,0,0,0,0];
  const native=Array(9).fill(0);native[8]=.13+attack;
  const f=e.step([...spec,.15,.2,.15,0,.12+attack*.12,.12,.18,...native],t,1,1,.16);
  if(f.counts[0]>counts){events.push(t);assert(f.transients[0]>.1);}
  counts=f.counts[0];
 }
 assert.deepEqual(events,[2,4,6]);
});
test('An impact has a visible strike in its first frame in every composition',()=>{
 const V=require('../code/lens_visual.js');
 for(let scene=0;scene<6;scene++){
  const e=new V.Engine(),powers=[];
  for(let i=0;i<9;i++){
   const a=e.step({bands:[0,0,0],body:0,behaviour:{phrase:0,bed:0,articulation:0},counts:[1,0,0],transients:[.3*Math.exp(-i*.033/.18),0,0],energy:0,slow:0,width:0},.033,{scene,focus:1,brightness:.55,bassWeight:1.2,trails:.25,detail:.55});
   powers.push(a.reduce((s,x)=>s+x,0));
  }
  assert(powers[0]>50);assert.equal(powers[0],Math.max(...powers),'scene '+scene+' '+powers);
 }
});
test('A held DSP peak and a large short jump cannot bypass the restored low energy gate',()=>{
 const e=new F.Engine();
 for(let i=1;i<=60;i++)e.step([0,.01,0,0,0,0,0,0,.02,.03,.02,0,.01,.01,.02,...Array(9).fill(0)],i*.02,1,1,.16);
 const f=e.step([0,.04,0,0,0,0,0,0,.07,.09,.07,0,.045,.047,.048,...Array(8).fill(0),3.73],1.25,1,1,.16);
 assert(f.impact.ratio<1);assert.equal(f.counts[0],0);assert.equal(f.transients[0],0);
});
if(require.main===module)console.log('PASS '+n+' independent dynamics groups');
module.exports={run,low,pulses,match,known,before,after};
