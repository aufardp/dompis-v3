#!/usr/bin/env python3
"""Verify the pinned local skill bundle without executing upstream code."""

from pathlib import Path
import argparse
import hashlib
import json
import re
import sys


def verify(root):
    root = root.resolve()
    lock_path = root / '.agents/skills-lock.json'
    lock = json.loads(lock_path.read_text())
    assert lock['schema_version'] == 1, 'Unsupported lock schema'
    assert re.fullmatch(r'[0-9a-f]{40}', lock['upstream']['commit']), 'Invalid upstream commit'
    assert lock['upstream']['repository'] == 'https://github.com/alirezarezvani/claude-skills'
    assert lock['mode'] == 'project-adapted-docs-only'
    names = set()
    expected_paths = set()
    for skill in lock['skills']:
        name = skill['name']
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name) and len(name) <= 64, name
        assert name not in names, f'Duplicate name: {name}'
        names.add(name)
        relative = Path(skill['path'])
        assert relative == Path('.agents/skills') / name / 'SKILL.md', relative
        path = root / relative
        assert path.resolve().is_relative_to(root), f'Path escapes project: {relative}'
        assert all(not p.is_symlink() for p in [path, path.parent, path.parent.parent, path.parent.parent.parent]), f'Canonical skill must be a regular file: {relative}'
        data = path.read_bytes()
        assert hashlib.sha256(data).hexdigest() == skill['sha256'], f'Hash mismatch: {relative}'
        assert re.fullmatch(r'[0-9a-f]{64}', skill['upstream_sha256'])
        content = data.decode('utf-8')
        header = re.match(r'^---\n(.*?)\n---\n', content, re.S)
        assert header, f'Invalid frontmatter: {relative}'
        assert f'name: {name}\n' in header.group(1) + '\n'
        match = re.search(r'^description: (.+)$', header.group(1), re.M)
        assert match, f'Description missing: {relative}'
        description = json.loads(match.group(1))
        assert isinstance(description, str) and 0 < len(description) <= 1024
        assert not re.search(r'^(?:context|hooks|model|agent|allowed-tools):', header.group(1), re.M), f'Unexpected execution settings: {relative}'
        assert 'HANDOVER' in content and 'PRD' in content, f'Governance reference missing: {relative}'
        assert 'scripts/' not in content, f'Unbundled script reference: {relative}'
        alias = root / '.claude/skills' / name
        assert alias.is_symlink(), f'Claude alias missing: {name}'
        assert alias.readlink() == Path('../../.agents/skills') / name, f'Nonportable alias: {name}'
        assert alias.resolve() == path.parent.resolve(), f'Alias points to wrong skill: {name}'
        expected_paths.add(relative.as_posix())
    actual_paths = {p.relative_to(root).as_posix() for p in (root / '.agents/skills').rglob('*') if p.is_file() or p.is_symlink()}
    assert actual_paths == expected_paths, 'Unregistered files or executable resources in canonical skills'
    assert {p.name for p in (root / '.claude/skills').iterdir()} == names, 'Unregistered Claude aliases'
    registry = json.loads((root / 'docs/skills-audit/registry.json').read_text())
    records = registry['skills']
    assert registry['summary']['commit'] == lock['upstream']['commit']
    assert len(records) == registry['summary']['entrypoints_total'] == 468
    assert len({x['path'] for x in records}) == len(records), 'Duplicate audit records'
    selected = {x['local_skill']: x for x in records if x['decision'] == 'ADAPTED_INSTALL'}
    assert set(selected) == names, 'Audit/install mismatch'
    for item in lock['skills']:
        assert selected[item['name']]['path'] == item['upstream_path']
        assert selected[item['name']]['sha256'] == item['upstream_sha256']
    for item in lock['evidence']:
        path = root / item['path']
        assert path.resolve().is_relative_to(root)
        assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], f'Audit evidence changed: {item["path"]}'
    for required in ['HANDOVER.md', 'AGENTS.md', 'CLAUDE.md', 'PRD-Dompis-v3-Agent-Governance.md', 'docs/skills-index.md', 'docs/skills-audit/REPORT.md', 'docs/skills-audit/THIRD_PARTY_NOTICES.md']:
        assert (root / required).is_file(), f'Missing governance file: {required}'
    print(f'PASS: {len(names)} project skills, hashes/provenance, Claude aliases, 468 audit records, evidence integrity; upstream scripts/hooks absent')


if __name__ == '__main__':
    if not __debug__:
        sys.exit('FAIL: run the verifier without Python -O; validation must remain enabled')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    try:
        verify(args.root)
    except (AssertionError, KeyError, ValueError, OSError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        raise SystemExit(1)
