"""Render three weights using actual native features; no physical LED brightness claim."""
import pathlib,json
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).resolve().parent.parent
rows=json.loads((root/'tmp/dynamics-review.json').read_text())['selected'];font='/System/Library/Fonts/STHeiti Light.ttc'
im=Image.new('RGB',(1140,540),'#080e18');d=ImageDraw.Draw(im)
def text(x,y,s,size=18,c='#abbcd0'):d.text((x,y),s,font=ImageFont.truetype(font,size),fill=c)
text(28,20,'同一低頻，衝擊有輕重',29,'#edf4fc');text(28,64,'持續 90 Hz 上疊加三種重音 · Max 原生分析 · 相同構圖與亮度')
for i,r in enumerate(rows):
 x=28+376*i;text(x,112,['輕擊','中擊','重擊'][i],23,'#edf4fc');text(x,146,'力度 '+format(r['strength'],'.2f'),17)
 for py in range(8):
  for px in range(8):
   k=((7-py)*8+px)*3;c=tuple(round(255*(b+(v/127)**.7*f)) for b,v,f in zip([.014,.021,.032],r['grid'][k:k+3],[.9,.92,.94]));xx=x+px*35;yy=184+py*35
   d.rounded_rectangle((xx,yy,xx+29,yy+29),4,fill=c,outline='#172131')
text(28,493,'正式 Renderer 重播同一份原生特徵；畫面 gamma 僅供預覽，不代表實體 LED 光度。',16)
im.save(root/'media/impact-weights.png')
