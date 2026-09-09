"""Native L/C/R calibration: known channel placement, not instrument recognition.
Requires Max main patch and the local-only tmp/runtime-control.maxpat bridge.
Creates its own tones/noise; no reference recording is copied or uploaded.
"""
from pathlib import Path
import hashlib, json, math, random, statistics, struct, subprocess, time, wave
root=Path(__file__).resolve().parent.parent
def send(*a): subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,a)],check=True)
send('stop');send('logto',root/'tmp/stereo-state.log');send('checkpoint');time.sleep(.3)
q=json.loads([s[6:] for s in (root/'tmp/stereo-state.log').read_text().splitlines() if s.startswith('CHECK ')][-1])
sr=int(q['state']['measurements']['sampleRate']);rng=random.Random(140)
cases=['mono','left','right','antiphase','split','swapped','same_register','diffuse','partial_pan','quadrature','silence']
def tone(hz,t,a=.08): return a*math.sin(2*math.pi*hz*t)
audio=bytearray()
for n in range(sr*len(cases)*4):
 t=n/sr;case=cases[int(t//4)];v=tone(1000,t)
 if case=='mono': left=right=v
 elif case=='left': left,right=v,0
 elif case=='right': left,right=0,v
 elif case=='antiphase': left,right=v,-v
 elif case in ['split','swapped']:
  left,right=tone(180,t)+v*.75,tone(2400,t)+v*.75
  if case=='swapped': left,right=right,left
 elif case=='same_register': left,right=tone(1100,t)+v*.75,tone(1400,t)+v*.75
 elif case=='partial_pan': left,right=v,v*.55
 elif case=='quadrature': left,right=v,.08*math.cos(2*math.pi*1000*t)
 elif case=='diffuse': left,right=rng.uniform(-.08,.08),rng.uniform(-.08,.08)
 else: left=right=0
 audio+=struct.pack('<hh',round(left*32767),round(right*32767))
source=root/'tmp/stereo-calibration.wav'
with wave.open(str(source),'wb') as out:
 out.setnchannels(2);out.setsampwidth(2);out.setframerate(sr);out.writeframes(audio)
send('param','monitor',0);send('loadfile',source);time.sleep(.5);send('param','scene',6);send('spacepanel')
send('capturefile',root/'tmp/stereo-calibration.jsonl');send('play')
print(f'Native L/C/R calibration: {len(cases)*4} s at {sr} Hz, monitor OFF',flush=True)
remaining=len(cases)*4+3
while remaining>0:
 wait=min(10,remaining);time.sleep(wait);remaining-=wait;print('Capturing native stereo measurements…',flush=True)
send('capturestop');send('stop');time.sleep(.2)
frames=[json.loads(line) for line in (root/'tmp/stereo-calibration.jsonl').read_text().splitlines()]
def rows(case):
 start=cases.index(case)*4;return [f for f in frames if start+1.5<f['position']<start+3.7 and f['running']]
def shares(f,indices=None):
 s=f['measurements']['stereoSpectrum'];v=s['totals'] if indices is None else [sum(s['bands'][i]['power'][c] for i in indices) for c in range(3)]
 total=max(1e-12,sum(v));return [x/total for x in v]
def median_shares(case,indices=None): return [statistics.median(shares(f,indices)[c] for f in rows(case)) for c in range(3)]
result={case:median_shares(case) for case in cases[:-1]}
result['splitLow']=median_shares('split',[4,5]);result['splitMiddle']=median_shares('split',[8,9]);result['splitHigh']=median_shares('split',[10,11])
result['swappedLow']=median_shares('swapped',[4,5]);result['swappedHigh']=median_shares('swapped',[10,11]);result['sameRegister']=median_shares('same_register',[9])
assert result['mono'][1]>.995,result
assert result['left'][0]>.995 and result['right'][2]>.995,result
assert result['antiphase'][1]<.005,result
assert result['splitLow'][0]>.95 and result['splitMiddle'][1]>.95 and result['splitHigh'][2]>.95,result
assert result['swappedLow'][2]>.95 and result['swappedHigh'][0]>.95,result
assert min(result['sameRegister'])>.15,result
assert abs(result['diffuse'][0]-result['diffuse'][2])<.05 and result['diffuse'][1]<.02,result
assert result['partial_pan'][1]<.01 and result['partial_pan'][0]>.7,result
assert result['quadrature'][1]<.01,result
active=[f for f in frames if f['running'] and f['features']['active'] and f['position']>1]
assert all(f['measurements']['stereoSpectrum']['valid'] for f in active)
assert all(0<=v<=127 for f in frames for v in f['leds'])
assert all(max(f['leds'])==0 for f in rows('silence'))
report={'version':'1.4.0','purpose':'Native known spatial placement and silence checks; not stem separation or music accuracy','sampleRate':sr,'frames':len(frames),'passed':True,'results':result,'runtimeHashes':{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root/'patchers').glob('*')) if p.is_file()}}
(root/'docs/stereo-calibration.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='runtimeHashes'},indent=2))
