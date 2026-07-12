#!/usr/bin/env python3
"""Procedural audio: afro-house percussion beds and cinematic scores.
usage: beats.py afro|score <seconds> <seed> <out.wav>"""
import sys, wave, numpy as np

SR = 44100

def env_exp(n, decay):
    return np.exp(-np.arange(n) / (SR * decay))

def sine(freq, n, phase=0.0):
    return np.sin(2 * np.pi * freq * np.arange(n) / SR + phase)

def pitch_sweep(f0, f1, n, decay):
    f = f0 * (f1 / f0) ** (np.arange(n) / n)
    ph = np.cumsum(2 * np.pi * f / SR)
    return np.sin(ph) * env_exp(n, decay)

def noise_burst(n, decay, lp=0.5, rng=None):
    x = (rng or np.random).standard_normal(n)
    for _ in range(int(lp * 6)):        # crude lowpass by repeated smoothing
        x = np.convolve(x, [0.25, 0.5, 0.25], 'same')
    return x * env_exp(n, decay)

def place(buf, t, sample, gain=1.0, pan=0.0):
    i = int(t * SR)
    n = min(len(sample), buf.shape[1] - i)
    if n <= 0: return
    l, r = (1 - pan) / 2 + 0.5, (1 + pan) / 2 + 0.5
    buf[0, i:i + n] += sample[:n] * gain * min(1.0, l)
    buf[1, i:i + n] += sample[:n] * gain * min(1.0, r)

def afro(seconds, seed):
    rng = np.random.default_rng(seed)
    bpm = [118, 120, 122, 124][seed % 4]
    beat = 60 / bpm
    step = beat / 4
    buf = np.zeros((2, int(seconds * SR) + SR))
    kick = pitch_sweep(120, 42, int(0.35 * SR), 0.09)
    click = noise_burst(int(0.01 * SR), 0.004, 0.2, rng) * 0.4
    kick[:len(click)] += click
    shaker = noise_burst(int(0.08 * SR), 0.025, 0.15, rng)
    shaker2 = noise_burst(int(0.06 * SR), 0.02, 0.1, rng)
    nr = int(0.03 * SR)
    rim = sine(1700, nr) * env_exp(nr, 0.008) + noise_burst(nr, 0.006, 0.3, rng) * 0.5
    conga_hi = pitch_sweep(340, 300, int(0.12 * SR), 0.045)
    conga_lo = pitch_sweep(230, 195, int(0.16 * SR), 0.06)
    # amapiano-style log drum notes (minor pentatonic on root)
    root = [46.25, 49.0, 51.9, 43.65][seed % 4]  # F#1..F1 area
    def log_drum(f):
        n = int(0.42 * SR)
        return pitch_sweep(f * 2.2, f, n, 0.16) * 1.2
    penta = [1, 6/5, 4/3, 3/2, 9/5]
    log_notes = [log_drum(root * 2 * p) for p in penta]
    # patterns per 16-step bar
    log_pat = [(0, 0), (3, 2), (6, 0), (10, 3), (13, 1)] if seed % 2 else [(0, 0), (4, 1), (7, 4), (11, 2), (14, 0)]
    t = 0.0; bar = 0
    while t < seconds:
        for s16 in range(16):
            ts = t + s16 * step
            if ts >= seconds: break
            if s16 % 4 == 0: place(buf, ts, kick, 0.9)
            if s16 % 2 == 0: place(buf, ts, shaker, 0.16, -0.3)
            else: place(buf, ts, shaker2, 0.10, 0.35)
            if s16 in (4, 12): place(buf, ts, rim, 0.32, 0.15)
            if s16 == 7: place(buf, ts, conga_hi, 0.35, -0.2)
            if s16 in (9, 15) and bar % 2: place(buf, ts, conga_lo, 0.4, 0.25)
            if bar >= 2:  # log drums enter after 2 bars
                for (pos, note) in log_pat:
                    if s16 == pos: place(buf, ts, log_notes[note], 0.5)
        t += 16 * step; bar += 1
    return buf[:, :int(seconds * SR)]

def score(seconds, seed):
    rng = np.random.default_rng(seed)
    roots = [55.0, 49.0, 58.27, 43.65]   # A1, G1, Bb1, F1
    root = roots[seed % 4]
    n = int(seconds * SR)
    buf = np.zeros((2, n))
    tt = np.arange(n) / SR
    # evolving drone: root + fifth, slow detune beats
    for mult, det, g in [(1, 0.0, 0.30), (1, 0.7, 0.22), (1.5, 0.3, 0.12), (2, 1.1, 0.10), (3, 0.2, 0.05)]:
        w = np.sin(2 * np.pi * (root * mult + det) * tt + rng.uniform(0, 6))
        w += 0.35 * np.sign(w) * np.abs(w) ** 2   # soft saturation for body
        lfo = 0.5 + 0.5 * np.sin(2 * np.pi * (0.05 + 0.03 * mult) * tt + rng.uniform(0, 6))
        pan = 0.4 * np.sin(2 * np.pi * 0.03 * mult * tt)
        buf[0] += w * g * lfo * (1 - pan) * 0.5
        buf[1] += w * g * lfo * (1 + pan) * 0.5
    # swell envelope over the whole cue
    swell = np.minimum(1, tt / (seconds * 0.55)) ** 1.5
    swell *= np.minimum(1, (seconds - tt) / 1.8).clip(0, 1)
    buf *= swell
    # heartbeat pulse
    pulse = pitch_sweep(85, 48, int(0.3 * SR), 0.08)
    period = 60 / 52  # 52 bpm heart
    t = 1.0
    while t < seconds - 1:
        place(buf, t, pulse, 0.5)
        place(buf, t + 0.28, pulse, 0.3)
        t += period
    # sparse taiko hits on phrase boundaries
    taiko = pitch_sweep(160, 55, int(0.7 * SR), 0.18)
    tn = noise_burst(int(0.1 * SR), 0.03, 0.6, rng) * 0.3
    taiko[:len(tn)] += tn
    for frac in (0.33, 0.62, 0.85):
        place(buf, seconds * frac, taiko, 0.65)
    return buf

def write_wav(path, buf):
    peak = np.max(np.abs(buf)) or 1
    x = (buf / peak * 0.89 * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.T.tobytes())

def mix(seconds, seed, hits=None):
    """Continuous sizzle-reel bed: driving pulse + cinematic swell + hit accents at cut points."""
    rng = np.random.default_rng(seed)
    n = int(seconds * SR)
    buf = np.zeros((2, n))
    tt = np.arange(n) / SR

    # cinematic drone bed throughout, swelling in over first 15%
    root = 49.0
    for mult, det, g in [(1, 0.0, 0.22), (1, 0.6, 0.16), (1.5, 0.25, 0.09), (2, 1.0, 0.07)]:
        w = np.sin(2 * np.pi * (root * mult + det) * tt + rng.uniform(0, 6))
        w += 0.3 * np.sign(w) * np.abs(w) ** 2
        buf[0] += w * g * 0.5
        buf[1] += w * g * 0.5
    swell = np.minimum(1, tt / (seconds * 0.18)).clip(0, 1)
    buf *= swell

    # driving four-on-floor pulse, ramps in after 12%
    bpm = 124
    beat = 60 / bpm
    kick = pitch_sweep(115, 44, int(0.3 * SR), 0.085)
    hat = noise_burst(int(0.04 * SR), 0.015, 0.15, rng)
    t = seconds * 0.12
    while t < seconds - 0.3:
        ramp = min(1.0, (t - seconds * 0.12) / (seconds * 0.15 + 0.01))
        place(buf, t, kick, 0.75 * ramp)
        place(buf, t + beat / 2, hat, 0.18 * ramp, 0.3)
        t += beat

    # log-drum-ish bass stabs, entering after 35%
    root2 = 46.25
    stab = pitch_sweep(root2 * 2, root2, int(0.3 * SR), 0.12)
    t = seconds * 0.35
    step = beat / 2
    pat = [0, 3, 5, 8]
    i = 0
    while t < seconds - 0.3:
        if i % 8 in pat:
            place(buf, t, stab, 0.4)
        t += step
        i += 1

    # hit accents at supplied cut times (big transient + sub thump)
    if hits:
        taiko = pitch_sweep(150, 50, int(0.5 * SR), 0.14)
        tn = noise_burst(int(0.08 * SR), 0.02, 0.5, rng) * 0.4
        taiko[:len(tn)] += tn
        for ht in hits:
            if 0 <= ht < seconds - 0.05:
                place(buf, ht, taiko, 0.55)

    # tail fade
    tail = seconds * 0.06
    fade_out = np.minimum(1, (seconds - tt) / tail).clip(0, 1)
    buf *= fade_out
    return buf


if __name__ == '__main__':
    kind, secs, seed, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    hits = [float(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 and sys.argv[5] else None
    if kind == 'afro':
        buf = afro(secs, seed)
    elif kind == 'score':
        buf = score(secs, seed)
    else:
        buf = mix(secs, seed, hits)
    write_wav(out, buf)
    print('OK', out)
