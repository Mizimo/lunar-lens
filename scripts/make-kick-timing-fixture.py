"""Known kick-like pitch sweeps: timing truth, not song kick-classification truth."""
from pathlib import Path
import json,wave
import numpy as np
root=Path(__file__).resolve().parent.parent
sr=48000; t=np.arange(sr*24)/sr; y=np.zeros_like(t); truth=[]
rng=np.random.default_rng(73)
for i in range(42):
 on=1+i*.503; u=t-on; sel=(u>=0)&(u<.4); u=u[sel]
 amp=[.13,.23,.38][i%3]
 # 175 -> 52 Hz in the first 50 ms, a 2 ms beater, 90 ms body decay.
 phase=2*np.pi*(52*u+123*.018*(1-np.exp(-u/.018)))
 env=(1-np.exp(-u/.0007))*np.exp(-u/.09)
 y[sel]+=amp*(np.sin(phase)*env+.12*rng.normal(size=len(u))*np.exp(-u/.002))
 truth.append({'time':on,'amplitude':amp,'context':'isolated' if i<14 else 'held bass' if i<28 else 'bass and chord'})
# Introduce beds with slow ramps. An abrupt bass entry 42 ms before a kick would
# intentionally share the detector's 160 ms refractory window and is not a fair timing trial.
sel=(t>=7.5)&(t<23)
y[sel]+=.10*np.minimum(1,(t[sel]-7.5)/.5)*np.sin(2*np.pi*82*t[sel])
sel=(t>=14.5)&(t<23)
y[sel]+=.045*np.minimum(1,(t[sel]-14.5)/.5)*(np.sin(2*np.pi*440*t[sel])+np.sin(2*np.pi*659*t[sel]))
out=root/'tmp/kick-timing-fixture.wav'
with wave.open(str(out),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr)
 f.writeframes(np.repeat((y*32767).astype('<i2')[:,None],2,axis=1).tobytes())
(root/'tmp/kick-timing-truth.json').write_text(json.dumps(truth,indent=2)+'\n')
print(out)
