"""Max must be open with optional localhost test bridge; no hardware sound needed."""
from pathlib import Path
import sys,subprocess,time,hashlib,json
root=Path(__file__).resolve().parent.parent
label=sys.argv[1] if len(sys.argv)>1 else 'current'
def send(*a):subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,a)],check=True)
send('stop');send('defaults');send('detectorreset');send('param','monitor',0)
send('param','focus',1);send('param','scene',1)
send('loadfile',root/'tmp/kick-timing-fixture.wav');time.sleep(.5)
send('capturefile',root/f'tmp/kick-timing-{label}.jsonl');send('play')
for i in range(3):time.sleep(8.5);print('Kick timing',label,(i+1)*8.5,flush=True)
send('capturestop');send('checkpoint')
hashes={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in ['patchers/Lunar Lens.maxpat','patchers/lens_runtime.js','patchers/lens_screen.js','patchers/lens_grid.js','patchers/lens_analysis.gendsp','patchers/lens_fx.gendsp']}
(root/f'tmp/kick-timing-{label}-build.json').write_text(json.dumps(hashes,indent=2)+'\n')
