"""Render a 24-second transition demonstration with the original project demo.
Pillow + ffmpeg. This is renderer replay, not a camera recording of LEDs.
"""
from pathlib import Path
import json,subprocess
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent
rows=json.loads((root/'tmp/transition-review.json').read_text());font='/System/Library/Fonts/STHeiti Light.ttc'
fonts={i:ImageFont.truetype(font,i) for i in [13,16,18,22,28]}
def text(d,xy,s,size=16,color='#acbcd0'):d.text(xy,s,font=fonts[size],fill=color)
silent=root/'tmp/transition-review-silent.mp4'
proc=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1100x680','-r','30','-i','-','-an','-c:v','libx264','-threads','2','-crf','20','-pix_fmt','yuv420p',str(silent)],stdin=subprocess.PIPE)
names=['重力 / 沉積','天體 / 公轉','織光 / 經緯','門廊 / 縱深','雙生 / 呼應','拼光 / 碎片']
for row in rows:
    im=Image.new('RGB',(1100,680),'#080e18');d=ImageDraw.Draw(im)
    text(d,(32,24),'LUNAR LENS 1.3',28,'#edf4ff');text(d,(32,70),'構圖轉場 · 聲音事件 · 五行為',18)
    for i,name in enumerate(names):
        y=160+i*55;d.rounded_rectangle((28,y-8,253,y+32),4,fill='#29314b' if row['scene']==i else '#101926');text(d,(40,y),name,18,'#bca0ed' if row['scene']==i else '#acbcd0')
    a=row['rgb'];step=54
    for y in range(8):
        for x in range(8):
            k=((7-y)*8+x)*3;color=tuple(round(255*(b+(v/127)**.7*f)) for b,v,f in zip([.014,.021,.032],a[k:k+3],[.9,.92,.94]));
            d.rounded_rectangle((310+x*step,135+y*step,310+x*step+46,135+y*step+46),4,fill=color,outline='#202c3e')
    tr=row['transition'];text(d,(795,153),'0.85 s 轉場',22,'#d7c2f1');text(d,(795,198),'混合中' if tr['active'] else '構圖穩定',18)
    d.rectangle((795,240,1040,244),fill='#253049');d.rectangle((795,240,795+245*tr['progress'],244),fill='#9f8dcc')
    m=row['measurements'];st=row['perception']['state']
    text(d,(795,310),'FFT 重心',16);text(d,(795,342),f"{m['spectrum']['centroidHz']:.0f} Hz",22,'#71d2dc')
    text(d,(795,397),'音色分散度',16);text(d,(795,429),f"{m['spectrum']['entropy']:.2f}",22,'#d196e4')
    text(d,(795,480),'結構變化程度',16);text(d,(795,512),f"{st['structureNovelty']:.2f}",22,'#ef93b3')
    text(d,(32,612),'原創 Demo 音訊 · 正式渲染器重播 · 不是實機 LED 拍攝',16)
    text(d,(32,644),'背景轉場；IMPACT 保留即時起音，畫面不等待轉場結束。',13)
    proc.stdin.write(im.tobytes())
proc.stdin.close();assert proc.wait()==0
subprocess.run(['ffmpeg','-y','-v','error','-i',str(silent),'-ss','2','-i',str(root/'media/Lunar-Departure-demo.wav'),'-t','24','-map','0:v','-map','1:a','-af','volume=0.4','-c:v','copy','-c:a','aac','-b:a','160k','-movflags','+faststart',str(root/'media/transitions-and-events.mp4')],check=True)
print('Wrote media/transitions-and-events.mp4')
