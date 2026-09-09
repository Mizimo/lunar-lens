"""Render seven geometrically different views of the same captured input. Pillow + ffmpeg.
Preview: native scene 0 RGB plus alternate production-renderer replays.
Video audio: original fixture only, never a commercial recording.
"""
import pathlib,json,subprocess,statistics,sys
from PIL import Image,ImageDraw,ImageFont
root=pathlib.Path(__file__).resolve().parent.parent
font='/System/Library/Fonts/STHeiti Light.ttc';fonts={}
def text(d,xy,s,size=18,fill='#acbcd0'):
 if size not in fonts:fonts[size]=ImageFont.truetype(font,size)
 d.text(xy,s,font=fonts[size],fill=fill)
def grid(d,a,x,y,w):
 step=w/8
 for py in range(8):
  for px in range(8):
   k=((7-py)*8+px)*3;c=tuple(round(255*(b+(v/127)**.7*f)) for b,v,f in zip([.014,.021,.032],a[k:k+3],[.9,.92,.94]))
   d.rounded_rectangle((x+px*step,y+py*step,x+(px+1)*step-4,y+(py+1)*step-4),3,fill=c,outline='#172131')
titles=['重力／沉積','天體／公轉','織光／經緯','門廊／縱深','雙生／呼應','拼光／碎片','聲場／三域']
palettes=['琥珀冰川','月夜紫羅蘭','翡翠珊瑚','鈷藍熔岩','蘭花青檸','桃紅電光','琥珀冰川']
selected=json.loads((root/'tmp/visual-review-selected.json').read_text());im=Image.new('RGB',(1200,1430),'#080e18');d=ImageDraw.Draw(im)
text(d,(32,22),'LUNAR LENS  1.4.0',30,'#edf4fc');text(d,(32,66),'同一音訊，同一時刻。七種空間構成，各自保留五個聲音行為。',18)
for i,t in enumerate(titles):
 x=32+(i%3)*396;y=112+(i//3)*330
 text(d,(x,y),f'0{i+1}  '+t,21,'#d6e4f2');text(d,(x+216,y+4),palettes[i],14);grid(d,selected['grids'][i],x,y+32,280)
text(d,(32,1115),'同一幀，逐層獨看',23,'#edf4fc')
for i,t in enumerate(['衝擊 IMPACT','地基 BODY','前景 PHRASE','鋪陳 BED','細節 DETAIL']):
 x=32+i*235;text(d,(x,1165),t,17);grid(d,selected['grids'][7+i],x,1198,184)
text(d,(32,1400),selected['caption']+f" · {selected['position']:.2f} s · Native 特徵／正式渲染器重播 · 螢幕 gamma 預覽",14)
im.save(root/'media/preview.png')
if '--sheet-only' in sys.argv:print('Wrote preview.png.');sys.exit(0)
rows=json.loads((root/'tmp/visual-review-frames.json').read_text());origin=statistics.median(r['time']-r['position'] for r in rows if 1<r['position']<44)-.05
fps=30;start=26;duration=17;idx=0;silent=root/'tmp/review-silent.mp4'
proc=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1200x1170','-r',str(fps),'-i','-','-an','-c:v','libx264','-crf','18','-pix_fmt','yuv420p',str(silent)],stdin=subprocess.PIPE)
for n in range(fps*duration):
 t=start+n/fps
 while idx+1<len(rows) and rows[idx+1]['time']<=origin+t:idx+=1
 row=rows[idx];im=Image.new('RGB',(1200,1170),'#080e18');d=ImageDraw.Draw(im)
 text(d,(32,20),'LUNAR LENS  1.4.0 / 同一聲音，七種空間',27,'#edf4fc')
 label='低頻＋短和弦＋打擊' if t<34 else '移除低頻：剩中頻短和弦' if t<38 else '只剩高頻短音' if t<42 else '停止後退暗'
 text(d,(32,62),label,18);text(d,(1040,26),f'{t:05.2f} s',21)
 for i,name in enumerate(titles):
  x=32+(i%3)*396;y=114+(i//3)*336;text(d,(x,y-4),name,19);grid(d,row['grids'][i],x,y+28,276)
 text(d,(32,1130),'原創驗收訊號 · 相同 Native 分析幀 · 正式渲染器重播 · 非實機 LED 拍攝',15)
 proc.stdin.write(im.tobytes())
proc.stdin.close();assert proc.wait()==0
subprocess.run(['ffmpeg','-y','-v','error','-i',str(silent),'-ss',str(start),'-i',str(root/'tmp/role-fixture.wav'),'-t',str(duration),'-map','0:v','-map','1:a','-af','volume=0.4','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',str(root/'media/roles-in-motion.mp4')],check=True)
print('Wrote preview.png and 17-second seven-composition movie.')
