"""Pillow rendering of production renderer replays and native relative FFT power."""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent
rows=json.loads((root/'tmp/stereo-review.json').read_text());im=Image.new('RGB',(1440,750),'#080e18');d=ImageDraw.Draw(im)
fonts={}
def text(x,y,s,size=18,col='#aabbcf'):
 if size not in fonts: fonts[size]=ImageFont.truetype('/System/Library/Fonts/STHeiti Light.ttc',size)
 d.text((x,y),s,font=fonts[size],fill=col)
def grid(a,x,y,w=200):
 step=w/8
 for yy in range(8):
  for xx in range(8):
   i=((7-yy)*8+xx)*3;c=tuple(round(255*(b+(v/127)**.7*f)) for b,v,f in zip([.014,.021,.032],a[i:i+3],[.9,.92,.94]))
   d.rounded_rectangle((x+xx*step,y+yy*step,x+(xx+1)*step-3,y+(yy+1)*step-3),2,fill=c,outline='#172131')
text(30,25,'LUNAR LENS  1.4  /  左／中／右',30,'#e5f1ff')
text(30,72,'低頻保持整體，中高頻保留位置與聚中證據。原生 Max 測量 → 正式渲染器重播。',20)
titles=['完整低頻 / 聚中 / 右中頻','完整低頻 / 聚中 / 左中頻','同一音域裡，左／中／右共存']
sub=['180 Hz 低音 · 1 kHz C · 2.4 kHz R','180 Hz 低音 · 1 kHz C · 2.4 kHz L','1.1 kHz L · 1 kHz C · 1.4 kHz R']
colors=['#5acdda','#e2aa65','#ed659f']
for col,row in enumerate(rows):
 x=30+col*474
 text(x,128,titles[col],23,'#deedfa');text(x,165,sub[col],15)
 s=row['measurement']['stereoSpectrum'];peak=max(max(b['power']) for b in s['bands'][6:])
 for c,label in enumerate(['L 左側','C 聚中線索','R 右側']):
  xx=x+c*141;text(xx,214,label,16,colors[c]);d.rounded_rectangle((xx,247,xx+133,373),4,fill='#0e1725')
  for i,b in enumerate(s['bands'][6:]):
   h=110*math.sqrt(b['power'][c]/max(1e-12,peak))
   if h>.3: d.rectangle((xx+4+i*12.3,369-h,xx+13+i*12.3,369),fill=colors[c])
  text(xx,387,'280 Hz        16 kHz',12)
 text(x,439,'重力：低頻保持整體',16);text(x+222,439,'三域：中高頻分開',16)
 grid(row['grids'][0],x,476);grid(row['grids'][1],x+222,476)
text(30,714,'三份頻譜共用刻度。聚中需近等電平及高度同相；不是中央聲部／人聲分離。圖中 LED 為螢幕 gamma 預覽。',17)
im.save(root/'media/stereo-distribution.png');print('Wrote media/stereo-distribution.png')
