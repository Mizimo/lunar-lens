/* Translation boundary: event semantics -> visual envelopes. No audio sampling.
   Events are consumed once by ID even when rendering and measurement clocks differ. */
var LensPresentation=(function(){
 function Engine(){this.clear();}
 Engine.prototype.clear=function(){this.epoch=-1;this.seen={};this.reframe=0;this.entry=0;this.texture=0;this.release=0;this.direction=0;};
 Engine.prototype.step=function(features,perception,dt,amount){
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
  return f;
 };
 return {Engine:Engine};
})();
if(typeof module!=="undefined")module.exports=LensPresentation;
