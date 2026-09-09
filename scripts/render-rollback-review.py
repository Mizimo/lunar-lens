"""Render one identical real-song instant through rejected and restored mappings."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parent.parent
q=json.loads((root/'tmp/visual-rollback-review.json').read_text())
im=Image.new('RGB',(1580,640),'#080d16');d=ImageDraw.Draw(im)
def text(x,y,s,size=20,color='#becad9'):
 d.text((x,y),s,font=ImageFont.truetype('/System/Library/Fonts/STHeiti Light.ttc',size),fill=color)
def grid(rgb,x,y):
 for yy in range(8):
  for xx in range(8):
   a=rgb[((7-yy)*8+xx)*3:((7-yy)*8+xx)*3+3]
   c=tuple(min(255,round(255*(.016+(v/127)**.7*.92))) for v in a)
   d.rounded_rectangle((x+xx*23,y+yy*23,x+xx*23+19,y+yy*23+19),2,fill=c,outline='#192331')
text(28,22,'LUNAR LENS  1.4.1  /  中央構圖回滾',29,'#eff4ff')
text(28,69,f"{q['sourceName']} · 同一個原生 Max 音訊幀 {q['position']:.1f} 秒 · 相同輸入及參數",20)
text(28,110,'上：1.4.0 的形體投影    下：六構圖恢復原版，三域改為清晰頻譜',20,'#8dbed2')
names=['重力／沉積','天體／公轉','織光／經緯','門廊／深梁','雙生／呼應','拼光／碎片','聲場／三域']
for i,s in enumerate(q['scenes']):
 x=28+i*221;text(x,158,names[i],19);grid(s['before'],x,194);grid(s['after'],x,408)
text(28,609,'六構圖逐幀對照 1.3；三域為新設計。螢幕 gamma 預覽，非實機照片。',18)
im.save(root/'media/visual-rollback.png')
