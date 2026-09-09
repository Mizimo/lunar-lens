"""Verify a full native song trace captured by run-song-check.py; requires numpy."""
import pathlib,json,sys,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
name=sys.argv[1] if len(sys.argv)>1 else 'sana'
assert name.replace('-','').isalnum()
rows=[json.loads(l) for l in (root/('tmp/'+name+'-final.jsonl')).read_text().splitlines()]
active=[r for r in rows if r['features']['active']];a=np.array([r['features']['roles'] for r in active]);dt=np.diff([r['time'] for r in rows])*1000
report={'version':json.loads((root/'package.json').read_text())['version'],**json.loads((root/('tmp/'+name+'-final-build.json')).read_text()),'durationSeconds':rows[-1]['position'],'frames':len(rows),'activeFrames':len(active),'meanFrameMs':float(dt.mean()),'p99FrameMs':float(np.quantile(dt,.99)),'maxFrameMs':float(dt.max()),'roleMedian':np.median(a,axis=0).tolist(),'roleP95':np.quantile(a,.95,axis=0).tolist(),'roleCorrelation':np.corrcoef(a.T).tolist(),'eventCounts':rows[-1]['features']['counts'],'monitorOffThroughout':all(not r['params']['monitor'] for r in rows),'endStopped':not rows[-1]['running'],'endBlack':max(rows[-1]['leds'])==0,'rgbValid':all(len(r['leds'])==192 and all(isinstance(c,int) and 0<=c<=127 for c in r['leds']) for r in rows),'maxSimultaneouslyLitCells':max(sum(max(r['leds'][k:k+3])>0 for k in range(0,192,3)) for r in rows)}
assert abs(rows[-1]['position']-report['sourceDurationSeconds'])<.2
assert len(active)>100 and all(report[k] for k in ['endStopped','endBlack','rgbValid'])
monitorPositions=[r['position'] for r in rows if r['params']['monitor']]
report['monitorOnPositionRange']=[min(monitorPositions),max(monitorPositions)] if monitorPositions else []
playingDt=np.array([d for i,d in enumerate(dt) if rows[i]['running'] and rows[i+1]['running']])
report['maxPlaybackFrameMs']=float(playingDt.max())
assert playingDt.mean()<36 and playingDt.max()<150
report['perBandEventCounts']=[b['count'] for b in rows[-1]['features']['bandDynamics']]
strengths=[[],[],[]];previous=[0,0,0]
for r in rows:
 for i,c in enumerate(r['features']['counts']):
  if c>previous[i]:strengths[i].append(r['features']['impact']['strength'] if i==0 else r['features']['transients'][i])
 previous=r['features']['counts']
report['onsetStrengthP10P50P90']=[np.quantile(s,[.1,.5,.9]).tolist() if s else [] for s in strengths]
(root/('docs/'+name+'-full-validation.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
