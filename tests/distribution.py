"""Exercise release isolation with disposable archives; never touch installed Max projects."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from release_files import digest, inspect_archive
from stable import check_store, current_tag, install, select, verify_installed


class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='lens-distribution-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.store = self.root / 'releases'

    def archive(self, version='1.4.1'):
        files = {'lunar-lens.maxproj': b'{"name":"test"}', 'code/test.js': version.encode()}
        manifest = {'version': version, 'files': {
            name: hashlib.sha256(data).hexdigest() for name, data in files.items()}}
        archive = self.root / ('lunar-lens-v' + version + '.zip')
        with zipfile.ZipFile(archive, 'x') as z:
            for name, data in files.items():
                z.writestr('lunar-lens/' + name, data)
            z.writestr('lunar-lens/SHA256SUMS.json', json.dumps(manifest))
        lock = {'tag': 'v' + version, 'version': version, 'archive': archive.name,
                'sha256': digest(archive), 'commit': 'fixture'}
        return archive, lock

    def test_install_idempotent_and_changed_file_is_not_overwritten(self):
        archive, lock = self.archive()
        install(self.store, archive, lock)
        install(self.store, archive, lock)
        tree, _, _ = verify_installed(self.store, lock['tag'])
        project = tree / 'lunar-lens.maxproj'
        project.write_text('user edit')
        with self.assertRaises(ValueError):
            install(self.store, archive, lock)
        self.assertEqual(project.read_text(), 'user edit')
        self.assertEqual(current_tag(self.store), lock['tag'])

    def test_archive_mismatch_cannot_install_or_select_candidate(self):
        archive, lock = self.archive()
        lock['sha256'] = '0' * 64
        with self.assertRaises(ValueError):
            install(self.store, archive, lock)
        self.assertFalse(self.store.exists())

    def test_switch_and_rollback_leave_both_releases_intact(self):
        old, old_lock = self.archive()
        new, new_lock = self.archive('1.5.0')
        install(self.store, old, old_lock)
        install(self.store, new, new_lock)
        self.assertEqual(current_tag(self.store), 'v1.5.0')
        select(self.store, 'v1.4.1')
        self.assertEqual(current_tag(self.store), 'v1.4.1')
        for lock in (old_lock, new_lock):
            verify_installed(self.store, lock['tag'])

    def test_current_folder_is_never_replaced(self):
        archive, lock = self.archive()
        (self.store / 'current').mkdir(parents=True)
        (self.store / 'current/keep.txt').write_text('keep')
        with self.assertRaises(ValueError):
            install(self.store, archive, lock)
        self.assertEqual((self.store / 'current/keep.txt').read_text(), 'keep')
        self.assertFalse((self.store / 'versions').exists())

    def test_development_tree_cannot_be_stable_storage(self):
        for path in (ROOT, ROOT / 'dist/stable', ROOT.parent):
            with self.assertRaises(ValueError):
                check_store(path)

    def test_unsafe_zip_and_unlisted_payload_are_rejected(self):
        archive, _ = self.archive()
        with zipfile.ZipFile(archive, 'a') as z:
            z.writestr('lunar-lens/../../escape.txt', 'escape')
        with self.assertRaises(ValueError):
            inspect_archive(archive)
        archive, _ = self.archive('1.5.0')
        with zipfile.ZipFile(archive, 'a') as z:
            z.writestr('lunar-lens/unlisted.txt', 'unlisted')
        with self.assertRaises(ValueError):
            inspect_archive(archive)

    def test_packaging_twice_is_isolated_and_excludes_development_data(self):
        checkout = self.root / 'checkout'
        (checkout / 'scripts').mkdir(parents=True)
        for name in ('package.mjs', 'release_files.py'):
            shutil.copy2(ROOT / 'scripts' / name, checkout / 'scripts' / name)
        (checkout / 'package.json').write_text('{"version":"1.4.1"}')
        (checkout / 'lunar-lens.maxproj').write_text('{}')
        for folder in ('tmp', 'dist', '.git', 'node_modules', '__pycache__'):
            (checkout / folder).mkdir()
            (checkout / folder / 'do-not-ship.txt').write_text('private development data')
        # This is exactly the old packaging destination; it must not be touched.
        old_archive = self.root / 'lunar-lens-v1.4.1.zip'
        old_archive.write_bytes(b'keep original stable archive')
        archive, lock = self.archive('1.3.0')
        install(self.store, archive, lock)
        for _ in range(2):
            subprocess.run(['node', 'scripts/package.mjs'], cwd=checkout,
                           check=True, capture_output=True, text=True)
        candidates = list((checkout / 'dist/candidates').glob('*.zip'))
        self.assertEqual(len(candidates), 2)
        for candidate in candidates:
            manifest = inspect_archive(candidate)
            self.assertFalse(any('do-not-ship' in name for name in manifest['files']))
            self.assertFalse(any(name.startswith('dist/') for name in manifest['files']))
        self.assertEqual(old_archive.read_bytes(), b'keep original stable archive')
        verify_installed(self.store, 'v1.3.0')
        self.assertEqual(current_tag(self.store), 'v1.3.0')


if __name__ == '__main__':
    unittest.main()
