"""Frame timestamps come from an explicit sfplay~ position snapshot at render time.
This measures native analysis + rendering; DAC, display and USB latency are excluded.
"""
from pathlib import Path
import json,sys
import numpy as np
root=Path(__file__).resolve().parent.parent
if json.loads((root/'package.json').read_text())['version']!='1.2.0':
 raise SystemExit('Historical 1.2 synthetic acceptance targets. Use a 1.2.0 checkout; current rollback validation is tests/low-rollback.cjs and scripts/verify-low-rollback.cjs.')
label=sys.argv[1] if len(sys.argv)>1 else 'current'
rows=[json.loads(l) for l in (root/f'tmp/kick-timing-{label}.jsonl').read_text().splitlines()]
truth=json.loads((root/'tmp/kick-timing-truth.json').read_text())
events=[];last=0
for r in rows:
 if r['features']['counts'][0]>last:events.append(r)
 last=r['features']['counts'][0]
matches=[];used=set()
for e in truth:
 candidates=[(i,r) for i,r in enumerate(events) if i not in used and 0<=r['position']-e['time']<.30]
 if not candidates:continue
 i,r=candidates[0];used.add(i)
 next_event=events[i+1]['position'] if i+1<len(events) else 999
 window=[w for w in rows if r['position']<=w['position']<min(e['time']+.32,next_event)]
 peak=max(window,key=lambda w:sum(w['leds']))
 visible=next((w for w in window if max(w['leds'])>=3),None)
 matches.append({**e,'eventDelayMs':(r['position']-e['time'])*1000,
  'firstVisibleMs':(visible['position']-e['time'])*1000 if visible else None,
  'brightestFrameMs':(peak['position']-e['time'])*1000,
  'peakRGBSum':sum(peak['leds'])})
def stats(key):
 a=[r[key] for r in matches if r[key] is not None]
 return dict(zip(['min','median','p95','max'],map(float,np.percentile(a,[0,50,95,100])))) if a else {}
report={'label':label,'expected':len(truth),'matched':len(matches),'totalLowEvents':len(events),
 'unmatchedLowEventTimes':[r['position'] for i,r in enumerate(events) if i not in used],'eventDelayMs':stats('eventDelayMs'),
 'firstVisibleMs':stats('firstVisibleMs'),'brightestFrameMs':stats('brightestFrameMs'),'matches':matches,
 'runtimeHashes':json.loads((root/f'tmp/kick-timing-{label}-build.json').read_text()),
 'scope':'Known synthesized pitch-sweep kick onsets, event-driven strike frames and regular 33 ms tail frames. sfplay position comes from a post-render snapshot reply, with audio-vector timing uncertainty. Native software timing only; no physical DAC/display/Launchpad measurement; no labelled song-accuracy claim.'}
(root/f'docs/kick-timing-{label}.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['matches','runtimeHashes']},indent=2))
assert not rows[-1]['running'] and rows[-1]['position']>=23.9
if label=='current':
 assert len(matches)==len(truth)
 assert not report['unmatchedLowEventTimes'], report['unmatchedLowEventTimes']
 assert report['firstVisibleMs']['p95']<85 and report['firstVisibleMs']['max']<120
