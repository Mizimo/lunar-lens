"""Native Max transport / gesture / local plugin acceptance. Monitoring stays OFF.
Open the main patch and tmp/runtime-control.maxpat before running.
"""
import pathlib,socket,struct,time,json,sys
root=pathlib.Path(__file__).resolve().parent.parent
sock=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
def string(v):
 b=str(v).encode()+b'\0';return b+b'\0'*((-len(b))%4)
def send(cmd,*args):
 types=',';payload=b''
 for v in args:
  if isinstance(v,(int,float)):types+='f';payload+=struct.pack('>f',float(v))
  else:types+='s';payload+=string(v)
 sock.sendto(string(cmd)+string(types)+payload,('127.0.0.1',7474))
log=root/'tmp/session-final.log';log.write_text('');checks={}
def check(name):
 time.sleep(.08);send('checkpoint');time.sleep(.12)
 s=json.loads([s[6:] for s in log.read_text().splitlines() if s.startswith('CHECK ')][-1])['state']
 assert s['params']['monitor'] is False
 checks[name]=s;print(name,flush=True);return s
send('logto',str(log));send('stop');send('defaults');send('param','monitor',0)
send('loadfile',str(root/'media/Lunar-Departure-demo.wav'));time.sleep(.4)
send('capturefile',str(root/'tmp/interaction-final.jsonl'))
send('recordfile',str(root/'tmp/touch-final.wav'));time.sleep(.65);send('play');time.sleep(3)
send('pad',44,70);time.sleep(.2);send('pressure',44,10);time.sleep(.15);a=check('lightPressure')
send('pressure',44,127);time.sleep(.15);b=check('fullPressure');assert b['gesture']['strength']>a['gesture']['strength']
send('pad',55,110);time.sleep(2.6);s=check('twoTouches');assert s['gesture']['count']==2
send('padup',44);send('padup',55);time.sleep(3.2);s=check('released');assert s['gesture']['count']==0
send('record');send('capturestop')
send('pause');time.sleep(.25);a=check('paused');time.sleep(.6);b=check('pauseHeld');assert a['position']==b['position'] and b['paused']
send('play');time.sleep(.2);send('seek',.25);time.sleep(.3);s=check('seekQuarter');assert s['running'] and abs(s['position']-s['duration']*.25)<.6
send('blackout');send('pad',22,127);time.sleep(.1);s=check('blackout');assert max(s['leds'])==0
send('blackout');send('param','freeze',1);send('pad',44,100);time.sleep(.1);s=check('frozenTouch');assert max(s['leds'])>10 and s['gesture']['count']==2
send('clear');send('cc',103,127);s=check('bodyFocus');assert s['params']['focus']==2
send('cc',107,127);s=check('bassWeight');assert abs(s['params']['bassWeight']-1.6)<1e-5
send('cc',108,127);s=check('restored');assert s['params']['focus']==0 and s['running'] and s['gesture']['count']==0
send('restart');time.sleep(.2);s=check('restart');assert s['running'] and s['position']<.7
send('stop');s=check('stop');assert not s['running'] and s['position']==0 and max(s['leds'])==0
plugin=pathlib.Path('/Library/Audio/Plug-Ins/VST3/FabFilter Pro-R 2.vst3')
if plugin.exists():
 send('pluginfile',str(plugin));time.sleep(2);s=check('pluginReady');assert s['pluginReady']
 send('param','plugin',1);send('recordfile',str(root/'tmp/plugin-final.wav'));time.sleep(.65);send('play');time.sleep(3.5)
 s=check('pluginEnabled');assert s['params']['plugin'] and s['running'];send('record');send('param','plugin',0)
 s=check('pluginBypassed');assert s['params']['plugin'] is False
send('stop');send('defaults');send('param','monitor',0)
song=pathlib.Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'media/Lunar-Departure-demo.wav';send('loadfile',str(song));time.sleep(.4);check('readyForUser')
(root/'tmp/session-final-checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
print('All native session checks passed. Source loaded; stopped; monitoring OFF.',flush=True)
