// Compare the six restored visuals against the actual historical renderer.
// The seventh view is intentionally retained and redesigned as a readable spectrum.
import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),V=require('../code/lens_visual.js'),Old=require('../tests/reference/lens_visual-v1.3.0.cjs'),Before=require('../tests/reference/lens_visual-v1.4.0.cjs'),P=require('../code/lens_presentation.js');
const path=process.argv[2]||'tmp/final-141-native.jsonl',raw=fs.readFileSync(path,'utf8'),rows=raw.trim().split('\n').map(JSON.parse),active=rows.filter(r=>r.running&&r.features.active);
assert(active.length>100);
const views=Array.from({length:7},()=>({v:new V.Engine(),ref:new Old.Engine(),before:new Before.Engine(),p:new P.Engine()}));
let last=rows[0].time,comparisons=0,chosen=null;const sources=[...new Set(rows.map(r=>r.sourceName).filter(Boolean))];
for(const row of rows){
 const dt=Math.max(.001,Math.min(.1,row.time-last));last=row.time;
 const frames=views.map((view,scene)=>{
  const p={...row.params,scene,brightness:.75,transition:0,focus:0,spatialAmount:1,spatialContrast:.85,black:false,freeze:false};
  const f=view.p.step(row.features,row.perception,dt,p.eventAmount,row.measurements,p),a=view.v.step(f,dt,p),b=view.before.step(f,dt,p);
  if(scene<6){assert.deepEqual(a,view.ref.step(f,dt,p),`Original visual diverged at ${row.position}, scene ${scene}`);comparisons++;}
  return {before:b,after:a};
 });
 if(!chosen&&row.running&&row.position>=15)chosen={position:row.position,sourceName:row.sourceName||'歷史實曲特徵',scenes:frames};
}
assert(chosen);
const report={version:JSON.parse(fs.readFileSync('package.json')).version,sourceNames:sources,traceSha256:crypto.createHash('sha256').update(raw).digest('hex'),frames:rows.length,activeFrames:active.length,sixSceneFrameComparisons:comparisons,originalV13VisualRGBExact:true,triptychRetainedAndRedesigned:true,comparisonPosition:chosen.position,passed:true,scope:'Identical captured real-audio features through the production and frozen v1.3.0 renderers. All six original scenes must match every RGB value. Seventh spectrum intentionally differs. No claim of stem separation, kick accuracy or physical LED timing.'};
fs.writeFileSync('docs/visual-rollback-validation.json',JSON.stringify(report,null,2)+'\n');fs.writeFileSync('tmp/visual-rollback-review.json',JSON.stringify(chosen));console.log(JSON.stringify(report,null,2));
