"""Install and select verified published releases outside the development checkout."""
from pathlib import Path
import argparse
import json
import os
import re
import shutil
import subprocess
import tempfile
import zipfile

from release_files import digest, inspect_archive, verify_tree

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_STORE = ROOT.parent / 'lunar-lens-releases'
LOCK = ROOT / 'config/stable-release.json'


def check_store(store):
    store = Path(store).resolve()
    if store == ROOT or store.is_relative_to(ROOT) or ROOT.is_relative_to(store):
        raise ValueError('Stable storage must be outside the development checkout')
    return store


def checked_tag(tag):
    if not re.fullmatch(r'v\d+\.\d+\.\d+(?:[-.][A-Za-z0-9.-]+)?', tag):
        raise ValueError('Invalid release tag')
    return tag


def verify_installed(store, tag):
    version = store / 'versions' / checked_tag(tag)
    receipt = json.loads((version / 'release.json').read_text())
    if receipt['tag'] != tag or Path(receipt['archive']).name != receipt['archive']:
        raise ValueError('Invalid installation receipt')
    archive = store / 'archives' / tag / receipt['archive']
    manifest = inspect_archive(archive, receipt['sha256'])
    if manifest['version'] != receipt['version']:
        raise ValueError('Release version mismatch')
    tree = version / 'lunar-lens'
    verify_tree(tree, manifest)
    return tree, receipt, manifest


def select(store, tag):
    tree, receipt, _ = verify_installed(store, tag)
    current = store / 'current'
    if current.exists() and not current.is_symlink():
        raise ValueError('current is not a symlink; refusing to replace it')
    # Only this pointer changes. Older installations and archives stay intact.
    with tempfile.TemporaryDirectory(prefix='.select-', dir=store) as temporary:
        link = Path(temporary) / 'current'
        link.symlink_to(tree.relative_to(store), target_is_directory=True)
        os.replace(link, current)
    return receipt


def install(store, archive, lock):
    tag = checked_tag(lock['tag'])
    if Path(lock['archive']).name != lock['archive']:
        raise ValueError('Invalid archive name')
    manifest = inspect_archive(archive, lock['sha256'])
    if manifest['version'] != lock['version']:
        raise ValueError('Pinned version does not match archive')
    target = store / 'versions' / tag
    archived = store / 'archives' / tag / lock['archive']
    # Check existing data before making changes. Never overwrite an old release.
    if archived.exists() and digest(archived) != lock['sha256']:
        raise ValueError('Existing archive differs; refusing to overwrite it')
    if target.exists():
        _, receipt, _ = verify_installed(store, tag)
        if receipt != lock:
            raise ValueError('Existing installation has a different receipt')
    if (store / 'current').exists() and not (store / 'current').is_symlink():
        raise ValueError('current is not a symlink; refusing to replace it')
    archived.parent.mkdir(parents=True, exist_ok=True)
    if not archived.exists():
        with archived.open('xb') as out, Path(archive).open('rb') as source:
            shutil.copyfileobj(source, out)
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='.install-', dir=target.parent) as temporary:
            staging = Path(temporary) / tag
            staging.mkdir()
            with zipfile.ZipFile(archived) as z:
                z.extractall(staging)
            verify_tree(staging / 'lunar-lens', manifest)
            (staging / 'release.json').write_text(json.dumps(lock, indent=2) + '\n')
            staging.rename(target)
    select(store, tag)
    launcher = store / '開啟穩定版.command'
    launcher.write_text('#!/bin/sh\nset -eu\nbase=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)\n'
                        'version=$(CDPATH= cd -- "$base/current" && pwd -P)\n'
                        'exec /usr/bin/open -a Max "$version/lunar-lens.maxproj"\n')
    launcher.chmod(0o755)
    (store / 'README.md').write_text(
        '# Lunar Lens 穩定版與歷史封存\n\n'
        '日常使用：雙擊「開啟穩定版.command」，或開啟 current/lunar-lens.maxproj。\n\n'
        '- current：目前選用的已驗證正式版；只是一個指向 versions 的捷徑。\n'
        '- versions：按 tag 獨立解壓的正式版及安裝來源記錄，不在這裡開發或建置。\n'
        '- archives：原始 ZIP 與當時的驗證檔，保留原始位元組；歷史版不等於目前推薦版。\n'
        '- ARCHIVE-INDEX.json：本次整理時的本機封存索引（若有）。\n\n'
        '開發工作區是相鄰的 lunar-lens；流程見其中 docs/開發與發布.md。\n'
        '不要把整個 Developer 或本目錄加入 Max 全域搜尋路徑。\n'
        '切換版本前先停止並關閉另一個 Lunar Lens Project，避免同名控制匯流排與 MIDI 爭用。\n'
        '穩定版檔案若被儲存修改，開發區的 npm run stable:verify 會檢出，不會自動覆寫。\n',
        encoding='utf-8')
    return lock


def current_tag(store):
    current = store / 'current'
    if not current.is_symlink():
        raise ValueError('No stable release selected; run stable:install first')
    resolved = current.resolve()
    versions = (store / 'versions').resolve()
    if not resolved.is_relative_to(versions) or resolved.name != 'lunar-lens':
        raise ValueError('current does not point to an installed release')
    tag = checked_tag(resolved.parent.name)
    if resolved != versions / tag / 'lunar-lens':
        raise ValueError('Invalid current release layout')
    return tag


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['install', 'verify', 'status', 'use', 'open'])
    parser.add_argument('--store', type=Path, default=DEFAULT_STORE)
    parser.add_argument('--archive', type=Path, help='Local official ZIP; no implicit download')
    parser.add_argument('--version', help='Already installed tag to select, e.g. v1.4.1')
    args = parser.parse_args()
    store = check_store(args.store)
    if args.action == 'install':
        if args.archive is None:
            parser.error('install requires --archive; obtain the ZIP linked in config/stable-release.json')
        receipt = install(store, args.archive, json.loads(LOCK.read_text()))
    elif args.action == 'use':
        if not args.version:
            parser.error('use requires --version')
        receipt = select(store, checked_tag(args.version))
    else:
        tag = current_tag(store)
        tree, receipt, manifest = verify_installed(store, tag)
        print(f'Verified {len(manifest["files"]) + 1} installed files and original archive')
        if args.action == 'open':
            subprocess.run(['/usr/bin/open', '-a', 'Max', str(tree / 'lunar-lens.maxproj')], check=True)
    print(json.dumps({'selected': receipt['tag'], 'pinned': json.loads(LOCK.read_text())['tag'],
                      'project': str(store / 'current/lunar-lens.maxproj'),
                      'sha256': receipt['sha256']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error))
