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
