"""Capture a full user-selected recording in native Max. No track-specific mapping.
Usage: python3 scripts/run-song-check.py /path/to/audio.mp3
"""
import pathlib,socket,struct,time,sys,json,subprocess,hashlib
root=pathlib.Path(__file__).resolve().parent.parent
source=pathlib.Path(sys.argv[1]).resolve();assert source.is_file()
name=sys.argv[2] if len(sys.argv)>2 else 'sana'
assert name.replace('-','').isalnum(), 'Use a simple report label'

duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(source)]))
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
def string(v):
 b=str(v).encode()+b'\0';return b+b'\0'*((-len(b))%4)
def send(cmd,*args):
 types=',';payload=b''
 for v in args:
  if isinstance(v,(int,float)):types+='f';payload+=struct.pack('>f',float(v))
  else:types+='s';payload+=string(v)
 sock.sendto(string(cmd)+string(types)+payload,('127.0.0.1',7474))
send('stop');send('defaults');send('detectorreset');send('param','master',.4);send('param','monitor',0);send('loadfile',str(source));time.sleep(.6)
send('logto',str(root/('tmp/'+name+'-final.log')));send('capturefile',str(root/('tmp/'+name+'-final.jsonl')));send('play')
print('Final build: original-rate full song running, monitor OFF.',flush=True)
elapsed=0
while elapsed<duration+3:
 wait=min(40,duration+3-elapsed);time.sleep(wait);elapsed+=wait;print('Elapsed %.1f s'%elapsed,flush=True)
send('capturestop');send('checkpoint');time.sleep(.2)
files=sorted(str(p.relative_to(root)) for p in (root/'patchers').iterdir() if p.is_file())
evidence={'sourceName':source.name,'sourceDurationSeconds':duration,'runtimeHashes':{f:hashlib.sha256((root/f).read_bytes()).hexdigest() for f in files}}
(root/('tmp/'+name+'-final-build.json')).write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
print('Full song complete.',flush=True)
