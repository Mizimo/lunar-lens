import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {analysisSource} from './analysis-source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
const appversion={major:9,minor:1,revision:4,architecture:'arm64',modernui:1};
function patch(rect=[60,80,1180,830],presentation=false,gen=false){return {fileversion:1,appversion,classnamespace:gen?'dsp.gen':'box',rect,openinpresentation:+presentation,default_fontsize:12,default_fontname:'Arial',bgcolor:[.025,.036,.06,1],boxes:[],lines:[],autosave:0};}
function box(p,id,text,x,y,w=150,ins=1,outs=1,extra={}){const b={id,maxclass:'newobj',numinlets:ins,numoutlets:outs,patching_rect:[x,y,w,22],...extra};if(text)b.text=text;p.boxes.push({box:b});return id;}
function wire(p,a,ao,b,bi,order){p.lines.push({patchline:{source:[a,ao],destination:[b,bi],...(order===undefined?{}:{order})}});}
function save(f,p){write('patchers/'+f,JSON.stringify({patcher:p},null,2)+'\n');}
function gen(name,src,inputs,outputs){const p=patch([80,80,980,700],false,true);box(p,'code',null,70,100,850,inputs,outputs,{maxclass:'codebox',code:read('code/'+src),patching_rect:[70,100,850,480]});for(let i=0;i<inputs;i++){box(p,'in'+i,'in '+(i+1),70+i*120,35,90,0,1);wire(p,'in'+i,0,'code',i);}for(let i=0;i<outputs;i++){box(p,'out'+i,'out '+(i+1),70+i*120,620,90,1,0);wire(p,'code',i,'out'+i,0);}save(name,p);}
const bundle=read('scripts/controller-core.js').replace(/include\("([^"]+)"\);/g,(_,f)=>'\n/* bundled '+f+' */\n'+read('code/'+f)+'\n');
write('patchers/lens_runtime.js','// GENERATED: edit scripts/controller-core.js and code/*.js, then npm run build.\n'+bundle);
write('patchers/lens_screen.js',read('code/lens_ui.js'));
write('patchers/lens_grid.js',read('code/lens_grid.js'));
write('code/lens_analysis.genexpr',analysisSource());
gen('lens_analysis.gendsp','lens_analysis.genexpr',2,24);gen('lens_fx.gendsp','lens_fx.genexpr',2,2);
gen('lens_context.gendsp','lens_context.genexpr',2,5);gen('lens_spectral.gendsp','lens_spectral.genexpr',5,7);
// Spectral descriptors are a separate, slower measurement bus, polled as one list.
const spectral=patch([100,100,980,600]);
box(spectral,'left','fftin~ 1',20,20,120,1,3);box(spectral,'right','fftin~ 2',180,20,120,1,3);
box(spectral,'shape','gen~ lens_spectral',20,90,280,5,7);
wire(spectral,'left',0,'shape',0);wire(spectral,'left',1,'shape',1);wire(spectral,'right',0,'shape',2);wire(spectral,'right',1,'shape',3);wire(spectral,'left',2,'shape',4);
box(spectral,'poll','in 3',380,20,90,0,1);box(spectral,'trigger','t b b b b b b b',380,90,190,1,7);wire(spectral,'poll',0,'trigger',0);
box(spectral,'pack','pack f f f f f f f',20,230,260,7,1);box(spectral,'out','out 1',20,280,90,1,0);
for(let i=0;i<7;i++){box(spectral,'snap'+i,'snapshot~',20+i*120,160,100,2,1);wire(spectral,'shape',i,'snap'+i,0);wire(spectral,'trigger',i,'snap'+i,0);wire(spectral,'snap'+i,0,'pack',i);}wire(spectral,'pack',0,'out',0);save('lens_spectral.maxpat',spectral);
const p=patch(undefined,true);
box(p,'ui',null,10,10,1180,1,1,{maxclass:'v8ui',filename:'lens_screen.js',varname:'ui',background:1,patching_rect:[10,10,1180,830],presentation:1,presentation_rect:[0,0,1180,830]});
box(p,'controller','v8 lens_runtime.js',20,880,220,1,3,{varname:'controller'});wire(p,'ui',0,'controller',0);
box(p,'ui-defer','deferlow',20,850,100);wire(p,'controller',0,'ui-defer',0);wire(p,'ui-defer',0,'ui',0);
box(p,'grid',null,320,190,448,1,1,{maxclass:'v8ui',filename:'lens_grid.js',varname:'grid',patching_rect:[320,190,448,448],presentation:1,presentation_rect:[320,190,448,448]});wire(p,'controller',2,'grid',0);wire(p,'grid',0,'controller',0);
// Front-to-back box order matters for the overlaid preview in Presentation mode.
p.boxes.unshift(p.boxes.splice(p.boxes.findIndex(x=>x.box.id==='grid'),1)[0]);
for(const id of ['ui','grid']){const b=p.boxes.find(x=>x.box.id===id).box;b.textfile={filename:b.filename,flags:0,embed:0,autowatch:1};}
box(p,'lb','loadbang',20,930,90);box(p,'delay','delay 350',20,970,100);box(p,'init','init',20,1010,80,2,1,{maxclass:'message'});wire(p,'lb',0,'delay',0);wire(p,'delay',0,'init',0);wire(p,'init',0,'controller',0);
box(p,'control','r lunar-lens-control',260,890,170);wire(p,'control',0,'controller',0);
box(p,'drop',null,260,945,264,1,2,{maxclass:'dropfile',presentation:1,presentation_rect:[28,210,264,40],bgcolor:[0,0,0,0],bordercolor:[.15,.21,.3,1]});
box(p,'file-dialog','opendialog',260,1000,120,1,2,{varname:'file-dialog'});box(p,'loadtag','prepend loadfile',260,1050,150);wire(p,'drop',0,'loadtag',0);wire(p,'file-dialog',0,'loadtag',0);wire(p,'loadtag',0,'controller',0);
box(p,'player','sfplay~ 2 0 1',20,1130,230,2,4,{varname:'player'});
box(p,'info','sfinfo~',280,1130,180,1,6,{varname:'info'});
for(const [o,name] of [[0,'filechannels'],[2,'filerate'],[3,'fileduration']]){box(p,'info'+o,'prepend '+name,280+o*150,1180,145);wire(p,'info',o,'info'+o,0);wire(p,'info'+o,0,'controller',0);}
box(p,'pos','snapshot~ 100',20,1190,125,2,1,{varname:'position-probe'});wire(p,'player',2,'pos',0);box(p,'postag','prepend fileposition',20,1230,170);wire(p,'pos',0,'postag',0);wire(p,'postag',0,'controller',0);
box(p,'capture-pos','snapshot~',20,1255,125,2,1,{varname:'capture-position'});wire(p,'player',2,'capture-pos',0);box(p,'capture-pos-tag','prepend frameposition',160,1255,195);wire(p,'capture-pos',0,'capture-pos-tag',0);wire(p,'capture-pos-tag',0,'controller',0);
box(p,'ended','fileended',170,1230,100,2,1,{maxclass:'message'});wire(p,'player',3,'ended',0);wire(p,'ended',0,'controller',0);
box(p,'adc','adc~ 1 2',550,1270,120,1,2);
box(p,'file-gain','line~ 1.',20,1290,100,2,2,{varname:'file-gain'});box(p,'live-gain','line~ 0.',550,1320,100,2,2,{varname:'live-gain'});box(p,'mono','line~ 0.',320,1290,100,2,2,{varname:'mono'});
box(p,'mono-copy','*~',320,1350,70,2,1);wire(p,'player',0,'mono-copy',0);wire(p,'mono',0,'mono-copy',1);
box(p,'analysis','gen~ lens_analysis',20,1520,440,2,24,{varname:'analysis'});box(p,'fx','gen~ lens_fx',550,1520,230,2,2,{varname:'fx'});
for(let c=0;c<2;c++){
 const x=20+c*230;box(p,'file'+c,'*~',x,1400,65,2,1);wire(p,'player',c,'file'+c,0);wire(p,'file-gain',0,'file'+c,1);
 if(c===1)wire(p,'mono-copy',0,'file'+c,0);
 box(p,'live'+c,'*~',550+c*230,1400,65,2,1);wire(p,'adc',c,'live'+c,0);wire(p,'live-gain',0,'live'+c,1);
 for(const s of ['file'+c,'live'+c]){wire(p,s,0,'analysis',c);wire(p,s,0,'fx',c);}
}
box(p,'poll','qmetro 20',20,1610,100,2,1,{varname:'poll'});box(p,'trig','t '+Array(24).fill('b').join(' '),20,1650,1020,1,24);wire(p,'poll',0,'trig',0);
box(p,'pack','pack '+Array(24).fill('f').join(' '),20,1780,1020,24,1);box(p,'featuretag','prepend features',20,1820,160);wire(p,'pack',0,'featuretag',0);wire(p,'featuretag',0,'controller',0);
for(let i=0;i<24;i++){box(p,'snap'+i,'snapshot~',20+i*88,1720,80,2,1);wire(p,'analysis',i,'snap'+i,0);wire(p,'trig',i,'snap'+i,0);wire(p,'snap'+i,0,'pack',i);}
box(p,'context','gen~ lens_context',1180,1520,240,2,5,{varname:'context'});
box(p,'spectral','pfft~ lens_spectral 2048 4',1470,1520,250,3,1,{varname:'spectral'});
for(let c=0;c<2;c++)for(const source of ['file'+c,'live'+c])for(const dest of ['context','spectral'])wire(p,source,0,dest,c);
box(p,'context-trigger','t b b b b b',1180,1610,180,1,5);wire(p,'poll',0,'context-trigger',0);
box(p,'context-pack','pack f f f f f',1180,1780,190,5,1);box(p,'context-tag','prepend contextual',1180,1820,190);wire(p,'context-pack',0,'context-tag',0);wire(p,'context-tag',0,'controller',0);
for(let i=0;i<5;i++){box(p,'context-snap'+i,'snapshot~',1180+i*100,1720,95,2,1);wire(p,'context',i,'context-snap'+i,0);wire(p,'context-trigger',i,'context-snap'+i,0);wire(p,'context-snap'+i,0,'context-pack',i);}
wire(p,'poll',0,'spectral',2);box(p,'spectral-tag','prepend spectral',1470,1580,180);wire(p,'spectral',0,'spectral-tag',0);wire(p,'spectral-tag',0,'controller',0);
// Context and spectral replies precede the unmodified detector frame.
for(const entry of p.lines){const l=entry.patchline;if(l.source[0]==='poll')l.order=l.destination[0]==='trig'?2:l.destination[0]==='spectral'?0:1;}
box(p,'dsp-state','dspstate~',1740,1520,130,1,6);box(p,'sr-tag','prepend audiorate',1740,1580,160);wire(p,'dsp-state',1,'sr-tag',0);wire(p,'sr-tag',0,'controller',0);
box(p,'vst','vst~ 2 2 @autosave 0',550,1870,240,2,8,{varname:'vst'});box(p,'plugin-dry','line~ 1.',400,1930,100,2,2,{varname:'plugin-dry'});box(p,'plugin-wet','line~ 0.',750,1930,100,2,2,{varname:'plugin-wet'});
box(p,'vsttag','prepend plugininfo',850,1870,170);wire(p,'vst',3,'vsttag',0);wire(p,'vsttag',0,'controller',0);
box(p,'master','line~ 0.4',700,2050,120,2,2,{varname:'master'});box(p,'monitor','line~ 0.',950,2120,100,2,2,{varname:'monitor'});
box(p,'dac','dac~ 1 2',940,2290,150,2,0,{varname:'dsp'});box(p,'recorder','sfrecord~ 2',570,2290,220,2,1,{varname:'recorder'});
for(let c=0;c<2;c++){
 let x=400+c*380;wire(p,'fx',c,'vst',c);
 box(p,'dry'+c,'*~',x,1980,70,2,1);wire(p,'fx',c,'dry'+c,0);wire(p,'plugin-dry',0,'dry'+c,1);
 box(p,'wet'+c,'*~',x+100,1980,70,2,1);wire(p,'vst',c,'wet'+c,0);wire(p,'plugin-wet',0,'wet'+c,1);
 box(p,'mg'+c,'*~',x,2070,70,2,1);wire(p,'dry'+c,0,'mg'+c,0);wire(p,'wet'+c,0,'mg'+c,0);wire(p,'master',0,'mg'+c,1);
 box(p,'guard'+c,'clip~ -0.98 0.98',x,2120,150,3,1);wire(p,'mg'+c,0,'guard'+c,0);
 box(p,'mon'+c,'*~',x,2180,70,2,1);wire(p,'guard'+c,0,'mon'+c,0);wire(p,'monitor',0,'mon'+c,1);wire(p,'mon'+c,0,'dac',c);wire(p,'guard'+c,0,'recorder',c);
}
box(p,'peak','peakamp~ 100',220,2170,130,2,1);wire(p,'guard0',0,'peak',0);box(p,'peak-tag','prepend metervalue',220,2210,180);wire(p,'peak',0,'peak-tag',0);wire(p,'peak-tag',0,'controller',0);
box(p,'record-dialog','savedialog WAVE',300,2280,160,1,2,{varname:'record-dialog'});box(p,'record-tag','prepend recordfile',300,2320,170);wire(p,'record-dialog',0,'record-tag',0);wire(p,'record-tag',0,'controller',0);
box(p,'dsp-dialog','; max dspstatus',20,2320,150,2,1,{varname:'dsp-dialog',maxclass:'message'});
box(p,'ports-refresh','t b b',20,2410,140,1,2,{varname:'ports-refresh'});
for(const [i,kind] of ['input','output'].entries()){
 const x=20+i*350;box(p,kind+'-menu',null,x,2480,295,1,3,{maxclass:'umenu',items:['none'],varname:kind+'-menu',presentation:1,presentation_rect:[28+i*307,743,292,25]});
 box(p,kind+'-info','midiinfo',x,2440,160,2,1);wire(p,kind+'-info',0,kind+'-menu',0);
 if(i===0){box(p,'inminus','-1',170,2410,40,2,1,{maxclass:'message'});wire(p,'ports-refresh',0,'inminus',0);wire(p,'inminus',0,kind+'-info',1);}else wire(p,'ports-refresh',1,kind+'-info',0);
 box(p,kind+'-seen','prepend portseen '+kind,x,2530,230);wire(p,kind+'-info',0,kind+'-seen',0);wire(p,kind+'-seen',0,'controller',0);
 box(p,kind+'-tag','prepend port '+kind,x,2570,230);wire(p,kind+'-menu',1,kind+'-tag',0);wire(p,kind+'-tag',0,'controller',0);
}
box(p,'midi-in','midiin none',740,2410,160,1,1,{varname:'midi-in'});box(p,'midi-tag','prepend midibyte',740,2470,180);wire(p,'midi-in',0,'midi-tag',0);wire(p,'midi-tag',0,'controller',0);
box(p,'lp-out','midiout none',970,2410,160,1,0,{varname:'lp-out'});wire(p,'controller',1,'lp-out',0);
// Optional effect bay: explicit enable and bypass commands; no third-party dependency.
const fxp=patch([100,100,740,410]);fxp.bgcolor=[.12,.15,.2,1];
box(fxp,'title','音訊效果器 / VST3 / AU · 原曲分析始終在效果器之前',25,20,680,1,0,{maxclass:'comment',textcolor:[.9,.94,1,1],fontsize:16});
box(fxp,'in',null,630,320,30,0,1,{maxclass:'inlet'});box(fxp,'this','thispatcher',600,360,110);wire(fxp,'in',0,'this',0);
box(fxp,'out',null,530,350,30,1,0,{maxclass:'outlet'});
for(const [i,title,cmd] of [[0,'選擇效果器','pluginload'],[1,'插件介面','plugineditor'],[2,'啟用','param plugin 1'],[3,'BYPASS','param plugin 0'],[4,'讀取 PRESET','pluginread'],[5,'儲存 PRESET','pluginwrite']]){
 let x=25+(i%3)*210,y=75+Math.floor(i/3)*70;box(fxp,'b'+i,title,x,y,185,2,1,{maxclass:'message'});box(fxp,'cmd'+i,cmd,x,y+30,185,2,1,{maxclass:'message'});wire(fxp,'b'+i,0,'cmd'+i,0);wire(fxp,'cmd'+i,0,'out',0);
}
box(fxp,'hint','插件介面內可調整參數與 preset。AU preset 建議由插件自身介面管理。',25,235,690,1,0,{maxclass:'comment',textcolor:[.85,.9,.98,1]});
box(fxp,'hint2','插件可能引入延遲；視覺分析保持原始音訊時間。預設 BYPASS。',25,267,690,1,0,{maxclass:'comment',textcolor:[.85,.9,.98,1]});
box(p,'fx-panel','p plugin-effects',800,2550,220,1,1,{varname:'fx-panel',patcher:fxp});wire(p,'fx-panel',0,'controller',0);
box(p,'plugin-dialog','opendialog',1030,2510,120,1,2,{varname:'plugin-dialog'});box(p,'plugin-path','prepend pluginfile',1030,2560,160);wire(p,'plugin-dialog',0,'plugin-path',0);wire(p,'plugin-path',0,'controller',0);
save('Lunar Lens.maxpat',p);
const contents={patchers:{},code:{},media:{}};for(const dir of Object.keys(contents))for(const f of fs.readdirSync(path.join(root,dir))){if(dir==='patchers'&&f.endsWith('.js'))continue;if(dir==='media'&&!/\.(wav|aiff?|mp3|flac|m4a)$/i.test(f))continue;contents[dir][f]={kind:dir==='patchers'?'patcher':dir==='code'?'javascript':'audiofile',local:1,...(f==='Lunar Lens.maxpat'?{toplevel:1}:{})};}
write('lunar-lens.maxproj',JSON.stringify({name:'lunar-lens',version:1,autoorganize:0,autolocalize:0,hideprojectwindow:0,contents,searchpath:{code:{path:'./code',recursive:1},patchers:{path:'./patchers',recursive:1},media:{path:'./media',recursive:1}},layout:{},devpath:'.',devpathtype:0},null,2));
fs.mkdirSync(path.join(root,'tmp'),{recursive:true});
const test=patch([100,100,400,190]);box(test,'rx','udpreceive 7474',20,25,170);box(test,'send','s lunar-lens-control',20,75,200,1,0);wire(test,'rx',0,'send',0);write('tmp/runtime-control.maxpat',JSON.stringify({patcher:test},null,2));
console.log(`Built Lunar Lens: ${p.boxes.length} objects, ${p.lines.length} cables. Source / analysis / light / gestures are independent of song identity.`);
