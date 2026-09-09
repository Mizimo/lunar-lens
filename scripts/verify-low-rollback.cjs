// Compare the decision functions on captured mixed-song features. The capture
// samples the renderer, so this proves rollback parity, not labelled kick accuracy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),Current=require('../code/lens_features.js'),Legacy=require('../tests/reference/lens_features-v1.1.cjs');
const Previous=require(path.resolve(root,process.argv[3]||'tmp/pre-low-rollback-features.cjs'));
const file=path.resolve(root,process.argv[2]||'tmp/blossoms-final.jsonl');
const rows=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse);
const engines=[new Current.Engine(),new Legacy.Engine(),new Previous.Engine()];let last=-1,frames=0,events=[0,0,0];
for(const r of rows){
 if(!r.running||r.featureTime===last)continue;last=r.featureTime;
 const v=r.raw,p=r.params,time=r.featureTime;
 const out=engines.map((e,i)=>e.step(i===1?v.slice(0,15):v,time,p.sensitivity,p.impactSensitivity,p.impactGap));
 assert.equal(out[0].counts[0],out[1].counts[0],'Low-event mismatch at '+r.position);
 for(const k of ['ratio','rise','threshold'])assert.equal(out[0].impact[k],out[1].impact[k],k+' at '+r.position);
 assert.deepEqual(out[0].bandDynamics,out[2].bandDynamics,'Eight-band regression at '+r.position);
 assert.deepEqual(out[0].counts.slice(1),out[2].counts.slice(1),'Mid/high regression');
 events=out.map(x=>x.counts[0]);frames++;
}
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=['patchers/Lunar Lens.maxpat','patchers/lens_runtime.js','patchers/lens_screen.js','patchers/lens_grid.js','patchers/lens_analysis.gendsp','patchers/lens_fx.gendsp'];
const report={version:'1.2.1',kind:'Rollback decision equivalence on captured real-mix features; not a kick precision/recall test',capture:path.basename(file),captureSHA256:hash(file),frames,
 lowDecisionMismatches:0,lowThresholdMismatches:0,eightBandDynamicsIdenticalToV12:true,midHighEventsIdenticalToV12:true,
 replayEventCounts:{rollback:events[0],v11Reference:events[1],v12:events[2]},
 scope:'The same captured feature frames are supplied to all engines. Renderer captures omit some 20 ms analysis polls; these replay counts are not the original native event totals, and neither fewer events nor parity proves perceptual accuracy.',
 referenceSHA256:hash(path.join(root,'tests/reference/lens_features-v1.1.cjs')),
 runtimeHashes:Object.fromEntries(files.map(f=>[f,hash(path.join(root,f))]))};
fs.writeFileSync(path.join(root,'docs/low-rollback-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
