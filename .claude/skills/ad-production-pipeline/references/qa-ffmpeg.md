# QA & FFmpeg — the exact commands

Rendering is local and free — re-render freely. Generation is not; never regenerate footage to fix
something ffmpeg can fix. Do the media QA below on the ACTUAL render, not just the source clips.

## Render (staged)
```bash
npx remotion render src/index.ts <CompositionId> out/<name>.mp4 --codec=h264
```
Stages: `…-picture-vo`, `…-audio-master`, `…-final-master`. Get sign-off between them.

## Spec + integrity checks
```bash
# exact frame math, dimensions, fps, codec (want e.g. 1080x1920, 24/1, 1440 frames)
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames,codec_name \
  -show_entries format=duration -of default=noprint_wrappers=1 out/<name>.mp4
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate \
  -of default=noprint_wrappers=1 out/<name>.mp4

# no black frames
ffmpeg -v error -i out/<name>.mp4 -vf blackdetect=d=0.1:pix_th=0.10 -an -f null - 2>&1 | grep -i black

# no repeated-frame / pulldown judder (should report nothing at native fps)
ffmpeg -v error -i out/<name>.mp4 -vf freezedetect=n=0.001:d=0.25 -an -f null - 2>&1 | grep -i freeze
```

## Inspect frames (anatomy, signage, identity, website spelling)
Extract representative stills at shot midpoints and view them — check hands/anatomy, prop/wardrobe
continuity, architecture, garbled signage, and that the endcard website is spelled exactly right.
```bash
ffmpeg -v error -ss <seconds> -i out/<name>.mp4 -frames:v 1 scratch/f_<t>.png -y
```

## Watermark removal (delogo) — preserves the approved shot, no regeneration
Find the mark's box (it sits in a corner; position can differ per asset — measure each). Then:
```bash
# still (overwrite in place after backing up the original)
ffmpeg -v error -i in.png -vf "delogo=x=<X>:y=<Y>:w=<W>:h=<H>" out.png -y
# video (re-encode, keep audio)
ffmpeg -v error -i in.mp4 -vf "delogo=x=<X>:y=<Y>:w=<W>:h=<H>" \
  -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -c:a copy out.mp4 -y
```
The box must fully contain the mark AND its soft halo, or delogo smears the uncovered part into a
streak. Back up originals (e.g. `_watermarked-originals/`). Verify by cropping the corner and viewing.
For a video, confirm the mark is static across the clip (sample several timestamps); if it drifts, a
static box won't track it and you regenerate the clip from a cleaned start-image instead.

## TikTok / vertical safe-area overlay
Overlay the platform's UI zones on the frames that carry critical content (endcard, typography beats).
For 1080×1920 — top tabs ≈132px, bottom caption/CTA band ≈480px, right action rail ≈121px, left text
margin ≈44px:
```bash
OV="drawbox=x=0:y=0:w=1080:h=132:color=red@0.4:t=fill,\
drawbox=x=0:y=1437:w=1080:h=483:color=red@0.4:t=fill,\
drawbox=x=959:y=560:w=121:h=877:color=orange@0.4:t=fill,\
drawbox=x=0:y=0:w=44:h=1920:color=yellow@0.3:t=fill,\
drawbox=x=44:y=132:w=915:h=1305:color=lime@0.9:t=3"
ffmpeg -v error -ss <t> -i out/<name>.mp4 -frames:v 1 -vf "$OV" scratch/safe_<t>.png -y
```
Green outline = safe. Keep the CTA/website/logo inside it; lower-third word beats that land in the
bottom band are a flag — raise them ~180px or advise short captions.

## Code checks
```bash
npm run lint   # eslint + tsc — the project's verification step (no unit-test suite)
```
