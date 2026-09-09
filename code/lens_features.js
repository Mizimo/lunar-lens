/* Track-independent temporal analysis. Sound roles, not instrument stems.
   24 inputs: eight bands, RMS/peak/mono/side, impact fast/slow/peak, nine DSP onset descriptors. */
var LensFeatures=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function smooth(a,b,dt,t){return a+(b-a)*(1-Math.exp(-dt/t));}
 function norm(x){return clamp(Math.pow(Math.max(0,x),.78),0,1);}
 // Causal local peaks of band-envelope novelty, NOT a stem separator or FFT SuperFlux.
 // Peak decisions use the threshold and support AT the peak (one analysis-frame delay).
 function Detector(base,compression,gap,decay,immediate){
  this.base=base;this.compression=compression;this.gap=gap;this.decay=decay;
  this.immediate=!!immediate;this.armed=true;this.releasePeak=0;
  this.previous=0;this.levelWindow=[];this.noveltyWindow=[];this.before=0;this.pending=null;this.noise=[];this.threshold=base;
  this.lastHit=-10;this.count=0;this.envelope=0;this.rise=0;this.level=0;this.peakTime=-10;this.reference=.04;this.strength=0;this.attackStart=-10;
 }
 Detector.prototype.step=function(level,time,dt,eligible,sensitivity,gap,nativeNovelty){
  var nativeTiming=nativeNovelty!==undefined,early=nativeTiming&&this.immediate,base=this.base*(nativeTiming&&!early?.68:1);
  // Measure the whole short attack, not whichever fraction landed in one UI poll.
  while(this.levelWindow.length&&time-this.levelWindow[0].t>.055)this.levelWindow.shift();
  var floor=this.previous;
  for(var w=0;w<this.levelWindow.length;w++){floor=Math.min(floor,this.levelWindow[w].v);}
  var rise=Math.max(0,Math.log(1+level*this.compression)-Math.log(1+floor*this.compression));
  if(nativeTiming)rise=nativeNovelty;
  while(this.noveltyWindow.length&&time-this.noveltyWindow[0].t>.10)this.noveltyWindow.shift();
  var valley=rise;for(var nv=0;nv<this.noveltyWindow.length;nv++)valley=Math.min(valley,this.noveltyWindow[nv].v);
  this.noveltyWindow.push({t:time,v:rise});
  var change=Math.max(0,level-floor),q=this.pending,hit=false;
  this.levelWindow.push({t:time,v:level,});
  if(rise<this.base*.35)this.attackStart=-10;
  else if(this.attackStart<0)this.attackStart=time;
  this.previous=level;this.level=level;this.rise=rise;
  this.reference=smooth(this.reference,Math.max(.015,level),dt,level>this.reference?.8:5);
  this.envelope*=Math.exp(-dt/this.decay);
  // A held bass has a non-zero periodic novelty floor. Rearm on release relative
  // to the accepted attack as well as the noise floor; never wait for bass silence.
  if(!this.armed)this.releasePeak=Math.max(this.releasePeak,rise);
  if(rise<this.threshold*.55||rise<this.releasePeak*.45)this.armed=true;
  var candidate=early?{rise:rise,level:level,reference:this.reference}:q;
  var crossing=early?this.armed&&eligible&&rise>this.threshold&&rise-valley>this.threshold:
   q&&q.rise>this.before&&q.rise>=rise&&q.rise>q.threshold&&q.eligible;
  if(crossing&&time-this.lastHit>=(gap||this.gap)){
   hit=true;this.armed=false;this.releasePeak=rise;this.lastHit=time;this.peakTime=early?time:q.time;this.count++;
   this.strength=0;
  }
  // An onset is immediate; allow its measured weight to mature through the next 65 ms.
  // This prevents a small first crest from defining the weight of a larger attack behind it.
  if(candidate&&time-this.lastHit<=.065){
   var contrast=1-Math.exp(-candidate.rise/.85);
   var weight=.4+.6*Math.sqrt(clamp(candidate.level/Math.max(.02,candidate.reference),0,1));
   var measured=contrast*weight;
   if(measured>this.strength){this.strength=measured;this.envelope=Math.max(this.envelope,measured);}
  }

  // Exclude accepted attacks and their first 90 ms of tail, cap all other novelty samples. Loudness is never the reference.
  // Median + MAD of the remaining 1.5 s rejects the influence of sparse large outliers.
  if(q&&!hit&&time-this.lastHit>.09)this.noise.push({t:q.time,v:Math.min(q.rise,base*1.5)});
  while(this.noise.length&&time-this.noise[0].t>1.5)this.noise.shift();
  var values=[],deviations=[],i;
  for(i=0;i<this.noise.length;i++)values.push(this.noise[i].v);
  values.sort(function(a,b){return a-b;});
  var median=values.length?values[Math.floor((values.length-1)*.5)]:0;
  for(i=0;i<values.length;i++)deviations.push(Math.abs(values[i]-median));
  deviations.sort(function(a,b){return a-b;});
  var mad=deviations.length?deviations[Math.floor((deviations.length-1)*.5)]:0;
  var target=clamp(median+3*mad,base,base*1.6)/Math.sqrt(sensitivity);
  this.threshold=smooth(this.threshold,target,dt,target>this.threshold?.8:.10);
  this.before=q?q.rise:0;
  this.pending={rise:rise,threshold:this.threshold,time:time,change:change,level:level,reference:this.reference,eligible:eligible&&(!nativeTiming||rise-valley>base*.6)&&(nativeTiming||(change>.0007&&this.attackStart>=0&&time-this.attackStart<=.10))};
  return hit;
 };
 Detector.prototype.snapshot=function(){return {energy:this.level,rise:this.rise,threshold:this.threshold,impact:this.envelope,strength:this.strength,count:this.count,peakTime:this.peakTime};};
 // Restore the complete 1.1 low-event decision. Keep 1.2's continuous weight
 // measurement separate: it may describe an accepted hit, never admit a new one.
 function LowImpactDetector(){
  this.previousLog=0;this.armed=true;this.recent=[];this.threshold=.14;
  this.lastHit=-10;this.weightUntil=-10;this.count=0;this.envelope=0;this.rise=0;this.peakTime=-10;this.reference=.04;this.strength=0;
 }
 LowImpactDetector.prototype.step=function(fast,ratio,time,dt,active,eligible,sensitivity,gap,nativeNovelty){
  var levelLog=Math.log(1+fast*100),rise=Math.max(0,levelLog-this.previousLog)*.02/dt;
  this.previousLog=levelLog;this.rise=rise;
  if(ratio<1.025||fast<.002)this.armed=true;
  var avg=0,variance=0,i;
  for(i=0;i<this.recent.length;i++)avg+=this.recent[i];avg/=Math.max(1,this.recent.length);
  for(i=0;i<this.recent.length;i++)variance+=Math.pow(this.recent[i]-avg,2);variance/=Math.max(1,this.recent.length);
  this.threshold=Math.max(.14,avg*1.5+Math.sqrt(variance)*.65)/Math.sqrt(sensitivity);
  var hit=eligible&&this.armed&&ratio>1.35&&rise>this.threshold&&time-this.lastHit>gap;
  this.recent.push(active?rise:0);if(this.recent.length>75)this.recent.shift();
  this.reference=smooth(this.reference,Math.max(.015,fast),dt,fast>this.reference?.8:5);
  this.envelope*=Math.exp(-dt/.18);
  if(hit){this.armed=false;this.lastHit=time;this.weightUntil=time+.065;this.peakTime=time;this.count++;this.strength=0;}
  if(time<=this.weightUntil){
   var contrast=1-Math.exp(-(nativeNovelty===undefined?rise:nativeNovelty)/.85);
   var weight=.4+.6*Math.sqrt(clamp(fast/Math.max(.02,this.reference),0,1));
   var measured=contrast*weight;
   if(measured>this.strength){this.strength=measured;this.envelope=Math.max(this.envelope,measured);}
  }
  return hit;
 };
 function Engine(){this.reset();}
 Engine.prototype.reset=function(){
  this.last=0;this.age=0;this.ref=.08;this.bandRef=[.035,.035,.035];this.prev=[0,0,0,0,0,0,0,0];
  this.hist=[];this.onsets=[];this.recent=[[],[],[]];this.lastHits=[-10,-10,-10];this.counts=[0,0,0];
  this.lastOnset=-10;this.lastTempo=0;this.tempo=0;this.confidence=0;this.phase=0;
  this.slow=0;this.energy=0;this.bands=[0,0,0];this.spectrum=[0,0,0,0,0,0,0,0];
  this.transients=[0,0,0];this.bandSupport=[0,0,0];this.body=0;this.midContour=.5;this.highIndex=0;this.width=0;this.bright=0;
  this.transient=0;this.pulse=0;this.count=0;this.raw=[];this.db=-100;this.crest=0;this.active=false;
  this.midWindows=[[],[],[],[]];this.midShape=[.25,.25,.25,.25];this.midFast=0;this.midSlow=0;
  this.phrase=0;this.bed=0;this.articulation=0;this.spectralMotion=0;this.persistence=0;
  this.previousRoles=[0,0,0,0,0];this.roleStates=["rest","rest","rest","rest","rest"];
  this.impactFallback=0;this.impactCooldown=0;
  this.detectors=[];for(var d=0;d<8;d++)this.detectors.push(new Detector([.12,.12,.10,.07,.065,.06,.055,.05][d],60,[.12,.12,.11,.10,.09,.08,.065,.065][d],[.18,.18,.16,.14,.13,.12,.08,.065][d]));
  this.lowDetector=new LowImpactDetector();this.bandDynamics=[];
  for(d=0;d<8;d++)this.bandDynamics.push(this.detectors[d].snapshot());
  this.impact={fast:0,slow:0,ratio:0,rise:0,threshold:0,support:0,peak:0};
 };
 Engine.prototype.step=function(values,time,sensitivity,impactSensitivity,impactGap){
  var a=[],i,j;for(i=0;i<24;i++)a[i]=clamp(isFinite(values[i])?Number(values[i]):0,0,8);
  var dt=this.last?clamp(time-this.last,.001,.2):.02;this.last=time;this.age+=dt;this.raw=a;
  var rms=a[8],active=rms>.00045;this.active=active;
  this.db=20*Math.log(Math.max(rms,.00001))/Math.LN10;
  this.crest=clamp(20*Math.log(Math.max(1,a[9]/Math.max(rms,.00001)))/Math.LN10,0,40);
  sensitivity=clamp(isFinite(sensitivity)?sensitivity:1,.35,2.5);
  if(active)this.ref=smooth(this.ref,Math.max(.018,rms*1.5),dt,rms>this.ref?.3:7);
  var gain=sensitivity/Math.max(.018,this.ref),energy=active?norm(rms*gain):0;
  this.energy=smooth(this.energy,energy,dt,energy>this.energy?.04:.24);
  this.slow=smooth(this.slow,this.energy,dt,energy>this.slow?3.5:5);
  var grouped=[Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]),Math.sqrt(a[3]*a[3]+a[4]*a[4]+a[5]*a[5]),Math.sqrt(a[6]*a[6]+a[7]*a[7])];
  // Reject filter skirts: a mid-frequency attack must not masquerade as a kick.
  this.bandSupport=[clamp((grouped[0]/Math.max(.003,rms)-.12)/.18,0,1),clamp((grouped[1]/Math.max(.003,rms)-.035)/.12,0,1),clamp((grouped[2]/Math.max(.003,rms)-.022)/.055,0,1)];
  for(i=0;i<3;i++){
   // Partial band adaptation preserves quiet bands without making every band full power.
   if(active)this.bandRef[i]=smooth(this.bandRef[i],Math.max(this.ref*.12,grouped[i]*1.7),dt,grouped[i]>this.bandRef[i]?1.2:8);
   var den=Math.max(.012,this.ref*.5+this.bandRef[i]*.5);
   var v=active?norm(grouped[i]*sensitivity/den)*this.bandSupport[i]:0;
   this.bands[i]=smooth(this.bands[i],v,dt,v>this.bands[i]?[.022,.035,.012][i]:[.18,.16,.055][i]);
  }
  var total=0,cent=0;for(i=0;i<8;i++){total+=a[i];cent+=a[i]*i;this.spectrum[i]=active?norm(a[i]*gain*1.5):0;}
  this.bright=smooth(this.bright,cent/Math.max(.000001,total)/7,dt,.18);
  this.width=smooth(this.width,active?a[11]/Math.max(.00001,a[10]+a[11]):0,dt,.25);
  var mids=a[3]+a[4]+a[5];
  this.midContour=smooth(this.midContour,mids>.0002?(a[4]*.45+a[5])/mids:.5,dt,.09);
  // Eight independent local-onset tracks plus the adjustable low-impact probe.
  // Level auto-gain above affects the drawing only, never a detector's novelty reference.
  var bandHits=[],flux=[0,0,0],maxHit=[0,0,0],d,sup;
  this.impactCooldown=Math.max(0,this.impactCooldown-dt);
  for(i=0;i<8;i++){
   d=this.detectors[i];sup=a[i]/Math.max(.003,rms);
   bandHits[i]=d.step(a[i],time,dt,active&&this.age>.12&&a[i]>.0015&&sup>[.13,.13,.10,.08,.06,.055,.045,.025][i],sensitivity,undefined,values.length>=24?a[15+i]:undefined);
   this.bandDynamics[i]=d.snapshot();j=i<3?0:i<6?1:2;
   flux[j]=Math.max(flux[j],d.rise);
   if(bandHits[i])maxHit[j]=Math.max(maxHit[j],d.envelope);
  }
  var fast=values.length>=15?a[12]:grouped[0];
  this.impactFallback=smooth(this.impactFallback,fast,dt,.09);
  var slowImpact=values.length>=15?a[13]:this.impactFallback;
  var ratio=fast/Math.max(.002,slowImpact),support=fast/Math.max(.003,rms);
  var lowHit=this.lowDetector.step(fast,ratio,time,dt,active&&this.age>=.12,active&&this.age>.12&&this.impactCooldown===0&&fast>.002&&support>.25,clamp(impactSensitivity||1,.4,2.5),impactGap||.16,values.length>=24?a[23]:undefined);
  // Keep three event latches for the five visual roles. No shared refractory across registers.
  // The low visual front follows the tunable probe; the three fixed low bands also articulate Body.
  var groupHits=[lowHit,maxHit[1]>0&&time-this.lastHits[1]>.10,maxHit[2]>0&&time-this.lastHits[2]>.065];
  for(i=0;i<3;i++){
   if(groupHits[i]){this.lastHits[i]=time;this.counts[i]++;this.count++;this.transients[i]=i===0?this.lowDetector.envelope:maxHit[i];}
   else this.transients[i]*=Math.exp(-dt/[.18,.13,.07][i]);
   if(time-this.lastHits[i]<=.085){
    var mature=i===0?this.lowDetector.envelope:i===1?Math.max(this.detectors[3].envelope,this.detectors[4].envelope,this.detectors[5].envelope):Math.max(this.detectors[6].envelope,this.detectors[7].envelope);
    this.transients[i]=Math.max(this.transients[i],mature);
   }
  }
  if(groupHits[2])this.highIndex=this.detectors[7].envelope>this.detectors[6].envelope?1:0;
  this.impact={fast:fast,slow:slowImpact,ratio:ratio,rise:this.lowDetector.rise,threshold:this.lowDetector.threshold,support:support,peak:values.length>=15?a[14]:a[9],impact:this.lowDetector.envelope,strength:this.lowDetector.strength,count:this.lowDetector.count,peakTime:this.lowDetector.peakTime};
  flux[0]=this.lowDetector.rise;
  var bodyTarget=this.bands[0]*(1-.2*this.transients[0]);
  this.body=smooth(this.body,bodyTarget,dt,bodyTarget>this.body?.095:.28);
  this.behaviour(a,dt);
  this.transient=Math.max.apply(Math,this.transients);
  var novelty=flux[0]+flux[1]*.25+flux[2]*.45;
  if((this.lastHits[0]===time||this.lastHits[2]===time)&&time-this.lastOnset>.14){this.lastOnset=time;this.onsets.push(time);}
  while(this.onsets.length&&time-this.onsets[0]>8)this.onsets.shift();
  this.hist.push({t:time,v:novelty});while(this.hist.length&&time-this.hist[0].t>8)this.hist.shift();
  if(active&&time-this.lastTempo>.5){this.lastTempo=time;this.estimate(time);}
  this.phase=(this.phase+dt*(this.tempo||90)/60)%1;
  if(this.lastHits[0]===time&&this.confidence>.48&&Math.min(this.phase,1-this.phase)<.22)this.phase=0;
  this.pulse=active&&this.confidence>.48?Math.exp(-this.phase*14)*this.confidence:0;
  if(!active){this.confidence*=Math.exp(-dt/.65);if(this.confidence<.08)this.tempo=0;}
  return this.snapshot();
 };
 Engine.prototype.resetImpact=function(){
  this.impactCooldown=.3;this.transients[0]=0;
  this.lowDetector.recent=[];this.lowDetector.armed=true;this.lowDetector.envelope=0;this.lowDetector.weightUntil=-10;
 };
 Engine.prototype.behaviour=function(a,dt){
  // A causal estimate of what a sound is DOING, not a voice/pad classifier.
  // Common loudness change cancels in spectral shape. Slow swells can stay beds.
  var i,mid=0,floor=0,motion=0;
  for(i=0;i<4;i++)mid+=a[i+2];
  this.midFast=smooth(this.midFast,mid,dt,.025);
  this.midSlow=smooth(this.midSlow,mid,dt,.24);
  for(i=0;i<4;i++){
   var shape=mid>.0005?a[i+2]/mid:this.midShape[i];
   motion+=Math.abs(shape-this.midShape[i]);this.midShape[i]=smooth(this.midShape[i],shape,dt,.22);
   var win=this.midWindows[i];win.push(a[i+2]);if(win.length>60)win.shift();
   var sorted=win.slice().sort(function(x,y){return x-y;});floor+=sorted[Math.floor((sorted.length-1)*.22)]||0;
  }
  var modulation=Math.abs(this.midFast-this.midSlow)/Math.max(.012,this.midSlow);
  var activity=this.active?clamp(motion*2.8+Math.max(0,modulation-.10)*1.25+this.transients[1]*.42,0,1):0;
  this.spectralMotion=smooth(this.spectralMotion,this.active?clamp(motion*2.8,0,1):0,dt,.10);
  this.articulation=smooth(this.articulation,activity,dt,activity>this.articulation?.025:.15);
  var foreground=this.bands[1]*this.articulation;
  this.phrase=smooth(this.phrase,foreground,dt,foreground>this.phrase?.035:.16);
  var persistence=this.active?clamp(floor/Math.max(.001,mid),0,1):0;
  this.persistence=smooth(this.persistence,persistence,dt,.40);
  var bedTarget=this.bands[1]*this.persistence*(1-.32*this.articulation);
  this.bed=smooth(this.bed,bedTarget,dt,bedTarget>this.bed?.40:.24);
  var roles=[this.transients[0],this.body,this.phrase,this.bed,Math.max(this.bands[2]*.5,this.transients[2])];
  for(i=0;i<5;i++){
   var delta=roles[i]-this.previousRoles[i],state="rest";
   if(roles[i]>.045)state=delta>.055?"attack":delta<-.015?"release":i===2&&this.articulation>.30?"moving":"sustain";
   this.roleStates[i]=state;this.previousRoles[i]=roles[i];
  }
 };
 Engine.prototype.estimate=function(time){
  if(this.hist.length<140||this.onsets.length<4||time-this.lastOnset>1.8){this.confidence*=.65;return;}
  var h=this.hist,start=Math.max(h[0].t,time-7.5),a=[],j=0;
  for(var t=start;t<=time;t+=.02){while(j+1<h.length&&h[j+1].t<t)j++;var q=h[j],r=h[Math.min(j+1,h.length-1)];a.push(q.v+(r.v-q.v)*clamp((t-q.t)/Math.max(.001,r.t-q.t),0,1));}
  var best=0,bestLag=0,n=a.length;
  for(var lag=17;lag<=60;lag++){
   var dot=0,aa=0,bb=0;for(var i=lag;i<n;i++){dot+=a[i]*a[i-lag];aa+=a[i]*a[i];bb+=a[i-lag]*a[i-lag];}
   var score=dot/Math.sqrt(Math.max(.0000001,aa*bb));
   var continuity=this.tempo?1+.055*Math.exp(-Math.pow((3000/lag-this.tempo)/12,2)):1;
   if(score*continuity>best){best=score*continuity;bestLag=lag;}
  }
  var confidence=clamp((best-.18)/.62,0,1);
  if(bestLag&&confidence>.28){var candidate=3000/bestLag;this.tempo=this.confidence>.5&&Math.abs(candidate-this.tempo)<12?this.tempo*.7+candidate*.3:candidate;}
  this.confidence=this.confidence*.55+confidence*.45;
 };
 Engine.prototype.snapshot=function(){return {bands:this.bands.slice(),spectrum:this.spectrum.slice(),roles:[this.transients[0],this.body,this.phrase,this.bed,Math.max(this.bands[2]*.5,this.transients[2])],impact:this.impact,bandDynamics:this.bandDynamics.slice(),behaviour:{phrase:this.phrase,bed:this.bed,articulation:this.articulation,motion:this.spectralMotion,persistence:this.persistence,states:this.roleStates.slice()},counts:this.counts.slice(),transients:this.transients.slice(),bandSupport:this.bandSupport.slice(),body:this.body,midContour:this.midContour,highIndex:this.highIndex,energy:this.energy,slow:this.slow,brightness:this.bright,width:this.width,transient:this.transient,pulse:this.pulse,bpm:this.tempo,confidence:this.confidence,db:this.db,crest:this.crest,active:this.active,count:this.count};};
 return {Engine:Engine,clamp:clamp,smooth:smooth};
})();
if(typeof module!=="undefined")module.exports=LensFeatures;
