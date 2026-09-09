"""Compare a partial native Max recording with the selected original file."""
import pathlib,json,subprocess,numpy as np,sys
root=pathlib.Path(__file__).resolve().parent.parent
source=pathlib.Path(sys.argv[1]);record=root/'tmp/sana-native-dry.wav'
def decode(path,sr,channels):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ar',str(sr),'-ac',str(channels),'-f','f32le','-'])
 return np.frombuffer(raw,dtype='<f4').reshape(-1,channels)
x=decode(source,8000,1)[:,0];y=decode(record,8000,1)[:,0]
nfft=1<<(len(x)+len(y)-1).bit_length()
c=np.fft.irfft(np.fft.rfft(x,nfft)*np.conj(np.fft.rfft(y,nfft)),nfft)
offset=int(np.argmax(c[:max(1,len(x)-len(y))]))*6
del c,x,y
sr=48000;x=decode(source,sr,2);y=decode(record,sr,2)
n=min(len(y),sr*6);probe=y[:n,0];scores=[]
for lag in range(offset-24,offset+25):
 if lag>=0 and lag+n<len(x):scores.append((float(np.dot(x[lag:lag+n,0],probe)),lag))
offset=max(scores)[1];n=min(len(y),len(x)-offset);xx=x[offset:offset+n];yy=y[:n]
gain=float(np.sum(xx.astype(np.float64)*yy)/np.sum(xx.astype(np.float64)**2))
correlation=float(np.corrcoef(xx.flatten(),yy.flatten())[0,1])
result={'sourceName':source.name,'comparisonSampleRate':sr,'recordingSeconds':len(y)/sr,'sourceOffsetSeconds':offset/sr,'gain':gain,'correlation':correlation,'finite':bool(np.isfinite(y).all()),'peakDbFS':float(20*np.log10(max(np.max(np.abs(y)),1e-12))),'relativeResidual':float(np.sqrt(np.mean((yy-xx*gain)**2))/max(np.sqrt(np.mean(yy**2)),1e-12))}
assert result['finite'] and correlation>.99 and abs(gain-.4)<.02,result
assert result['peakDbFS']<-.1
(root/'docs/sana-audio-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
