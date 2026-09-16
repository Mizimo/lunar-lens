"""Shared archive checks. No Max, audio, network or Git side effects."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import stat
import zipfile


def digest(path):
    result = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def relative_name(name):
    parts = PurePosixPath(name).parts
    if (not parts or name.startswith('/') or '\\' in name
            or any(p in ('..', '.') for p in name.split('/'))):
        raise ValueError('Unsafe archive path: ' + name)
    return name


def inspect_archive(archive, expected_sha=None):
    if expected_sha and digest(archive) != expected_sha:
        raise ValueError('Archive SHA256 mismatch: ' + str(archive))
    with zipfile.ZipFile(archive) as z:
        files = set()
        names = set()
        for item in z.infolist():
            name = relative_name(item.filename.rstrip('/'))
            if name in names:
                raise ValueError('Duplicate archive entry: ' + name)
            names.add(name)
            if name != 'lunar-lens' and not name.startswith('lunar-lens/'):
                raise ValueError('Unexpected archive root: ' + name)
            if stat.S_ISLNK(item.external_attr >> 16):
                raise ValueError('Symlink in archive: ' + name)
            if not item.is_dir():
                files.add(name.removeprefix('lunar-lens/'))
        manifest = json.loads(z.read('lunar-lens/SHA256SUMS.json'))
        expected = set(manifest['files']) | {'SHA256SUMS.json'}
        if files != expected:
            raise ValueError('Archive files do not match the manifest')
        for name, sha in manifest['files'].items():
            relative_name(name)
            if hashlib.sha256(z.read('lunar-lens/' + name)).hexdigest() != sha:
                raise ValueError('File SHA256 mismatch: ' + name)
    return manifest


def verify_tree(tree, manifest):
    """Check all distributed files; allow Max/macOS to add local metadata."""
    tree = Path(tree)
    for name, sha in manifest['files'].items():
        relative_name(name)
        target = tree / name
        if not target.resolve().is_relative_to(tree.resolve()) or target.is_symlink():
            raise ValueError('File escaped installed tree: ' + name)
        if not target.is_file() or digest(target) != sha:
            raise ValueError('Installed file changed or missing: ' + name)
    installed = json.loads((tree / 'SHA256SUMS.json').read_text())
    if installed != manifest:
        raise ValueError('Installed manifest changed')
