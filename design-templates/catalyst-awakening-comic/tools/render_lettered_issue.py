#!/usr/bin/env python3
"""Render a reviewable in-panel lettering cut from the approved Issue 01 source.

The exact script remains in manifest.json and the story-book view. Long pages
use verbatim excerpts, recorded in lettering-audit.json for editorial review.
The private output must never enter the public Git repository.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SITE = Path(__file__).resolve().parents[1]
PRIVATE = SITE / "private/issue01"
MANIFEST = PRIVATE / "manifest.json"
OUTPUT = PRIVATE / "lettered/pages"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        trial = f"{current} {word}".strip()
        if current and draw.textlength(trial, font=font) > width:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    return lines or [""]


def excerpt(text: str, limit: int) -> str:
    text = " ".join(text.split())
    if len(text) <= limit:
        return text
    # Exact source words, with a visible mark where the sentence continues.
    boundary = text.rfind(" ", 0, limit - 1)
    return text[: max(boundary, 25)].rstrip(" ,;:") + "…"


def cards_for(page: dict) -> tuple[list[dict], list[str], list[str]]:
    all_cues = [c for c in page["cues"] if c["text"].strip() and c["type"] != "proposed silent hold"]
    cues = [c for c in all_cues if not re.match(
        r"^(?:VISUAL\b|Panel\s+(?:one|two|three|four|five|six|\d)\b|FLASHBACK PANEL\b)",
        c["text"].strip(), re.I)]
    if not cues:
        return [], [c["id"] for c in all_cues], []
    total = sum(len(c["text"].strip()) for c in cues)
    # Keep every source cue on spacious pages. Dense pages take representative
    # verbatim lines while the reader transcript retains all source text.
    complete = total <= 420 and len(cues) <= 6
    if complete:
        chosen = cues
    else:
        candidates = [c for c in cues if c["type"] == "dialogue"] or cues
        wanted = min(4, len(candidates))
        indices = sorted({round(i * (len(candidates) - 1) / max(1, wanted - 1)) for i in range(wanted)})
        chosen = [candidates[i] for i in indices]
    cards = []
    for c in chosen:
        raw = " ".join(c["text"].split())
        max_len = 170 if complete else 95
        text = excerpt(raw, max_len)
        speaker = re.sub(r"\s*\(.*", "", c["speaker"].strip().rstrip("— ").strip()).strip()
        if "CAPTION" in speaker.upper() or speaker.upper().startswith("STREET"):
            speaker = ""
        cards.append({"cue_id": c["id"], "speaker": speaker,
                      "kind": "speech" if c["type"] == "dialogue" and speaker else "caption",
                      "text": text, "complete": text == raw})
    shown = {c["cue_id"] for c in cards}
    omitted = [c["id"] for c in all_cues if c["id"] not in shown]
    shortened = [c["cue_id"] for c in cards if not c["complete"]]
    return cards, omitted, shortened


def render(page: dict, source: Path, target: Path) -> dict:
    with Image.open(source) as original:
        im = original.convert("RGBA")
    w, h = im.size
    cards, omitted, shortened = cards_for(page)
    overlay = Image.new("RGBA", im.size)
    d = ImageDraw.Draw(overlay)
    count = len(cards)
    smallest_type = 100
    if count:
        row_h = min(330, (h - 65) // count)
        for i, card in enumerate(cards):
            x = 35 if i % 2 == 0 else 170
            box_w = min(815, w - x - 32)
            top = 35 + i * ((h - 75) // count)
            max_h = min(row_h - 26, 310)
            label = card["speaker"].upper()
            font_size = 35
            while font_size >= 24:
                f = ImageFont.truetype(FONT, font_size)
                label_f = ImageFont.truetype(BOLD, 20)
                lines = wrap(d, card["text"], f, box_w - 54)
                height = 34 + (36 if label else 0) + len(lines) * (font_size + 9)
                if height <= max_h:
                    break
                font_size -= 1
            if height > max_h:
                raise ValueError(f"Page {page['page']} cue {card['cue_id']}: lettering overflow")
            smallest_type = min(smallest_type, font_size)
            bottom = top + height
            speech = card["kind"] == "speech"
            fill = (248, 243, 228, 242) if speech else (6, 15, 27, 231)
            ink = (19, 24, 32) if speech else (247, 242, 230)
            d.rounded_rectangle((x, top, x + box_w, bottom), radius=26 if speech else 8,
                                fill=fill, outline=(230, 176, 91, 255), width=3)
            if speech:
                # A provisional tail. Speaker position still needs visual QA.
                tip_x = x + (int(box_w * .75) if i % 2 else int(box_w * .25))
                d.polygon([(tip_x - 15, bottom - 2), (tip_x + 18, bottom - 2),
                           (tip_x + (23 if i % 2 else -22), bottom + 24)],
                          fill=fill, outline=(230, 176, 91, 255), width=2)
            cursor = top + 15
            if label:
                d.text((x + 27, cursor), label, font=label_f,
                       fill=(126, 62, 25) if speech else (232, 187, 101))
                cursor += 34
            for line in lines:
                d.text((x + 27, cursor), line, font=f, fill=ink)
                cursor += font_size + 9
    d.rounded_rectangle((w - 180, h - 52, w - 16, h - 13), radius=5, fill=(4, 10, 20, 220))
    d.text((w - 169, h - 43), f"ISSUE 01 / {page['page']:02d}",
           font=ImageFont.truetype(BOLD, 19), fill=(244, 209, 146))
    target.parent.mkdir(parents=True, exist_ok=True)
    Image.alpha_composite(im, overlay).convert("RGB").save(target, "WEBP", quality=87, method=4)
    return {"page": page["page"], "source_cues": len(page["cues"]),
            "shown_cues": [c["cue_id"] for c in cards], "omitted_cues": omitted,
            "shortened_cues": shortened, "cards": cards,
            "smallest_type_px": smallest_type if cards else None,
            "art_image": page.get("art_image", page["image"]),
            "lettered_image": f"/private/issue01/lettered/pages/p{page['page']:02d}.webp"}


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records = []
    for page in data["pages"]:
        n = page["page"]
        source_url = page.get("art_image", page["image"])
        source = SITE / source_url.lstrip("/")
        target = OUTPUT / f"p{n:02d}.webp"
        record = render(page, source, target)
        page["art_image"] = record["art_image"]
        page["image"] = record["lettered_image"]
        records.append(record)
    data["status"] = "lettered adaptation review · exact source transcript available"
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    (PRIVATE / "lettering-audit.json").write_text(json.dumps({"pages": records}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Rendered {len(records)} pages; {sum(len(r['shown_cues']) for r in records)} shown, "
          f"{sum(len(r['omitted_cues']) for r in records)} transcript-only, "
          f"{sum(len(r['shortened_cues']) for r in records)} shortened")


if __name__ == "__main__":
    main()
