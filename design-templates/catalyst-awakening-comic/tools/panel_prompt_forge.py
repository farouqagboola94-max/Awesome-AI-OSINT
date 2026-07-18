#!/usr/bin/env python3
"""Panel Prompt Forge — an execute/verify/iterate loop for drafting art
prompts that stay on-model with the CatalystVerse visual style bible.

Two nodes, same pattern as any agentic content-production loop:
  Writer Node   — drafts (or revises) a panel prompt for a scene
  Director Node — deterministically checks it against style_bible.json
                  and either approves it or returns specific, actionable
                  feedback ("missing: purple-gold light, Yoruba script overlay")

The loop feeds Director feedback back into the Writer until the prompt
passes or max_attempts is hit. This mirrors how Batch 14's "Aṣẹ Memory
Bank" reuses past experience: every APPROVED prompt is appended to
ledger.json, and — when a real API key is present — the Writer is shown
1-2 past approved prompts of the same scene_type as few-shot exemplars,
so quality compounds across runs instead of starting cold every time.

Usage:
  python3 panel_prompt_forge.py "Bayo faces the Architect" --scene-type character_reveal
  python3 panel_prompt_forge.py --list-scene-types
  ANTHROPIC_API_KEY=sk-... python3 panel_prompt_forge.py "The Balogun Bleed opens" --scene-type orisha_manifestation

Without ANTHROPIC_API_KEY set, the Writer runs in simulation mode (no
network calls) so the loop mechanics can be exercised/tested for free.
"""
import argparse
import json
import os
import random
import sys
import time
from pathlib import Path

HERE = Path(__file__).parent
STYLE_BIBLE_PATH = HERE / "style_bible.json"
LEDGER_PATH = HERE / "ledger.json"


def load_style_bible():
    with open(STYLE_BIBLE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_ledger():
    if not LEDGER_PATH.exists():
        return []
    with open(LEDGER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_ledger(entries):
    with open(LEDGER_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)


def sample_past_exemplars(ledger, scene_type, k=2):
    """Experience-replay: sample past approved prompts of the same
    scene_type to steer the Writer toward established visual continuity."""
    pool = [e for e in ledger if e["scene_type"] == scene_type]
    if not pool:
        return []
    return random.sample(pool, min(k, len(pool)))


def call_ai_writer(scene_idea, scene_type, bible, exemplars, feedback=""):
    """Writer Node. Uses the real Claude API when ANTHROPIC_API_KEY is set;
    otherwise runs a deterministic simulation so the loop is testable
    without network access or API cost."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    scene_cfg = bible["scene_types"][scene_type]

    if api_key:
        try:
            import anthropic  # local import: optional dependency
        except ImportError:
            print("  [Writer Node] anthropic package not installed — falling back to simulation.")
            print("  (pip install anthropic to use the real API)")
            api_key = None

    if api_key:
        client = anthropic.Anthropic(api_key=api_key)
        exemplar_text = ""
        if exemplars:
            exemplar_text = "\n\nPast approved prompts for this scene type (match this register):\n" + \
                "\n".join(f"- {e['final_prompt']}" for e in exemplars)
        feedback_text = f"\n\nThe previous draft was rejected: {feedback}\nRevise to fix this specifically." if feedback else ""
        system = (
            "You write single-panel art direction prompts for a Lagos-noir superhero "
            "comic (Catalyst: The Awakening). Output ONLY the prompt itself — one dense "
            "paragraph, no preamble, no quotation marks.\n\n"
            f"Scene type: {scene_type} — {scene_cfg['description']}\n"
            f"Required visual elements: {', '.join(scene_cfg['required_tags'])}\n"
            f"Flavor details to draw from: {', '.join(scene_cfg['flavor_pool'])}"
            f"{exemplar_text}"
        )
        msg = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=300,
            system=system,
            messages=[{"role": "user", "content": f"Scene: {scene_idea}{feedback_text}"}],
        )
        return msg.content[0].text.strip()

    # Simulation mode — deterministic, mirrors the loop mechanics without
    # a network call. Each retry incorporates more of the required tags,
    # same shape as the original reference script.
    print("  [Writer Node] (simulation mode — set ANTHROPIC_API_KEY for real drafts)")
    time.sleep(0.3)
    if feedback and "missing" in feedback.lower():
        tags = scene_cfg["required_tags"]
        flavor = scene_cfg["flavor_pool"][:2]
        return (
            f"{scene_idea}. Rendered with {', '.join(tags)}, featuring {', '.join(flavor)}. "
            f"Lagos noir composition, high contrast, {scene_type.replace('_', ' ')} framing."
        )
    return f"A shot related to: {scene_idea}. It looks moody."


def call_ai_director(drafted_text, scene_type, bible):
    """Director Node — deterministic gatekeeper. Objective pass/fail,
    same principle as the reference script: no vibes, just rules."""
    scene_cfg = bible["scene_types"][scene_type]
    # Each scene type's required_tags is already the scene-appropriate
    # subset of the base noir vocabulary (an orisha_manifestation panel
    # doesn't need "rain"; an establishing shot doesn't need "close-up").
    # Checking the union with base_tags here would force every scene into
    # the same mold — the whole point of per-scene_type tag lists.
    required = set(t.lower() for t in scene_cfg["required_tags"])
    text_lower = drafted_text.lower()

    missing = [t for t in required if t not in text_lower]
    banned_hit = [p for p in bible["banned_phrases"] if p.lower() in text_lower]
    too_short = len(drafted_text) < bible["min_prompt_length"]

    if missing or banned_hit or too_short:
        reasons = []
        if missing:
            reasons.append(f"missing required elements: {', '.join(sorted(missing))}")
        if banned_hit:
            reasons.append(f"contains banned phrasing: {', '.join(banned_hit)}")
        if too_short:
            reasons.append(f"too short ({len(drafted_text)} chars, need {bible['min_prompt_length']}+)")
        return False, "; ".join(reasons)

    return True, "Passed — on-model with the style bible."


def run_production_loop(scene_idea, scene_type, max_attempts=5):
    bible = load_style_bible()
    if scene_type not in bible["scene_types"]:
        valid = ", ".join(bible["scene_types"].keys())
        print(f"Unknown scene_type '{scene_type}'. Valid types: {valid}")
        sys.exit(1)

    ledger = load_ledger()
    exemplars = sample_past_exemplars(ledger, scene_type)

    print(f"--- PANEL PROMPT FORGE: {scene_idea} [{scene_type}] ---")
    if exemplars:
        print(f"(drawing on {len(exemplars)} past approved prompt(s) of this scene type)")

    attempt = 1
    feedback = ""
    success = False
    final_prompt = ""

    while attempt <= max_attempts and not success:
        print(f"\n--- Iteration {attempt} ---")
        draft = call_ai_writer(scene_idea, scene_type, bible, exemplars, feedback)
        print(f"Draft: {draft}")

        is_approved, feedback = call_ai_director(draft, scene_type, bible)
        if is_approved:
            print(f"[Director Node] [APPROVED] {feedback}")
            success = True
            final_prompt = draft
        else:
            print(f"[Director Node] [REJECTED] {feedback}")
            attempt += 1

    if success:
        print("\n=== FINAL PRODUCTION PROMPT ===")
        print(final_prompt)
        print("===============================")
        ledger.append({
            "scene_idea": scene_idea,
            "scene_type": scene_type,
            "final_prompt": final_prompt,
            "iterations": attempt,
        })
        save_ledger(ledger)
        print(f"\nSaved to ledger.json ({len(ledger)} total approved prompts).")
    else:
        print(f"\n[System] Loop hit max_attempts ({max_attempts}) without approval. Manual revision needed.")
    return success, final_prompt


def main():
    parser = argparse.ArgumentParser(description="Draft and verify a panel art prompt against the CatalystVerse style bible.")
    parser.add_argument("scene_idea", nargs="*", help="Short description of the scene.")
    parser.add_argument("--scene-type", default="establishing", help="One of the scene types in style_bible.json.")
    parser.add_argument("--max-attempts", type=int, default=5)
    parser.add_argument("--list-scene-types", action="store_true")
    args = parser.parse_args()

    if args.list_scene_types:
        bible = load_style_bible()
        for name, cfg in bible["scene_types"].items():
            print(f"{name:22s} {cfg['description']}")
        return

    scene_idea = " ".join(args.scene_idea) if args.scene_idea else "Scene 1: Introduction of the main character in the city."
    run_production_loop(scene_idea, args.scene_type, args.max_attempts)


if __name__ == "__main__":
    main()
