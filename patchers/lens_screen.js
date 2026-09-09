autowatch=1;inlets=1;outlets=1;mgraphics.init();mgraphics.relative_coords=0;mgraphics.autofill=0;
var S=null,hit=[],drag=null,mousePad=null,mouseY=0,textPaths={},paintMs=0;
var sharedState=typeof Dict!=="undefined"?new Dict():null;
function dictionary(name){if(sharedState){sharedState.name=name;state(sharedState.stringify());}}
var C={bg:[.025,.036,.06,1],panel:[.042,.058,.092,1],line:[.115,.15,.21,1],text:[.84,.9,.95,1],dim:[.4,.5,.61,1],cyan:[.36,.8,.87,1],violet:[.65,.52,.9,1],gold:[.89,.66,.4,1]};
function col(c){mgraphics.set_source_rgba(c);}
function rect(x,y,w,h,c,r){col(c);if(r)mgraphics.rectangle_rounded(x,y,w,h,r,r);else mgraphics.rectangle(x,y,w,h);mgraphics.fill();}
function text(t,x,y,size,c){
 // One shaped glyph path per label position; fixed Chinese labels need no
 // repeated font fallback / text layout on every dashboard update.
 t=String(t);size=size||12;var key=x+":"+y+":"+size,cache=textPaths[key];
 col(c||C.text);mgraphics.new_path();
 if(!cache||cache.text!==t){
  mgraphics.select_font_face("Arial");mgraphics.set_font_size(size);mgraphics.move_to(x,y);mgraphics.text_path(t);
  cache={text:t,path:mgraphics.copy_path()};textPaths[key]=cache;
 }else mgraphics.append_path(cache.path);
 mgraphics.fill();
}
function line(x,y,x2,y2,c){col(c);mgraphics.set_line_width(1);mgraphics.move_to(x,y);mgraphics.line_to(x2,y2);mgraphics.stroke();}
function area(x,y,w,h,cmd,args,type,lo,hi){hit.push({x:x,y:y,w:w,h:h,cmd:cmd,args:args||[],type:type||"button",lo:lo,hi:hi});}
function button(label,x,y,w,cmd,args,on,color){rect(x,y,w,29,on?(color||C.cyan):C.panel,4);text(label,x+9,y+19,11,on?C.bg:C.text);area(x,y,w,29,cmd,args);}
function slider(label,v,x,y,w,cmd,args,lo,hi,display,color){text(label,x,y,11,C.dim);text(display===undefined?Math.round(v*100)+"%":display,x+w-50,y,11);rect(x,y+12,w,3,C.line,1);rect(x,y+12,Math.max(2,(v-lo)/(hi-lo)*w),3,color||C.cyan,1);rect(x+(v-lo)/(hi-lo)*w-3,y+8,6,11,color||C.cyan,2);area(x,y+3,w,26,cmd,args,"slider",lo,hi);}
function state(json){try{var begin=new Date().getTime();S=JSON.parse(json);var parsed=new Date().getTime();mgraphics.redraw();outlet(0,"uiperf",parsed-begin,new Date().getTime()-parsed,paintMs);}catch(e){post("LENS UI "+e+"\n");}}
function time(t){t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+":"+(t%60<10?"0":"")+t%60;}
function paint(){
 var paintStart=new Date().getTime();
 rect(0,0,1180,830,C.bg);hit=[];
 text("LUNAR LENS",28,46,29);text("重量、延續、碎裂，各自成形。",30,72,12,C.dim);
 text("AUDIO → FORM → TOUCH",849,43,13,C.cyan);text("Max · Launchpad Pro MK3 · 1.2.1",849,66,11,C.dim);
 if(!S){text("正在建立音訊分析與燈光引擎…",28,150,16,C.cyan);return;}
 var p=S.params,f=S.features,i,x,y;
 button("載入音訊",28,96,93,"openfile");button("DEMO",129,96,66,"demo");
 button(S.running?"Ⅱ PAUSE":"▶ PLAY",211,96,98,"pause",[],S.running);
 button("■ STOP",317,96,82,"stop");button("RESTART",407,96,90,"restart");
 button("BLACKOUT",513,96,107,"blackout",[],p.black,C.violet);
 button(p.monitor?"聲音 ON":"聲音 OFF",636,96,97,"audio",[],p.monitor);
 button(S.connected?"已連接 MK3":"CONNECT MK3",749,96,137,"connect",[],S.connected);
 button("歸還設備",894,96,96,"disconnect");button("錄音",1006,96,66,"record",[],S.rec,C.gold);
 button("音訊設定",1080,96,77,"dspstatus");
 line(28,143,1152,143,C.line);
 text("SOURCE",28,173,10,C.dim);
 text(S.file?S.file.slice(0,30):"將音訊拖放到下方區域",28,196,13,C.text);
 // A native dropfile occupies the empty file target below.
 rect(28,210,264,40,C.panel,5);text("DROP AUDIO HERE",48,235,11,C.dim);
 button("檔案",28,269,76,"param",["input",0],p.input===0);
 button("即時輸入 1/2",112,269,131,"param",["input",1],p.input===1);

 text("聲音角色 / 按右側獨看",28,364,11,C.dim);button("全層",238,346,54,"param",["focus",0],p.focus===0);
 var labels=["低頻衝擊","地基  BODY","前景  PHRASE","鋪陳  BED","細節  DETAIL"],colors=[C.cyan,C.gold,[.93,.4,.63,1],C.violet,[.78,.87,.96,1]];
 for(i=0;i<5;i++){y=389+i*36;text(labels[i],28,y,11,C.dim);var states={rest:"休止",attack:"起音",release:"退去",moving:"活動",sustain:"延續"};text(states[(f.behaviour||{states:[]}).states[i]]||"",181,y,10,colors[i]);rect(28,y+11,183,4,C.line,2);rect(28,y+11,Math.max(1,(f.roles[i]||0)*183),4,colors[i],2);button("獨看",238,y-15,54,"param",["focus",p.focus===i+1?0:i+1],p.focus===i+1,colors[i]);}
 text("力度  "+f.db.toFixed(1)+" dBFS",28,575,12);text("峰均比 "+f.crest.toFixed(1)+" dB",179,575,10,C.dim);
 text("8 起音",28,601,9,C.dim);
 for(i=0;i<8;i++){
  x=98+i*25;rect(x,588,15,28,C.line,2);rect(x,616-(f.spectrum[i]||0)*28,15,(f.spectrum[i]||0)*28,colors[i<3?1:i<6?2:4],2);
  var bd=f.bandDynamics&&f.bandDynamics[i],flash=bd?bd.impact:0;
  rect(x,581,15,4,[.15+.8*flash,.20+.75*flash,.26+.7*flash,1],1);
  area(x-3,578,22,44,"inspectband",[i]);
 }
 text("PULSE",28,649,10,C.dim);text(f.confidence>.48&&f.bpm?Math.round(f.bpm)+" BPM":"聆聽中",90,650,15,f.confidence>.48?C.cyan:C.dim);
 text("信心 "+Math.round(f.confidence*100)+"%",213,649,10,C.dim);
 text("寬度 "+Math.round(f.width*100)+"% · 起音 "+f.count,28,681,11,C.dim);
 var scenes=["重力 / 沉積","天體 / 公轉","織光 / 經緯","門廊 / 縱深","雙生 / 呼應","拼光 / 碎片"];
 text(scenes[p.scene],336,173,14,C.cyan);text(p.freeze?"背景已凍結":p.focus?"獨看："+labels[p.focus-1]:"五個聲音行為",581,172,11,C.dim);
 rect(320,190,448,448,[.012,.019,.034,1],12);
 for(y=0;y<8;y++)for(x=0;x<8;x++){
  // The overlaid lens_grid.js draws at event/animation speed. Keep coordinates
  // here for the standalone dashboard's pointer fallback and callback tests.
  area(337+x*53,207+y*53,44,44,"pad",[11+x+(7-y)*10,92]);
 }
 text("點按產生漣漪 · 按住聚光 · 滑鼠上下拖曳模擬壓力",333,663,11,C.dim);
 slider("進度 · 拖曳後播放",S.duration?S.position/S.duration:0,333,685,419,"seek",[],0,1,time(S.position));
 var paletteNames=["隨構圖","琥珀冰川","月夜紫羅蘭","翡翠珊瑚","鈷藍熔岩","蘭花青檸","桃紅電光"];
 text("COMPOSITION",810,173,10,C.dim);button(paletteNames[p.palette||0],933,152,113,"palettecycle",[],p.palette>0,C.gold);button("VST / AU",1056,152,96,"pluginpanel",[],p.plugin,C.gold);
 if(!p.detector){for(i=0;i<6;i++)button(scenes[i],810,190+i*29,342,"param",["scene",i],p.scene===i,i===0?C.cyan:C.violet);
 slider("低頻重量",p.bassWeight,810,375,342,"param",["bassWeight"],.6,1.8,p.bassWeight.toFixed(2)+"×");
 slider("光線亮度",p.brightness,810,417,342,"param",["brightness"],0,1);
 slider("殘影長度",p.trails,810,459,342,"param",["trails"],0,1,undefined,C.violet);
 slider("感應靈敏度",p.sensitivity,810,501,342,"param",["sensitivity"],.35,2.5,p.sensitivity.toFixed(2)+"×");
 slider("細節密度",p.detail,810,543,342,"param",["detail"],0,1,undefined,C.gold);
 button("凍結",810,574,79,"param",["freeze",p.freeze?0:1],p.freeze,C.violet);
 button("清除",897,574,79,"clear");button("LOOP",984,574,79,"param",["loop",p.loop?0:1],p.loop);
 button("還原",1071,574,81,"defaults");
 button("觸控聲音效果",810,619,155,"param",["fx",p.fx?0:1],p.fx,C.gold);
 text(p.fx?"濾色、空間、壓力顆粒":"鬆開回到原音",979,638,10,C.dim);
 slider("效果深度",p.fxdepth,810,670,342,"param",["fxdepth"],0,1,undefined,C.gold);
 }else{
  text("分頻起音 / 低頻範圍",810,213,17,C.cyan);
  text("8 段各自偵測；以下範圍控制低頻衝擊。",810,239,11,C.dim);
  slider("下限 / Hz",p.impactLo,810,278,342,"param",["impactLo"],20,160,Math.round(p.impactLo)+" Hz");
  slider("上限 / Hz",p.impactHi,810,330,342,"param",["impactHi"],70,400,Math.round(p.impactHi)+" Hz");
  slider("觸發靈敏度",p.impactSensitivity,810,382,342,"param",["impactSensitivity"],.4,2.5,p.impactSensitivity.toFixed(2)+"×");
  slider("最短間隔",p.impactGap,810,434,342,"param",["impactGap"],.08,.4,Math.round(p.impactGap*1000)+" ms");
  var selected=p.detectorBand===undefined?8:p.detectorBand;
  for(i=0;i<9;i++)button(i===8?"LOW":String(i+1),810+i*38,471,i===8?38:31,"param",["detectorBand",i],selected===i);
  var names=["30–70","70–140","140–280","280–600","600–1500","1500–3500","3500–7500","7500–16000"],imp=selected===8?f.impact:(f.bandDynamics||[])[selected];
  imp=imp||{rise:0,threshold:0,count:0};
  text((selected===8?"可調低頻":names[selected]+" Hz")+"  ·  次數 "+(imp.count||0)+"  ·  力度 "+Math.round((imp.strength||0)*100)+"%",810,526,13);
  text("上升量 "+imp.rise.toFixed(3)+"  ·  門檻 "+imp.threshold.toFixed(3),810,552,12,C.dim);
  text(selected===8?"能量比 "+imp.ratio.toFixed(2)+" / 1.35 · 起音也需過門檻":"亮柱是能量，上方短閃是各段起音。",810,581,11,C.dim);
  text("低頻：1.1 判斷 · 其餘八段保留獨立動態。",810,604,11,C.dim);
  button("恢復偵測",810,624,155,"detectorreset");
  button("返回構圖",979,624,173,"param",["detector",0],true);
 }
 button(p.detector?"返回構圖":"分頻起音設定",28,315,128,"param",["detector",p.detector?0:1],p.detector);
 text(Math.round(p.impactLo)+"–"+Math.round(p.impactHi)+" Hz",170,334,11,C.dim);
 line(28,708,1152,708,C.line);
 text("MIDI IN",28,732,10,C.dim);text("LED OUT",335,732,10,C.dim);
 // Native MIDI menus occupy y743, above this JSUI.
 button("重掃",639,741,70,"refreshports");
 slider("MASTER",p.master,738,746,193,"param",["master"],0,1);
 var peak=Math.max(0,Math.min(1,S.meter));rect(953,756,199,4,C.line,2);rect(953,756,Math.max(1,199*peak),4,peak>.95?C.gold:C.cyan,2);
 text(S.message.slice(0,67),28,794,11,C.dim);
 text(time(S.position)+" / "+time(S.duration),740,794,12,C.cyan);
 text(S.samplerate?S.samplerate/1000+" kHz · "+S.channels+" ch":"READY",960,794,11,C.dim);
 paintMs=new Date().getTime()-paintStart;
}
function perform(h,x){var a=h.args.slice();if(h.type==="slider")a.push(h.lo+Math.max(0,Math.min(1,(x-h.x)/h.w))*(h.hi-h.lo));outlet.apply(this,[0,h.cmd].concat(a));}
function release(){if(mousePad!==null){outlet(0,"padup",mousePad);mousePad=null;}}
function onclick(x,y){release();for(var i=hit.length-1;i>=0;i--){var h=hit[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){drag=h.type==="slider"?h:null;if(h.cmd==="pad"){mousePad=h.args[0];mouseY=y;}perform(h,x);return;}}}
function ondrag(x,y,but){if(!but){drag=null;release();return;}if(drag)perform(drag,x);if(mousePad!==null)outlet(0,"pressure",mousePad,Math.max(0,Math.min(127,64+(mouseY-y)*2)));}
function onresize(){mgraphics.redraw();}onresize.local=1;
