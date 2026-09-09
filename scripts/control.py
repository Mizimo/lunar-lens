"""Local test-harness client. Open tmp/runtime-control.maxpat in Max first."""
import socket,sys,struct
s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
def oscstr(s):
 b=s.encode()+b'\0';return b+b'\0'*((-len(b))%4)
types=',';data=b''
for a in sys.argv[2:]:
 try:
  f=float(a);types+='f';data+=struct.pack('>f',f)
 except ValueError:
  types+='s';data+=oscstr(a)
s.sendto(oscstr(sys.argv[1])+oscstr(types)+data,('127.0.0.1',7474))
