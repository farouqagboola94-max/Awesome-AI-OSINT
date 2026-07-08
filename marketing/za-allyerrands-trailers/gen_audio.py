#!/usr/bin/env python3
"""Synthesize a trailer audio bed synced to scene cuts, mix in VO, write WAV.

usage: gen_audio.py <video-name>
reads audio-events.json ({name: {vo, impacts[], reveal}}) and vo<1|2>.raw
(f32le 44100 mono, produced by ffmpeg) if present.
"""
import json
import struct
import sys
from pathlib import Path

import numpy as np

SR = 44100
DUR = 18.0
BPM = 116.0
BEAT = 60.0 / BPM
N = int(SR * DUR)
HERE = Path(__file__).parent

rng = np.random.default_rng(42)
NOISE = rng.standard_normal(N + SR).astype(np.float64)


def t_axis(n):
    return np.arange(n) / SR


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def bandnoise(dur, lo, hi, shape=1.0):
    n = int(dur * SR)
    start = rng.integers(0, SR)
    x = NOISE[start:start + n].copy()
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(X, n)
    x /= (np.abs(x).max() + 1e-9)
    env = np.exp(-shape * t_axis(n) / dur * 8)
    return x * env


def kick(dur=0.28, f0=150.0, f1=44.0, punch=1.0):
    n = int(dur * SR)
    t = t_axis(n)
    freq = f1 + (f0 - f1) * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-t * 13)
    click = bandnoise(0.02, 1500, 9000, 2.0) * 0.4 * punch
    out = body
    out[: len(click)] += click
    return out


def clap(dur=0.24):
    n = int(dur * SR)
    out = np.zeros(n)
    for k, off in enumerate((0.0, 0.012, 0.026)):
        b = bandnoise(dur - off, 900, 5200, 2.2)
        place_local = int(off * SR)
        out[place_local:place_local + len(b)] += b * (0.7 + 0.3 * (k == 2))
    return out * 0.8


def shaker(dur=0.07, accent=False):
    b = bandnoise(dur, 4500, 13000, 1.6)
    return b * (0.5 if accent else 0.28)


def rim(dur=0.05):
    b = bandnoise(dur, 1800, 4200, 3.0)
    return b * 0.5


def bassnote(freq, dur=0.42):
    n = int(dur * SR)
    t = t_axis(n)
    sig = (np.sin(2 * np.pi * freq * t)
           + 0.35 * np.sin(2 * np.pi * 2 * freq * t)
           + 0.12 * np.sin(2 * np.pi * 3 * freq * t))
    env = np.exp(-t * 7) * (1 - np.exp(-t * 300))
    return sig * env * 0.9


def boom(dur=0.9):
    n = int(dur * SR)
    t = t_axis(n)
    body = np.sin(2 * np.pi * (52 - 14 * t) * t) * np.exp(-t * 5)
    splash = bandnoise(min(0.4, dur), 300, 7000, 2.0) * 0.5
    out = body
    out[: len(splash)] += splash
    return out


def riser(dur=1.4):
    n = int(dur * SR)
    t = t_axis(n)
    x = NOISE[:n].copy()
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < 400) | (f > 9000)] = 0
    x = np.fft.irfft(X, n)
    x /= np.abs(x).max() + 1e-9
    env = (t / dur) ** 2.2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 700 * (t / dur) ** 2) / SR)
    return (x * 0.8 + tone * 0.25) * env * 0.8


def build(name, events):
    music = np.zeros(N)
    fx = np.zeros(N)

    # --- groove ---
    F, Ab, Bb, C = 43.65, 51.91, 58.27, 65.41
    bass_cycle = [F, F, Ab, Bb]
    nbeats = int(DUR / BEAT) + 1
    for b in range(nbeats):
        tb = b * BEAT
        bar = b // 4
        beat_in_bar = b % 4
        intro = tb < 1.2
        # four-on-floor kick
        place(music, kick(), tb, 0.95 if not intro else 0.75)
        # ghost kick on the 'and' of beat 2 (afro sway)
        if beat_in_bar == 1 and not intro:
            place(music, kick(0.18, 120, 50, 0.4), tb + BEAT * 0.75, 0.4)
        # clap on 2 & 4
        if beat_in_bar in (1, 3) and not intro:
            place(music, clap(), tb, 0.75)
        # bass: root on 1, syncopated hits
        if not intro:
            f = bass_cycle[bar % 4]
            place(music, bassnote(f), tb, 0.9)
            place(music, bassnote(f * 1.5, 0.22), tb + BEAT * 0.5, 0.35)
        # rim on offbeats every other bar
        if bar % 2 == 1 and beat_in_bar in (0, 2):
            place(music, rim(), tb + BEAT * 0.5, 0.6)
    # swung shaker 16ths
    six = BEAT / 4
    t = 0.0
    idx = 0
    while t < DUR:
        swing = 0.028 if idx % 2 == 1 else 0.0
        place(music, shaker(accent=(idx % 4 == 0)), t + swing)
        t += six
        idx += 1

    # --- synced FX ---
    for imp in sorted(set(round(x, 2) for x in events["impacts"])):
        place(fx, boom(0.55), imp, 0.5)
    rev = events["reveal"]
    place(fx, riser(1.4), rev - 1.4, 0.9)
    place(fx, boom(1.1), rev, 0.95)
    place(fx, boom(0.7), 0.02, 0.7)  # opening hit

    mix = music * 0.62 + fx
    # gentle fade-out last 0.4s
    fade = np.ones(N)
    nf = int(0.4 * SR)
    fade[-nf:] = np.linspace(1, 0, nf)

    # --- VO ---
    vo_path = HERE / f"vo{events['vo']}.raw"
    duck = np.ones(N)
    vo_track = np.zeros(N)
    if vo_path.exists():
        vo = np.fromfile(vo_path, dtype=np.float32).astype(np.float64)
        vo_dur = len(vo) / SR
        vo_start = max(rev + 0.25, 17.75 - vo_dur)
        peak = np.abs(vo).max() + 1e-9
        place(vo_track, vo / peak, vo_start, 0.95)
        i0, i1 = int(vo_start * SR), min(N, int((vo_start + vo_dur) * SR))
        ramp = int(0.15 * SR)
        duck[i0:i1] = 0.42
        duck[max(0, i0 - ramp):i0] = np.linspace(1, 0.42, min(ramp, i0))
        if i1 < N:
            e = min(N, i1 + ramp)
            duck[i1:e] = np.linspace(0.42, 1, e - i1)
        print(f"{name}: VO{events['vo']} {vo_dur:.2f}s at {vo_start:.2f}s")
    else:
        print(f"{name}: no VO file {vo_path.name}, music only")

    out = mix * duck * fade + vo_track
    # soft clip + normalize to -1 dBFS
    out = np.tanh(out * 1.15)
    out *= 0.891 / (np.abs(out).max() + 1e-9)

    stereo = np.repeat(out[:, None], 2, axis=1)
    pcm = (stereo * 32767).astype('<i2')
    wav = HERE / f"{name}.wav"
    with open(wav, 'wb') as fp:
        data = pcm.tobytes()
        fp.write(b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVE')
        fp.write(b'fmt ' + struct.pack('<IHHIIHH', 16, 1, 2, SR, SR * 4, 4, 16))
        fp.write(b'data' + struct.pack('<I', len(data)) + data)
    print('wrote', wav.name)


if __name__ == '__main__':
    events = json.loads((HERE / 'audio-events.json').read_text())
    names = sys.argv[1:] or list(events)
    for name in names:
        build(name, events[name])
