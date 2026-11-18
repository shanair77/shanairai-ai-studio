#!/usr/bin/env python3
"""
Synthesize the soft background music for CountryMouseStory.

An original 3/4 lullaby: a music-box melody over a gentle "oom-pah-pah" waltz,
a warm pad and a little room reverb. Pure numpy, no samples, so the track is
reproducible and free of licensing questions.

    python3 scripts/mouse-music.py public/mouse/music.wav
    ffmpeg -y -i public/mouse/music.wav -c:a libmp3lame -b:a 160k public/mouse/music.mp3
"""

import sys

import numpy as np

SR = 44100
BPM = 80
BEAT = 60 / BPM  # seconds per beat
BAR = 3 * BEAT

# ── Score ────────────────────────────────────────────────────────────────
# Chords as MIDI note lists (root first). Melody as (midi, beats) per bar.
C, Am, F, G, Dm, Em = (
    [48, 55, 60, 64],
    [45, 52, 57, 60],
    [41, 53, 57, 60],
    [43, 50, 55, 59],
    [38, 50, 53, 57],
    [40, 52, 55, 59],
)

A_CHORDS = [C, Am, F, G, C, Am, F, C]
A_MELODY = [
    [(76, 2), (79, 1)],
    [(81, 2), (79, 1)],
    [(77, 1), (76, 1), (74, 1)],
    [(74, 3)],
    [(76, 2), (79, 1)],
    [(81, 1), (79, 1), (76, 1)],
    [(77, 1), (74, 1), (71, 1)],
    [(72, 3)],
]
B_CHORDS = [F, C, Dm, G, Em, Am, Dm, G]
B_MELODY = [
    [(77, 2), (81, 1)],
    [(79, 2), (76, 1)],
    [(77, 1), (76, 1), (74, 1)],
    [(79, 3)],
    [(76, 2), (79, 1)],
    [(81, 1), (79, 1), (76, 1)],
    [(74, 1), (77, 1), (76, 1)],
    [(74, 2), (71, 1)],
]

# Form: intro, then A B alternating, outro. Later passes add a twinkle line.
SECTIONS = [("intro", [C, C], None)]
for i, (ch, mel) in enumerate([(A_CHORDS, A_MELODY), (B_CHORDS, B_MELODY)] * 3 + [(A_CHORDS, A_MELODY)]):
    SECTIONS.append(("twinkle" if i >= 2 else "plain", ch, mel))
SECTIONS.append(("outro", [C, C], [[(72, 3)], [(None, 3)]]))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


def music_box(m, dur, amp):
    n = int((dur + 2.5) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    tone = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t / 0.4)
    tone += 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t / 0.2)
    return amp * tone * env(n, 0.004, 0.9)


def soft_pluck(m, amp):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = hz(m)
    tone = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return amp * tone * env(n, 0.01, 0.45)


def pad(chord, dur, amp):
    n = int((dur + 1.0) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for m in chord[1:]:
        f = hz(m)
        for det in (-0.12, 0.0, 0.12):
            out += np.sin(2 * np.pi * f * (2 ** (det / 12)) * t + det * 7)
    shape = np.clip(t / 0.8, 0, 1) * np.clip((dur + 1.0 - t) / 1.0, 0, 1)
    return amp * out * shape / 9


def place(buf, sig, start, pan=0.0):
    i = int(start * SR)
    j = min(len(buf), i + len(sig))
    if j <= i:
        return
    left = np.sqrt(0.5 * (1 - pan))
    right = np.sqrt(0.5 * (1 + pan))
    buf[i:j, 0] += sig[: j - i] * left
    buf[i:j, 1] += sig[: j - i] * right


def reverb(x, seconds=2.2, mix=0.28):
    rng = np.random.default_rng(7)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.empty_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / (seconds / 5))
        ir /= np.sqrt(np.sum(ir**2))
        size = 1 << int(np.ceil(np.log2(len(x) + n)))
        wet = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x)]
        out[:, ch] = (1 - mix) * x[:, ch] + mix * wet
    return out


def render():
    bars = sum(len(s[1]) for s in SECTIONS)
    total = bars * BAR + 4.0
    buf = np.zeros((int(total * SR), 2))
    bar_i = 0
    for kind, chords, melody in SECTIONS:
        for k, chord in enumerate(chords):
            t0 = bar_i * BAR
            place(buf, pad(chord, BAR, 0.10), t0)
            # oom-pah-pah
            place(buf, soft_pluck(chord[0], 0.28), t0, -0.2)
            for b in (1, 2):
                for m in chord[1:]:
                    place(buf, soft_pluck(m + 12, 0.055), t0 + b * BEAT, 0.25)
            if melody:
                t = t0
                for m, beats in melody[k]:
                    if m is not None:
                        place(buf, music_box(m, beats * BEAT, 0.22), t, 0.1)
                    t += beats * BEAT
            if kind == "twinkle":
                # quiet chord-tone sparkle in eighth notes, two octaves up
                tones = [chord[1] + 24, chord[2] + 24, chord[3] + 24, chord[2] + 24, chord[3] + 24, chord[1] + 36]
                for e, m in enumerate(tones):
                    place(buf, music_box(m, BEAT / 2, 0.035), t0 + e * BEAT / 2, -0.4 + 0.16 * e)
            bar_i += 1

    buf = reverb(buf)
    # gentle fade-in and a long final fade
    n = len(buf)
    fade = np.ones(n)
    fi = int(1.5 * SR)
    fo = int(5.0 * SR)
    fade[:fi] = np.linspace(0, 1, fi)
    fade[-fo:] = np.linspace(1, 0, fo) ** 2
    buf *= fade[:, None]
    buf /= np.max(np.abs(buf)) / 0.7  # peak at about -3 dBFS
    return buf


def write_wav(path, data):
    import wave

    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "public/mouse/music.wav"
    audio = render()
    write_wav(out, audio)
    print(f"wrote {out}: {len(audio) / SR:.1f}s")
