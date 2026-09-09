import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{if(['tmp','.git','node_modules','.DS_Store','SHA256SUMS.json'].includes(e.name))return [];let f=dir?dir+'/'+e.name:e.name;return e.isDirectory()?walk(f):[f];});}
const files=walk('').sort(),hashes={};for(const f of files)hashes[f]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
fs.writeFileSync(path.join(root,'SHA256SUMS.json'),JSON.stringify({version:JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,files:hashes},null,2)+'\n');
const archive=path.join(path.dirname(root),'lunar-lens-v'+JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version+'.zip');
const script=`import pathlib,zipfile,json,hashlib,sys\nr=pathlib.Path(sys.argv[1]);zpath=pathlib.Path(sys.argv[2]);m=json.loads((r/'SHA256SUMS.json').read_text())['files']\nwith zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED) as z:\n for f in list(m)+['SHA256SUMS.json']: z.write(r/f,'lunar-lens/'+f)\nwith zipfile.ZipFile(zpath) as z:\n for f,h in m.items(): assert hashlib.sha256(z.read('lunar-lens/'+f)).hexdigest()==h,f\nprint('Verified',len(m)+1,'files; archive bytes',zpath.stat().st_size)\nprint('SHA256',hashlib.sha256(zpath.read_bytes()).hexdigest())\n`;
process.stdout.write(execFileSync('python3',['-c',script,root,archive]));console.log(archive);
