# Historical v0.1 acceptance script; current 1.1 uses verify-native-roles / verify-session.
"""Measure actual Max touch-effect recordings and release state. Requires numpy / ffmpeg."""
import pathlib,json,subprocess,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
sr=48000
def decode(path):
 b=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ar',str(sr),'-ac','2','-f','f32le','-'])
 return np.frombuffer(b,dtype='<f4').reshape(-1,2)
x=decode(root/'media/Lunar-Departure-demo.wav')*.65;y=decode(root/'tmp/touch-isolated-Max.wav')
a=y[:sr*3,0];b=x[:sr*2,0];nfft=1<<int(np.ceil(np.log2(len(a)+len(b))))
corr=np.fft.irfft(np.fft.rfft(a,nfft)*np.conj(np.fft.rfft(b,nfft)),nfft);lag=int(np.argmax(corr[:sr]))
n=min(len(x),len(y)-lag);xx=x[:n];yy=y[lag:lag+n]
def error(lo,hi):
 a=xx[int(lo*sr):int(hi*sr)];b=yy[int(lo*sr):int(hi*sr)]
 return float(np.sqrt(np.mean((a-b)**2))/max(1e-8,np.sqrt(np.mean(a*a))))
baseline=error(.5,2.5);held=error(4.6,7.4);released=error(9.6,10.1)
checks=[json.loads(l[6:])['state'] for l in (root/'tmp/touch-isolated.log').read_text().splitlines() if l.startswith('CHECK ')]
assert [d['gesture']['count'] for d in checks]==[1,2,0,0]
assert all(d['running'] for d in checks[:3]) and not checks[3]['running']
assert held>baseline*3 and released<max(.04,baseline*2),(baseline,held,released)
plugin=decode(root/'tmp/plugin-Max.wav')
pluginChecks=[json.loads(l[6:])['state'] for l in (root/'tmp/interaction-runtime.log').read_text().splitlines() if l.startswith('CHECK ')]
assert any(s['pluginReady'] and s['params']['plugin'] and s['running'] for s in pluginChecks)
assert pluginChecks[-1]['params']['plugin'] is False
assert np.isfinite(y).all() and np.isfinite(plugin).all() and np.max(np.abs(plugin))>.005
report={'touchDuration':len(y)/sr,'touchPeakDbFS':float(20*np.log10(np.max(np.abs(y)))),'alignmentSamples':lag,'relativeDryError':baseline,'relativeHeldEffectError':held,'relativeReleasedError':released,'touchCounts':[d['gesture']['count'] for d in checks],'pressureStrength':[d['gesture']['strength'] for d in checks],'plugin':'FabFilter Pro-R 2 VST3','pluginDuration':len(plugin)/sr,'pluginPeakDbFS':float(20*np.log10(np.max(np.abs(plugin)))),'pluginBypassRestored':True,'allFinite':True}
(root/'docs/archive-v0.1/actual-interaction-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
