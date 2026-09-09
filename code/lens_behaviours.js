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
