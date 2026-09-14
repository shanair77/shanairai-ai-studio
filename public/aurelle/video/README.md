# AURELLE — generated video clips

The finished `ShanairAICommercial45` is cut from **image-to-video clips** generated from the 13
master stills in `public/aurelle/`. Drop the MP4s here, then run:

```bash
npm run aurelle:scan-video
```

That regenerates `src/aurelle/videoManifest.ts`; every shot whose clip is present switches from
its still placeholder to real footage automatically — **no edit changes required**. Any clip not
yet present keeps rendering its still with the editorial camera move, so the composition always
renders.

## Specs (all clips)

- **Format:** 1080×1920, 9:16, H.264 `.mp4`, 30fps (24/25fps also fine — Remotion reseeks).
- **Length:** ≥ the shot's on-screen duration below (extra tail is fine; the edit trims it).
- **Protect from warping:** faces, hands, product geometry, architecture, branding must stay
  geometrically stable. Motion is camera + environment + natural subject movement only — no
  morphing, no fake walk cycles that distort limbs, no talking mouths.
- **Grade:** keep each source's native grade. Do **not** recolor the industry clips (10–13) into
  the AURELLE palette.

## Required clips (used on screen)

| File | Slot | On-screen | Motion brief |
|---|---|---|---|
| `01-product.mp4` | product | ~3.2s (fragments) | slow push/orbit, champagne highlight travels the hardware, light evolves; bag geometry identical |
| `02-arrival.mp4` | arrival | ~3.2s | she completes the exit from the sedan — step, weight transfer, coat momentum, bag swings; chauffeur steadies door; photographers shift; **multiple flashes fire**; reflections move |
| `03-clasp.mp4` | clasp | ~2.5s | fingertips apply pressure, clasp components close, CLICK; tiny highlight crosses the metal; extremely restrained |
| `04-walk.mp4` | walk | ~2.6s | she actually WALKS — natural gait, coat + bag swing, fabric inertia, slight head move; camera tracks backward; foreground column passes; architectural parallax |
| `05-gold.mp4` | gold | ~0.3s | tiny wrist/hand move + moving jewellery reflection |
| `05-heel.mp4` | heel | ~0.3s | the heel completes its footfall |
| `05-stitch.mp4` | stitch | ~0.3s | macro camera travel / light moving over leather + stitch |
| `05-parfum.mp4` | parfum | ~0.3s | the fragrance mist actually moves |
| `05-eyes.mp4` | eyes | ~0.3s | natural eye movement or a subtle blink |
| `05-icon.mp4` | montageIcon | ~0.45s (holds) | subtle product camera move / highlight |
| `06-hero.mp4` | hero | ~1.6s → **freeze** | very restrained: breathing, minute posture/silk shift, slight light + camera push. Motion must exist right up to the freeze at 0:15 so the freeze reads. |
| `09-flagship.mp4` | flagship | reveal card | pedestrians walk, glass reflections change, subtle camera drift; architecture stable |
| `10-restaurant.mp4` | restaurant | ~1.0s | chef's hand completes the garnish, tweezers move, steam rises, diners move; restrained push |
| `11-real-estate.mp4` | realEstate | ~1.0s | couple walks to entrance, pool water + reflections move, landscaping breeze; camera advances |
| `12-travel.mp4` | travel | ~1.1s | traveller steps onto terrace and turns to the view, hair/linen/curtain move, sea + pool ripple; camera advances from suite to terrace |
| `13-beauty-founder.mp4` | founder | ~1.2s (also in grid) | subtle founder move, breathing, micro head/hair; product stable; precision light across the pump |

## Optional clips (used if present; otherwise the still is shown)

| File | Slot | Where |
|---|---|---|
| `07-beauty.mp4` | beauty | the "THE CAMPAIGN?" reveal card |
| `08-icon.mp4` | icon | the receding hero / deconstruction plate |

The reveal cards (09/07/08 and the receding hero) intentionally sit **inside** the Remotion
deconstruction UI (selection boxes, layer labels, code), so a clip there reads as "generated
footage being deconstructed" — which is on-message.
