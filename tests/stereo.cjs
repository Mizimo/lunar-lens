const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../code/lens_measurements.js'),P=require('../code/lens_presentation.js'),B=require('../code/lens_behaviours.js'),V=require('../code/lens_visual.js');
let passed=0;function test(n,f){f();passed++;console.log('✓ '+n);}
function packet(assign,serial=1){const a=Array(55).fill(0);a[6]=serial;for(const [band,power] of Object.entries(assign))a.splice(7+Number(band)*3,3,...power);return a;}
function measure(assign){const e=new M.Engine();e.spectrum(packet(assign),1);return e.step(Array(24).fill(.1),1,48000,true);}
const settings={roles:B.defaults(),spatialAmount:1,impactLo:35,impactHi:160};
const feature={counts:[0,0,0],transients:[0,0,0],roles:[0,.8,.5,.4,.5],bands:[.8,.5,.5],spectrum:Array(8).fill(.2),body:.8,behaviour:{phrase:.5,bed:.4,articulation:.5},energy:.8,slow:.7,active:true};
test('Stereo packets retain 16 distinct registers and one shared unnormalised energy scale',()=>{
 const a=measure({0:[4,0,0],9:[0,1,0],15:[0,0,4]});assert.equal(a.stereoSpectrum.totalPower,9);assert.deepEqual(a.stereoSpectrum.totals,[4,1,4]);assert.equal(a.stereoSpectrum.bands.length,16);
 const s=P.spatial(a,settings);assert(s.spectrum[0][0]===1&&s.spectrum[7][2]===1);assert.equal(s.spectrum[4][1],.5);
});
test('Opposite registers remain opposed when the overall L/R power balance is zero',()=>{
 const s=P.spatial(measure({1:[1,0,0],14:[0,0,1]}),settings);
 assert.deepEqual(s.roles[0],[1,0,0]);assert.deepEqual(s.roles[1],[1,0,0]);assert.deepEqual(s.roles[4],[0,0,1]);
});
test('Role frequency masks and low probe range select their own spatial evidence',()=>{
 const cfg={...settings,roles:B.defaults(),impactLo:70,impactHi:140};cfg.roles[1].bands=[7];
 const s=P.spatial(measure({0:[1,0,0],3:[0,1,0],14:[0,0,2]}),cfg);
 assert.deepEqual(s.roles[0],[0,1,0]);assert.deepEqual(s.roles[1],[0,0,1]);assert.deepEqual(s.roles[4],[0,0,1]);
});
test('Articulated left foreground and held right bed can have different spatial mappings in one register',()=>{
 const m=new M.Engine();let a;for(let i=0;i<100;i++){m.spectrum(packet({9:[0,0,1]},i+1),i*.02+1);a=m.step(Array(24).fill(.1),i*.02+1,48000,true);}
 m.spectrum(packet({9:[1,0,1]},102),3.02);a=m.step(Array(24).fill(.1),3.02,48000,true);const s=P.spatial(a,settings);
 assert(s.roles[2][0]>.8);assert(s.roles[3][2]>.9);
});
test('Stale, absent, silent and malformed spatial measurements cannot keep painting activity',()=>{
 const m=new M.Engine();m.spectrum(packet({0:[1,2,3]}),1);m.step([],1,48000,true);
 m.spectrum(packet({0:[1,2,3]}),1.4);assert.equal(m.step([],1.4,48000,false).stereoSpectrum.valid,false);
 assert(P.spatial(m.result,settings).spectrum.flat().every(v=>v===0));
 m.reset();m.spectrum(Array(55).fill(NaN),2);assert.equal(m.step([],2,48000,true).stereoSpectrum.valid,false);
 m.spectrum([0,0,0,0,0,0,2],2);assert.equal(m.step([],2,48000,true).stereoSpectrum.valid,false);
});
function rendered(shares,scene=0,amount=1,focus=3){const v=new V.Engine(),f={...feature,spatial:{valid:true,amount,roles:Array(5).fill(shares),lowSpectrum:[.8,.7,.5],cells:Array.from({length:10},()=>shares),spectrum:Array.from({length:8},()=>shares)}};let out;
 for(let i=0;i<60;i++)out=v.step(f,.02,{...settings,scene,focus,palette:1,brightness:.8,trails:.2,detail:.5,transition:0});return out;}
function centroid(rgb){let power=0,moment=0;for(let i=0;i<64;i++){const v=rgb.slice(i*3,i*3+3).reduce((a,b)=>a+b,0);power+=v;moment+=(i%8)*v;}return moment/Math.max(1,power);}
test('Original six-scene PHRASE geometry does not acquire left/centre/right copies',()=>{
 for(let scene=0;scene<6;scene++){
  assert.deepEqual(rendered([1,0,0],scene),rendered([0,0,1],scene));
  assert.deepEqual(rendered([1,0,0],scene),rendered([0,1,0],scene));
 }
});
test('L/C/R dedicated scene keeps silence dark, hard sides distinct, and all seven scenes bounded',()=>{
 const a=rendered([1,0,0],6),b=rendered([0,0,1],6);assert(centroid(a)<1);assert(centroid(b)>6);
 for(let scene=0;scene<7;scene++)assert(rendered([.4,.2,.4],scene).every(v=>Number.isInteger(v)&&v>=0&&v<=127));
});
test('Low body stays one intact shape across left, centre and right inputs in every composition',()=>{
 for(let scene=0;scene<7;scene++){
  assert.deepEqual(rendered([1,0,0],scene,1,2),rendered([0,0,1],scene,1,2));
  assert.deepEqual(rendered([1,0,0],scene,1,2),rendered([0,1,0],scene,1,2));
 }
});
test('Spatial projection is independent from event visual amount and does not mutate onset data',()=>{
 const p=new P.Engine(),f=structuredClone(feature),m=measure({1:[1,0,0]});const out=p.step(f,{epoch:1,events:[],state:{}},.02,0,m,settings);
 assert.equal(out.spatial.amount,1);assert.deepEqual(f,feature);assert.deepEqual(out.counts,f.counts);
});
test('Triptych uses ten distinct bins and one shared mid/high reference without bass dimming',()=>{
 const m=measure({0:[200,0,0],6:[1,0,0],7:[0,0,4],9:[0,2,0]}),s=P.spatial(m,{...settings,spatialContrast:.6});
 assert.equal(s.cells.length,10);assert.equal(s.cells[1][2],1);assert(s.cells[0][0]<1&&s.cells[0][0]>.1);assert.equal(s.cells[0][1],0);
 const noBass=measure({6:[1,0,0],7:[0,0,4],9:[0,2,0]});assert.deepEqual(s.cells,P.spatial(noBass,{...settings,spatialContrast:.6}).cells);
});
 test('Triptych positions have different hues and adjacent cells show different registers',()=>{
 const l=rendered([1,0,0],6),c=rendered([0,1,0],6),r=rendered([0,0,1],6);
 function sum(a,ch){let v=0;for(let y=3;y<8;y++)for(let x=0;x<8;x++)v+=a[(y*8+x)*3+ch];return v;}
 assert(sum(l,2)>sum(l,0)*2);assert(sum(c,0)>sum(c,2)*2);assert(sum(r,0)>sum(r,1)*2);
 const v=new V.Engine(),f={...feature,spatial:P.spatial(measure({6:[1,0,0],7:[0,0,1]}),settings)},p={...settings,scene:6,focus:3,palette:1,brightness:.8,trails:0,detail:.5,transition:0};let rgb;
 for(let i=0;i<40;i++)rgb=v.step(f,.02,p);
 const cell=(x,y)=>rgb.slice((y*8+x)*3,(y*8+x)*3+3).reduce((a,b)=>a+b,0);
 assert(cell(0,3)>10&&cell(1,3)===0);assert(cell(6,3)===0&&cell(7,3)>10);
});
test('Generated FFT frame transports 55 coherent values and receives the real host sample rate',()=>{
 const p=JSON.parse(fs.readFileSync('patchers/lens_spectral.maxpat')).patcher;
 assert.equal(p.boxes.find(x=>x.box.id==='shape').box.numoutlets,55);
 assert.equal(p.boxes.find(x=>x.box.id==='pack').box.numinlets,55);
 for(let i=0;i<55;i++)assert(p.lines.some(x=>x.patchline.source[0]==='snap'+i&&x.patchline.destination[1]===i));
 const parent=JSON.parse(fs.readFileSync('patchers/Lunar Lens.maxpat')).patcher;
 assert(parent.lines.some(x=>x.patchline.source[0]==='spectral-rate'&&x.patchline.destination[0]==='spectral'));
});
test('Spatial inspector paints finite rectangles and exposes the live mapping slider and seventh scene',()=>{
 const calls=[],ui={mgraphics:new Proxy({},{get:(_,key)=>key==='rectangle'||key==='rectangle_rounded'? (...a)=>assert(a.every(Number.isFinite)):()=>{}}),post:e=>{throw Error(e);},outlet:(...a)=>calls.push(a)};
 vm.createContext(ui);vm.runInContext(fs.readFileSync('code/lens_ui.js','utf8'),ui);
 function Task(){this.repeat=this.schedule=this.cancel=()=>{};}
 const c={Task,post:()=>{},arrayfromargs:x=>Array.from(x),outlet:()=>{},File:function(){this.isopen=false;},patcher:{filepath:__dirname+'/../patchers/Lunar Lens.maxpat',getnamed:()=>({message:()=>{}})}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('patchers/lens_runtime.js','utf8'),c);c.P.detector=true;c.P.inspector=3;c.measured=measure({1:[1,0,0],9:[0,.4,0],14:[0,0,.2]});c.lastFeatures=Date.now()/1000;c.render();
 ui.state(JSON.stringify(c.snapshot()));ui.paint();let h=ui.hit.find(h=>h.args[0]==='spatialContrast');assert(h);ui.onclick(h.x,h.y+5);assert.equal(calls.at(-1)[3],0);
 assert(ui.hit.some(h=>h.args[0]==='scene'&&h.args[1]===6));assert(ui.hit.some(h=>h.args[0]==='spatialContrast'));
});
console.log('PASS '+passed+' spatial measurement and rendering groups');
