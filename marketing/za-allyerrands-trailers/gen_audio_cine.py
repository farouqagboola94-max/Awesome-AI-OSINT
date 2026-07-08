#!/usr/bin/env python3
"""Cinematic score generator for the 4K pack.

Variants (per cinema-audio-events.json "score"):
  clock — ticking clock + heartbeat + dark drone (time-pressure concepts)
  pulse — driving sub pulse + ticks (energy/speed concepts)
  warm  — softer heartbeat + brighter pad (family/aspiration concepts)
  calm  — slow heartbeat + airy pad (relief concepts)

All: boom at scene cuts, riser into reveal, braam at brand reveal.
usage: gen_audio_cine.py [names...]
"""
import json
import struct
import sys
from pathlib import Path

import numpy as np

SR = 44100
DUR = 18.0
N = int(SR * DUR)
HERE = Path(__file__).parent
rng = np.random.default_rng(7)
NOISE = rng.standard_normal(N + SR).astype(np.float64)


def t_axis(n):
    return np.arange(n) / SR


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def bandnoise(dur, lo, hi, decay=8.0):
    n = int(dur * SR)
    start = rng.integers(0, SR)
    x = NOISE[start:start + n].copy()
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(X, n)
    x /= (np.abs(x).max() + 1e-9)
    return x * np.exp(-decay * t_axis(n))


def heartbeat(f0=58.0):
    """lub-dub pair."""
    def thump(dur, drop):
        n = int(dur * SR)
        t = t_axis(n)
        fr = f0 + drop * np.exp(-t * 30)
        ph = 2 * np.pi * np.cumsum(fr) / SR
        return np.sin(ph) * np.exp(-t * 16)
    n = int(0.5 * SR)
    out = np.zeros(n)
    a = thump(0.22, 40)
    b = thump(0.18, 25)
    out[: len(a)] += a
    i = int(0.16 * SR)
    out[i:i + len(b)] += b * 0.62
    return out


def tick(bright=False):
    return bandnoise(0.035, 2600 if bright else 1700, 8600, 40) * 0.5


def tock():
    return bandnoise(0.045, 900, 4200, 34) * 0.45


def boom(dur=1.0):
    n = int(dur * SR)
    t = t_axis(n)
    body = np.sin(2 * np.pi * (50 - 12 * t) * t) * np.exp(-t * 4.5)
    splash = bandnoise(min(0.5, dur), 250, 6500, 9) * 0.4
    out = body
    out[: len(splash)] += splash
    return out


def riser(dur=1.6):
    n = int(dur * SR)
    t = t_axis(n)
    x = NOISE[:n].copy()
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < 350) | (f > 8500)] = 0
    x = np.fft.irfft(X, n)
    x /= np.abs(x).max() + 1e-9
    env = (t / dur) ** 2.4
    shimmer = np.sin(2 * np.pi * np.cumsum(180 + 900 * (t / dur) ** 2) / SR)
    return (x * 0.75 + shimmer * 0.3) * env


def braam(f0=43.65, dur=2.2):
    n = int(dur * SR)
    t = t_axis(n)
    sig = np.zeros(n)
    for mult, g in ((1, 1.0), (2, 0.55), (3, 0.34), (4.02, 0.2), (5.98, 0.12)):
        det = 1 + 0.004 * np.sin(2 * np.pi * 0.9 * t * mult)
        sig += g * np.sin(2 * np.pi * f0 * mult * det * t)
    env = (1 - np.exp(-t * 18)) * np.exp(-t * 1.9)
    return np.tanh(sig * 2.2) * env * 0.9


def pad(freqs, gains, lfo=0.14, wob=0.35):
    t = t_axis(N)
    sig = np.zeros(N)
    for f, g in zip(freqs, gains):
        vib = 1 + 0.0025 * np.sin(2 * np.pi * (0.11 + f / 900) * t)
        sig += g * np.sin(2 * np.pi * f * vib * t)
    swell = 0.62 + wob * np.sin(2 * np.pi * lfo * t - np.pi / 2)
    edge = np.minimum(t / 2.5, 1) * np.minimum((DUR - t) / 1.2, 1)
    return sig * swell * np.clip(edge, 0, 1)


F1, G1, D1 = 43.65, 49.0, 36.71


def build(name, ev):
    score = ev['score']
    music = np.zeros(N)
    fx = np.zeros(N)

    if score == 'clock':
        root = F1
        # relentless tick-tock (the whole point: time)
        t = 0.0
        k = 0
        while t < DUR:
            place(music, tick(k % 2 == 0) if k % 2 == 0 else tock(), t, 0.8)
            t += 0.5
            k += 1
        hb_gap = 0.92
    elif score == 'pulse':
        root = G1
        # driving eighth sub pulse
        step = 0.24
        t = 0.0
        k = 0
        while t < DUR:
            n = int(0.2 * SR)
            tt = t_axis(n)
            p = np.sin(2 * np.pi * (root * 2) * tt) * np.exp(-tt * 22)
            place(music, p, t, 0.55 if k % 4 else 0.85)
            if k % 2 == 0:
                place(music, tick(True), t, 0.4)
            t += step
            k += 1
        hb_gap = 0.0  # no heartbeat, pulse instead
    elif score == 'warm':
        root = F1
        t = 1.0
        while t < DUR:
            place(music, tick(True), t, 0.28)
            t += 1.0
        hb_gap = 1.05
    else:  # calm
        root = D1
        hb_gap = 1.25

    if hb_gap:
        t = 0.2
        while t < DUR:
            place(music, heartbeat(root + 14), t, 0.85)
            t += hb_gap

    # drone / pad
    if score == 'warm':
        music += pad([root * 2, root * 3, root * 4.02, root * 6], [0.5, 0.3, 0.22, 0.1], lfo=0.12, wob=0.3) * 0.4
    elif score == 'calm':
        music += pad([root * 2, root * 2.997, root * 4.75], [0.55, 0.3, 0.14], lfo=0.09, wob=0.42) * 0.38
    else:
        music += pad([root, root * 2, root * 2.997], [0.6, 0.34, 0.18], lfo=0.16, wob=0.34) * 0.42

    # synced FX
    for imp in sorted(set(round(x, 2) for x in ev['impacts'])):
        place(fx, boom(0.8), imp, 0.5)
    rev = ev['reveal']
    place(fx, riser(1.6), rev - 1.6, 0.85)
    place(fx, braam(root if score != 'calm' else root * 1.5), rev, 0.95)
    place(fx, boom(1.2), 0.03, 0.65)

    out = music * 0.6 + fx
    nf = int(0.5 * SR)
    fade = np.ones(N)
    fade[-nf:] = np.linspace(1, 0, nf)
    out *= fade
    out = np.tanh(out * 1.1)
    out *= 0.891 / (np.abs(out).max() + 1e-9)

    stereo = np.repeat(out[:, None], 2, axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with open(HERE / f"{name}.wav", 'wb') as fp:
        data = pcm.tobytes()
        fp.write(b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVE')
        fp.write(b'fmt ' + struct.pack('<IHHIIHH', 16, 1, 2, SR, SR * 4, 4, 16))
        fp.write(b'data' + struct.pack('<I', len(data)) + data)
    print('wrote', name + '.wav', f'({score})')


if __name__ == '__main__':
    events = json.loads((HERE / 'cinema-audio-events.json').read_text())
    for name in (sys.argv[1:] or list(events)):
        build(name, events[name])
