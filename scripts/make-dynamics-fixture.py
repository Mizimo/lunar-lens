"""Original signal with known weak/heavy and density-change events, no song cues."""
import pathlib,json,wave,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent;sr=48000;t=np.arange(sr*55)/sr;y=np.zeros_like(t);truth={}
def carrier(hz,lo,hi,amp):
 sel=(t>=lo)&(t<hi);y[sel]+=amp*np.sin(2*np.pi*hz*t[sel])
def pulse(hz,on,amp,tau=.055):
 p=t-on;sel=(p>=0)&(p<tau*8);y[sel]+=amp*np.exp(-p[sel]/tau)*np.sin(2*np.pi*hz*t[sel])
carrier(90,1,8,.14);truth['heldAccents']=[2+i*.65 for i in range(8)]
for on in truth['heldAccents']:pulse(90,on,.065)
carrier(90,9,24,.14);truth['dense']=[10+i*.2 for i in range(30)];truth['afterDense']=[16+i*.5 for i in range(10)]
for on in truth['dense']:pulse(90,on,.20)
for on in truth['afterDense']:pulse(90,on,.065)
carrier(90,25,32.5,.10);truth['strength']=[{'time':26+i,'amplitude':[.055,.12,.25][i%3]} for i in range(6)]
for event in truth['strength']:pulse(90,event['time'],event['amplitude'],.075)
truth['registers']=[{'time':34+i,'band':i,'frequency':hz} for i,hz in enumerate([46,100,200,410,950,2200,5200,10500])]
for event in truth['registers']:pulse(event['frequency'],event['time'],.20,.06)
sel=(t>=44)&(t<52);env=.2*np.sin(np.pi*((t[sel]-44)%4)/4)**2;y[sel]+=env*np.sin(2*np.pi*90*t[sel])
assert np.max(np.abs(y))<.7
out=root/'tmp/dynamics-fixture.wav'
with wave.open(str(out),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(np.repeat((y*32767).astype('<i2')[:,None],2,axis=1).tobytes())
(root/'tmp/dynamics-truth.json').write_text(json.dumps(truth,indent=2))
print(out)
