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
