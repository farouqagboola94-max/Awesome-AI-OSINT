#!/usr/bin/env python3
"""Build the private Issue 01 reader and CapCut handoff from reviewed sources.

The generated private/ tree contains unpublished artwork. Keep it out of Git.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
from pathlib import Path

from lxml import html as lxml_html
from PIL import Image, ImageOps


def source_art(root: Path, page: int) -> Path:
    if page <= 5:
        matches = list((root / "downloads/batch01/Catalyst_Awakening_Issue01_Final_Art_Batch01").rglob(
            f"issue01-print-page{page:02d}-art-v1.png"
        ))
    else:
        bucket = (
            "early_packs/Catalyst_Awakening_Issue01_Production_Review_Pack_v4/issue01_v3"
            if page <= 10
            else "early_packs/Catalyst_Awakening_Issue01_Production_Review_Pack_v5_Pages_11-20"
            if page <= 20
            else "early_packs/Catalyst_Awakening_Issue01_Production_Review_Pack_v6_Pages_21-30"
            if page <= 30
            else "early_packs/Catalyst_Awakening_Issue01_Production_Review_Pack_v8_Pages_31-40"
            if page <= 40
            else "early_packs/Catalyst_Awakening_Issue01_Production_Review_Pack_v9_Pages_41-50"
            if page <= 50
            else "pages51_60/extracted"
            if page <= 60
            else "pages61_70/extracted"
            if page <= 70
            else "pages71_80/extracted"
            if page <= 80
            else "pages81_88/extracted"
        )
        matches = list((root / "downloads" / bucket / "page_art_drafts").glob(f"issue01-page{page:02d}*.png"))
    if len(matches) != 1:
        raise ValueError(f"Page {page:02d}: expected one source artwork, found {matches}")
    return matches[0]


def timestamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3600000)
    minutes, millis = divmod(millis, 60000)
    sec, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{sec:02d},{millis:03d}"


def build_book(site: Path) -> None:
    source = lxml_html.fromstring((site / "read/issue-1.html").read_text(encoding="utf-8"))
    chapters = source.xpath("//*[@id='panel-i1']//*[contains(concat(' ',normalize-space(@class),' '),' story-chapter ')]")
    if len(chapters) != 19:
        raise ValueError(f"Expected 19 source scenes, found {len(chapters)}")
    nav = []
    body = []
    for i, chapter in enumerate(chapters, 1):
        title = "".join(chapter.xpath(".//*[contains(concat(' ',normalize-space(@class),' '),' chapter-title ')]")[0].itertext()).strip()
        label = "".join(chapter.xpath(".//*[contains(concat(' ',normalize-space(@class),' '),' chapter-label ')]")[0].itertext()).strip()
        source_text = "".join(chapter.itertext())
        inner = "".join(lxml_html.tostring(child, encoding="unicode", method="html") for child in chapter)
        check = "".join(lxml_html.fromstring(f"<div>{inner}</div>").itertext())
        if source_text.strip() != check.strip():
            raise ValueError(f"Scene {i} source text changed")
        nav.append(f'<a href="#scene-{i:02d}"><span>{i:02d}</span>{html.escape(title)}</a>')
        body.append(f'<section class="book-scene" id="scene-{i:02d}" aria-labelledby="scene-title-{i:02d}">'
                    f'<p class="book-kicker">Scene {i:02d} · {html.escape(label)}</p>'
                    f'<h2 id="scene-title-{i:02d}">{html.escape(title)}</h2>{inner}</section>')
    cliff = source.xpath("//*[@id='panel-i1']//*[contains(concat(' ',normalize-space(@class),' '),' cliffhanger-box ')]")
    if cliff:
        body.append('<aside class="book-afterword">' + "".join(lxml_html.tostring(child, encoding="unicode", method="html") for child in cliff[0]) + '</aside>')
    doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Issue 01 · Story book · Catalyst: The Awakening</title><link rel="canonical" href="https://catalyst-awakening.netlify.app/read/issue-1-book"><script type="application/ld+json">{{"@context":"https://schema.org","@type":"CreativeWork","name":"Catalyst: The Awakening — Issue 01 story edition"}}</script><link rel="stylesheet" href="../issue.css"><link rel="stylesheet" href="../release.css"></head><body class="release-body"><a class="skip-link" href="#book">Skip to story</a><header class="release-top"><a href="./issue-1">← Issue 01</a><span>CATALYST / THE AWAKENING</span><a href="./issue-1-comic">Comic →</a></header><main id="book" class="book-shell"><div class="book-title"><p>ARC I · ISSUE 01 · STORY EDITION</p><h1>Awaken, O City</h1><p>Original storyline in reading order · 19 scenes</p></div><div class="book-layout"><nav class="book-toc" aria-label="Scene contents"><h2>Contents</h2>{''.join(nav)}</nav><article class="book-pages">{''.join(body)}</article></div><footer class="release-footer"><a href="./issue-1-comic">View the 88-page comic proof →</a><a href="./issue-2">Continue to Issue 02 →</a></footer></main></body></html>'''
    (site / "read/issue-1-book.html").write_text(doc, encoding="utf-8")


def build(root: Path, site: Path) -> None:
    storyboard = json.loads((root / "downloads/pages81_88/extracted/Storyboard_88_Pages.json").read_text(encoding="utf-8"))
    pages = storyboard["pages"]
    if [p["page"] for p in pages] != list(range(1, 89)):
        raise ValueError("The storyboard must contain each of the 88 pages in order")
    private = site / "private/issue01"
    web = private / "pages"
    capcut = root / "release/CapCut_Import/Pages"
    web.mkdir(parents=True, exist_ok=True)
    capcut.mkdir(parents=True, exist_ok=True)
    manifest = []
    cue_rows = []
    subtitles = []
    shots = []
    for p in pages:
        n = p["page"]
        source = source_art(root, n)
        web_file = web / f"p{n:02d}.webp"
        edit_file = capcut / f"p{n:02d}.jpg"
        if not web_file.exists() or web_file.stat().st_size < 1000 or not edit_file.exists() or edit_file.stat().st_size < 1000:
            with Image.open(source) as art:
                if art.size != (1024, 1536):
                    raise ValueError(f"Page {n:02d}: unexpected art size {art.size}")
                rgb = ImageOps.exif_transpose(art).convert("RGB")
                if not web_file.exists() or web_file.stat().st_size < 1000:
                    rgb.save(web_file, "WEBP", quality=82, method=6)
                if not edit_file.exists() or edit_file.stat().st_size < 1000:
                    rgb.save(edit_file, "JPEG", quality=88, optimize=True)
        cues = [{"id": q["cue_id"], "type": q["type"], "speaker": q["speaker"], "text": q["source_text"]} for q in p["panels"]]
        manifest.append({"page": n, "scene": p["scene"], "title": p["title"], "image": f"/private/issue01/pages/p{n:02d}.webp", "cues": cues})
        start = float(p["motion_start_seconds"])
        end = float(p["motion_end_seconds"])
        shots.append({"page": n, "image": f"Pages/p{n:02d}.jpg", "start": timestamp(start), "end": timestamp(end), "seconds": round(end - start, 2), "scene": p["scene"], "source": source.name})
        spoken = [q for q in cues if q["type"] == "dialogue" and q["text"].strip()]
        length = sum(max(1, len(q["text"].strip())) for q in spoken)
        cursor = start
        for q in spoken:
            duration = (end - start) * max(1, len(q["text"].strip())) / length
            # This is a planning subtitle, not synced to recorded narration.
            subtitles.append((cursor, cursor + duration, q["text"].strip()))
            cursor += duration
        for q in cues:
            cue_rows.append({"page": n, "scene": p["scene"], "cue_id": q["id"], "type": q["type"], "speaker": q["speaker"], "exact_source_text": q["text"], "motion_start": timestamp(start), "motion_end": timestamp(end)})
    (private / "manifest.json").write_text(json.dumps({"title": "Catalyst: The Awakening · Issue 01", "status": "private layout proof · editable source cues", "pages": manifest}, ensure_ascii=False), encoding="utf-8")
    with (root / "release/CapCut_Import/Timeline.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, shots[0].keys()); writer.writeheader(); writer.writerows(shots)
    with (root / "release/CapCut_Import/Exact_Source_Cues.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, cue_rows[0].keys()); writer.writeheader(); writer.writerows(cue_rows)
    lines = []
    for i, (start, end, text) in enumerate(subtitles, 1):
        lines.extend([str(i), f"{timestamp(start)} --> {timestamp(end)}", text, ""])
    (root / "release/CapCut_Import/Dialogue_Placement_Draft.srt").write_text("\n".join(lines), encoding="utf-8")
    (root / "release/CapCut_Import/README.md").write_text(
        "# Issue 01 · CapCut assembly handoff\n\n"
        "Import Pages/p01.jpg through p88.jpg in numerical order. Set the sequence to 2:3 portrait. "
        "Timeline.csv carries the storyboard's 42:24.3 planning positions; set each still's length accordingly. "
        "Dialogue_Placement_Draft.srt is a temporary placement guide, not approved recorded narration. "
        "Exact_Source_Cues.csv preserves dialogue, prose, narration, and system text by source cue for manual lettering and audio decisions. "
        "Keep spoken lines and sound on separate tracks. Use restrained pans and cuts; avoid movement that changes panel order or obscures text. "
        "Final voice, sound, caption timing, print and phone lettering proof, and CapCut export still require editorial review.\n",
        encoding="utf-8",
    )
    build_book(site)
    print(f"Built {len(manifest)} pages, {len(cue_rows)} source cues, {len(subtitles)} draft subtitle events")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--site", type=Path, required=True)
    args = parser.parse_args()
    build(args.root.resolve(), args.site.resolve())
