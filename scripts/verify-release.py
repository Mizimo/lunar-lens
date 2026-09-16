"""Verify the packaged files, rebuild an isolated extraction, and run acceptance tests.
The temporary extraction stays outside Max's project search path.
"""
from pathlib import Path
import argparse, json, subprocess, tempfile, zipfile
from release_files import digest, inspect_archive, verify_tree

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('archive', nargs='?', type=Path, help='Defaults to the last local candidate')
args = parser.parse_args()
if args.archive:
    archive = args.archive.resolve()
else:
    latest = root / 'dist/candidates/latest.json'
    if not latest.exists():
        parser.error('No candidate found. Run npm run package, or specify an archive path.')
    candidate = json.loads(latest.read_text())
    archive = Path(candidate['archive'])
    if digest(archive) != candidate['sha256']:
        raise SystemExit('Candidate archive changed after packaging')
manifest = inspect_archive(archive)
version = manifest['version']
with tempfile.TemporaryDirectory(prefix='lunar-lens-verify-') as temporary:
    destination = Path(temporary)
    with zipfile.ZipFile(archive) as z:
        z.extractall(destination)
    extracted = destination / 'lunar-lens'
    verify_tree(extracted, manifest)
    for command in [['npm', 'run', 'build'], ['npm', 'test']]:
        result = subprocess.run(command, cwd=extracted, text=True, capture_output=True)
        assert result.returncode == 0, result.stdout + result.stderr
        print(result.stdout.strip())
        if result.stderr.strip():
            print(result.stderr.strip())
    generated = ['lunar-lens.maxproj', 'code/lens_analysis.genexpr']
    generated += [name for name in manifest['files'] if name.startswith('patchers/')]
    for name in generated:
        assert digest(extracted / name) == manifest['files'][name], 'Non-reproducible: ' + name
    report = {'version': version, 'archive': str(archive), 'sha256': digest(archive),
              'verifiedFiles': len(manifest['files']) + 1,
              'rebuildIdentical': True, 'isolatedSoftwareTestsPassed': True}
(root / 'dist/reports').mkdir(parents=True, exist_ok=True)
for filename in (archive.name + '.verification.json', 'release-verification.json'):
    (root / 'dist/reports' / filename).write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
