// Replay actual native measurement frames; never manufacture a separated stem.
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),V=require('../code/lens_visual.js'),P=require('../code/lens_presentation.js');
const rows=fs.readFileSync('tmp/stereo-calibration.jsonl','utf8').trim().split('\n').map(JSON.parse);
const views=[0,6],engines=views.map(()=>new V.Engine()),presentations=views.map(()=>new P.Engine()),selected=[];
let last=rows[0].time;
for(const row of rows){
 const dt=Math.max(.001,Math.min(.1,row.time-last));last=row.time;
 const grids=engines.map((v,i)=>{const p={...row.params,scene:views[i],brightness:.85,transition:0,focus:0,spatialAmount:1,black:false,freeze:false};return v.step(presentations[i].step(row.features,row.perception,dt,p.eventAmount,row.measurements,p),dt,p);});
 for(const [index,t] of [18,22,26].entries())if(!selected[index]&&row.running&&row.position>=t)selected[index]={position:row.position,grids,measurement:row.measurements};
}
if(selected.length!==3||selected.some(x=>!x))throw Error('Need the complete native stereo calibration trace');
fs.writeFileSync('tmp/stereo-review.json',JSON.stringify(selected));
