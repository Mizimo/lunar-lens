"""Measure native gesture audio and report transport / optional local plugin checks."""
import pathlib,json,subprocess,hashlib,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent;sr=48000
def decode(p):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar',str(sr),'-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2)
x=decode(root/'media/Lunar-Departure-demo.wav')*.4;y=decode(root/'tmp/touch-final.wav')
probe=x[:sr*2,0];search=y[:sr*3,0];fft=1<<(len(probe)+len(search)-1).bit_length()
c=np.fft.irfft(np.fft.rfft(search,fft)*np.conj(np.fft.rfft(probe,fft)),fft);lag=int(np.argmax(c[:sr]))
n=min(len(x),len(y)-lag);xx=x[:n];yy=y[lag:lag+n]
def error(lo,hi):
 a=xx[int(lo*sr):int(hi*sr)];b=yy[int(lo*sr):int(hi*sr)];return float(np.sqrt(np.mean((a-b)**2))/max(1e-8,np.sqrt(np.mean(a*a))))
trace=[json.loads(l) for l in (root/'tmp/interaction-final.jsonl').read_text().splitlines()]
two=[r['position'] for r in trace if r['gesture']['count']==2];last=trace[-1]['position']
baseline=error(.5,2.5);held=error(min(two)+.3,max(two)-.2);released=error(last-.8,last-.2)
assert held>max(.32,baseline*3) and released<max(.04,baseline*2),(baseline,held,released)
assert np.isfinite(y).all() and np.max(np.abs(y))<.98
checks=json.loads((root/'tmp/session-final-checks.json').read_text())
report={'version':json.loads((root/'package.json').read_text())['version'],'touchDurationSeconds':len(y)/sr,'touchPeakDbFS':float(20*np.log10(np.max(np.abs(y)))),'alignmentSamples':lag,'relativeDryError':baseline,'relativeHeldEffectError':held,'relativeReleasedError':released,'heldComparisonSeconds':[min(two)+.3,max(two)-.2],'pressureStrength':[checks[n]['gesture']['strength'] for n in ['lightPressure','fullPressure','twoTouches','released']],'plugin':None,'monitorOffThroughout':all(not s['params']['monitor'] for s in checks.values()),'allAudioFinite':True,'checks':{name:{k:s[k] for k in ['running','paused','position','duration','gesture','pluginReady']} for name,s in checks.items()}}
if 'pluginEnabled' in checks:
 plugin=decode(root/'tmp/plugin-final.wav')
 assert checks['pluginEnabled']['pluginReady'] and checks['pluginEnabled']['params']['plugin']
 assert np.isfinite(plugin).all() and .005<np.max(np.abs(plugin))<.98
 report.update({'plugin':'FabFilter Pro-R 2 VST3','pluginDurationSeconds':len(plugin)/sr,'pluginPeakDbFS':float(20*np.log10(np.max(np.abs(plugin)))),'pluginBypassRestored':not checks['pluginBypassed']['params']['plugin']})
files=['patchers/Lunar Lens.maxpat','patchers/lens_runtime.js','patchers/lens_screen.js','patchers/lens_grid.js','patchers/lens_analysis.gendsp','patchers/lens_fx.gendsp']
report['runtimeHashes']={f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files}
(root/'docs/session-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='checks'},indent=2))
