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
