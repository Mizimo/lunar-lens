"""Local acceptance driver. Open tmp/runtime-control.maxpat and the main patch in Max."""
import pathlib,socket,struct,time,json
root=pathlib.Path(__file__).resolve().parent.parent
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
def string(s):
 b=str(s).encode()+b'\0';return b+b'\0'*((-len(b))%4)
def send(cmd,*args):
 types=',';payload=b''
 for v in args:
  if isinstance(v,(float,int)):types+='f';payload+=struct.pack('>f',float(v))
  else:types+='s';payload+=string(v)
 sock.sendto(string(cmd)+string(types)+payload,('127.0.0.1',7474))
def phase(s):print(s,flush=True)
send('logto',str(root/'tmp/v1-final.log'));send('param','monitor',0);send('disconnect');send('stop')
send('loadfile',str(root/'tmp/role-fixture.wav'));time.sleep(.5)
send('capturefile',str(root/'tmp/role-fixture-native.jsonl'))
send('recordfile',str(root/'tmp/role-fixture-native.wav'));time.sleep(.65)
send('play');phase('Native role fixture started; monitoring OFF.')
for i in range(4):time.sleep(10);send('checkpoint');phase('Fixture elapsed '+str((i+1)*10)+' s')
time.sleep(6);send('record');send('capturestop');send('checkpoint');phase('Fixture capture complete.')
