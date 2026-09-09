"""Generate original, labelled test material. Labels are for assertions, never runtime cues."""
import math, json, wave, pathlib, numpy as np
root=pathlib.Path(__file__).resolve().parent.parent
sr=48000; duration=45; n=sr*duration
a=np.zeros((n,2),np.float32); rng=np.random.default_rng(421)
def add(start,seconds,freq,amp=.16,anti=False):
 t=np.arange(int(seconds*sr))/sr
 env=np.minimum(t/.012,1)*np.minimum((seconds-t)/.025,1)
 s=(np.sin(2*np.pi*freq*t)*amp*env).astype(np.float32)
 j=int(start*sr);a[j:j+len(s),0]+=s;a[j:j+len(s),1]+=s*(-1 if anti else 1)
for start,freq in [(1,100),(4,950),(7,11000)]:add(start,2.4,freq)
add(10,1.8,440,anti=True);add(12.5,1.8,440)
# Fast low-frequency pulses with no mid/high hits; enough cycles to establish 120 BPM.
for t in np.arange(15,25,.5):
 dt=np.arange(int(.21*sr))/sr
 s=.32*np.sin(2*np.pi*85*dt)*np.exp(-dt/.045)*np.minimum(dt/.002,1)
 j=int(t*sr);a[j:j+len(s)]+=s[:,None]
# A mixed synthetic ensemble, then remove its low voice.
for t in np.arange(26,34,.5):
 dt=np.arange(int(.25*sr))/sr
 phase=2*np.pi*(43*dt+(132-43)*.022*(1-np.exp(-dt/.022)))
 s=.24*np.sin(phase)*np.exp(-dt/.06)*np.minimum(dt/.001,1)
 j=int(t*sr);a[j:j+len(s)]+=s[:,None]
 for d in [0,.25]:
  ht=np.arange(int(.06*sr))/sr
  hs=rng.normal(size=len(ht));hs=np.r_[0,np.diff(hs)]*.021*np.exp(-ht/.012)
  j=int((t+d)*sr);a[j:j+len(hs)]+=hs[:,None]
for i,t in enumerate(np.arange(26,34,1)):
 add(t,.75,[82.407,110,98,73.416][i%4],.11)
for i,t in enumerate(np.arange(26,38,.5)):
 for freq in [440,554.365,659.255]:add(t,.31,freq,.025)
for t in np.arange(39,42,.25):add(t,.045,10500,.13)
peak=float(np.max(np.abs(a)));assert peak<.98
path=root/'tmp/role-fixture.wav'
with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((a*32767).astype('<i2').tobytes())
metadata={'sampleRate':sr,'duration':duration,'peak':peak,'regions':{'low':[1.5,3.2],'mid':[4.5,6.2],'high':[7.5,9.2],'anti':[10.6,11.7],'mono':[13,14.2],'pulse':[20,24.5],'mixed':[27,33.5],'noLow':[35,37.7],'highTicks':[39,41.8],'silence':[43,44.8]}}
(root/'tmp/role-fixture.json').write_text(json.dumps(metadata,indent=2))
print(path, 'peak',round(peak,3))
