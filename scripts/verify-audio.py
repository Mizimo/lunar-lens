# Historical v0.1 acceptance script; current 1.1 uses verify-native-roles / verify-session.
"""Check an actual Max recording against the known input; requires numpy + ffmpeg."""
import json,pathlib,subprocess,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=sample_rate','-of','json',str(root/'tmp/fixture-Max.wav')]))
sr=int(metadata['streams'][0]['sample_rate'])
def decode(path):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ar',str(sr),'-ac','2','-f','f32le','-'])
 return np.frombuffer(raw,dtype='<f4').reshape(-1,2)
x=decode(root/'tmp/analysis-fixture.wav');y=decode(root/'tmp/fixture-Max.wav')
nfft=1<<int(np.ceil(np.log2(len(x)+len(y))))
corr=np.fft.irfft(np.fft.rfft(y[:,0],nfft)*np.conj(np.fft.rfft(x[:,0],nfft)),nfft)
lag=int(np.argmax(corr[:sr*3]));n=min(len(x),len(y)-lag);xx=x[:n];yy=y[lag:lag+n]
metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=sample_rate','-of','json',str(root/'tmp/fixture-Max.wav')]))
report={'recordingSampleRate':int(metadata['streams'][0]['sample_rate']),'comparisonSampleRate':sr,'duration':len(y)/sr,'finite':bool(np.isfinite(y).all()),'peakDbFS':float(20*np.log10(max(np.max(np.abs(y)),1e-12))),'alignmentSamples':lag,'dryGain':float(np.sum(yy*xx)/np.sum(xx*xx)),'dryCorrelation':float(np.corrcoef(yy.flatten(),xx.flatten())[0,1]),'channelEnergy':[float(np.sqrt(np.mean(y[:,c]**2))) for c in range(2)]}
records=[json.loads(l[6:]) for l in (root/'tmp/fixture-runtime.log').read_text().splitlines() if l.startswith('CHECK ')]
for lo,hi,name,band in [(1.2,2.9,'low',0),(3.7,5.2,'mid',1),(6,7.7,'high',2)]:
 rows=[d for d in records if lo<d['state']['position']<hi];assert rows,name
 mean=np.mean([d['raw'][:3] for d in rows],axis=0);assert int(np.argmax(mean))==band,(name,mean);report[name+'Bands']=mean.tolist()
anti=[d for d in records if 9.3<d['state']['position']<10.1][0];mono=[d for d in records if 11.3<d['state']['position']<12.6][-1]
assert anti['state']['features']['width']>.9 and mono['state']['features']['width']<.1
report['antiPhaseEnergy']=anti['raw'][3];report['antiPhaseWidth']=anti['state']['features']['width'];report['monoWidth']=mono['state']['features']['width']
locked=[d['state']['features'] for d in records if 16<d['state']['position']<25 and d['state']['features']['confidence']>.48]
assert len(locked)>3 and all(abs(d['bpm']-120)<4 for d in locked)
report['pulseBPM']=float(np.mean([d['bpm'] for d in locked]));report['maxPulseConfidence']=max(d['confidence'] for d in locked)
assert report['finite'] and report['dryCorrelation']>.995 and abs(report['dryGain']-.65)<.025,report
(root/'docs/archive-v0.1/actual-audio-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
