/* Track-independent temporal analysis. Sound roles, not instrument stems.
   15 inputs: eight bands, RMS/peak/mono/side, dedicated impact fast/slow/peak. */
var LensFeatures=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function smooth(a,b,dt,t){return a+(b-a)*(1-Math.exp(-dt/t));}
 function norm(x){return clamp(Math.pow(Math.max(0,x),.78),0,1);}
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
  this.impactPrevious=0;this.impactFallback=0;this.impactArmed=true;this.impactCooldown=0;
  this.impact={fast:0,slow:0,ratio:0,rise:0,threshold:0,support:0,peak:0};
 };
 Engine.prototype.step=function(values,time,sensitivity,impactSensitivity,impactGap){
  var a=[],i,j;for(i=0;i<15;i++)a[i]=clamp(isFinite(values[i])?Number(values[i]):0,0,8);
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
  // Separate counters latch events across slower render frames.
  var flux=[0,0,0],delta=[];
  for(i=0;i<8;i++){v=Math.log(1+a[i]*60);delta[i]=Math.max(0,v-this.prev[i]);this.prev[i]=v;}
  flux[0]=(delta[0]*.9+delta[1]+delta[2]*.65)/2.55;
  flux[1]=(delta[3]+delta[4]+delta[5]*.7)/2.7;
  flux[2]=(delta[6]+delta[7]*.8+delta[5]*.15)/1.95;
  var fast=values.length>=15?a[12]:grouped[0];
  this.impactFallback=smooth(this.impactFallback,fast,dt,.09);
  var slowImpact=values.length>=15?a[13]:this.impactFallback;
  var ratio=fast/Math.max(.002,slowImpact),support=fast/Math.max(.003,rms);
  var impLog=Math.log(1+fast*100),rise=Math.max(0,impLog-this.impactPrevious)*.02/dt;
  this.impactPrevious=impLog;this.impactCooldown=Math.max(0,this.impactCooldown-dt);
  if(ratio<1.025||fast<.002)this.impactArmed=true;
  flux[0]=rise;
  if(!active||this.age<.12)flux=[0,0,0];
  for(i=0;i<3;i++){
   var hist=this.recent[i],avg=0,variance=0;
   for(j=0;j<hist.length;j++)avg+=hist[j];avg/=Math.max(1,hist.length);
   for(j=0;j<hist.length;j++)variance+=Math.pow(hist[j]-avg,2);variance/=Math.max(1,hist.length);
   var threshold=Math.max([.14,.020,.014][i],avg*1.5+Math.sqrt(variance)*.65)/Math.sqrt(i===0?clamp(impactSensitivity||1,.4,2.5):sensitivity);
   var hit=this.bandSupport[i]>.25&&flux[i]*this.bandSupport[i]>threshold&&time-this.lastHits[i]>[.12,.10,.065][i];
   if(i===0){
    hit=active&&this.age>.12&&this.impactCooldown===0&&this.impactArmed&&fast>.002&&support>.25&&ratio>1.35&&rise>threshold&&time-this.lastHits[0]>(impactGap||.16);
    this.impact={fast:fast,slow:slowImpact,ratio:ratio,rise:rise,threshold:threshold,support:support,peak:values.length>=15?a[14]:a[9]};
    if(hit)this.impactArmed=false;
   }
   if(hit){this.lastHits[i]=time;this.counts[i]++;this.count++;this.transients[i]=clamp(flux[i]/(threshold*2.8),.28,1);if(i===2)this.highIndex=delta[7]>delta[6]?1:0;}
   else this.transients[i]*=Math.exp(-dt/[.18,.13,.07][i]);
   hist.push(flux[i]);if(hist.length>75)hist.shift();
  }
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
 Engine.prototype.resetImpact=function(){this.impactCooldown=.3;this.recent[0]=[];this.transients[0]=0;this.impactArmed=true;};
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
 Engine.prototype.snapshot=function(){return {bands:this.bands.slice(),spectrum:this.spectrum.slice(),roles:[this.transients[0],this.body,this.phrase,this.bed,Math.max(this.bands[2]*.5,this.transients[2])],impact:this.impact,behaviour:{phrase:this.phrase,bed:this.bed,articulation:this.articulation,motion:this.spectralMotion,persistence:this.persistence,states:this.roleStates.slice()},counts:this.counts.slice(),transients:this.transients.slice(),bandSupport:this.bandSupport.slice(),body:this.body,midContour:this.midContour,highIndex:this.highIndex,energy:this.energy,slow:this.slow,brightness:this.bright,width:this.width,transient:this.transient,pulse:this.pulse,bpm:this.tempo,confidence:this.confidence,db:this.db,crest:this.crest,active:this.active,count:this.count};};
 return {Engine:Engine,clamp:clamp,smooth:smooth};
})();
if(typeof module!=="undefined")module.exports=LensFeatures;
