/* Measurement boundary: physical units and freshness, no visual decisions.
   Raw v1.2.1 detector inputs remain untouched and are not normalised here. */
var LensMeasurements=(function(){
 function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
 function number(x,fallback){return typeof x==='number'&&isFinite(x)?x:fallback;}
 function db(x){return 20*Math.log(Math.max(.00001,x))/Math.LN10;}
 function Engine(){this.reset();}
 Engine.prototype.reset=function(){this.spectral=null;this.context=null;this.result=null;this.lastSerial=-1;this.freshAt=-10;};
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
  this.result={schemaVersion:1,time:t,sampleRate:sr,active:!!active,
   spectrum:{valid:!!valid,frame:s[6],age:Math.max(0,t-this.freshAt),windowSamples:2048,hopSamples:512,
    centroidHz:s[0]*sr*.5,spreadHz:s[1]*sr*.5,flatness:s[2],change:s[3],concentration:s[4],entropy:s[5]},
   level:{valid:!!cv,rmsFast:Math.max(0,number(a[8],0)),momentaryDb:db(c[0]),shortTermDb:db(c[1]),
    crestDb:clamp(db(Math.max(.00001,number(a[9],0)))-db(Math.max(.00001,number(a[8],0))),0,40)},
   space:{valid:!!cv,correlation:clamp(c[2],-1,1),balance:clamp(c[3],-1,1),
    sideRatio:clamp(number(a[11],0)/Math.max(.00001,number(a[10],0)+number(a[11],0)),0,1)},
   waveform:{zeroCrossingRate:clamp(c[4],0,1),valid:!!cv},bandPowerShape:shape};
  return this.result;
 };
 return {Engine:Engine};
})();
if(typeof module!=="undefined")module.exports=LensMeasurements;
