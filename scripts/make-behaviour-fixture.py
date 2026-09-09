"""Original controls: same-register held / articulated / combined material plus known impacts.
Annotations below belong to the acceptance fixture only, never the runtime renderer.
"""
import pathlib,json,wave,numpy as np
root=pathlib.Path(__file__).resolve().parent.parent;sr=48000
x=np.zeros((56*sr,2),np.float32)
def add(t,s):
 j=round(t*sr);x[j:j+len(s)]+=s[:,None]
def bed(start,duration,amp):
 t=np.arange(round(duration*sr))/sr
 env=np.minimum(t/.45,1)*np.minimum((duration-t)/.4,1)
 add(start,env*sum(amp*np.sin(2*np.pi*f*t) for f in [440,660,1100]))
def phrase(start,duration,amp):
 for i,at in enumerate(np.arange(0,duration-.3,.38)):
  t=np.arange(round(.22*sr))/sr;env=np.minimum(t/.008,1)*np.exp(-t/.085)
  add(start+at,env*sum(amp*(1 if j==i%3 else .13)*np.sin(2*np.pi*f*t) for j,f in enumerate([440,660,1100])))
bed(1,6,.036);phrase(8,6,.14);bed(15,6,.034);phrase(15,6,.10)
# Smooth low swells have substantial energy and no short attacks.
for start in [22,25.5]:
 t=np.arange(3*sr)/sr;add(start,.21*np.sin(np.pi*t/3)**2*np.sin(2*np.pi*90*t))
def hit(start,f):
 t=np.arange(round(.20*sr))/sr;add(start,.3*np.minimum(t/.002,1)*np.exp(-t/.035)*np.sin(2*np.pi*f*t))
for start in np.arange(31,35.4,.55):hit(start,85)
for start in np.arange(38,41,.5):hit(start,300)
for start in np.arange(45,48,.5):hit(start,300)
assert np.max(abs(x))<.98
with wave.open(str(root/'tmp/behaviour-fixture.wav'),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((x*32767).astype('<i2').tobytes())
meta={'sampleRate':sr,'duration':56,'regions':{'held':[3,6.7],'articulated':[8.5,13.7],'combined':[16.5,20.7],'swell':[22,29],'impacts':[30.5,36],'outsideDefaultBand':[37.5,42],'insideWiderBand':[44.5,49],'silence':[52,55]},'knownImpactTimes':[float(t) for t in np.arange(31,35.4,.55)],'expectedDefaultBandEvents':8,'expectedOutsideBandEvents':0,'expectedWiderBandEvents':6,'widerBandChangeAt':43}
(root/'tmp/behaviour-fixture.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Wrote original 56-second behaviour fixture.')
