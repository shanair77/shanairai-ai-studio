#!/usr/bin/env python3
"""
Synthesize the 2.5 s series intro chime for the kids' stories: a rising music-box
arpeggio with a soft shimmer. Pure numpy, original, reproducible.

    python3 scripts/kids-sting.py public/kids/sting.wav
    ffmpeg -y -i public/kids/sting.wav -c:a libmp3lame -b:a 160k public/kids/sting.mp3
"""

import sys
import wave

import numpy as np

SR = 44100


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bell(m, dur, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    tone = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-t / 0.25)
    tone += 0.15 * np.sin(2 * np.pi * 3.98 * f * t) * np.exp(-t / 0.12)
    return amp * tone * np.clip(t / 0.004, 0, 1) * np.exp(-t / 0.7)


total = 2.6
buf = np.zeros((int(total * SR), 2))
notes = [72, 76, 79, 84, 88]  # C E G C E, rising
for i, m in enumerate(notes):
    start = int(i * 0.14 * SR)
    s = bell(m, total - i * 0.14, 0.25 if i < 4 else 0.3)
    pan = -0.5 + i * 0.25
    end = start + len(s)
    buf[start:end, 0] += s[: end - start] * np.sqrt(0.5 * (1 - pan))
    buf[start:end, 1] += s[: end - start] * np.sqrt(0.5 * (1 + pan))
# shimmer: a quiet cluster of high partials that swells and fades
t = np.arange(len(buf)) / SR
shimmer = sum(np.sin(2 * np.pi * hz(m) * t + m) for m in (96, 100, 103)) / 3
shimmer *= 0.05 * np.clip((t - 0.5) / 0.4, 0, 1) * np.exp(-np.clip(t - 0.9, 0, None) / 0.6)
buf[:, 0] += shimmer
buf[:, 1] += shimmer
fade = np.ones(len(buf))
fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
buf *= fade[:, None]
buf /= np.max(np.abs(buf)) / 0.7

out = sys.argv[1] if len(sys.argv) > 1 else "public/kids/sting.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(buf, -1, 1) * 32767).astype("<i2").tobytes())
print(f"wrote {out}")
