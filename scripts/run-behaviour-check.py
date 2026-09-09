"""Native Max acceptance, monitoring OFF; test frequency control at 43 s."""
import pathlib,socket,struct,time
root=pathlib.Path(__file__).resolve().parent.parent;sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
def string(s):
 b=str(s).encode()+b'\0';return b+b'\0'*((-len(b))%4)
def send(cmd,*args):
 tags=',';payload=b''
 for a in args:
  if isinstance(a,(int,float)):tags+='f';payload+=struct.pack('>f',float(a))
  else:tags+='s';payload+=string(a)
 sock.sendto(string(cmd)+string(tags)+payload,('127.0.0.1',7474))
send('stop');send('defaults');send('detectorreset');send('param','monitor',0)
send('logto',str(root/'tmp/behaviour.log'));send('loadfile',str(root/'tmp/behaviour-fixture.wav'));time.sleep(.5)
send('capturefile',str(root/'tmp/behaviour-native.jsonl'));send('recordfile',str(root/'tmp/behaviour-native.wav'));time.sleep(.65)
send('play');start=time.monotonic();print('Native behaviour test started; monitoring OFF.',flush=True)
for target in [15,30,43,57]:
 time.sleep(max(0,target-(time.monotonic()-start)))
 if target==43:send('param','impactHi',380)
 send('checkpoint');print('Elapsed '+str(target)+' s',flush=True)
send('record');send('capturestop');send('stop');send('detectorreset')
print('Native behaviour test complete.',flush=True)
