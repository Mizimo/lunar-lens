"""Review real recording captures; no manual labels, so no accuracy claims.
Usage: python3 scripts/review-events.py blossoms13 isekai13
Requires Pillow. Raw recordings and raw traces are never packaged.
"""
from pathlib import Path
import hashlib,json,statistics,sys
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent
labels=sys.argv[1:];assert labels
font=next((p for p in ['/System/Library/Fonts/STHeiti Light.ttc','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'] if Path(p).exists()),None)
def text(draw,xy,value,size=16,color='#b8c9db'):draw.text(xy,value,font=ImageFont.truetype(font,size),fill=color)
reports=[];im=Image.new('RGB',(1280,100+len(labels)*455),'#080e18');draw=ImageDraw.Draw(im)
text(draw,(32,20),'LUNAR LENS 1.3 / REAL-MIX EVENT REVIEW',26,'#edf4ff')
text(draw,(32,60),'聲學測量與候選事件時間線；未人工標註，這不是識別準確率。',18)
for track,label in enumerate(labels):
    path=root/f'tmp/{label}-final.jsonl';rows=[json.loads(s) for s in path.read_text().splitlines()]
    build=json.loads((root/f'tmp/{label}-final-build.json').read_text());duration=build['sourceDurationSeconds']
    active=[r for r in rows if r['features']['active']]
    assert active and all(r['measurements']['spectrum']['valid'] for r in active[10:])
    seen=set();events=[]
    for row in rows:
        for e in row['perception']['events']:
            if e['id'] in seen:continue
            seen.add(e['id'])
            if e['type']=='onset':continue
            events.append({**e,'position':round(max(0,row['position']+e['time']-row['time']),3)})
    report={'sourceName':build['sourceName'],'durationSeconds':duration,'frames':len(rows),'traceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),
      'eventTotals':rows[-1]['perception']['totals'],'events':events,'validSpectraDuringActiveAudio':True,
      'analysisMsP99':sorted(r['analysisMs'] for r in rows)[int(len(rows)*.99)],'renderMsP99':sorted(r['renderMs'] for r in rows)[int(len(rows)*.99)],
      'limitations':'No manually labelled event truth. Counts and timelines are diagnostic, not precision/recall.'}
    reports.append(report)
    y=105+track*455;text(draw,(32,y),build['sourceName'],20,'#edf4ff');y+=36
    x0=200;x1=1235;w=x1-x0
    series=[('能量 0.4s / 3s',lambda r:(r['measurements']['level']['momentaryDb']+60)/60,'#66cddb'),
      ('頻譜分散度',lambda r:r['measurements']['spectrum']['entropy'],'#c194e6'),
      ('左右相關 -1…1',lambda r:(r['measurements']['space']['correlation']+1)/2,'#edb46d'),
      ('結構變化程度',lambda r:r['perception']['state']['structureNovelty'],'#ec789b')]
    for i,(name,getter,color) in enumerate(series):
        top=y+i*62
        text(draw,(32,top+18),name,15);draw.line((x0,top+48,x1,top+48),fill='#273348')
        sampled=rows[::max(1,len(rows)//1000)]
        points=[(x0+min(duration,r['position'])/duration*w,top+48-max(0,min(1,getter(r)))*43) for r in sampled]
        draw.line(points,fill=color,width=2)
        if i==0:
            points=[(x0+min(duration,r['position'])/duration*w,top+48-max(0,min(1,(r['measurements']['level']['shortTermDb']+60)/60))*43) for r in sampled];draw.line(points,fill='#647a98',width=1)
    bottom=y+252;text(draw,(32,bottom+7),'結構候選 / 音色變化',14)
    for e in events:
        x=x0+min(duration,e['position'])/duration*w
        if e['type']=='structure.change':draw.line((x,y,x,bottom+30),fill='#82516b',width=1);draw.rectangle((x-2,bottom,x+2,bottom+20),fill='#ed83a5')
        elif e['type']=='texture.change':draw.ellipse((x-1,bottom+27,x+1,bottom+29),fill='#9274b0')
    for second in range(0,int(duration)+1,30):text(draw,(x0+second/duration*w-10,bottom+38),str(second)+'s',12)
    total=report['eventTotals'];text(draw,(32,bottom+70),f"結構候選 {total.get('structure.change',0)} · 音色變化 {total.get('texture.change',0)} · 事件頁可查看依據與信心",15)
im.save(root/'media/event-timelines.png')
(root/'docs/event-timelines.json').write_text(json.dumps({'schemaVersion':1,'tracks':reports},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k!='events'} for r in reports],ensure_ascii=False,indent=2))
