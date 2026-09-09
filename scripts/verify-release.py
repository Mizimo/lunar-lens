"""Verify the packaged files, rebuild an isolated extraction, and run acceptance tests.
The temporary extraction stays outside Max's project search path.
"""
from pathlib import Path
import hashlib, json, subprocess, tempfile, zipfile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'package.json').read_text())['version']
archive = root.parent / f'lunar-lens-v{version}.zip'
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='lunar-lens-verify-') as temporary:
    destination = Path(temporary)
    with zipfile.ZipFile(archive) as z:
        for name in z.namelist():
            assert not Path(name).is_absolute() and '..' not in Path(name).parts
            assert name.startswith('lunar-lens/') and '/tmp/' not in name
        z.extractall(destination)
    extracted = destination / 'lunar-lens'
    manifest = json.loads((extracted / 'SHA256SUMS.json').read_text())
    assert manifest['version'] == version
    for name, expected in manifest['files'].items():
        assert digest(extracted / name) == expected, name
    for command in [['npm', 'run', 'build'], ['npm', 'test']]:
        result = subprocess.run(command, cwd=extracted, text=True, capture_output=True)
        assert result.returncode == 0, result.stdout + result.stderr
        print(result.stdout.strip())
    generated = ['lunar-lens.maxproj', 'code/lens_analysis.genexpr']
    generated += [name for name in manifest['files'] if name.startswith('patchers/')]
    for name in generated:
        assert digest(extracted / name) == manifest['files'][name], 'Non-reproducible: ' + name
    report = {'version': version, 'archive': archive.name, 'sha256': digest(archive),
              'verifiedFiles': len(manifest['files']) + 1,
              'rebuildIdentical': True, 'isolatedSoftwareTestsPassed': True}
(root / 'tmp').mkdir(exist_ok=True)
(root / 'tmp/release-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
