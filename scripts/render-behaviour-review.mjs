import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url),V=require('../code/lens_visual.js');
const rows=fs.readFileSync(path.join(root,'tmp/behaviour-native.jsonl'),'utf8').trim().split('\n').map(JSON.parse),engines=Array.from({length:3},()=>new V.Engine());let last=rows[0].time,out=[];
for(const r of rows){const dt=Math.min(.1,Math.max(.001,r.time-last));last=r.time;
 out.push({time:r.time,position:r.position,roles:r.features.roles,grids:engines.map((e,i)=>e.step(r.features,dt,{...r.params,scene:0,focus:[0,3,4][i]}))});}
const regions=[[5,6.5],[9,13],[17,20.5]],selected=regions.map(([lo,hi],i)=>out.filter(r=>lo<r.position&&r.position<hi).sort((a,b)=>{
 const score=r=>i===0?r.roles[3]:i===1?r.roles[2]:Math.min(r.roles[2],r.roles[3]);return score(b)-score(a);
})[0]);
fs.writeFileSync(path.join(root,'tmp/behaviour-review.json'),JSON.stringify({selected,rows:out}));
