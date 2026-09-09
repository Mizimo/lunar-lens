"""Native DSP calibration only. This is NOT music-event accuracy validation.
Open the main Max patch and tmp/runtime-control.maxpat before running.
"""
from pathlib import Path
import json, math, random, statistics, struct, subprocess, time, wave
root=Path(__file__).resolve().parent.parent
def send(*args): subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,args)],check=True)
send('stop');send('logto',root/'tmp/measurement-state.log');send('checkpoint');time.sleep(.3)
check=json.loads([s[6:] for s in (root/'tmp/measurement-state.log').read_text().splitlines() if s.startswith('CHECK ')][-1])
sr=int(check['state']['measurements']['sampleRate']);rng=random.Random(214);audio=bytearray()
for i in range(sr*22):
    t=i/sr; sine=.1*math.sin(2*math.pi*1000*t)
    if t<4: left=right=sine
    elif t<8: left,right=sine,-sine
    elif t<12: left,right=sine,0
    elif t<18: left,right=rng.uniform(-.1,.1),rng.uniform(-.1,.1)
    else: left=right=0
    audio+=struct.pack('<hh',round(left*32767),round(right*32767))
source=root/'tmp/measurement-calibration.wav'
with wave.open(str(source),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(sr);out.writeframes(audio)
def send(*args): subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,args)],check=True)
send('stop');send('param','monitor',0);send('loadfile',source);time.sleep(.6)
send('capturefile',root/'tmp/measurement-calibration.jsonl');send('play')
print('Native measurement calibration, 22 s, monitoring OFF.',flush=True)
time.sleep(24);send('capturestop');send('stop');time.sleep(.2)
frames=[json.loads(line) for line in (root/'tmp/measurement-calibration.jsonl').read_text().splitlines()]
def sample(start,end,section,key):
    return statistics.median(f['measurements'][section][key] for f in frames if start<f['position']<end and f['running'])
results={
    'sineCentroidHz':sample(2,3.8,'spectrum','centroidHz'),
    'sineFlatness':sample(2,3.8,'spectrum','flatness'),
    'sineMomentaryDb':sample(2,3.8,'level','momentaryDb'),
    'monoCorrelation':sample(2,3.8,'space','correlation'),
    'antiphaseCorrelation':sample(6,7.8,'space','correlation'),
    'antiphaseCentroidHz':sample(6,7.8,'spectrum','centroidHz'),
    'leftOnlyBalance':sample(10,11.8,'space','balance'),
    'noiseFlatness':sample(14,17,'spectrum','flatness'),
    'noiseEntropy':sample(14,17,'spectrum','entropy'),
    'noiseCentroidHz':sample(14,17,'spectrum','centroidHz'),
    'sineZeroCrossingRate':sample(2,3.8,'waveform','zeroCrossingRate'),
}
assert abs(results['sineCentroidHz']-1000)<40,results
assert abs(results['antiphaseCentroidHz']-1000)<40,results
assert results['sineFlatness']<.01 and results['noiseFlatness']>.3,results
assert abs(results['sineMomentaryDb']+23.01)<.3,results
assert results['monoCorrelation']>.99 and results['antiphaseCorrelation']<-.98,results
assert results['leftOnlyBalance']<-.98,results
assert abs(results['noiseCentroidHz']-sr/4)<1000,results
assert abs(results['sineZeroCrossingRate']-2000/sr)<.005,results
report={'purpose':'Native measurement units and stereo calibration; not event precision/recall','sampleRate':sr,'frames':len(frames),'passed':True,'results':results}
(root/'docs/measurement-calibration.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
