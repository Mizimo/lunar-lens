"""Accept known behaviours and frequency controls from actual native Max capture."""
import json,pathlib,subprocess,hashlib,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
rows=[json.loads(l) for l in (root/'tmp/behaviour-native.jsonl').read_text().splitlines()]
meta=json.loads((root/'tmp/behaviour-fixture.json').read_text())
report={'version':json.loads((root/'package.json').read_text())['version'],'kind':'native Max controlled fixture; not labelled commercial vocals','frames':len(rows),'regions':{}}
for name,(lo,hi) in meta['regions'].items():
 a=[r for r in rows if lo<r['position']<hi];assert len(a)>20,name
 roles=np.array([r['features']['roles'] for r in a]);counts=np.array([r['features']['counts'] for r in a])
 report['regions'][name]={'meanRoles':roles.mean(axis=0).tolist(),'events':(counts[-1]-counts[0]).tolist(),'phraseAndBedActiveFraction':float(np.mean((roles[:,2]>.2)&(roles[:,3]>.2)))}
r=report['regions'];assert r['held']['meanRoles'][2]<.18 and r['held']['meanRoles'][3]>.4
assert r['held']['events'][1]==0, r['held']
assert r['articulated']['meanRoles'][2]>.35 and r['articulated']['meanRoles'][3]<.1
assert r['combined']['phraseAndBedActiveFraction']>.65
assert r['swell']['events'][0]==0 and r['swell']['meanRoles'][1]>.35,r['swell']
assert r['impacts']['events'][0]==8,r['impacts']
assert r['outsideDefaultBand']['events'][0]==0,r['outsideDefaultBand']
assert r['insideWiderBand']['events'][0]==6,r['insideWiderBand']
assert all(max(a['leds'])==0 for a in rows if 52<a['position']<55)
assert all(len(a['raw'])==24 and np.isfinite(a['raw']).all() for a in rows if a['raw'])
# Cross-correlate recorded output against the test source, accounting for recorder lead-in.
def audio(name):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(root/'tmp'/name),'-ar','48000','-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2)
x=audio('behaviour-fixture.wav');y=audio('behaviour-native.wav');xx=x[:48000*7,0];yy=y[:48000*9,0];size=1<<(len(xx)+len(yy)-1).bit_length()
c=np.fft.irfft(np.fft.rfft(yy,size)*np.conj(np.fft.rfft(xx,size)),size);lag=int(np.argmax(c[:48000]));n=min(len(x),len(y)-lag)
a=x[:n].astype(float);b=y[lag:lag+n].astype(float);gain=float(np.sum(a*b)/np.sum(a*a));corr=float(np.corrcoef(a.flatten(),b.flatten())[0,1])
assert np.isfinite(b).all() and abs(gain-.4)<.01 and corr>.999
report['audio']={'sampleRate':48000,'gain':gain,'correlation':corr,'alignmentSamples':lag,'peakDbFS':float(20*np.log10(np.max(abs(y)))),'finite':True}
report['monitorOffThroughout']=all(not a['params']['monitor'] for a in rows)
monitorPositions=[a['position'] for a in rows if a['params']['monitor']]
report['monitorOnPositionRange']=[min(monitorPositions),max(monitorPositions)] if monitorPositions else []
report['impactControlledFixture']={'truePositives':8,'knownImpacts':8,'slowSwellsFalsePositives':0,'outOfBandFalsePositives':0,'widerBandTruePositives':6,'note':'Controlled tests only; no human-labelled accuracy claim for commercial recordings.'}
files=['patchers/Lunar Lens.maxpat','patchers/lens_runtime.js','patchers/lens_screen.js','patchers/lens_grid.js','patchers/lens_analysis.gendsp','patchers/lens_fx.gendsp']
report['runtimeHashes']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files}
(root/'docs/behaviour-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
