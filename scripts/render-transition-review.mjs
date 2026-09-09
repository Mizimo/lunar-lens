// Current renderer replay of the original, project-owned demo capture.
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),V=require('../code/lens_visual.js'),P=require('../code/lens_presentation.js'),B=require('../code/lens_behaviours.js');
const rows=fs.readFileSync('tmp/v13-smoke.jsonl','utf8').trim().split('\n').map(JSON.parse).filter(r=>r.running);
const v=new V.Engine(),presentation=new P.Engine(),out=[];let index=0;
for(let n=0;n<720;n++){
 const t=2+n/30;while(index+1<rows.length&&rows[index+1].position<=t)index++;
 const row=rows[index],scene=Math.floor(n/120)%6;
 const params={...row.params,roles:B.defaults(),scene,focus:0,black:false,freeze:false,transition:.85,eventAmount:.7};
 const rgb=v.step(presentation.step(row.features,row.perception,1/30,.7),1/30,params);
 out.push({position:t,scene,rgb,transition:v.transition.snapshot(),perception:row.perception,measurements:row.measurements});
}
fs.writeFileSync('tmp/transition-review.json',JSON.stringify(out));console.log('720 transition review frames');
