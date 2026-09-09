"""Known signals for REAL Max audio-path validation; not shipped as a song."""
import math,wave,struct,pathlib,random
root=pathlib.Path(__file__).resolve().parent.parent
sr=44100;rng=random.Random(47)
with wave.open(str(root/'tmp/analysis-fixture.wav'),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr)
 out=bytearray()
 for n in range(sr*29):
  t=n/sr;l=r=0.
  for start,end,hz,anti in [(1,3,80,False),(3.4,5.4,800,False),(5.8,7.8,8000,False),(8.2,10.2,440,True),(10.6,12.6,440,False)]:
   if start<=t<end:
    env=min(1,(t-start)*100,(end-t)*100);l=.18*env*math.sin(2*math.pi*hz*t);r=-l if anti else l
  if 13<=t<26:
   phase=(t-13)%.5;env=math.exp(-phase/.035)
   l=r=.32*env*math.sin(2*math.pi*90*phase)+.04*env*(rng.random()*2-1)
  out.extend(struct.pack('<hh',int(l*32767),int(r*32767)))
 w.writeframes(out)
print(root/'tmp/analysis-fixture.wav')
