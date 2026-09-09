// Same captured native features, replayed through all six production compositions.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url),V=require('../code/lens_visual.js');
const source=process.argv[2]||'tmp/role-fixture-native.jsonl',caption=process.argv[3]||'原創混合驗收訊號';
const rows=fs.readFileSync(path.join(root,source),'utf8').trim().split('\n').map(JSON.parse),engines=Array.from({length:11},()=>new V.Engine()),out=[];
let previous=rows[0].time,chosen,best=-1;
for(const row of rows){const dt=Math.max(.001,Math.min(.1,row.time-previous));previous=row.time;
 const grids=engines.map((e,i)=>e.step(row.features,dt,{...row.params,scene:i<6?i:0,palette:0,focus:i<6?0:i-5,freeze:false,black:false}));
 // Exact native RGB for the recorded default scene, replay for alternative views.
 if(row.params.scene===0&&row.params.focus===0&&!row.params.black&&!row.params.freeze)grids[0]=row.leds;
 const frame={time:row.time,position:row.position,roles:row.features.roles,grids,running:row.running,caption};out.push(frame);
 const r=row.features.roles,score=r[0]*r[1]*r[2]*(.15+r[3])*(.15+r[4]);if(row.running&&row.position>1&&score>best){best=score;chosen=frame;}
}
fs.writeFileSync(path.join(root,'tmp/visual-review-frames.json'),JSON.stringify(out));fs.writeFileSync(path.join(root,'tmp/visual-review-selected.json'),JSON.stringify(chosen));
const text=(x,y,s,size=15,col='#a8b8cb')=>`<text x="${x}" y="${y}" fill="${col}" font-size="${size}">${s}</text>`;
function grid(a,x,y,w){let s='',step=w/8;for(let py=0;py<8;py++)for(let px=0;px<8;px++){const k=((7-py)*8+px)*3,c=a.slice(k,k+3).map((v,i)=>Math.round(255*([.014,.021,.032][i]+Math.pow(v/127,.7)*[.9,.92,.94][i])));s+=`<rect x="${x+px*step}" y="${y+py*step}" width="${step-4}" height="${step-4}" rx="3" fill="rgb(${c.join(',')})" stroke="#172131" stroke-width=".6"/>`;}return s;}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1100"><rect width="1200" height="1100" fill="#080e18"/><g font-family="Arial,Hiragino Sans GB,sans-serif">';
svg+=text(32,48,'LUNAR LENS  1.2.1',28,'#edf4fc')+text(32,78,'同一音訊，同一時刻。六種空間構成，各自保留五個聲音行為。',18);
V.names.forEach((t,i)=>{const x=32+(i%3)*396,y=122+Math.floor(i/3)*330;svg+=text(x,y,`0${i+1}  ${t}`,19,'#d6e4f2')+text(x+206,y,V.paletteNames[i],13)+grid(chosen.grids[i],x,y+22,280);});
svg+=text(32,810,'同一幀，逐層獨看',21,'#edf4fc');
['衝擊 IMPACT','地基 BODY','前景 PHRASE','鋪陳 BED','細節 DETAIL'].forEach((t,i)=>{const x=32+i*235;svg+=text(x,847,t,16)+grid(chosen.grids[6+i],x,868,184);});
svg+=text(32,1080,`${caption} · ${chosen.position.toFixed(2)} s · Native 特徵／正式渲染器重播 · 螢幕 gamma 預覽`,13)+'</g></svg>';
fs.writeFileSync(path.join(root,'media/preview.svg'),svg);console.log(`Prepared ${rows.length} frames; selected ${chosen.position.toFixed(2)} s.`);
