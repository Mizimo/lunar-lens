// Real-mix observability and throughput, without claiming stem/onset precision.
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),P=require('../code/lens_presentation.js');
const label=process.argv[2];if(!/^[a-zA-Z0-9-]+$/.test(label||''))throw Error('Report label required');
const rows=fs.readFileSync(`tmp/${label}-final.jsonl`,'utf8').trim().split('\n').map(JSON.parse);
const active=rows.filter(r=>r.running&&r.features.active&&r.position>1),valid=active.filter(r=>r.measurements?.stereoSpectrum?.valid);
const perc=(arr,q)=>[...arr].sort((a,b)=>a-b)[Math.floor((arr.length-1)*q)];
let balanced=0,opposed=0,differentMid=0;const totalShares=[[],[],[]];
for(const row of valid){
 const s=row.measurements.stereoSpectrum,share=s.totals.map(v=>v/Math.max(1e-12,s.totalPower));share.forEach((v,c)=>totalShares[c].push(v));
 const balance=(s.totals[2]-s.totals[0])/Math.max(1e-12,s.totalPower);
 if(Math.abs(balance)<.05){balanced++;const directions=s.bands.filter(b=>b.power.reduce((a,b)=>a+b,0)/s.totalPower>.01).map(b=>(b.power[2]-b.power[0])/Math.max(1e-12,b.power.reduce((a,b)=>a+b,0)));if(Math.min(...directions)<-.2&&Math.max(...directions)>.2)opposed++;}
 const p=P.spatial(row.measurements,row.params);if(p.roles[2].reduce((sum,v,c)=>sum+Math.abs(v-p.roles[3][c]),0)>.24)differentMid++;
}
if(valid.length!==active.length)throw Error(`Stale stereo frames: ${active.length-valid.length}`);
const report={version:JSON.parse(fs.readFileSync('package.json')).version,label,activeFrames:active.length,validFrames:valid.length,passed:valid.length===active.length,
 overallSharesMedian:totalShares.map(a=>perc(a,.5)),globallyBalancedFrames:balanced,balancedFramesWithOppositeRegisters:opposed,
 foregroundVsBedSpatialDifferenceFrames:differentMid,computeP99Ms:perc(rows.map(r=>r.computeMs),.99),analysisP99Ms:perc(rows.map(r=>r.analysisMs),.99),
 interpretation:'Opposite registers: overall residual balance within 5%, yet two bands above 1% total power lean more than 20% in opposite directions. Foreground vs bed: L1 distance > 0.24. These report observable spatial differences, not correct instrument or stem separation.'};
fs.writeFileSync(`docs/${label}-stereo-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
