"""Same-register behavioural comparison from native Max features, not separated vocals."""
import pathlib,json,importlib.util
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).resolve().parent.parent
rows=json.loads((root/'tmp/behaviour-review.json').read_text())['selected'];font='/System/Library/Fonts/STHeiti Light.ttc'
def text(d,xy,s,size=18,c='#acbcd0'):d.text(xy,s,font=ImageFont.truetype(font,size),fill=c)
def grid(d,a,x,y,w):
 step=w/8
 for py in range(8):
  for px in range(8):
   k=((7-py)*8+px)*3;c=tuple(round(255*(b+(v/127)**.7*f)) for b,v,f in zip([.014,.021,.032],a[k:k+3],[.9,.92,.94]))
   d.rounded_rectangle((x+px*step,y+py*step,x+(px+1)*step-4,y+(py+1)*step-4),3,fill=c,outline='#172131')
im=Image.new('RGB',(1110,900),'#080e18');d=ImageDraw.Draw(im)
text(d,(28,24),'同一個音域，三種發聲行為',29,'#edf4fc');text(d,(28,68),'440 / 660 / 1100 Hz 原創控制訊號 · Max 原生分析 · 相同參數',18)
for col,(row,title) in enumerate(zip(rows,['穩定延續','音節式短音','延續＋短音同時存在'])):
 x=28+col*368;text(d,(x,120),title,22,'#edf4fc');text(d,(x,155),f"前景 {row['roles'][2]:.2f}  /  鋪陳 {row['roles'][3]:.2f}",17)
 for j,label in [(1,'前景 PHRASE'),(2,'鋪陳 BED')]:
  y=200+(j-1)*320;text(d,(x,y),label,17);grid(d,row['grids'][j],x,y+32,258)
text(d,(28,858),'兩層可同時存在。此測試驗證聲音行為，不代表已分離人聲或辨識樂器。',17)
im.save(root/'media/behaviour-comparison.png')
