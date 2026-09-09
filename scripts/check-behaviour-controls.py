"""Native Max control dispatch check. Does not claim physical button testing."""
from pathlib import Path
import json,subprocess,time
root=Path(__file__).resolve().parent.parent
def send(*args):subprocess.run(['python3',str(root/'scripts/control.py'),*map(str,args)],check=True)
log=root/'tmp/behaviour-controls.log'
send('stop');send('logto',log)
expected=[]
for i in range(5):
    send('roleedit',i);values={'sensitivity':.8+i*.1,'gain':1+i*.1,'width':.7+i*.2,'release':.5+i*.3}
    for key,value in values.items():send('roleparam',key,value)
    expected.append(values)
send('param','scene',4);send('param','palette',3);send('checkpoint');time.sleep(.3)
state=json.loads([line[6:] for line in log.read_text().splitlines() if line.startswith('CHECK ')][-1])['state']
for i,values in enumerate(expected):
    for key,value in values.items():assert abs(state['params']['roles'][i][key]-value)<.00001,(i,key,state)
assert state['params']['scene']==4 and state['params']['palette']==3
assert abs(state['params']['impactSensitivity']-.8)<.00001
report={'version':'1.3.0','nativeParameterDispatchPassed':True,'independentRoles':5,'values':state['params']['roles'],
  'scope':'Max control commands and snapshots; not physical Launchpad or mouse timing.'}
(root/'docs/behaviour-controls-validation.json').write_text(json.dumps(report,indent=2)+'\n')
for i in range(5):send('roleedit',i);send('rolereset')
send('defaults');send('roleedit',0)
print('PASS native Max: five independent role parameter sets survive scene / palette changes; restored afterwards.')
