# public/nyelle — Nyelle's footage for the NyelleReel

The NyelleReel is the LuxuryReel format with a through-line: Nyelle, a fictional character who
exists on Higgsfield as the Soul "Urban Elegance Unveiled" (`soul_id
cec95fb9-101e-4739-88b8-a86686ec0cd5`, legacy `soul` type — it binds fine through the `soul_2`
image model). Twenty-four of the reel's shots reuse `public/luxury/`; the twelve `ny-*` clips here
are hers. Media in this folder is gitignored.

## How each Nyelle clip was made

1. **Still** — `generate_image`, model `soul_2` + the soul id, 9:16, quality 2k (~0.12 credits).
   Prompt skeleton: *"Photograph, vertical, night, dark and moody, [light], shallow depth of field.
   A woman with long loose black waves [action/place]; black silk slip dress under an open camel
   wool coat, small gold hoops. Photoreal, 35mm film look. No text, no typography, no captions,
   no logos."* Say "Photograph", never "editorial still" — the latter makes the model lay out
   fake magazine type in the frame. Originals are kept in `stills/`.
2. **Clean** — Soul 2 stamps a translucent four-point star near the bottom-right (sometimes a
   second one top-right). It is not metadata; it is pixels, and its position varies ~50 px. The
   fix that worked: `delogo` on a 100×175 px box at the bottom-right (x≈1025, y≈1840 of
   1152×2048), then crop a 3 % border and rescale to 1080×1920. Cleaned stills are in
   `stills-clean/`. Check the corners on a contact sheet before animating.
3. **Upload** — `media_upload` (presigned PUT) + `media_confirm`, so the clean still can be the
   `start_image`.
4. **Motion** — `generate_video`, model `kling3_0`, mode pro, sound off, 9:16, 5 s, with the
   cleaned still as `start_image` (7.5 credits). Prompts describe one small realistic action and a
   slow camera move; the start image carries identity and wardrobe.

## Wardrobe lock

One look for the whole reel: black silk slip dress, open camel wool coat, small gold hoops, long
loose black waves. A hammered gold cuff appears in the hands-only shot.

## The shot list (12 Nyelle shots)

| id | Beat | Palette |
|---|---|---|
| `ny-entrance` | Hotel entrance under amber lanterns, looking off frame | amber |
| `ny-window` | Penthouse window from behind, city below | navy |
| `ny-bar` | At the bar in profile, coupe in hand | amber |
| `ny-stairs` | Descending a marble spiral staircase | cream |
| `ny-car` | Back seat, violet ambient light, city passing | violet |
| `ny-balcony` | Balcony rail, Eiffel Tower behind | gold |
| `ny-elevator` | Gold elevator, doors opening | gold |
| `ny-cuff` | Hands only: clutch, cuff, rings | champagne |
| `ny-rooftop` | Rooftop edge, skyline, wind in hair | navy |
| `ny-corridor` | Walking toward camera down a hotel corridor | cream |
| `ny-jet` | Top of the jet stairs, glance back | silver |
| `ny-turn` | Turns to camera, faint smile — the end-card hold | gold |

## Spec

Same as LuxuryReel: vertical 9:16, dark and warm, ≥ 1.5 s per clip. Nyelle's cuts are the long
beats (1.0–1.4 s, 3.6 s for the end-card); a face at half a second reads as a glitch.
