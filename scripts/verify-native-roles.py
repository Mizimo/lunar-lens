"""Acceptance of actual native Max output; no mock DSP or generated visual frames."""
import pathlib,json,subprocess,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
a=[json.loads(s) for s in (root/'tmp/role-fixture-native.jsonl').read_text().splitlines() if s.endswith('}')]
regions=json.loads((root/'tmp/role-fixture.json').read_text())['regions']
report={'version':json.loads((root/'package.json').read_text())['version'],'frames':len(a),'regions':{}}
for name,(lo,hi) in regions.items():
 rows=[x for x in a if x['running'] and lo<x['position']<hi];assert len(rows)>10,name
 raw=np.array([x['raw'] for x in rows]);roles=np.array([x['features']['roles'] for x in rows])
 assert np.isfinite(raw).all()
 report['regions'][name]={'bands':raw[:,:8].mean(axis=0).tolist(),'roles':roles.mean(axis=0).tolist(),'width':float(np.mean([x['features']['width'] for x in rows])),'pulseBPM':float(np.median([x['features']['bpm'] for x in rows])),'maxConfidence':max(x['features']['confidence'] for x in rows),'lastCounts':rows[-1]['features']['counts']}
for name,band in [('low',1),('mid',4),('high',7)]:
 assert np.argmax(report['regions'][name]['bands'])==band,name
r=report['regions'];assert r['anti']['width']>.9 and r['mono']['width']<.05
assert abs(r['pulse']['pulseBPM']-120)<3 and r['pulse']['maxConfidence']>.48
assert r['low']['roles'][1]>.65 and r['low']['roles'][2]<.04
settled=np.mean([x['features']['roles'] for x in a if 5.8<x['position']<6.25],axis=0)
assert r['mid']['roles'][1]<.02 and settled[3]>.55 and settled[2]<.04
report['settledMiddleToneRoles']=settled.tolist()
assert r['high']['roles'][1]<.01 and r['high']['roles'][2]<.02
assert r['noLow']['roles'][0]<.03 and r['noLow']['roles'][1]<.03,r['noLow']
assert r['noLow']['roles'][2]>.15
assert r['silence']['maxConfidence']<.25
assert all(x['leds']==[0]*192 for x in a if 43<x['position']<44.8)
def decode(path):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ar','48000','-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2)
x=decode(root/'tmp/role-fixture.wav');y=decode(root/'tmp/role-fixture-native.wav')
smallx=x[::6,0];smally=y[::6,0];nfft=1<<(len(smallx)+len(smally)-1).bit_length()
c=np.fft.irfft(np.fft.rfft(smally,nfft)*np.conj(np.fft.rfft(smallx,nfft)),nfft)
coarse=int(np.argmax(c[:8000*3]))*6
scores=[(float(np.dot(x[:48000*6,0],y[lag:lag+48000*6,0])),lag) for lag in range(max(0,coarse-12),coarse+13)]
lag=max(scores)[1];n=min(len(x),len(y)-lag);xx=x[:n];yy=y[lag:lag+n]
gain=float(np.sum(xx.astype(float)*yy)/np.sum(xx.astype(float)**2));cor=float(np.corrcoef(xx.flatten(),yy.flatten())[0,1])
report['audio']={'sampleRate':48000,'duration':len(y)/48000,'peakDbFS':float(20*np.log10(max(np.abs(y).max(),1e-12))),'finite':bool(np.isfinite(y).all()),'gain':gain,'correlation':cor,'alignmentSamples':lag}
assert report['audio']['finite'] and abs(gain-.4)<.01 and cor>.999
report['monitorOffThroughout']=all(not x['params']['monitor'] for x in a)
assert report['monitorOffThroughout']
report['rgbValid']=all(len(x['leds'])==192 and all(isinstance(n,int) and 0<=n<=127 for n in x['leds']) for x in a)
assert report['rgbValid']
report['meanFrameMilliseconds']=float(np.mean(np.diff([x['time'] for x in a]))*1000)
(root/'docs/native-role-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='regions'},indent=2))
print('No-low region:',r['noLow']['roles'],'Silence confidence:',r['silence']['maxConfidence'])
