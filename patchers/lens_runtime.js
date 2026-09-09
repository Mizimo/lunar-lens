// GENERATED: edit scripts/controller-core.js and code/*.js, then npm run build.
autowatch=1;inlets=1;outlets=3;

/* bundled lens_protocol.js */
/* Novation Launchpad Pro MK3, official Programmer's Reference pp. 6, 12-13, 18-19. */
var MoonProtocol=(function(){
    var header=[240,0,32,41,2,14];
    function sysex(body){return header.concat(body,[247]);}
    function pad(x,y){return 11+x+y*10;} // bottom-left origin
    function xy(n){var x=n%10-1,y=Math.floor(n/10)-1;return x>=0&&x<8&&y>=0&&y<8?[x,y]:null;}
    function rgb(entries){var b=[3];for(var i=0;i<entries.length;i++){var e=entries[i];b.push(3,e[0],Math.max(0,Math.min(127,Math.round(e[1]))),Math.max(0,Math.min(127,Math.round(e[2]))),Math.max(0,Math.min(127,Math.round(e[3]))));}return sysex(b);}
    var ids=[];for(var y=0;y<8;y++)for(var x=0;x<8;x++)ids.push(pad(x,y));
    for(x=90;x<=99;x++)ids.push(x);for(x=1;x<=8;x++)ids.push(x);for(x=101;x<=108;x++)ids.push(x);
    for(y=1;y<=8;y++){ids.push(y*10);ids.push(y*10+9);}
    return {header:header,pad:pad,xy:xy,ids:ids,sysex:sysex,rgb:rgb,programmer:sysex([14,1]),live:sysex([14,0]),noteLayout:sysex([0,4,0,0]),inquiry:[240,126,127,6,1,247],layout:sysex([0]),blackout:function(){return rgb(ids.map(function(n){return[n,0,0,0];}));}};
})();
if(typeof module!=="undefined")module.exports=MoonProtocol;


/* bundled lens_features.js */
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


/* bundled lens_measurements.js */
/* Measurement boundary: physical units and freshness, no visual decisions.
   Raw v1.2.1 detector inputs remain untouched and are not normalised here. */
var LensMeasurements=(function(){
 var edges=[30,50,70,100,140,200,280,410,600,950,1500,2300,3500,5100,7500,11000,16000];
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function number(x,fallback){return typeof x==='number'&&isFinite(x)?x:fallback;}
 function db(x){return 20*Math.log(Math.max(.00001,x))/Math.LN10;}
 function Engine(){this.reset();}
 Engine.prototype.reset=function(){this.spectral=null;this.context=null;this.result=null;this.lastSerial=-1;this.freshAt=-10;this.spatialSlow=[];this.lastTime=0;};
 Engine.prototype.spectrum=function(a,t){
  if(a.length<7||!a.every(function(x){return typeof x==='number'&&isFinite(x);}))return;
  if(a[6]!==this.lastSerial){this.freshAt=t;this.lastSerial=a[6];}
  this.spectral=a.slice();
 };
 Engine.prototype.contextual=function(a,t){if(a.length>=5){this.context={time:t,values:a.map(function(x){return number(x,0);})};}};
 Engine.prototype.step=function(a,t,sampleRate,active){
  var valid=this.spectral&&t-this.freshAt<.18,cv=this.context&&t-this.context.time<.18;
  var s=valid?this.spectral:[0,0,0,0,0,0,0],c=cv?this.context.values:[0,0,0,0,0];
  var sr=number(sampleRate,44100),bands=[],sum=0,i;
  for(i=0;i<8;i++){bands[i]=Math.pow(Math.max(0,number(a[i],0)),2);sum+=bands[i];}
  var shape=bands.map(function(v){return v/Math.max(.00000001,sum);});
  var dt=this.lastTime?clamp(t-this.lastTime,.001,.2):.02;this.lastTime=t;
  var spatialValid=!!valid&&s.length>=55,spatial=[],spatialTotal=0,totals=[0,0,0];
  for(i=0;i<16;i++){
   var values=[],steady=[],movement=[];
   for(var ch=0;ch<3;ch++){
    var ix=i*3+ch,p=spatialValid?Math.max(0,s[7+ix]):0,prior=this.spatialSlow[ix];
    if(prior===undefined)prior=p;
    this.spatialSlow[ix]=prior+(p-prior)*(1-Math.exp(-dt/.65));
    values[ch]=p;steady[ch]=Math.min(p,this.spatialSlow[ix]);movement[ch]=Math.max(0,p-this.spatialSlow[ix]);
    totals[ch]+=p;spatialTotal+=p;
   }
   spatial.push({loHz:edges[i],hiHz:Math.min(edges[i+1],sr*.5),power:values,steadyPower:steady,movingPower:movement});
  }
  this.result={schemaVersion:2,time:t,sampleRate:sr,active:!!active,
   spectrum:{valid:!!valid,frame:s[6],age:Math.max(0,t-this.freshAt),windowSamples:2048,hopSamples:512,
    centroidHz:s[0]*sr*.5,spreadHz:s[1]*sr*.5,flatness:s[2],change:s[3],concentration:s[4],entropy:s[5]},
   level:{valid:!!cv,rmsFast:Math.max(0,number(a[8],0)),momentaryDb:db(c[0]),shortTermDb:db(c[1]),
    crestDb:clamp(db(Math.max(.00001,number(a[9],0)))-db(Math.max(.00001,number(a[8],0))),0,40)},
   space:{valid:!!cv,correlation:clamp(c[2],-1,1),balance:clamp(c[3],-1,1),
    sideRatio:clamp(number(a[11],0)/Math.max(.00001,number(a[10],0)+number(a[11],0)),0,1)},
   stereoSpectrum:{valid:spatialValid,edgesHz:edges.slice(),bands:spatial,totalPower:spatialTotal,totals:totals,smoothingMs:80,centreMethod:"balanced-phase-agreement",units:"relative FFT power"},
   waveform:{zeroCrossingRate:clamp(c[4],0,1),valid:!!cv},bandPowerShape:shape};
  return this.result;
 };
 return {Engine:Engine,edges:edges};
})();
if(typeof module!=="undefined")module.exports=LensMeasurements;


/* bundled lens_behaviours.js */
/* Behaviour controls operate before event interpretation and visual mapping.
   The low probe keeps its dedicated DSP frequency range. Other roles use the
   measured overlapping filter-bank bands: a coarse analysis mask, not an EQ. */
var LensBehaviours=(function(){
 var masks=[[0,1],[0,1,2],[3,4,5],[3,4,5],[6,7]];
 function defaults(){return masks.map(function(b){return {sensitivity:1,gain:1,width:1,release:1,bands:b.slice()};});}
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function power(raw,bands){var sum=0;for(var i=0;i<bands.length;i++)sum+=Math.pow(raw[bands[i]]||0,2);return sum;}
 function follow(a,b,dt,tau){return a+(b-a)*(1-Math.exp(-dt/tau));}
 function Engine(){this.reset();}
 Engine.prototype.reset=function(){this.time=0;this.roles=[];for(var i=0;i<5;i++)this.roles.push({mask:'',fast:0,slow:0,shape:[],history:[],reference:.06,level:0,counts:[],count:0,cooldown:.3,lastHit:-10});};
 Engine.prototype.step=function(features,raw,settings,time){
  var dt=this.time?clamp(time-this.time,.001,.2):.02;this.time=time;
  var f=apply(features,raw,settings),names=['impact','body','phrase','bed','detail'];f.counts=f.counts.slice();
  for(var role=1;role<5;role++){
   var cfg=settings[role],q=this.roles[role],key=cfg.bands.join(),same=key===masks[role].join(),sum=0,motion=0;
   if(key!==q.mask){q.mask=key;q.history=[];q.shape=[];q.cooldown=.3;q.count=features.counts[role===4?2:1];q.counts=(features.bandDynamics||[]).map(function(b){return b.count;});}
   var level=Math.sqrt(power(raw,cfg.bands));q.fast=follow(q.fast,level,dt,.025);q.slow=follow(q.slow,level,dt,.24);
   if(features.active)q.reference=follow(q.reference,Math.max(.015,level*1.6),dt,level>q.reference?.5:6);
   for(var j=0;j<cfg.bands.length;j++)sum+=raw[cfg.bands[j]]||0;
   for(j=0;j<cfg.bands.length;j++){
    var value=(raw[cfg.bands[j]]||0)/Math.max(.00001,sum),prior=q.shape[j]===undefined?value:q.shape[j];
    motion+=Math.abs(value-prior);q.shape[j]=follow(prior,value,dt,.22);
   }
   q.history.push({t:time,v:level});while(q.history.length&&time-q.history[0].t>1.2)q.history.shift();
   var sorted=q.history.map(function(v){return v.v;}).sort(function(a,b){return a-b;}),floor=sorted[Math.floor((sorted.length-1)*.22)]||0;
   var articulation=clamp(motion*2.8+Math.max(0,Math.abs(q.fast-q.slow)/Math.max(.008,q.slow)-.1)*1.25,0,1);
   var persistence=clamp(floor/Math.max(.001,level),0,1),energy=features.active?clamp(Math.pow(level/Math.max(.018,q.reference)*cfg.sensitivity,.78),0,1):0;
   var attack=0,hit=false;for(j=0;j<cfg.bands.length;j++){
    var n=cfg.bands[j],d=(features.bandDynamics||[])[n];if(!d)continue;attack=Math.max(attack,d.impact);if(d.count>(q.counts[n]||0))hit=true;q.counts[n]=d.count;
   }
   q.cooldown=Math.max(0,q.cooldown-dt);
   if(!same){
    var target=role===1?energy:role===2?energy*articulation:role===3?energy*persistence*(1-.32*articulation):Math.max(energy*.5,attack);
    q.level=follow(q.level,target,dt,target>q.level?(role===3?.4:.035):.2);
    f.roles[role]=q.level;
    if(role===1)f.body=q.level;
    if(role===2){f.behaviour.phrase=q.level;f.behaviour.articulation=articulation;}
    if(role===3){f.behaviour.bed=q.level;f.behaviour.persistence=persistence;}
    if(role===4)f.bands[2]=energy;
    if(role===2||role===4){
     var group=role===2?1:2;
     if(hit&&q.cooldown===0&&time-q.lastHit>(role===2?.1:.065)){q.count++;q.lastHit=time;}
     f.counts[group]=q.count;f.transients[group]=q.cooldown?0:attack;
    }
   }else q.level=f.roles[role];
  }
  return f;
 };
 function apply(features,raw,settings){
  var f=Object.assign({},features),b=Object.assign({},f.behaviour),roles=f.roles.slice(),factors=[1,1,1,1,1];
  for(var i=1;i<5;i++){
   var p=settings[i],base=power(raw,masks[i]),selected=power(raw,p.bands);
   var same=p.bands.join()===masks[i].join();
   factors[i]=p.sensitivity*(same?1:clamp(Math.sqrt(selected/Math.max(.00000001,base)),0,1.5));
   roles[i]=clamp(roles[i]*factors[i],0,1);
  }
  f.body=roles[1];b.phrase=roles[2];b.bed=roles[3];f.behaviour=b;f.roles=roles;
  f.bands=f.bands.slice();f.bands[2]=clamp(f.bands[2]*factors[4],0,1);
  f.transients=f.transients.slice();f.transients[1]=clamp(f.transients[1]*factors[2],0,1);f.transients[2]=clamp(f.transients[2]*factors[4],0,1);
  return f;
 }
 return {Engine:Engine,defaults:defaults,apply:apply,masks:masks};
})();
if(typeof module!=="undefined")module.exports=LensBehaviours;


/* bundled lens_events.js */
/* Causal acoustic interpretation. No colours, geometry, MIDI or song metadata.
   Event confidence is a heuristic score, not a calibrated probability. */
var LensEvents=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function follow(a,b,dt,tau){return a+(b-a)*(1-Math.exp(-dt/tau));}
 function Engine(){this.epoch=0;this.reset();}
 Engine.prototype.reset=function(){
  this.epoch++;this.serial=0;this.time=0;this.age=0;this.lastCounts=[0,0,0];this.events=[];this.totals={};
  this.onsets=[];this.lastCombined=-10;this.density=0;this.novelty=0;this.reference=null;this.previousTexture=null;
  this.candidateAt=-1;this.lastBoundary=-10;this.lastTexture=-10;this.roleOn=[false,false];this.roleWait=[0,0];
  this.sound=false;this.soundWait=0;this.dynamic='steady';this.dynamicWait=0;this.state={};
 };
 Engine.prototype.emit=function(type,t,strength,confidence,evidence,extra){
  var event={id:this.epoch+':'+(++this.serial),type:type,time:t,observedTime:t,
   strength:clamp(strength,0,1),confidence:clamp(confidence,0,1),evidence:evidence};
  if(extra)for(var k in extra)event[k]=extra[k];
  this.events.push(event);this.totals[type]=(this.totals[type]||0)+1;return event;
 };
 Engine.prototype.step=function(m,f,t){
  var dt=this.time?clamp(t-this.time,.001,.2):.02;this.time=t;this.age+=dt;
  var i,changed=false,counts=f.counts||[0,0,0];
  for(i=0;i<3;i++)if(counts[i]>this.lastCounts[i]){
   this.emit('onset',t,(f.transients||[])[i]||0,i===0?.8:.6,{detector:i===0?'low-v1.1':'band-local-peak'},{role:['impact','phrase','detail'][i],detectorCount:counts[i]});changed=true;
  }
  this.lastCounts=counts.slice();
  // Coincident band onsets count as one attack for density, not three beats.
  if(changed&&t-this.lastCombined>.085){this.onsets.push(t);this.lastCombined=t;}
  while(this.onsets.length&&t-this.onsets[0]>2)this.onsets.shift();
  this.density=follow(this.density,this.onsets.length/2,dt,.35);
  var b=f.behaviour||{},roleValues=[b.phrase||0,b.bed||0];
  for(i=0;i<2;i++){
   var wanted=this.roleOn[i]?roleValues[i]>.06:roleValues[i]>.18;
   this.roleWait[i]=wanted!==this.roleOn[i]?this.roleWait[i]+dt:0;
   if(this.roleWait[i]>(wanted?.16:.4)){
    this.roleOn[i]=wanted;this.roleWait[i]=0;
    this.emit(wanted?'role.enter':'role.exit',t,wanted?roleValues[i]:.3,.6,{articulation:b.articulation||0,persistence:b.persistence||0},{role:i?'bed':'phrase'});
   }
  }
  var sounding=m.active;
  this.soundWait=sounding!==this.sound?this.soundWait+dt:0;
  if(this.soundWait>(sounding?.10:.35)){
   this.sound=sounding;this.soundWait=0;
   this.emit(sounding?'sound.enter':'sound.exit',t,sounding?f.energy:.3,.9,{rms:m.level.rmsFast});
  }
  var trend=m.level.valid?clamp((m.level.momentaryDb-m.level.shortTermDb)/8,-1,1):0;
  var desired=trend>.27?'building':trend<-.32?'releasing':'steady';
  this.dynamicWait=desired!==this.dynamic?this.dynamicWait+dt:0;
  if(this.age>3&&m.active&&this.dynamicWait>.65){
   this.dynamic=desired;this.dynamicWait=0;
   if(desired!=='steady')this.emit('dynamics.'+(desired==='building'?'rise':'fall'),t,Math.abs(trend),.65,{momentaryDb:m.level.momentaryDb,shortTermDb:m.level.shortTermDb});
  }
  var s=m.spectrum,shape=m.bandPowerShape,ref=this.reference,change=0,widthChange=0,levelChange=0,textureChange=0;
  if(m.active&&s.valid){
   var vector=shape.concat([s.entropy,s.flatness,m.space.sideRatio,m.level.momentaryDb]);
   if(!ref)this.reference=vector.slice();
   else{
    for(i=0;i<8;i++)change+=Math.abs(shape[i]-ref[i]);change*=.5;
    textureChange=Math.abs(s.entropy-ref[8])*.8+Math.abs(s.flatness-ref[9])*.3;
    widthChange=Math.abs(m.space.sideRatio-ref[10]);levelChange=Math.abs(m.level.momentaryDb-ref[11]);
    // Loudness alone cannot nominate a structural boundary. Require a sustained
    // spectral-distribution change plus independent timbral / spatial / dynamic support.
    var score=clamp(change*1.8+textureChange+widthChange*.65+Math.min(levelChange/18,.3),0,1);
    this.novelty=follow(this.novelty,score,dt,.15);
    var candidate=this.age>3&&change>.15&&this.novelty>.48&&(textureChange>.065||widthChange>.09||levelChange>3.5);
    if(candidate&&t-this.lastBoundary>4){
     if(this.candidateAt<0)this.candidateAt=t;
     if(t-this.candidateAt>.45){
      this.emit('structure.change',t,this.novelty,clamp(.45+this.novelty*.35,0,.85),{shapeDistance:change,textureDistance:textureChange,widthDistance:widthChange,levelDifferenceDb:levelChange},{observedTime:this.candidateAt});
      this.lastBoundary=t;this.candidateAt=-1;this.reference=vector.slice();
     }
    }else this.candidateAt=-1;
    // Freeze the reference only while confirming a candidate, avoiding threshold chase.
    if(this.candidateAt<0)for(i=0;i<vector.length;i++)this.reference[i]=follow(this.reference[i],vector[i],dt,3.5);
   }
   if(this.previousTexture!==null&&this.age>1.5&&t-this.lastTexture>1.2&&s.change>.10&&Math.abs(s.entropy-this.previousTexture)>.065){
    this.emit('texture.change',t,clamp(s.change*2,0,1),.6,{spectralChange:s.change,entropy:s.entropy});this.lastTexture=t;
   }
   this.previousTexture=follow(this.previousTexture===null?s.entropy:this.previousTexture,s.entropy,dt,.45);
  }else{this.novelty*=Math.exp(-dt/.25);this.candidateAt=-1;if(!m.active){this.reference=null;this.previousTexture=null;}}
  while(this.events.length&&(t-this.events[0].time>2||this.events.length>96))this.events.shift();
  this.state={densityHz:this.density,density:clamp(this.density/8,0,1),trend:trend,dynamics:this.dynamic,
   structureNovelty:this.novelty,texture:s.valid?s.entropy:0,spread:s.valid?clamp(s.spreadHz/6000,0,1):0,
   stereoBalance:m.space.balance,correlation:m.space.correlation,phrasePresent:this.roleOn[0],bedPresent:this.roleOn[1],soundPresent:this.sound};
  return this.snapshot();
 };
 Engine.prototype.snapshot=function(){return {schemaVersion:1,epoch:this.epoch,time:this.time,state:this.state,events:this.events.slice(),totals:Object.assign({},this.totals)};};
 return {Engine:Engine};
})();
if(typeof module!=="undefined")module.exports=LensEvents;


/* bundled lens_interaction.js */
/* Spatial input state; independent of sound measurement and rendering. */
var LensInteraction=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function Engine(){this.clear();}
 Engine.prototype.clear=function(){this.held={};this.waves=[];};
 Engine.prototype.touch=function(note,velocity){
  var x=note%10-1,y=Math.floor(note/10)-1;if(x<0||x>7||y<0||y>7||note%1)return false;
  this.held[note]={x:x,y:y,p:clamp(velocity/127,.15,1),v:clamp(velocity/127,.15,1)};
  this.waves.push({x:x,y:y,t:0,p:clamp(velocity/127,.3,1)});if(this.waves.length>16)this.waves.shift();return true;
 };
 Engine.prototype.release=function(note){delete this.held[note];};
 Engine.prototype.releaseAll=function(){this.held={};};
 Engine.prototype.pressure=function(note,value){for(var k in this.held)if(note===-1||Number(k)===note)this.held[k].p=clamp(value/127,0,1);};
 Engine.prototype.step=function(dt){for(var i=this.waves.length-1;i>=0;i--){this.waves[i].t+=dt;if(this.waves[i].t>1.5)this.waves.splice(i,1);}};
 Engine.prototype.gesture=function(){
  var weight=0,x=0,y=0,n=0;for(var k in this.held){var h=this.held[k],w=.15+.85*h.p;weight+=w;x+=h.x*w;y+=h.y*w;n++;}
  return {count:n,strength:clamp(weight/1.1,0,1),x:weight?x/weight/7:.5,y:weight?y/weight/7:.5};
 };
 return {Engine:Engine};
})();
if(typeof module!=="undefined")module.exports=LensInteraction;


/* bundled lens_transition.js */
/* A linear-light, spatial crossfade. Background only; onsets and touch stay live.
   Retargeting begins at the displayed mixture, never jumps to an old endpoint. */
var LensTransition=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function Engine(){this.clear();}
 Engine.prototype.clear=function(){this.key=null;this.from=null;this.frame=null;this.elapsed=0;this.duration=0;this.active=false;this.mode=0;};
 Engine.prototype.step=function(target,key,dt,duration,mode){
  if(key!==this.key){
   this.from=this.frame?this.frame.map(function(c){return c.slice();}):null;
   this.key=key;this.elapsed=0;this.duration=clamp(duration,0,3);this.mode=mode||0;
   this.active=!!this.from&&this.duration>0;
  }
  var u=this.active?clamp(this.elapsed/this.duration,0,1):1,out=[],i,k;
  for(i=0;i<64;i++){
   var x=i%8,y=Math.floor(i/8),d=this.mode%3===0?Math.sqrt(Math.pow(x-3.5,2)+Math.pow(y-3.5,2))/5:this.mode%3===1?(x+y)/14:y/7;
   var mix=clamp(u*1.3-d*.3,0,1);mix=mix*mix*(3-2*mix);var c=[];
   for(k=0;k<3;k++)c[k]=this.from?this.from[i][k]*(1-mix)+target[i][k]*mix:target[i][k];out.push(c);
  }
  this.elapsed+=dt;if(u>=1){this.active=false;this.from=null;}
  this.frame=out;return out;
 };
 Engine.prototype.snapshot=function(){return {active:this.active,progress:this.duration?clamp(this.elapsed/this.duration,0,1):1,duration:this.duration};};
 return {Engine:Engine};
})();
if(typeof module!=="undefined")module.exports=LensTransition;


/* bundled lens_presentation.js */
/* Translation boundary: event semantics -> visual envelopes. No audio sampling.
   Events are consumed once by ID even when rendering and measurement clocks differ. */
var LensPresentation=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function spatial(measured,settings){
  var s=measured&&measured.stereoSpectrum,p=settings||{},contrast=clamp(p.spatialContrast===undefined?.65:p.spatialContrast,0,1),valid=!!(s&&s.valid&&measured.active),roles=[],rows=[],lowSpectrum=[],peak=0;
  for(var role=0;role<5;role++){
   var cfg=(p.roles||[])[role]||{bands:[[0,1],[0,1,2],[3,4,5],[3,4,5],[6,7]][role]},sum=[0,0,0];
   if(valid)for(var i=0;i<s.bands.length;i++){
    var b=s.bands[i],weight=role===0?Math.max(0,Math.min(b.hiHz,p.impactHi||160)-Math.max(b.loHz,p.impactLo||35))/(b.hiHz-b.loHz):(cfg.bands.indexOf(Math.floor(i/2))>=0?1:0);
    for(var ch=0;ch<3;ch++){
     // Articulated foreground favours changing energy; held background favours persistence.
     // These are temporal weights, never vocal/pad or instrument classification.
     var energy=role===2?b.power[ch]*.18+b.movingPower[ch]*.82:role===3?b.steadyPower[ch]:b.power[ch];
     sum[ch]+=weight*energy;
    }
   }
   var total=sum[0]+sum[1]+sum[2];roles.push(total>1e-12?sum.map(function(v){return v/total;}):[0,1,0]);
  }
  for(i=0;i<8;i++){
   rows[i]=[0,0,0];if(valid)for(ch=0;ch<3;ch++){rows[i][ch]=s.bands[i*2].power[ch]+s.bands[i*2+1].power[ch];peak=Math.max(peak,rows[i][ch]);}
  }
  var displayRoles=roles.map(function(shares,role){
   if(role<2)return [0,1,0];
   var strength=contrast*(role===2||role===3?1:.45),weights=shares.map(function(v,ch){return ch===1?v:Math.pow(v,1-strength*.5);}),sum=weights[0]+weights[1]+weights[2];
   return weights.map(function(v){return v/Math.max(1e-12,sum);});
  });
  for(i=0;i<3;i++)lowSpectrum[i]=peak>1e-12?Math.sqrt((rows[i][0]+rows[i][1]+rows[i][2])/peak):0;
  for(i=0;i<8;i++)for(ch=0;ch<3;ch++){
   var ratio=peak>1e-12?rows[i][ch]/peak:0,strength=contrast*(i>=3&&i<=5?1:.45);
   // Visual compression only; diagnostic power and role proportions stay raw.
   rows[i][ch]=Math.pow(ratio,ch===1?.5:.5-strength*.22);
  }
  return {valid:valid,roles:roles,displayRoles:displayRoles,contrast:contrast,spectrum:rows,lowSpectrum:lowSpectrum,amount:valid?clamp(p.spatialAmount===undefined?.85:p.spatialAmount,0,1):0};
 }
 function Engine(){this.clear();}
 Engine.prototype.clear=function(){this.epoch=-1;this.seen={};this.reframe=0;this.entry=0;this.texture=0;this.release=0;this.direction=0;};
 Engine.prototype.step=function(features,perception,dt,amount,measured,settings){
  var q=perception||{epoch:0,state:{},events:[]},i,e;
  if(q.epoch!==this.epoch){this.clear();this.epoch=q.epoch;}
  this.reframe*=Math.exp(-dt/1.2);this.entry*=Math.exp(-dt/.35);this.texture*=Math.exp(-dt/.2);this.release*=Math.exp(-dt/.65);
  for(i=0;i<q.events.length;i++){
   e=q.events[i];if(this.seen[e.id])continue;this.seen[e.id]=e.time;
   if(e.type==='structure.change'){this.reframe=e.strength;this.direction=1-this.direction;}
   if(e.type==='role.enter'&&e.role==='phrase')this.entry=e.strength;
   if(e.type==='texture.change')this.texture=e.strength;
   if(e.type==='dynamics.fall'||e.type==='sound.exit')this.release=e.strength;
  }
  for(var id in this.seen)if(q.time-this.seen[id]>3)delete this.seen[id];
  var f=Object.assign({},features),s=q.state||{},a=amount===undefined?.7:amount;
  f.eventVisual={reframe:this.reframe*a,entry:this.entry*a,texture:this.texture*a,release:this.release*a,direction:this.direction,
   density:(s.density||0)*a,spread:(s.spread||0)*a,pan:(s.stereoBalance||0)*a,trend:(s.trend||0)*a};
  f.spatial=spatial(measured,settings);
  return f;
 };
 return {Engine:Engine,spatial:spatial};
})();
if(typeof module!=="undefined")module.exports=LensPresentation;


/* bundled lens_visual.js */
/* Five sound behaviours, seven different spatial grammars.
   No score, title, transport position, instrument label or free-running beat. */
if(typeof module!=="undefined"){
 var LensInteraction=require('./lens_interaction.js'),LensTransition=require('./lens_transition.js');
}
var LensVisual=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function hash(n){var x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x);}
 function glow(x,y,cx,cy,r){return Math.exp(-((x-cx)*(x-cx)+(y-cy)*(y-cy))/r);}
 function edge(d,w){return Math.exp(-d*d/(w*w));}
 function zeros(){var a=[];for(var i=0;i<64;i++)a.push(0);return a;}
 function empty(){return [zeros(),zeros(),zeros(),zeros(),zeros()];}
 // Resample inside the source, never clamp edges into long false streaks.
 function sample(layer,x,y){if(x<-.5||x>7.5)return 0;var l=Math.floor(x),f=x-l;return (l>=0&&l<8?layer[y*8+l]:0)*(1-f)+(l+1>=0&&l+1<8?layer[y*8+l+1]:0)*f;}
 function project(layer,x,y,anchor,scale){
  if(scale>=1)return sample(layer,3.5+(x-anchor)/scale,y);
  // Area integration prevents a narrow moving phrase disappearing between LEDs.
  var a=3.5+(x-.5-anchor)/scale,b=3.5+(x+.5-anchor)/scale,sum=0;
  for(var cell=Math.max(0,Math.floor(a+.5));cell<=Math.min(7,Math.floor(b+.5));cell++)sum+=layer[y*8+cell]*Math.max(0,Math.min(b,cell+.5)-Math.max(a,cell-.5));
  return sum/(b-a);
 }
 function spatialSample(layer,x,y,width,shares,amount,separation){
  var base=sample(layer,3.5+(x-3.5)/width,y);if(!amount)return base;
  var value=0,sep=separation||0,anchors=[1.25-.3*sep,3.5,5.75+.3*sep],sizes=[.48-.14*sep,.76-.22*sep,.48-.14*sep];
  for(var ch=0;ch<3;ch++)value+=shares[ch]*project(layer,x,y,anchors[ch],width*sizes[ch])/sizes[ch];
  return base*(1-amount)+value*amount;
 }
 var names=["重力／沉積","天體／公轉","織光／經緯","門廊／縱深","雙生／呼應","拼光／碎片","聲場／三域"];
 var paletteNames=["琥珀冰川","月夜紫羅蘭","翡翠珊瑚","鈷藍熔岩","蘭花青檸","桃紅電光"];
 // impact / foundation / phrase / bed / detail; bounded palettes, never hue-cycling.
 var palettes=[
  [[.70,.90,1],[1,.39,.09],[.95,.27,.50],[.06,.57,.55],[1,.87,.43]],
  [[.49,.91,1],[.09,.45,.95],[.91,.23,.60],[.37,.18,.80],[.78,1,.84]],
  [[1,.68,.23],[.02,.79,.42],[1,.25,.21],[.11,.38,.63],[1,.91,.67]],
  [[1,.30,.08],[.15,.27,1],[1,.63,.09],[.30,.12,.64],[.30,1,.76]],
  [[1,.30,.71],[.48,.14,.93],[.72,1,.13],[.03,.57,.53],[1,.78,.37]],
  [[1,.84,.20],[1,.19,.37],[.12,.89,.81],[.36,.18,.85],[.75,.95,.99]]
 ];
 function palette(scene,choice){return palettes[choice?clamp(choice-1,0,5):scene===6?0:clamp(scene,0,5)];}
 function Engine(interaction){this.input=interaction||new LensInteraction.Engine();this.transition=new LensTransition.Engine();this.time=0;this.motion=0;this.serial=0;this.clear();}
 Engine.prototype.clear=function(){
  this.input.clear();this.transition.clear();this.impacts=[];this.particles=[];this.lastCounts=[0,0,0];
  this.trails=empty();this.layers=empty();this.frame=[];this.midHistory=[];this.flash=0;
  this.spatial=null;this.phraseClock=0;this.bedClock=0;this.turn=0;this.lastScene=-1;
 };
 // Compatibility accessors for existing standalone renderers; state lives in input.
 Object.defineProperty(Engine.prototype,"held",{get:function(){return this.input.held;},set:function(v){this.input.held=v;}});
 Object.defineProperty(Engine.prototype,"waves",{get:function(){return this.input.waves;}});
 Engine.prototype.touch=function(n,v){return this.input.touch(n,v);};
 Engine.prototype.release=function(n){this.input.release(n);};
 Engine.prototype.pressure=function(n,v){this.input.pressure(n,v);};
 Engine.prototype.gesture=function(){return this.input.gesture();};
 Engine.prototype.step=function(f,dt,p){
  dt=clamp(dt,.001,.1);this.time+=dt;var g=this.gesture(),i,j,k,x,y,pt;
  var ev=f.eventVisual||{},roleSettings=p.roles||[],spatial=f.spatial||{valid:false,amount:0,roles:[]};
  if(!p.freeze||!this.spatial)this.spatial=spatial;else spatial=this.spatial;
  var scene=clamp(p.scene||0,0,6),counts=f.counts||[0,0,0],hits=f.transients||[0,0,0];
  var body=f.body===undefined?f.bands[0]:f.body,b=f.behaviour;
  var phrase=b?(b.phrase||0):f.bands[1],bed=b?(b.bed||0):0,art=b?(b.articulation||0):.6,contour=f.midContour===undefined?.5:f.midContour;
  var dynamics=f.bandDynamics||[],bassAttack=0,midAttack=0,register=0;
  for(i=0;i<8;i++)if(dynamics[i]){
   if(i<3)bassAttack=Math.max(bassAttack,dynamics[i].impact);
   if(i>=3&&i<6){midAttack+=dynamics[i].impact;register+=(i-3)*.5*dynamics[i].impact;}
  }
  if(midAttack>.08)contour=contour*.65+register/midAttack*.35;
  var weight=p.bassWeight===undefined?1.2:p.bassWeight,low=clamp(body*weight,0,1),focus=p.focus||0;
  if(scene!==this.lastScene){this.trails=empty();this.lastScene=scene;}
  if(!p.freeze){
   this.motion+=dt*(low*.2+phrase*.4);this.phraseClock+=dt*phrase*(.7+art*2.5);this.bedClock+=dt*bed*.35;
   this.midHistory.unshift(contour);if(this.midHistory.length>32)this.midHistory.pop();
   if(counts[0]>this.lastCounts[0]){this.impacts.push({t:0,p:Math.max(.025,hits[0]),dir:counts[0]%2,fresh:true});if(this.impacts.length>4)this.impacts.shift();}
   if(counts[1]>this.lastCounts[1]){this.flash=Math.max(.025,hits[1]);this.turn++;}
   if(counts[2]>this.lastCounts[2]){
    var n=1+Math.floor(f.bands[2]*p.detail*2+(ev.density||0)*.8);
    for(i=0;i<n;i++){
     var id=++this.serial;this.particles.push({x:Math.floor(hash(id*2+3)*8),y:5+Math.floor(hash(id+19)*3),id:id,band:f.highIndex||0,t:0,life:1,duration:(f.highIndex?.07:.12)+p.detail*.08,p:Math.max(.025,hits[2])});
    }if(this.particles.length>16)this.particles.splice(0,this.particles.length-16);
   }
  }
  if(!p.freeze){
   if(this.impacts.length){var lastImpact=this.impacts[this.impacts.length-1];if(lastImpact.t<.09)lastImpact.p=Math.max(lastImpact.p,hits[0]);}
   this.flash=Math.max(this.flash,hits[1]);
   for(i=0;i<this.particles.length;i++)if(this.particles[i].t<.09)this.particles[i].p=Math.max(this.particles[i].p,hits[2]);
  }
  this.lastCounts=counts.slice();
  this.input.step(dt);
  if(!p.freeze){
   this.flash*=Math.exp(-dt/.13);
   for(i=this.impacts.length-1;i>=0;i--){if(this.impacts[i].fresh)this.impacts[i].fresh=false;else this.impacts[i].t+=dt;if(this.impacts[i].t>.52)this.impacts.splice(i,1);}
   for(i=this.particles.length-1;i>=0;i--){pt=this.particles[i];pt.t+=dt;pt.life=Math.max(0,1-pt.t/pt.duration);if(pt.life<=0)this.particles.splice(i,1);}
   var next=empty(),cx=3.5+(g.count?(g.x*7-3.5)*g.strength*.55:0),cy=3.5+(g.count?(g.y*7-3.5)*g.strength*.4:0);
   if(!spatial.valid)cx+=(ev.pan||0)*.7;
   var spread=1+(f.width||0)*.25+(ev.reframe||0)*.16,pc=this.phraseClock+(ev.entry||0)*.35,
    bc=this.bedClock+(ev.reframe||0)*.6,turn=this.turn,flash=this.flash;
   for(y=0;y<8;y++)for(x=0;x<8;x++){
    var idx=y*8+x,dx=(x-cx)/spread,dy=y-cy,rr=Math.sqrt(dx*dx+dy*dy),angle=Math.atan2(dy,dx);
    var foundation=0,fore=0,bedShape=0,impact=0,detail=0;
    if(scene===0){
     var surface=.4+low*1.6+Math.cos(dx*.8)*.2;
     foundation=clamp((1.1+low*2-Math.abs(dx))/.6,0,1)*clamp((surface+.35-y)/.65,0,1);
     var h=this.midHistory[Math.min(31,Math.round((7-x)*3))]||.5;
     fore=edge(y-(3.6+h*1.5+Math.sin(x*.8-pc)*.4),.42)*(1-Math.abs(dx)/6);
     bedShape=(edge(x-1,.55)+edge(x-6,.55))*edge(y-(3.5+Math.sin(bc)*.3),2.3)*.62;
    }else if(scene===1){
     foundation=edge(rr-(.55+low*1.4),.50)*(angle<0?1:.62);
     var orbit=2.3+contour*.6,ax=cx+Math.cos(pc*1.7)*orbit,ay=cy+Math.sin(pc*1.7)*orbit;
     fore=glow(x,y,ax,ay,.5)+glow(x,y,cx+Math.cos(pc*1.7-.5)*orbit,cy+Math.sin(pc*1.7-.5)*orbit,.8)*.38;
     bedShape=edge(rr-(3.1+Math.sin(bc)*.25),.5)*(.45+.30*Math.cos(angle*2+bc));
    }else if(scene===2){
     // Orthogonal fabric: two low rails, slowly held vertical warp, articulated horizontal weft.
     foundation=(edge(x-(1.4-low*.75),.6)+edge(x-(5.6+low*.75),.6))*clamp((1+low*4.3-y)/1.3,0,1);
     var wy=2+(turn%4),front=(pc*3)%8;
     fore=edge(y-wy,.35)*(.20+.8*glow(x,y,front,wy,2.2));
     bedShape=((x%3)===1?1:.08)*clamp((y-.6)/1.3,0,1)*clamp((7.6-y)/1.3,0,1)*(.6+.2*Math.sin(bc+x));
    }else if(scene===3){
     // Square perspective. The low voice opens the gate; phrases travel towards the viewer.
     var square=Math.max(Math.abs(dx),Math.abs(dy));
     foundation=edge(square-(.5+low*2.2),.34)*(Math.abs(dx)>=Math.abs(dy)?1:.08);
     var depth=(pc*.8)%1,ray=turn%4;
     var tx=cx+(ray%2?1:-1)*depth*3.3,ty=cy+(ray<2?1:-1)*depth*3.3;
     fore=glow(x,y,tx,ty,.25+depth*.3)+glow(x,y,(cx+tx)/2,(cy+ty)/2,.4)*.25;
     bedShape=(edge(square-3.4,.38)+edge(square-1.5,.28)*.28)*(.5+.18*Math.cos(angle*2+bc));
    }else if(scene===4){
     // Two unequal bodies and a quiet bridge; entry and retreat create a dialogue.
     var gap=1.1+low*1.1,lx=cx-gap,rx=cx+gap;
     foundation=glow(x,y,lx,2.2,.35+low*1.5)+glow(x,y,rx,4.6,.25+low*.8)*.65;
     var side=turn%2,fx=side?rx:lx,fy=side?2.3:5.2;
     fore=glow(x,y,fx+Math.sin(pc*2)*.55,fy,.42)+edge(x-(cx+Math.sin(pc)*1.2),.35)*edge(y-3.5,.5)*flash*.4;
     bedShape=edge(y-(3.5+Math.sin(x*.7+bc)*.65),.65)*clamp((3.8-Math.abs(dx))/2,0,1)*.55;
    }else{
     // Pixel mosaic: diagonal clusters. Active phrases hop tiles; beds fill other tile interiors.
     var bx=Math.floor(x/2),by=Math.floor(y/2),localX=x%2,localY=y%2;
     foundation=((bx+by)%3===0?1:0)*clamp((low*4.6-(3-by))/.9,0,1)*(.60+.25*localX);
     var tile=turn%6,px=[0,2,3,1,3,0][tile],py=[3,2,0,1,3,1][tile];
     fore=(bx===px&&by===py?1:0)*(localX===localY?1:.3);
     bedShape=((bx+by)%3===1&&localX!==localY?.65:0)*(.65+.20*Math.cos(bc+bx));
    }
    for(i=0;i<this.impacts.length;i++){
     // An immediate local strike anchors the beat. The travelling front is its tail.
     // Travel follows age only, so a maturing weight cannot pull the front backwards.
     var imp=this.impacts[i],pr=clamp(imp.t/.24,0,1),front=0,strike=0;
     if(scene===0)front=edge(y-(.35+pr*5.8),.47)*clamp((3.8-Math.abs(dx))/.8,0,1);
     else if(scene===1)front=edge(rr-(.4+pr*4),.34);
     else if(scene===2)front=edge(x-(imp.dir?pr*7:7-pr*7),.43)*edge(y-3.5,2.5);
     else if(scene===3)front=edge(Math.max(Math.abs(dx),Math.abs(dy))-(.2+pr*4),.27);
     else if(scene===4)front=(edge(Math.sqrt(Math.pow(x-(cx-2),2)+Math.pow(y-2.2,2))-(.2+pr*2.5),.35)+edge(Math.sqrt(Math.pow(x-(cx+2),2)+Math.pow(y-4.6,2))-(.2+pr*2.5),.35))*.7;
     else front=edge(x+y-(1+pr*11),.50)*(x%2===y%2?1:.16);
     if(scene===0)strike=edge(y,.55)*edge(dx,2.6);
     else if(scene===1||scene===3)strike=glow(x,y,cx,cy,.8);
     else if(scene===2)strike=edge(x-(imp.dir?0:7),.55)*edge(y-3.5,1.4);
     else if(scene===4)strike=glow(x,y,cx-2,2.2,.5)+glow(x,y,cx+2,4.6,.5)*.7;
     else strike=(x+y<=2&&x%2===y%2)?1:0;
     impact+=weight*(strike*Math.sqrt(imp.p)*2.1*Math.exp(-imp.t/.025)+front*imp.p*.65*Math.exp(-imp.t/(.07+.17*imp.p))/(1+pr*1.8));
    }
    for(i=0;i<this.particles.length;i++){
     pt=this.particles[i];var px=pt.x,py=pt.band?7:6;
     if(scene===1){var ang=pt.id*2.399;px=cx+Math.cos(ang)*3.5;py=cy+Math.sin(ang)*3.5;}
     if(scene===2){px=pt.id%2?0:7;py=(pt.id*3)%8;}
     if(scene===3){px=pt.id%2?0:7;py=pt.id%3?0:7;}
     if(scene===4){px=pt.id%2?1:6;py=pt.id%2?6:1;}
     if(scene===5){px=(pt.id*3)%8;py=(pt.id*5)%8;}
     if(g.count){px+=(g.x*7-px)*g.strength*pt.t*2;py+=(g.y*7-py)*g.strength*pt.t*2;}
     detail+=glow(x,y,px,py,.19)*Math.pow(pt.life,.6)*pt.p*(.8+p.detail*.3);
    }
    if((x===0&&y===7)||(x===7&&y===0))detail+=f.bands[2]*.055;
    next[0][idx]=impact;
    next[1][idx]=foundation*low*(.48+low*.5)*(1+bassAttack*.35)*(1+(ev.trend||0)*.12);
    next[2][idx]=fore*phrase*(.64+flash*.3)*(1+(ev.entry||0)*.22);
    next[3][idx]=bedShape*bed*.55*(1-clamp(fore*phrase,0,.6))*(1-(ev.release||0)*.35)*(1-(ev.reframe||0)*.65*edge(x-((ev.direction||0)?4.5:2.5),.9));
    next[4][idx]=detail*(1+(ev.texture||0)*.25);
    if(scene===6){
     // Three separated lanes, eight registers from bottom (low) to top (high).
     // One shared power reference across all lanes. No random particle placement.
     var channel=x<2?0:x>=3&&x<5?1:x>=6?2:-1,level=channel>=0&&spatial.valid?spatial.spectrum[y][channel]:0;
     var rowRole=y<3?1:y<6?2:4;
     for(var layer=0;layer<5;layer++)next[layer][idx]=0;
     next[rowRole][idx]=level*Math.max(0,f.slow||0)*.85;
     if(rowRole===2){
      var midLevel=next[2][idx],midTotal=Math.max(.001,phrase+bed);
      next[2][idx]=midLevel*phrase/midTotal;next[3][idx]=midLevel*bed/midTotal;
     }
     if(y<3){
      // The low register remains one continuous mass, regardless of its stereo input.
      var lowLevel=spatial.valid&&spatial.lowSpectrum?spatial.lowSpectrum[y]:0;
      next[1][idx]=lowLevel*Math.max(0,f.slow||0)*.85*clamp((1+low*2.5-Math.abs(x-3.5))/.8,0,1);
      // Impact timing and weight are unchanged; no left/centre/right copies.
      if(y===0)for(i=0;i<this.impacts.length;i++){
       var pulse=this.impacts[i];next[0][idx]+=edge(x-3.5,2.2)*Math.sqrt(pulse.p)*Math.exp(-pulse.t/.055)*weight;
      }
     }
    }
   }
   var tau=[.035,.09+p.trails*.25,.045+p.trails*.11,.18+p.trails*.30,.020+p.trails*.025];
   for(j=0;j<5;j++)for(i=0;i<64;i++){next[j][i]=Math.max(next[j][i],this.trails[j][i]*Math.exp(-dt/(tau[j]*((roleSettings[j]||{}).release||1))));if(next[j][i]<.0001)next[j][i]=0;}
   this.trails=next;this.layers=next;
  }
  var budgets=[5.2,5.3,3.7,2.6,1.6],scales=[],colours=palette(scene,p.palette||0);
  for(j=0;j<5;j++){var sum=0;for(i=0;i<64;i++)sum+=this.layers[j][i];scales[j]=Math.min(1,budgets[j]/Math.max(.001,sum));}
  var rgb=[],live=[],total=0;
  for(y=0;y<8;y++)for(x=0;x<8;x++){
   var idx=y*8+x,c=[0,0,0],attack=[0,0,0],local=0;
   for(j=0;j<5;j++){
    var settings=roleSettings[j]||{},wide=(settings.width||1)*(j===3?1+(ev.spread||0)*.35:1);
    var sampled=spatialSample(this.layers[j],x,y,wide,(spatial.displayRoles||spatial.roles||[])[j]||[0,1,0],j<2?0:spatial.amount||0,j===2||j===3?spatial.contrast||0:0);
    if(scene===6&&j>=2){
     var lane=x<2?0:x>=3&&x<5?1:x>=6?2:-1,anchor=[.5,3.5,6.5][lane];
     sampled=lane<0?0:sample(this.layers[j],anchor+(x-anchor)/wide,y);
    }
    var value=focus&&focus!==j+1?0:sampled*scales[j]*(settings.gain===undefined?1:settings.gain);local+=value;
    for(k=0;k<3;k++)if(j===0)attack[k]+=value*colours[j][k];else c[k]+=value*colours[j][k];
   }
   for(k=0;k<3;k++){c[k]/=Math.max(1,Math.pow(local,.65));attack[k]/=Math.max(1,Math.pow(local,.65));}
   for(var key in this.held){var h=this.held[key],v=glow(x,y,h.x,h.y,.24+h.p*.3)*(.55+h.p*.65);attack[0]+=v;attack[1]+=v*.69;attack[2]+=v*.34;}
   for(i=0;i<this.waves.length;i++){var w=this.waves[i],d=Math.sqrt(Math.pow(x-w.x,2)+Math.pow(y-w.y,2));var v=edge(d-w.t*3.8,.36)*Math.exp(-w.t*3)*w.p*.5;attack[0]+=v*.8;attack[1]+=v*.4;attack[2]+=v;}
   rgb.push(c);live.push(attack);
  }
  if(p.black)this.transition.clear();
  rgb=this.transition.step(rgb,scene+":"+(p.palette||0)+":"+focus,dt,p.transition===undefined?.85:p.transition,scene);
  for(i=0;i<64;i++){for(k=0;k<3;k++)rgb[i][k]+=live[i][k];total+=Math.max.apply(Math,rgb[i]);}
  var scale=Math.min(1,(12+f.slow*2+g.strength*2)/Math.max(.001,total)),output=[];
  for(i=0;i<64;i++)for(k=0;k<3;k++){var v=clamp(rgb[i][k]*scale,0,1)*127*clamp(p.brightness,0,1);output.push(p.black||v<1.6?0:Math.round(v));}
  this.frame=output;return output;
 };
 return {Engine:Engine,names:names,palettes:palettes,paletteNames:paletteNames,palette:palette,colours:palettes[0]};
})();
if(typeof module!=="undefined")module.exports=LensVisual;


var initialized=false;
var self=this,analysis=new LensFeatures.Engine(),measurements=new LensMeasurements.Engine(),events=new LensEvents.Engine();
var interaction=new LensInteraction.Engine(),presentation=new LensPresentation.Engine(),visual=new LensVisual.Engine(interaction);
var behaviours=new LensBehaviours.Engine(),roleMaskChanged=false;
var audioSampleRate=44100,measured=null,perception=events.snapshot(),behaviourFrame=analysis.snapshot();
var P={master:.4,brightness:.55,sensitivity:1,trails:.25,detail:.55,bassWeight:1.2,focus:0,scene:0,palette:0,detector:false,detectorBand:8,impactLo:35,impactHi:160,impactSensitivity:1,impactGap:.16,freeze:false,black:false,fx:true,fxdepth:.85,monitor:false,loop:false,input:0,livegain:1,plugin:false,role:0,roles:LensBehaviours.defaults(),transition:.85,eventAmount:.7,spatialAmount:.85,spatialContrast:.65,inspector:0};
var file="",pendingFile="",loaded=false,running=false,paused=false,position=0,duration=0,samplerate=0,channels=2;
var hw=false,identity=false,layout=false,connected=false,inputPort="none",outputPort="none",lastReply=0,lastQuery=0,lastLed={},midiStatus=0,midiData=[],sx=null;
var enumerating=false,portLists={input:[],output:[]};
var buttonUntil={};
var lastFrame=0,lastFeatures=0,lastLog=0,frameNo=0,meter=0,rec=false,recReady=false,logPath="",traceOn=false;
var pendingRecordPath="";
var capture=null,captureFrames=0,pendingCapture=null,analysisMs=0,lastFx={},lastUi=0,uiDirty=true,uiProfile=[0,0,0];
var uiDict=typeof Dict!=="undefined"?new Dict():null;
function uiperf(parseMs,requestMs,paintMs){uiProfile=[parseMs,requestMs,paintMs];}
var message="載入音訊或選擇 Demo；點觸畫面即可試玩。",pluginName="未載入",pluginReady=false,pluginInputs=0,pluginOutputs=0,pluginSynth=1,pluginPolls=0;
function now(){return new Date().getTime()/1000;}
function obj(n){return self.patcher.getnamed(n);}
function msg(n){var a=arrayfromargs(arguments);a.shift();var o=obj(n);if(o)o.message.apply(o,a);}
function ramp(n,v){msg(n,"list",v,40);}
function fxparam(n,v){if(lastFx[n]!==v){lastFx[n]=v;msg("fx",n,v);}}
function rootPath(){return self.patcher.filepath.replace(/\/patchers\/[^\/]+$/,"/");}
function log(s){post("LENS: "+s+"\n");if(logPath){var f=new File(logPath,"write","TEXT");if(f.isopen){f.position=f.eof;f.writeline(s);f.close();}}}
function status(s){message=s;uiDirty=true;log(s);}
function init(){
 if(initialized)return;initialized=true;
 ramp("master",P.master);ramp("monitor",0);ramp("file-gain",1);ramp("live-gain",0);ramp("mono",0);ramp("plugin-dry",1);ramp("plugin-wet",0);
 msg("analysis","impactLo",P.impactLo);msg("analysis","impactHi",P.impactHi);msg("vst","disable",1);msg("recorder","samptype","float32");msg("poll","int",1);refreshports();
 tickTask.interval=33;tickTask.repeat();status("READY · 五個聲音行為 · v1.4.0");
}
function openfile(){msg("file-dialog","bang");}
function demo(){loadfile(rootPath()+"media/Lunar-Departure-demo.wav");}
function loadfile(path){var a=arrayfromargs(arguments);path=a.join(" ");var check=new File(path,"read");if(!check.isopen){status("無法開啟音訊："+path);return;}check.close();
 stop();file="";loaded=false;duration=0;channels=0;pendingFile=path;resetAnalysis();visual.clear();
 msg("info","open",path);
}
function filechannels(n){channels=Number(n);if(channels<1||!pendingFile)return;
 file=pendingFile;pendingFile="";loaded=true;msg("player","open",file);msg("player","loop",P.loop?1:0);
 ramp("mono",channels===1?1:0);param("input",0);status("已載入："+file.split("/").pop());
}
function fileduration(n){duration=Math.max(0,Number(n)/1000);}
function filerate(n){samplerate=Number(n);}
function fileposition(n){if(running||paused)position=Math.max(0,Number(n)/1000);}
function play(){if(running)return;if(P.input===0&&!loaded){status("請先載入音訊，或按 DEMO。");return;}
 msg("dsp","start");running=true;resetAnalysis();visual.clear();
 if(P.input===0){if(paused)msg("player","resume");else msg("player","int",1);}else ramp("live-gain",P.livegain);
 paused=false;status(P.input?"LIVE INPUT 分析中":"播放中 · 原速 1×");
}
function pause(){if(!running){play();return;}running=false;paused=true;if(P.input===0)msg("player","pause");else ramp("live-gain",0);releaseall();status("已暫停");}
function stop(){running=false;paused=false;position=0;msg("player","int",0);ramp("live-gain",0);releaseall();resetAnalysis();visual.clear();P.freeze=false;status("已停止");}
function restart(){if(P.input===0&&loaded){P.freeze=false;seek(0);status("從頭播放 · 原速 1×");}else{stop();play();}}
// sfplay~ also bangs after an explicit 0. A deferred halt from before a restart
// must not finish the new playback. Position snapshots arrive every 100 ms.
function fileended(){if(running&&P.input===0&&!P.loop&&position+.25>=duration){running=false;paused=false;position=duration;releaseall();status("播放完畢");}}
function seek(fraction){if(!loaded||P.input!==0||duration<=0)return;releaseall();resetAnalysis();visual.clear();position=LensFeatures.clamp(Number(fraction),0,.999)*duration;running=true;paused=false;msg("dsp","start");msg("player","seek",position*1000);}
function param(name,v){if(P[name]===undefined)return;
 if(["fx","freeze","black","monitor","loop","plugin","detector"].indexOf(name)>=0)v=Number(v)!==0;
 else {v=Number(v);if(!isFinite(v))return;var ranges={transition:[0,3],role:[0,4],inspector:[0,3],sensitivity:[.35,2.5],bassWeight:[.6,1.8],scene:[0,6],focus:[0,5],palette:[0,6],detectorBand:[0,8],livegain:[0,4],impactLo:[20,160],impactHi:[70,400],impactSensitivity:[.4,2.5],impactGap:[.08,.4]},r=ranges[name]||[0,1];v=LensFeatures.clamp(v,r[0],r[1]);if(["scene","focus","input","palette","detectorBand","role","inspector"].indexOf(name)>=0)v=Math.round(v);}
 if(name==="impactLo")v=Math.min(v,P.impactHi-25);
 if(name==="impactHi")v=Math.max(v,P.impactLo+25);
 if(name==="input"&&v!==P.input){stop();resetAnalysis();visual.clear();P.monitor=false;ramp("monitor",0);ramp("file-gain",v?0:1);}
 if(name==="plugin"&&v&&!pluginReady){status("先選擇並載入效果器，再啟用。 ");return;}
 P[name]=v;
 uiDirty=true;
 if(name==="impactLo"||name==="impactHi"){msg("analysis",name,v);analysis.resetImpact();visual.impacts=[];}
 if(name==="impactSensitivity")P.roles[0].sensitivity=v;
 if(name==="master")ramp("master",v);
 if(name==="monitor"){ramp("monitor",v?1:0);if(v)msg("dsp","start");}
 if(name==="loop")msg("player","loop",v?1:0);
 if(name==="livegain"&&P.input&&running)ramp("live-gain",v);
 if(name==="plugin"){msg("vst","disable",v?0:1);ramp("plugin-dry",v?0:1);ramp("plugin-wet",v?1:0);}
 if(name==="black"){lastLed={};if(v&&hw)outlet(1,MoonProtocol.blackout());}
 if(name==="fx"&&!v)msg("fx","amount",0);
}
function blackout(){param("black",P.black?0:1);}
function audio(){param("monitor",P.monitor?0:1);}
function releaseall(){interaction.releaseAll();msg("fx","amount",0);}
function clear(){releaseall();visual.clear();presentation.clear();P.freeze=false;status("已清除殘影與按壓狀態");}
function features(){
 var a=arrayfromargs(arguments),t=now(),before=analysis.counts[0];lastFeatures=t;
 analyse(running?a:[],t);
 analysisMs=(now()-t)*1000;
 // Dispatch the low attack on arrival, then restart the regular 33 ms tail clock.
 // A hit must not wait in an unrelated animation timer's queue for one more frame.
 if(analysis.counts[0]>before){render();tickTask.cancel();tickTask.repeat(-1,33);}
}
function resetAnalysis(){analysis.reset();behaviours.reset();measurements.reset();events.reset();presentation.clear();measured=null;perception=events.snapshot();behaviourFrame=analysis.snapshot();}
function spectral(){measurements.spectrum(arrayfromargs(arguments),now());}
function contextual(){measurements.contextual(arrayfromargs(arguments),now());}
function audiorate(n){if(Number(n)>8000)audioSampleRate=Number(n);}
function analyse(a,t){
 var f=analysis.step(a,t,P.sensitivity,P.impactSensitivity,P.impactGap);
 measured=measurements.step(a,t,audioSampleRate,f.active);
 behaviourFrame=behaviours.step(f,a,P.roles,t);
 if(roleMaskChanged){visual.lastCounts=behaviourFrame.counts.slice();events.lastCounts=behaviourFrame.counts.slice();roleMaskChanged=false;}
 perception=events.step(measured,behaviourFrame,t);
}
function roleedit(i){param("role",i);param("inspector",0);param("detector",1);}
function roleparam(name,value){
 var r=P.roles[P.role],v=Number(value),range={sensitivity:[.4,2.5],gain:[0,2],width:[.5,1.8],release:[.3,3]}[name];
 if(!range||!isFinite(v))return;r[name]=LensFeatures.clamp(v,range[0],range[1]);
 if(P.role===0&&name==="sensitivity")param("impactSensitivity",r[name]);uiDirty=true;
}
function roleband(i){
 if(P.role===0)return;i=Math.round(Number(i));if(i<0||i>7)return;
 var bands=P.roles[P.role].bands,index=bands.indexOf(i);
 if(index>=0)bands.splice(index,1);else bands.push(i);bands.sort(function(a,b){return a-b;});roleMaskChanged=true;uiDirty=true;
}
function rolereset(){P.roles[P.role]=LensBehaviours.defaults()[P.role];roleMaskChanged=true;if(P.role===0)detectorreset();uiDirty=true;}
function metervalue(v){meter=Number(v);}
function pad(note,velocity){note=Number(note);velocity=Number(velocity);if(velocity<=0){padup(note);return;}if(!interaction.touch(note,velocity)){cc(note,velocity);return;}message="觸點 "+(note%10)+" · "+Math.floor(note/10)+"／按壓聚光，鬆開釋放";render();}
function padup(note){interaction.release(Number(note));}
function pressure(note,value){interaction.pressure(Number(note),Number(value));}
function cc(n,v){if(v<=0)return;
 if(n>=101&&n<=108)n-=100;buttonUntil[n]=now()+.18;if(n>=1&&n<=8)buttonUntil[n+100]=buttonUntil[n];
 if(n===91)pause();else if(n===92)stop();else if(n===93)restart();else if(n===94)blackout();
 else if(n===95)param("freeze",P.freeze?0:1);else if(n===96)param("fx",P.fx?0:1);
 else if(n===97)param("trails",P.trails>.65?.25:.9);else if(n===98)clear();
 else if(n===89)param("scene",0);else if(n===79)param("scene",1);else if(n===69)param("scene",2);else if(n===59)param("scene",3);else if(n===49)param("scene",4);else if(n===39)param("scene",5);else if(n===29)palettecycle();else if(n===19)param("detector",P.detector?0:1);
 else if(n>=1&&n<=6)param("focus",P.focus===n-1?0:n-1);
 else if(n===7)param("bassWeight",P.bassWeight>1.5?.8:P.bassWeight+.4);else if(n===8)defaults();
}
function palettecycle(){param("palette",(P.palette+1)%7);}
function spacepanel(){param("detector",1);param("inspector",3);}
function inspectband(i){param("detectorBand",i);param("inspector",2);param("detector",1);}
function detectorreset(){param("impactLo",35);param("impactHi",160);param("impactSensitivity",1);param("impactGap",.16);P.roles[0].sensitivity=1;}
function defaults(){var d={brightness:.55,sensitivity:1,trails:.25,detail:.55,bassWeight:1.2,focus:0,scene:0,palette:0,detector:false,transition:.85,eventAmount:.7,spatialAmount:.85,spatialContrast:.65,freeze:false,black:false,fx:true,fxdepth:.85};for(var k in d)param(k,d[k]);clear();status("視覺與觸控效果已恢復預設，播放與音量保持原狀。");}
function render(){
 var t=now(),dt=lastFrame?LensFeatures.clamp(t-lastFrame,.001,.1):.05;lastFrame=t;
 if(t-lastFeatures>.15)analyse([],t);
 var f=behaviourFrame,display=presentation.step(f,perception,dt,P.eventAmount,measured,P),leds=visual.step(display,dt,P),g=interaction.gesture();
 var computed=now();
 fxparam("amount",P.fx&&g.count?(.25+g.strength*.75)*P.fxdepth*.95:0);fxparam("pressure",g.strength);fxparam("tone",g.y);fxparam("distance",g.x);
 var fxSent=now();
 if(hw&&connected)sendFrame(leds);
 if(hw&&t-lastQuery>5){lastQuery=t;outlet(1,MoonProtocol.layout);if(lastReply&&t-lastReply>12){hw=false;connected=false;releaseall();status("Launchpad 已失去回應；重新連接後按 CONNECT。");}}
 frameNo++;outlet(2,leds);
 if(uiDirty||t-lastUi>=.125){
  lastUi=t;uiDirty=false;var packet=JSON.stringify(snapshot(leds));
  // Large changing JSON strings must not become a new Max symbol on every frame.
  if(uiDict){uiDict.parse(packet);outlet(0,"dictionary",uiDict.name);}else outlet(0,"state",packet);
 }
 if(capture&&capture.isopen){
  pendingCapture={time:t,position:position,running:running,features:f,measurements:measured,perception:perception,transition:visual.transition.snapshot(),raw:analysis.raw,leds:leds,gesture:g,params:P,featureTime:lastFeatures,analysisMs:analysisMs,renderMs:(now()-t)*1000,computeMs:(computed-t)*1000,fxMs:(fxSent-computed)*1000,uiMs:(now()-fxSent)*1000,uiProfile:uiProfile};
  // Max can defer messages returning to the same JS object. Flush from the
  // snapshot reply, rather than accidentally storing the PREVIOUS frame position.
  if(running&&P.input===0)msg("capture-position","bang");else frameposition(position*1000);
 }
 if(traceOn&&t-lastLog>1){lastLog=t;checkpoint();}
}
var tickTask=new Task(render,this);
function frameposition(ms){if(!pendingCapture)return;pendingCapture.position=Math.max(0,Number(ms)/1000);if(capture&&capture.isopen){capture.writeline(JSON.stringify(pendingCapture));if(++captureFrames>60000)capturestop();}pendingCapture=null;}
function snapshot(leds){return {params:P,spatial:visual.spatial,features:behaviourFrame,measurements:measured,perception:perception,transition:visual.transition.snapshot(),leds:leds||visual.frame,gesture:interaction.gesture(),file:file.split("/").pop(),loaded:loaded,running:running,paused:paused,position:position,duration:duration,samplerate:samplerate,channels:channels,connected:connected,requested:hw,inputPort:inputPort,outputPort:outputPort,message:message,rec:rec,meter:meter,plugin:pluginName,pluginReady:pluginReady,frame:frameNo};}
function sendFrame(leds){var entries=[],i,n,c,old;for(i=0;i<64;i++){n=MoonProtocol.pad(i%8,Math.floor(i/8));c=leds.slice(i*3,i*3+3);old=lastLed[n];if(!old||c.join()!=old.join()){entries.push([n].concat(c));lastLed[n]=c;}}
 var edge=[[91,running],[92,!running],[93,0],[94,P.black],[95,P.freeze],[96,P.fx],[97,P.trails>.65],[98,0],[89,P.scene===0],[79,P.scene===1],[69,P.scene===2],[59,P.scene===3],[49,P.scene===4],[39,P.scene===5],[29,P.palette!==0],[19,P.detector],[1,P.focus===0],[2,P.focus===1],[3,P.focus===2],[4,P.focus===3],[5,P.focus===4],[6,P.focus===5],[7,0],[8,0]];
 for(i=1;i<=8;i++)edge.push([100+i,i<=6?P.focus===i-1:0]);
 for(i=0;i<edge.length;i++){n=edge[i][0];c=P.black?[0,0,0]:edge[i][1]||buttonUntil[n]>now()?[8,32,38]:[1,3,5];if(!lastLed[n]||lastLed[n].join()!=c.join()){entries.push([n].concat(c));lastLed[n]=c;}}
 if(entries.length)outlet(1,MoonProtocol.rgb(entries));
}
function connect(){if(inputPort==="none"||outputPort==="none"){status("請在 MIDI 路由中選擇 LPProMK3 MIDI 輸入與輸出。");return;}
 hw=true;identity=false;layout=false;connected=false;lastReply=now();lastQuery=now();lastLed={};
 outlet(1,MoonProtocol.programmer);outlet(1,MoonProtocol.blackout());outlet(1,MoonProtocol.inquiry);outlet(1,MoonProtocol.layout);status("正在確認 Launchpad Pro MK3 與 Programmer Mode…");
}
function disconnect(){releaseall();if(hw){outlet(1,MoonProtocol.blackout());outlet(1,MoonProtocol.live);outlet(1,MoonProtocol.noteLayout);}hw=false;identity=false;layout=false;connected=false;lastLed={};}
function refreshports(){enumerating=true;portLists={input:[],output:[]};msg("ports-refresh","bang");routeTask.schedule(200);}
function port(kind){if(enumerating)return;var a=arrayfromargs(arguments);a.shift();var name=a.join(" ");if(hw)disconnect();if(kind==="input"){inputPort=name;msg("midi-in","port",name);}else{outputPort=name;msg("lp-out","port",name);}}
function portseen(kind,command){var a=arrayfromargs(arguments);a.splice(0,2);if(command==="append"&&portLists[kind])portLists[kind].push(a.join(" "));}
function applyroutes(){enumerating=false;for(var i=0;i<2;i++){var kind=i?"output":"input",list=portLists[kind],current=i?outputPort:inputPort,chosen=list.indexOf(current)>=0?current:"none";
 if(chosen==="none")for(var j=0;j<list.length;j++)if(list[j].indexOf("LPProMK3 MIDI")>=0){chosen=list[j];break;}
 msg(kind+"-menu","append","none");port(kind,chosen);msg(kind+"-menu","setsymbol",chosen);
 }log("MIDI ROUTE "+inputPort+" -> "+outputPort);
}
var routeTask=new Task(applyroutes,this);
function midibyte(b){b=Number(b);if(b>=248)return;if(b===240){sx=[b];midiStatus=0;return;}
 if(sx){sx.push(b);if(b===247){reply(sx);sx=null;}else if(sx.length>2048)sx=null;return;}
 if(b>=128){midiStatus=b<240?b:0;midiData=[];return;}if(!midiStatus)return;
 midiData.push(b);var type=midiStatus&240,need=type===192||type===208?1:2;if(midiData.length<need)return;
 var n=midiData[0],v=midiData[1];midiData=[];if(!hw||!connected)return;
 if(type===144&&v>0)pad(n,v);else if(type===128||type===144&&v===0)padup(n);else if(type===160)pressure(n,v);else if(type===208)pressure(-1,n);else if(type===176)cc(n,v);
}
function reply(a){if(!hw)return;
 if(a[1]===126&&a[3]===6&&a[4]===2&&a[5]===0&&a[6]===32&&a[7]===41&&(a[8]===19||a[8]===35)&&a[9]===1){identity=true;lastReply=now();log("IDENTITY "+a.join(" "));}
 if(a[1]===0&&a[2]===32&&a[3]===41&&a[4]===2&&a[5]===14&&a[6]===0){layout=a[7]===17;lastReply=now();if(!layout){connected=false;releaseall();}}
 var ok=identity&&layout;if(ok&&!connected)status("Launchpad Pro MK3 已確認 · Programmer Mode 17");connected=ok;
}
function dspstatus(){msg("dsp-dialog","bang");}
function pluginpanel(){msg("fx-panel","front");}
function pluginload(){msg("plugin-dialog","bang");}
function pluginfile(path){param("plugin",0);pluginReady=false;pluginInputs=0;pluginOutputs=0;pluginSynth=1;pluginPolls=0;pluginName=String(path).split("/").pop();msg("vst","drop");msg("vst","plug",path);pluginTask.schedule(500);}
function plugincheck(){msg("vst","get",-1);msg("vst","get",-2);msg("vst","get",-7);if(!pluginReady&&++pluginPolls<10)pluginTask.schedule(500);}
var pluginTask=new Task(plugincheck,this);
function plugininfo(index,value){if(Number(index)===-1)pluginInputs=Number(value);if(Number(index)===-2)pluginOutputs=Number(value);if(Number(index)===-7)pluginSynth=Number(value);
 var ok=pluginInputs>0&&pluginOutputs>0&&pluginSynth===0;if(ok&&!pluginReady)status("效果器就緒："+pluginName+"，可在效果器面板啟用。");pluginReady=ok;
}
function plugineditor(){msg("vst","open");}
function pluginread(){msg("vst","read");}
function pluginwrite(){msg("vst","write");}
function pluginparam(index,value){msg("vst","list",Number(index),LensFeatures.clamp(Number(value),0,1));}
function record(){if(rec){msg("recorder","int",0);rec=false;status("錄音已結束");}else msg("record-dialog","bang");}
function recordfile(path){if(rec){msg("recorder","int",0);rec=false;}pendingRecordPath=String(path);msg("dsp","start");recordOpenTask.schedule(250);}
function openrecord(){if(!pendingRecordPath)return;msg("recorder","open",pendingRecordPath);pendingRecordPath="";recReady=true;recordTask.schedule(100);}
var recordOpenTask=new Task(openrecord,this);
function beginrecord(){if(recReady){msg("recorder","int",1);rec=true;status("正在錄製效果後的輸出");}}
var recordTask=new Task(beginrecord,this);
function logto(path){logPath=String(path);}
function trace(v){traceOn=Number(v)!==0;}
function checkpoint(){log("CHECK "+JSON.stringify({state:snapshot(),raw:analysis.raw,time:now()}));}
function capturefile(path){capturestop();capture=new File(String(path),"write","TEXT");captureFrames=0;if(capture.isopen){capture.eof=0;capture.position=0;}}
function capturestop(){pendingCapture=null;if(capture){capture.close();capture=null;}}
function notifydeleted(){bootTask.cancel();tickTask.cancel();recordOpenTask.cancel();recordTask.cancel();pluginTask.cancel();routeTask.cancel();capturestop();disconnect();if(rec)msg("recorder","int",0);}

// Reinitialise a development autowatch reload as well as a fresh patch load.
var bootTask=new Task(init,this);bootTask.schedule(500);
