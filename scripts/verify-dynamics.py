"""Event recall against constructed signal truth; never infer song accuracy from event counts."""
import pathlib,json,hashlib,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
if json.loads((root/'package.json').read_text())['version']!='1.2.0':
 raise SystemExit('Historical 1.2 synthetic acceptance targets. Use a 1.2.0 checkout; current rollback validation is tests/low-rollback.cjs and scripts/verify-low-rollback.cjs.')
rows=[json.loads(l) for l in (root/'tmp/dynamics-native.jsonl').read_text().splitlines()]
truth=json.loads((root/'tmp/dynamics-truth.json').read_text());events=[];last=[0]*8;low=0;bandEvents=[[] for _ in range(8)]
for r in rows:
 f=r['features']
 if f['counts'][0]>low:events.append({'time':r['position'],'strength':f['impact']['strength'],'ratio':f['impact']['ratio']})
 if events and f['counts'][0]==low:events[-1]['strength']=max(events[-1]['strength'],f['impact']['strength'])
 low=f['counts'][0]
 for i,b in enumerate(f['bandDynamics']):
  if b['count']>last[i]:bandEvents[i].append({'time':r['position'],'strength':b['strength']})
  last[i]=b['count']
def matching(onsets,detected):
 used=set();matches=[]
 for onset in onsets:
  candidates=[(abs(e['time']-onset),j,e) for j,e in enumerate(detected) if j not in used and -.11<=e['time']-onset<=.18]
  if candidates:
   _,j,e=min(candidates);used.add(j);matches.append({'onset':onset,**e})
 return matches
report={'version':json.loads((root/'package.json').read_text())['version'],'frames':len(rows),'knownEventGroups':{}}
for name in ['heldAccents','dense','afterDense']:
 hits=matching(truth[name],events);report['knownEventGroups'][name]={'expected':len(truth[name]),'matched':len(hits),'matches':hits}
strength=matching([a['time'] for a in truth['strength']],events);report['strengthSequence']=strength
report['slowSwellFalseEvents']=[e for e in events if 44.3<e['time']<52]
report['perRegisterMatches']=[len(matching([e['time']],bandEvents[e['band']])) for e in truth['registers']]
report['runtimeHashes']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in ['patchers/Lunar Lens.maxpat','patchers/lens_runtime.js','patchers/lens_screen.js','patchers/lens_grid.js','patchers/lens_analysis.gendsp','patchers/lens_fx.gendsp']}
report['nativeDescriptorsValid']=all(len(r['raw'])==24 and np.isfinite(r['raw']).all() for r in rows if r['raw'])
report['silenceBlack']=all(max(r['leds'])==0 for r in rows if 53<r['position']<55)
report['monitorOffThroughout']=all(not r['params']['monitor'] for r in rows)
report['endStopped']=not rows[-1]['running']
report['note']='Strength is the event peak including its first 65 ms maturation. Known synthetic onsets, post-render sfplay position reply with audio-vector uncertainty; not perceptual song accuracy or physical LED latency.'
(root/'docs/dynamics-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
for name,r in report['knownEventGroups'].items():assert r['matched']==r['expected'],name
assert len(strength)==6
for i in [0,3]:assert strength[i]['strength']<strength[i+1]['strength']<strength[i+2]['strength']
assert not report['slowSwellFalseEvents']
assert report['perRegisterMatches']==[1]*8
assert report['silenceBlack'] and report['endStopped'] and report['nativeDescriptorsValid']
