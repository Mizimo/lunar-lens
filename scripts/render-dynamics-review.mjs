// Replays real Max features into the production renderer. No new audio analysis.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url),V=require('../code/lens_visual.js');
const rows=fs.readFileSync(path.join(root,'tmp/dynamics-native.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const v=new V.Engine();let last=rows[0].time,rendered=[];
for(const r of rows){let dt=Math.max(.001,Math.min(.1,r.time-last));last=r.time;rendered.push({...r,grid:v.step(r.features,dt,{...r.params,scene:0,focus:1,brightness:.65})});}
const report=JSON.parse(fs.readFileSync(path.join(root,'docs/dynamics-validation.json'),'utf8'));
const selected=report.strengthSequence.slice(0,3).map(e=>{
 const first=rendered.find(r=>Math.abs(r.position-e.time)<.02&&r.features.impact.strength>=e.strength*.98);
 const r=rendered.find(r=>r.time>first.time+.06);return {onset:e.onset,strength:e.strength,grid:r.grid};
});
fs.writeFileSync(path.join(root,'tmp/dynamics-review.json'),JSON.stringify({selected}));
