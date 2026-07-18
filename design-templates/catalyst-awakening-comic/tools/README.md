# Panel Prompt Forge

An execute → verify → iterate loop for drafting art-direction prompts that
stay visually consistent with the CatalystVerse style bible — built for
Arc II and beyond, where dozens of artists/panels need to look like one
continuous world.

## How it works

- **Writer Node** drafts (or revises) a prompt for a scene.
- **Director Node** checks it deterministically against `style_bible.json`
  — required visual tags per scene type, a banned-phrase list, and a
  minimum length — and returns specific, actionable feedback on failure
  ("missing: purple-gold light, Yoruba script overlay").
- The loop feeds Director feedback back into the Writer until the prompt
  passes or `--max-attempts` is hit (default 5).
- Every **approved** prompt is appended to `ledger.json`. On the next run
  for the same `scene_type`, the Writer is shown 1-2 past approved
  prompts as exemplars — so quality compounds across sessions instead of
  starting cold every time. This is the same principle as reinforcement
  learning's experience replay: sample stored past outcomes to steer
  future generation, rather than only ever reacting to the newest input.

## Usage

```bash
# See available scene types
python3 panel_prompt_forge.py --list-scene-types

# Draft a prompt (simulation mode — no API key needed, deterministic, free)
python3 panel_prompt_forge.py "Bayo faces the Architect" --scene-type character_reveal

# Draft with the real Claude API (better prompts, costs tokens)
export ANTHROPIC_API_KEY=sk-...
pip install anthropic
python3 panel_prompt_forge.py "The Balogun Bleed opens over the market" --scene-type orisha_manifestation
```

## Extending the style bible

Edit `style_bible.json` as new visual motifs get established in canon —
it's the single source of truth for "does this panel look like our
universe." Each `scene_types` entry has:

- `required_tags` — what the Director enforces (keep this scene-appropriate;
  don't just copy the global `base_tags` into every scene type)
- `flavor_pool` — suggested details fed to the Writer, not enforced
- `description` — when to use this scene type

`banned_phrases` catches generic-superhero drift; `min_prompt_length`
catches technically-tag-stuffed one-liners that pass the tag check but
aren't actually a usable prompt.

## Files

- `panel_prompt_forge.py` — the loop
- `style_bible.json` — required tags, flavor pool, and banned phrases per scene type
- `ledger.json` — every approved prompt ever produced (the replay buffer); starts empty, grows with use
