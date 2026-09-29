#!/usr/bin/env python3
"""Prepare lettered stills and a deterministic CapCut import timeline."""

from __future__ import annotations

import csv
import json
from pathlib import Path

from PIL import Image

SITE = Path(__file__).resolve().parents[1]
ROOT = SITE.parents[2]
PRIVATE = SITE / "private/issue01"
OUT = ROOT / "release/CapCut_Import"


def main() -> None:
    pages = json.loads((PRIVATE / "manifest.json").read_text(encoding="utf-8"))["pages"]
    if [p["page"] for p in pages] != list(range(1, 89)):
        raise ValueError("Comic pages are not in 1–88 order")
    motion = OUT / "Lettered_Pages"
    motion.mkdir(parents=True, exist_ok=True)
    rows = []
    for p in pages:
        n = p["page"]
        source = SITE / p["image"].lstrip("/")
        target = motion / f"p{n:02d}.jpg"
        with Image.open(source) as im:
            im.convert("RGB").save(target, "JPEG", quality=91, optimize=True)
        rows.append({"page": n, "file": f"Lettered_Pages/p{n:02d}.jpg", "in_seconds": 2 * (n - 1),
                     "duration_seconds": 2, "scene": p["scene"], "title": p["title"]})
    with (OUT / "Lettered_Review_Timeline.csv").open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    with (OUT / "review_concat_lettered.txt").open("w", encoding="utf-8") as file:
        for n in range(1, 89):
            file.write(f"file 'Lettered_Pages/p{n:02d}.jpg'\nduration 2\n")
        file.write("file 'Lettered_Pages/p88.jpg'\n")
    (OUT / "README_Lettered_Review.md").write_text(
        "# Catalyst: The Awakening · Issue 01 · lettered motion review\n\n"
        "Import Lettered_Pages/p01.jpg through p88.jpg in order into a 2:3 portrait CapCut sequence. "
        "Lettered_Review_Timeline.csv defines a two-second visual check per page (176 seconds). "
        "Dialogue_Placement_Draft.srt and Timeline.csv are source pacing guides, not synced voice or final timing. "
        "The lettered stills are an adaptation proof. Complete source text is in Exact_Source_Cues.csv and the book edition. "
        "Pages 29 and 64–66 are visual holds; production directions remain in the transcript. "
        "Some crowded pages use verbatim excerpts; see lettering-audit.json in the private reader package. "
        "Speaker-tail placement, missing source lines, voice, sound, final timing, and CapCut export need human editorial approval.\n",
        encoding="utf-8",
    )
    print("Prepared 88 lettered stills and a 176-second review timeline")


if __name__ == "__main__":
    main()
