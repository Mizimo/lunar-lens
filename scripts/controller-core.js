autowatch=1;inlets=1;outlets=3;
include("lens_protocol.js");include("lens_features.js");include("lens_visual.js");
var self=this,analysis=new LensFeatures.Engine(),visual=new LensVisual.Engine();
var P={master:.4,brightness:.55,sensitivity:1,trails:.25,detail:.55,bassWeight:1.2,focus:0,scene:0,palette:0,detector:false,detectorBand:8,impactLo:35,impactHi:160,impactSensitivity:1,impactGap:.16,freeze:false,black:false,fx:true,fxdepth:.85,monitor:false,loop:false,input:0,livegain:1,plugin:false};
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
 ramp("master",P.master);ramp("monitor",0);ramp("file-gain",1);ramp("live-gain",0);ramp("mono",0);ramp("plugin-dry",1);ramp("plugin-wet",0);
 msg("analysis","impactLo",P.impactLo);msg("analysis","impactHi",P.impactHi);msg("vst","disable",1);msg("recorder","samptype","float32");msg("poll","int",1);refreshports();
 tickTask.interval=33;tickTask.repeat();status("READY · 五個聲音行為 · v1.2.1");
}
function openfile(){msg("file-dialog","bang");}
function demo(){loadfile(rootPath()+"media/Lunar-Departure-demo.wav");}
function loadfile(path){var a=arrayfromargs(arguments);path=a.join(" ");var check=new File(path,"read");if(!check.isopen){status("無法開啟音訊："+path);return;}check.close();
 stop();file="";loaded=false;duration=0;channels=0;pendingFile=path;analysis.reset();visual.clear();
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
 msg("dsp","start");running=true;analysis.reset();visual.clear();
 if(P.input===0){if(paused)msg("player","resume");else msg("player","int",1);}else ramp("live-gain",P.livegain);
 paused=false;status(P.input?"LIVE INPUT 分析中":"播放中 · 原速 1×");
}
function pause(){if(!running){play();return;}running=false;paused=true;if(P.input===0)msg("player","pause");else ramp("live-gain",0);releaseall();status("已暫停");}
function stop(){running=false;paused=false;position=0;msg("player","int",0);ramp("live-gain",0);releaseall();analysis.reset();visual.clear();P.freeze=false;status("已停止");}
function restart(){if(P.input===0&&loaded){P.freeze=false;seek(0);status("從頭播放 · 原速 1×");}else{stop();play();}}
// sfplay~ also bangs after an explicit 0. A deferred halt from before a restart
// must not finish the new playback. Position snapshots arrive every 100 ms.
function fileended(){if(running&&P.input===0&&!P.loop&&position+.25>=duration){running=false;paused=false;position=duration;releaseall();status("播放完畢");}}
function seek(fraction){if(!loaded||P.input!==0||duration<=0)return;releaseall();analysis.reset();visual.clear();position=LensFeatures.clamp(Number(fraction),0,.999)*duration;running=true;paused=false;msg("dsp","start");msg("player","seek",position*1000);}
function param(name,v){if(P[name]===undefined)return;
 if(["fx","freeze","black","monitor","loop","plugin","detector"].indexOf(name)>=0)v=Number(v)!==0;
 else {v=Number(v);if(!isFinite(v))return;var ranges={sensitivity:[.35,2.5],bassWeight:[.6,1.8],scene:[0,5],focus:[0,5],palette:[0,6],detectorBand:[0,8],livegain:[0,4],impactLo:[20,160],impactHi:[70,400],impactSensitivity:[.4,2.5],impactGap:[.08,.4]},r=ranges[name]||[0,1];v=LensFeatures.clamp(v,r[0],r[1]);if(["scene","focus","input","palette","detectorBand"].indexOf(name)>=0)v=Math.round(v);}
 if(name==="impactLo")v=Math.min(v,P.impactHi-25);
 if(name==="impactHi")v=Math.max(v,P.impactLo+25);
 if(name==="input"&&v!==P.input){stop();analysis.reset();visual.clear();P.monitor=false;ramp("monitor",0);ramp("file-gain",v?0:1);}
 if(name==="plugin"&&v&&!pluginReady){status("先選擇並載入效果器，再啟用。 ");return;}
 P[name]=v;
 uiDirty=true;
 if(name==="impactLo"||name==="impactHi"){msg("analysis",name,v);analysis.resetImpact();visual.impacts=[];}
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
function releaseall(){visual.held={};msg("fx","amount",0);}
function clear(){releaseall();visual.clear();P.freeze=false;status("已清除殘影與按壓狀態");}
function features(){
 var a=arrayfromargs(arguments),t=now(),before=analysis.counts[0];lastFeatures=t;
 analysis.step(running?a:[],t,P.sensitivity,P.impactSensitivity,P.impactGap);
 analysisMs=(now()-t)*1000;
 // Dispatch the low attack on arrival, then restart the regular 33 ms tail clock.
 // A hit must not wait in an unrelated animation timer's queue for one more frame.
 if(analysis.counts[0]>before){render();tickTask.cancel();tickTask.repeat(-1,33);}
}
function metervalue(v){meter=Number(v);}
function pad(note,velocity){note=Number(note);velocity=Number(velocity);if(velocity<=0){padup(note);return;}if(!visual.touch(note,velocity)){cc(note,velocity);return;}message="觸點 "+(note%10)+" · "+Math.floor(note/10)+"／按壓聚光，鬆開釋放";render();}
function padup(note){visual.release(Number(note));}
function pressure(note,value){visual.pressure(Number(note),Number(value));}
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
function inspectband(i){param("detectorBand",i);param("detector",1);}
function detectorreset(){param("impactLo",35);param("impactHi",160);param("impactSensitivity",1);param("impactGap",.16);}
function defaults(){var d={brightness:.55,sensitivity:1,trails:.25,detail:.55,bassWeight:1.2,focus:0,scene:0,palette:0,detector:false,freeze:false,black:false,fx:true,fxdepth:.85};for(var k in d)param(k,d[k]);clear();status("視覺與觸控效果已恢復預設，播放與音量保持原狀。");}
function render(){
 var t=now(),dt=lastFrame?LensFeatures.clamp(t-lastFrame,.001,.1):.05;lastFrame=t;
 if(t-lastFeatures>.15)analysis.step([],t,P.sensitivity);
 var f=analysis.snapshot(),leds=visual.step(f,dt,P),g=visual.gesture();
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
  pendingCapture={time:t,position:position,running:running,features:f,raw:analysis.raw,leds:leds,gesture:g,params:P,featureTime:lastFeatures,analysisMs:analysisMs,renderMs:(now()-t)*1000,computeMs:(computed-t)*1000,fxMs:(fxSent-computed)*1000,uiMs:(now()-fxSent)*1000,uiProfile:uiProfile};
  // Max can defer messages returning to the same JS object. Flush from the
  // snapshot reply, rather than accidentally storing the PREVIOUS frame position.
  if(running&&P.input===0)msg("capture-position","bang");else frameposition(position*1000);
 }
 if(traceOn&&t-lastLog>1){lastLog=t;checkpoint();}
}
var tickTask=new Task(render,this);
function frameposition(ms){if(!pendingCapture)return;pendingCapture.position=Math.max(0,Number(ms)/1000);if(capture&&capture.isopen){capture.writeline(JSON.stringify(pendingCapture));if(++captureFrames>60000)capturestop();}pendingCapture=null;}
function snapshot(leds){return {params:P,features:analysis.snapshot(),leds:leds||visual.frame,gesture:visual.gesture(),file:file.split("/").pop(),loaded:loaded,running:running,paused:paused,position:position,duration:duration,samplerate:samplerate,channels:channels,connected:connected,requested:hw,inputPort:inputPort,outputPort:outputPort,message:message,rec:rec,meter:meter,plugin:pluginName,pluginReady:pluginReady,frame:frameNo};}
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
function notifydeleted(){tickTask.cancel();recordOpenTask.cancel();recordTask.cancel();pluginTask.cancel();routeTask.cancel();capturestop();disconnect();if(rec)msg("recorder","int",0);}
