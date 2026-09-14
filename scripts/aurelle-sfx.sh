#!/usr/bin/env bash
#
# aurelle-sfx — synthesize the dedicated SFX palette for ShanairAICommercial45.
#
# Every cue is built procedurally with ffmpeg (no sample library, no generation
# credits) so it is reproducible and tuned to the film's beats. Output: 48kHz mono
# PCM WAV into public/aurelle/audio/sfx/. A final alimiter guards each mix against
# inter-sample clipping. Re-run any time to regenerate; the edit references these by name.
#
set -euo pipefail

OUT="public/aurelle/audio/sfx"
mkdir -p "$OUT"

SR=48000
LIM="alimiter=limit=0.97:level=disabled"   # transparent ceiling, no makeup gain

gen() { echo "  · $1"; }

# ── 1. Camera flash (xenon pop): sharp broadband transient, snappy decay ──
gen flash.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.9:duration=0.13:sample_rate=$SR:seed=11" \
  -af "highpass=f=2200,lowpass=f=13000,afade=t=in:st=0:d=0.002:curve=exp,afade=t=out:st=0.010:d=0.11:curve=exp,volume=1.5,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/flash.wav"

# ── flash burst (pop 3): three stacked pops ──
gen flash-burst.wav
ffmpeg -y -loglevel error -i "$OUT/flash.wav" -filter_complex \
  "[0:a]adelay=0[a];[0:a]adelay=45,volume=0.72[b];[0:a]adelay=85,volume=0.88[c];[a][b][c]amix=inputs=3:normalize=0,volume=1.05,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/flash-burst.wav"

# ── 2. Clasp CLICK (metallic lock): noise snap + two inharmonic ring partials ──
gen clasp-click.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.85:duration=0.16:sample_rate=$SR:seed=7" \
  -f lavfi -i "sine=frequency=3180:duration=0.16:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=5240:duration=0.16:sample_rate=$SR" \
  -filter_complex \
  "[0:a]bandpass=f=3600:width_type=h:w=3200,afade=t=out:st=0.004:d=0.06:curve=exp,volume=1.2[click]; \
   [1:a]afade=t=out:st=0:d=0.13:curve=exp,volume=0.34[r1]; \
   [2:a]afade=t=out:st=0:d=0.10:curve=exp,volume=0.24[r2]; \
   [click][r1][r2]amix=inputs=3:normalize=0,highpass=f=800,volume=1.25,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/clasp-click.wav"

# ── 3. Cursor click (UI): tight highpassed tick + short blip ──
gen ui-click.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.5:duration=0.05:sample_rate=$SR:seed=3" \
  -f lavfi -i "sine=frequency=1150:duration=0.05:sample_rate=$SR" \
  -filter_complex \
  "[0:a]highpass=f=1500,afade=t=out:st=0:d=0.03:curve=exp,volume=0.7[n]; \
   [1:a]afade=t=out:st=0:d=0.035:curve=exp,volume=0.6[t]; \
   [n][t]amix=inputs=2:normalize=0,volume=1.15,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/ui-click.wav"

# ── 4. Selection tick (UI): soft higher blip ──
gen ui-tick.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=frequency=2050:duration=0.045:sample_rate=$SR" \
  -af "afade=t=out:st=0:d=0.035:curve=exp,volume=0.5,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/ui-tick.wav"

# ── 5. Labels assemble: four ticks snapping into place ──
gen assemble.wav
ffmpeg -y -loglevel error -i "$OUT/ui-tick.wav" -filter_complex \
  "[0:a]adelay=0[a];[0:a]adelay=55,volume=0.9[b];[0:a]adelay=110,volume=0.85[c];[0:a]adelay=150,volume=1.0[d];[a][b][c][d]amix=inputs=4:normalize=0,volume=1.1,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/assemble.wav"

# ── 6. Layers detach (pull-back zip): descending chirp + noise swell ──
gen layers-detach.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='0.5*sin(2*PI*(900*exp(-3*t))*t)':d=0.5:s=$SR" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=0.5:sample_rate=$SR:seed=5" \
  -filter_complex \
  "[0:a]afade=t=out:st=0.08:d=0.42:curve=exp[c]; \
   [1:a]highpass=f=600,lowpass=f=6000,volume='min(1,t/0.12)*max(0,1-(t-0.12)/0.38)':eval=frame,volume=0.5[n]; \
   [c][n]amix=inputs=2:normalize=0,volume=1.15,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/layers-detach.wav"

# ── 7. Industry swishes (two variants for rhythm): banded noise, in-out envelope ──
gen swish-a.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:amplitude=0.7:duration=0.4:sample_rate=$SR:seed=21" \
  -af "bandpass=f=1800:width_type=h:w=1600,volume='sin(PI*t/0.4)':eval=frame,volume=1.3,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/swish-a.wav"
gen swish-b.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:amplitude=0.7:duration=0.38:sample_rate=$SR:seed=22" \
  -af "bandpass=f=1200:width_type=h:w=1200,volume='sin(PI*t/0.38)':eval=frame,volume=1.3,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/swish-b.wav"

# ── 8. Riser into reveal (~1.0s): rising pitch + rising noise, climaxes at the impact ──
gen riser.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='0.32*sin(2*PI*(240 + 680*pow(t/1.0,2))*t)':d=1.0:s=$SR" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.6:duration=1.0:sample_rate=$SR:seed=9" \
  -filter_complex \
  "[0:a]volume='pow(t/1.0,1.5)':eval=frame[c]; \
   [1:a]highpass=f=800,volume='pow(t/1.0,2)':eval=frame,volume=0.8[n]; \
   [c][n]amix=inputs=2:normalize=0,afade=t=out:st=0.94:d=0.06,volume=1.2,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/riser.wav"

# ── 9. Impacts (trailer hits): pitch-drop sub + brown-noise body + transient ──
mk_impact() { # $1 out  $2 f0  $3 subdecay  $4 dur  $5 clickgain
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='sin(2*PI*($2*exp(-2.2*t))*t)':d=$4:s=$SR" \
  -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:duration=$4:sample_rate=$SR:seed=13" \
  -f lavfi -i "anoisesrc=color=white:amplitude=0.6:duration=0.08:sample_rate=$SR:seed=17" \
  -filter_complex \
  "[0:a]volume='exp(-$3*t)':eval=frame,volume=1.15[sub]; \
   [1:a]lowpass=f=180,volume='exp(-4*t)':eval=frame,volume=0.95[body]; \
   [2:a]highpass=f=1500,afade=t=out:st=0:d=0.07:curve=exp,volume=$5[click]; \
   [sub][body][click]amix=inputs=3:normalize=0,volume=1.05,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/$1"
}
gen impact-a.wav; mk_impact impact-a.wav 85 2.5 1.3 0.6
gen impact-b.wav; mk_impact impact-b.wav 96 3.2 1.0 0.72

# ── 10. Brand sting (proof): warm exp-decaying major chord + short tail ──
gen brand-sting.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=440:duration=1.3:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=554:duration=1.3:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=659:duration=1.3:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=880:duration=1.3:sample_rate=$SR" \
  -filter_complex \
  "[0:a]volume='exp(-2.0*t)':eval=frame,volume=0.5[n1]; \
   [1:a]volume='exp(-2.2*t)':eval=frame,volume=0.4[n2]; \
   [2:a]volume='exp(-2.4*t)':eval=frame,volume=0.34[n3]; \
   [3:a]volume='exp(-3.2*t)':eval=frame,volume=0.2[n4]; \
   [n1][n2][n3][n4]amix=inputs=4:normalize=0,afade=t=in:st=0:d=0.006,aecho=0.8:0.55:180:0.32,volume=1.1,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/brand-sting.wav"

# ── 11. Logo sting (finale): fuller chord + sub weight + shimmer + long tail (~2.2s) ──
gen logo-sting.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "sine=frequency=110:duration=2.2:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=440:duration=2.2:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=659:duration=2.2:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=880:duration=2.2:sample_rate=$SR" \
  -f lavfi -i "sine=frequency=1319:duration=2.2:sample_rate=$SR" \
  -filter_complex \
  "[0:a]volume='exp(-1.4*t)':eval=frame,volume=0.34[s]; \
   [1:a]volume='exp(-1.6*t)':eval=frame,volume=0.42[a]; \
   [2:a]volume='exp(-1.8*t)':eval=frame,volume=0.3[b]; \
   [3:a]volume='exp(-2.2*t)':eval=frame,volume=0.22[c]; \
   [4:a]volume='exp(-3.0*t)*max(0,min(1,(t-0.05)/0.1))':eval=frame,volume=0.13[d]; \
   [s][a][b][c][d]amix=inputs=5:normalize=0,afade=t=in:st=0:d=0.008,aecho=0.8:0.6:220|340:0.36|0.22,afade=t=out:st=2.0:d=0.2,volume=1.05,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/logo-sting.wav"

# ── 12. Hero air (settle): soft low airy swell, quiet ──
gen hero-air.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=color=pink:amplitude=0.5:duration=0.85:sample_rate=$SR:seed=31" \
  -af "lowpass=f=2200,volume='sin(PI*t/0.85)':eval=frame,volume=0.5,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/hero-air.wav"

# ── 13. Converge (finale): short upward shimmer into the wordmark ──
gen converge.wav
ffmpeg -y -loglevel error \
  -f lavfi -i "aevalsrc='0.3*sin(2*PI*(420 + 520*(t/0.8))*t)':d=0.8:s=$SR" \
  -f lavfi -i "anoisesrc=color=pink:amplitude=0.4:duration=0.8:sample_rate=$SR:seed=41" \
  -filter_complex \
  "[0:a]volume='min(1,t/0.4)*max(0,1-(t-0.4)/0.4)':eval=frame[c]; \
   [1:a]highpass=f=1500,volume='t/0.8':eval=frame,volume=0.4[n]; \
   [c][n]amix=inputs=2:normalize=0,volume=1.1,$LIM" \
  -ac 1 -c:a pcm_s16le "$OUT/converge.wav"

# ── Normalize every cue to a uniform -3 dBFS peak so config gains are predictable ──
gen "normalize → -3 dBFS peak"
for f in "$OUT"/*.wav; do
  max=$(ffmpeg -hide_banner -i "$f" -af volumedetect -f null - 2>&1 | grep -o 'max_volume: [-0-9.]*' | awk '{print $2}')
  adj=$(awk -v m="$max" 'BEGIN{printf "%.2f", -3 - m}')
  ffmpeg -y -loglevel error -i "$f" -af "volume=${adj}dB" -ac 1 -c:a pcm_s16le "$f.norm.wav"
  mv "$f.norm.wav" "$f"
done

echo "SFX palette written to $OUT"
