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
