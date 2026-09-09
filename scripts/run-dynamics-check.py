"""Run original dynamics test in native Max through the optional local test bridge."""
import pathlib,subprocess,time
root=pathlib.Path(__file__).resolve().parent.parent
def send(*a):subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,a)],check=True)
send('stop');send('defaults');send('detectorreset');send('param','master',.4);send('param','monitor',0)
send('loadfile',root/'tmp/dynamics-fixture.wav');time.sleep(.5)
send('capturefile',root/'tmp/dynamics-native.jsonl');send('play')
for i in range(4):time.sleep(14);print('Dynamics elapsed',14*(i+1),flush=True)
send('capturestop');send('checkpoint')
