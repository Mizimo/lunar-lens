// Decision parity with the archived 1.1 engine. This is a rollback test, not
// a perceptual kick benchmark and not a model of a finished musical mix.
const assert=require('node:assert/strict');
const Current=require('../code/lens_features.js'),Legacy=require('./reference/lens_features-v1.1.cjs');
let comparisons=0,hits=0;
for(const steps of [[.02],[.01,.033,.02,.04]]){
 const a=new Current.Engine(),b=new Legacy.Engine();let time=0,slow=0,seed=513;
 for(let i=0;i<5000;i++){
  const dt=steps[i%steps.length];time+=dt;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const p=time%7,gate=p<5.8?1:0;
  const fast=gate*(.05+.03*Math.sin(time*2.3)**2+.13*Math.exp(-(time%.43)/.04)+(seed/4294967296)*.012);
  slow+=(fast-slow)*(1-Math.exp(-dt/.09));
  const bands=[fast*.6,fast,.03*gate,.07*gate,.1*gate,.04*gate,.02*gate,.01*gate],rms=Math.hypot(...bands);
  const values=[...bands,rms,rms*1.6,rms,.02*gate,fast,slow,fast*1.5,...Array(9).fill((i%4)*.7)];
  if(i===1600||i===3500){a.resetImpact();b.resetImpact();}
  const sensitivity=i<2000?1:.7,gap=i<3000?.16:.233;
  const x=a.step(values,time,1,sensitivity,gap),y=b.step(values.slice(0,15),time,1,sensitivity,gap);
  assert.equal(x.counts[0],y.counts[0],'event mismatch at '+time);
  for(const k of ['ratio','rise','threshold'])assert.equal(x.impact[k],y.impact[k],k+' at '+time);
  comparisons++;
 }
 hits+=a.counts[0];
}
assert(hits>50,'Parity test must exercise accepted and rejected events');
console.log('PASS low rollback: '+comparisons+' decisions exactly match 1.1, including sensitivity, gap and resets.');
