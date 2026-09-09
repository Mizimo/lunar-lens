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
