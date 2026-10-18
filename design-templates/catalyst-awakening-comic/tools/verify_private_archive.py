#!/usr/bin/env python3
"""Stop an incomplete Git build from replacing the deployed comic archive."""
import json
from pathlib import Path

site = Path(__file__).resolve().parents[1]
archive = site / 'private' / 'issue01'
manifest = archive / 'manifest.json'
if not manifest.is_file() or not (archive / 'cover.webp').is_file():
    raise SystemExit('Release blocked: restore the existing private/issue01 artwork, including cover.webp and manifest.json, before deploying.')
pages = json.loads(manifest.read_text())['pages']
if len(pages) != 88 or [p['page'] for p in pages] != list(range(1, 89)):
    raise SystemExit('Release blocked: the private comic must contain its existing 88-page sequence.')
for page in pages:
    image = page.get('image', '')
    target = (site / image.lstrip('/')).resolve()
    if not image.startswith('/private/issue01/') or not target.is_relative_to(archive) or not target.is_file():
        raise SystemExit(f'Release blocked: missing or invalid private artwork for page {page["page"]}.')
print('Private 88-page comic archive is complete.')
