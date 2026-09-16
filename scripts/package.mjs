import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['tmp', 'dist', '.git', 'node_modules', '.DS_Store', '__pycache__', 'SHA256SUMS.json']);
function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), {withFileTypes: true}).flatMap(entry => {
    if (excluded.has(entry.name) || entry.name.endsWith('.pyc')) return [];
    const file = dir ? dir + '/' + entry.name : entry.name;
    if (entry.isSymbolicLink()) throw new Error('Do not package symlinks: ' + file);
    if (entry.isDirectory()) return walk(file);
    if (!entry.isFile()) throw new Error('Unsupported file: ' + file);
    return [file];
  });
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
const hashes = Object.fromEntries(walk().sort().map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')]));
fs.writeFileSync(path.join(root, 'SHA256SUMS.json'), JSON.stringify({version: pkg.version, files: hashes}, null, 2) + '\n');
// Unique candidate names. Packaging never writes to archives/, versions/ or current.
const stamp = new Date().toISOString().replace(/[-:.]/g, '');
const filename = `lunar-lens-v${pkg.version}-candidate-${stamp}-${crypto.randomUUID().slice(0, 8)}.zip`;
const output = path.join(root, 'dist/candidates');
fs.mkdirSync(output, {recursive: true});
const archive = path.join(output, filename);
const script = `import pathlib,zipfile,json,sys
sys.path.insert(0, str(pathlib.Path(sys.argv[1])/'scripts'))
from release_files import inspect_archive,digest
r=pathlib.Path(sys.argv[1]); archive=pathlib.Path(sys.argv[2])
m=json.loads((r/'SHA256SUMS.json').read_text())
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
 for f in list(m['files'])+['SHA256SUMS.json']: z.write(r/f,'lunar-lens/'+f)
inspect_archive(archive)
print(json.dumps({'archive':str(archive),'sha256':digest(archive),'files':len(m['files'])+1}))
`;
const result = JSON.parse(execFileSync('python3', ['-c', script, root, archive], {encoding: 'utf8'}));
const candidate = {channel: 'candidate', baseVersion: pkg.version, ...result};
fs.writeFileSync(archive + '.json', JSON.stringify(candidate, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'latest.json'), JSON.stringify(candidate, null, 2) + '\n');
console.log(`Candidate only (${result.files} files): ${archive}\nSHA256 ${result.sha256}\nStable release unchanged.`);
