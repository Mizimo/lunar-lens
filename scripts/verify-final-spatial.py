"""Verify a final native interaction trace and the exact running DSP build.
This measures transport/data/render health, not perceptual or stem accuracy.
"""
from pathlib import Path
import json,hashlib,statistics,subprocess
root=Path(__file__).resolve().parent.parent
rows=[json.loads(s) for s in (root/'tmp/final-spatial-live.jsonl').read_text().splitlines()]
active=[r for r in rows if r['running'] and r['features']['active'] and r['position']>81]
assert active
assert all(r['measurements']['stereoSpectrum']['valid'] and r['measurements']['stereoSpectrum']['centreMethod']=='balanced-phase-agreement' for r in active)
assert all(len(r['leds'])==192 and all(isinstance(c,int) and 0<=c<=127 for c in r['leds']) for r in rows)
def q(a,p):return sorted(a)[int((len(a)-1)*p)]
dt=[(b['time']-a['time'])*1000 for a,b in zip(rows,rows[1:])]
assert statistics.mean(dt)<40
cal=json.loads((root/'docs/stereo-calibration.json').read_text())
for name,digest in cal['runtimeHashes'].items():assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
unchanged=['code/lens_features.js','code/lens_analysis.genexpr','patchers/lens_analysis.gendsp','code/lens_events.js','code/lens_fx.genexpr','patchers/lens_fx.gendsp','code/lens_protocol.js']
for f in unchanged:assert (root/f).read_bytes()==subprocess.check_output(['git','show','v1.3.0:'+f],cwd=root),f
mid=[]
for r in active:
 a=[sum(b['power'][c] for b in r['measurements']['stereoSpectrum']['bands'][6:]) for c in range(3)];total=max(1e-12,sum(a));mid.append([v/total for v in a])
report={'version':'1.4.0','sourceName':'02 鍵っ子.flac','captureDurationSeconds':rows[-1]['time']-rows[0]['time'],'sourcePositionRange':[min(r['position'] for r in rows),max(r['position'] for r in rows)],'frames':len(rows),'activeFrames':len(active),'meanFrameMs':statistics.mean(dt),'p99FrameMs':q(dt,.99),'maxFrameMs':max(dt),'computeP99Ms':q([r['computeMs'] for r in rows],.99),'measurementValidThroughoutActiveAudio':True,'rgbValid':True,'monitorOnFrames':sum(bool(r['params']['monitor']) for r in rows),'centreMethod':'balanced-phase-agreement','midHighSharesMedian':[statistics.median(v[c] for v in mid) for c in range(3)],'runtimeMatchesNativeCalibration':True,'unchangedFromV13':unchanged,'passed':True,'scope':'Final native 75-second observation, including user interaction; not a complete-song or listening-accuracy test. No physical LED latency measurement.'}
(root/'docs/final-spatial-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
