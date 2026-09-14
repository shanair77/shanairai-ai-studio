# Generation tools — identity lock, footage, audio, and cost control

Asset generation runs through connected MCP servers (the Higgsfield-style generation service, and
Artlist). Tool schemas are deferred — load them with `ToolSearch` (e.g.
`select:mcp__<server>__generate_image,...`) before calling. Names below are stable; the server prefix
varies per session, so search rather than hardcode.

## Cost control (do this first, every time)
- Check the balance before a session of generation. Set a **picture-credit ceiling** (the reference
  master used 180) and stop + report if it's approached.
- Preflight every generation with `get_cost: true` before submitting the real job. Video costs far more
  than stills; a few extra rejected video takes add up fast.
- Log each take to a `provenance.json` in the campaign folder: shot, asset key, jobId, credits, verdict
  (accepted/rejected), reason, and the `start_image` used. This is what makes cost + continuity auditable.

## Identity (the protagonist)
- A reusable identity is a trained **Soul** (`show_characters` action `train`, 5–20 reference photos,
  ~10 min; then `list`/`status`). Soul works with image model `soul_2` (and `soul_cinematic`). One
  `soul_id` per generation.
- Verify a reused Soul against the authoritative reference before shipping — a trained twin can look
  like a different person than the real subject. If it doesn't match and that matters, retrain; if the
  stylised look is intended, confirm with the user (this is a creative call, not a silent default).
- For multi-person shots or non-Soul image models, use a saved reference **Element**
  (`show_reference_elements` action `create`; embed `<<<element_id>>>` in the prompt).

## Stills
- `generate_image` with `model: soul_2` + the `soul_id` for identity-locked frames; or a one-off
  reference model (e.g. Nano Banana Pro) where identity is looser.
- **Watermark caveat:** Google/Gemini-family image models (Nano Banana) stamp a corner sparkle. It will
  appear in any still shown directly and in image-to-video clips built from it. Either generate stills
  with a non-Gemini model, or remove the mark in QA with `delogo` (see `qa-ffmpeg.md`) — cheaper and
  higher-continuity than regenerating an approved shot.
- Stills used as Ken Burns shots should be generated at 1440×2560 (headroom for the pan).

## Motion (image-to-video)
- `generate_video` with a `start_image` role = the approved still (or the previous shot's end frame).
  **Start-image chaining is the continuity mechanism** — it holds wardrobe, light and identity across
  cuts far better than a fresh text-to-video. The reference master used Google Veo 3.1 Lite (9:16,
  720×1280 @24fps, audio off). Other models (Seedance, Kling) are available via `models_explore`.
- Match each clip's duration to the shot's need; the composition can trim, but generating close to the
  target avoids waste. Generate at the film's native fps.

## Audio
- VO + ambience + SFX: a text-to-audio provider (this repo used **ElevenLabs**, wired via
  `scripts/acquire-jetset-audio.ts` + `src/acquisition/`; the Artlist MCP `generate_voiceover` /
  Higgsfield `generate_audio` are alternatives). Prompt SFX/ambience for constant, event-free beds
  (see the prompts in `src/jetset/audio-provenance.json` for what passed the loop-seam/silence gates).
- Music bed: a music-generation model (this repo used **Google Lyria**; Artlist `generate_music` is an
  alternative). Prefer a bed that leaves narration room and builds emotionally rather than staying at
  constant energy.
- Everything audio goes through acquire → normalise → verify before the mix (see `architecture.md` §Audio).

## Batches & waiting
- For several independent generations, use the `*_batch` tools + `jobs_wait`, then one
  `show_generation_by_ids`. Follow each tool's own protocol (returned in its description).
