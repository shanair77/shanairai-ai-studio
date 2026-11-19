# Postcards from Africa · Episode 01 — Morocco: Beat Sheet (v2, produced)

Faceless travel cartoon series, Africa season, stop 01.

| | |
|---|---|
| **Format** | 1080×1920 vertical, ~74 s, 30 fps |
| **Look** | Style 5 — illustrated watercolor travel journal (taped photo, pen route, passport stamp) |
| **Guide** | Faceless traveler seen from behind: wide-brim tan hat, mustard-yellow backpack, cream shirt, scarf |
| **Motion** | Kling 4.0 for hero shots · MiniMax H3 Max for "atmosphere" shots (nothing walks) · layered code animation for in-between beats · map, captions, cards and stamp drawn in Remotion |
| **Tone** | Documentary-cozy: calm, curious, respectful. "Places you'll want to see for yourself." |
| **Audio** | ElevenLabs voiceover (Kimberly — warm, calm, natural), ambient sound only (no music), word-by-word captions |
| **Composition** | `PostcardsMorocco` → `src/postcards/` (engine + `morocco.ts` data), media in `public/postcards/morocco/` |

**Shot types**

- **AI-K** — Kling 4.0 image-to-video from a painted plate (~11.25 credits / 5 s)
- **AI-M** — MiniMax H3 Max, atmosphere only (~12.5 credits / 5 s)
- **LAYER** — painted plate split into layers, animated in code (~0.5 credits)
- **CODE** — fully drawn in Remotion (free)

---

## Beats

### 0 · Hook — 3 s · CODE
- **Picture:** Pen draws the coastlines of Spain and Morocco on the journal page; a paper plane skims the gap between them.
- **Narration:** "Here, Africa and Europe are just 14 kilometres apart."
- **On screen:** "14 km" scribbled across the Strait of Gibraltar.

### 1 · Fly-in and title — 4 s · CODE
- **Picture:** The map pulls back to the whole of Africa, the dot pulses on Morocco, and the stamp slams down.
- **Narration:** "Stop one on our trip around Africa: Morocco."
- **On screen:** Location card (map, flag, "Morocco · North Africa"); stamp "STOP 01 · MOROCCO".

### 2 · Marrakech souks — 7 s · AI-K (hero)
- **Picture:** Journal take 2 (already made): the traveler looks up at the lanterns, then walks into the alley.
- **Narration:** "In Marrakech's old medina, alleys of lantern-makers, spice sellers and rug weavers wind for miles."
- **Fact card:** "The medina is a UNESCO World Heritage Site."

### 3 · Jemaa el-Fnaa at dusk — 7 s · AI-K (hero)
- **Picture:** The traveler at the edge of the great square as the sun sets: food-stall smoke rising, musicians in a ring, strings of lights coming on.
- **Narration:** "At sunset, the main square becomes an open-air theatre of storytellers, musicians and food stalls."
- **Fact card:** "UNESCO lists the square's living traditions as cultural heritage."

### 4 · Koutoubia minaret — 5 s · LAYER
- **Picture:** The minaret against a pink sky; palm silhouettes drift past at different depths.
- **Narration:** "Its 12th-century minaret still sets the skyline. No building in the old city may stand taller."
- **Etiquette tip:** "Most Moroccan mosques are open to Muslims only. Admire them from outside."

### 5 · Mint tea — 6 s · AI-M (atmosphere)
- **Picture:** Close-up of a hand pouring mint tea from high above a small glass; steam curls; a brass tray. No faces.
- **Narration:** "Mint tea is poured from high up to make it foam. Accepting a glass is a warm way to say hello."
- **Local phrase:** "Shukran" — *thank you*.

### 6 · Fes, the world's oldest university — 6 s · LAYER
- **Picture:** A tiled courtyard with a fountain; pages of an old manuscript fan open in the foreground.
- **Narration:** "In Fes, a university founded in 859 by a woman, Fatima al-Fihri, is still teaching today."
- **Fact card:** "Al-Qarawiyyin: often called the world's oldest operating university."

### 7 · Chefchaouen, the blue city — 6 s · AI-K (hero)
- **Picture:** The traveler climbs blue-washed steps in a mountain town; a cat watches from a doorway.
- **Narration:** "Up in the Rif Mountains, Chefchaouen is painted almost entirely blue — and nobody fully agrees why."
- **On screen:** Three handwritten theories: "the sky? · keeping cool? · tradition?"

### 8 · Aït Benhaddou — 5 s · LAYER
- **Picture:** A mud-brick fortress village on a hillside at golden hour; the camera pans slowly across it.
- **Narration:** "This earthen fortress village has stood in for ancient worlds in dozens of films."
- **Fact card:** "Aït Benhaddou: UNESCO World Heritage Site."

### 9 · The Sahara — 8 s · AI-K (hero)
- **Picture:** The traveler rides a camel along the crest of a huge orange dune; a line of camels stretches behind; long shadows.
- **Narration:** "Further south, the dunes of Erg Chebbi rise up to around 150 metres — taller than the Koutoubia's minaret."
- **On screen:** A small scale drawing: dune vs. minaret.

### 10 · A night in the desert — 5 s · AI-M (atmosphere)
- **Picture:** A desert camp under a sky packed with stars; a lantern glows by a tent. No people in the foreground.
- **Narration:** "Spend a night out here, and you'll see more stars than you knew existed."

### 11 · Traveler's card — 8 s · CODE
- **Picture:** A journal page fills with handwritten notes, each ticking in.
- **Notes:**
  - **Best time:** spring (Mar–May) and autumn (Sep–Nov). Summer inland is very hot, and desert nights get cold in winter.
  - **Budget:** $$ — great value, especially outside the big hotels.
  - **Money:** the Moroccan dirham. Change money or use cash machines on arrival.
  - **Languages:** Arabic and Amazigh (Berber) are official; French is widely spoken.
  - **Respect:** dress modestly, ask before photographing people, and expect to bargain in the souks.
- **Narration:** "Go in spring or autumn, dress modestly, and bargain with a smile."

### 12 · Stamp and next stop — 4 s · CODE
- **Picture:** The passport page closes; the route line draws east across North Africa to a pyramid sketch.
- **Narration:** "Next stop: Egypt."
- **On screen:** "STOP 02 → EGYPT".

**Running time:** 74 s. **Narration:** about 190 words (~2.6 words/s — comfortable to read on screen or to voice).

---

## Production plan

**Painted plates to generate** (watercolor journal style, traveler from behind when she appears):
1. Jemaa el-Fnaa at dusk (beat 3)
2. Koutoubia minaret and palms, split into 3 layers (beat 4)
3. Mint tea pour close-up (beat 5)
4. Fes courtyard + manuscript, split into layers (beat 6)
5. Chefchaouen blue steps (beat 7)
6. Aït Benhaddou panorama (beat 8)
7. Sahara camel crest (beat 9)
8. Desert camp under stars (beat 10)

Beat 2 reuses the existing journal take 2 Kling clip. Beats 0, 1, 11 and 12 are drawn in code.

**Estimated credits (Higgsfield):**

| Item | Count | Each | Total |
|---|---|---|---|
| Painted plates (higher quality for final) | 8 | ~1–2 | ~8–16 |
| Kling 4.0 hero clips (beats 3, 7, 9) | 3 | 11.25 | ~34 |
| MiniMax atmosphere clips (beats 5, 10) | 2 | 12.5 | 25 |
| Layer splits (beats 4, 6, 8) | ~6 images | ~0.5 | ~3 |
| **Total** | | | **~70–80 credits** + a buffer for 1–2 retakes |

**Consistency rule for every plate prompt:** "the same traveler seen strictly from behind: wide-brim tan hat, long wavy brown hair, mustard-yellow backpack, cream shirt, red patterned scarf, sage skirt; face never visible." Use journal take 2 as an image reference on every generation.

---

## Facts to verify before publishing

Everything above is written to be accurate, but these items change or are easy to overstate. Check each one with a current source just before the episode goes out:

- [ ] Strait of Gibraltar narrowest width ≈ 14 km
- [ ] Koutoubia minaret height (commonly ~77 m) and the "no building taller" rule in the medina
- [ ] Al-Qarawiyyin founding date (859) and "oldest operating university" framing
- [ ] Erg Chebbi dune heights (up to ~150 m)
- [ ] UNESCO listings: Marrakech medina, Jemaa el-Fnaa (intangible heritage), Aït Benhaddou
- [ ] Best-season advice and dirham cash guidance
- [ ] Visa rules are deliberately left out (they vary by passport) — add a "check your entry rules" line if wanted

---

## Decisions (locked)

1. **Series name:** *Postcards from Africa*
2. **Voice:** ElevenLabs voiceover — Kimberly (warm, calm, natural). One file per beat in `vo/`; each beat is timed to its line.
3. **Sound:** ambient only, no music — a crossfading bed per location plus one-shot effects (pen, stamp, tea pour, notes). All files normalized: beds ≈ -32 dB RMS, effects ≈ -30 dB, voice ≈ -20 dB.
4. **Traveler:** nameless.
5. **Motion:** Kling 4.0 for hero shots, MiniMax H3 Max for atmosphere shots, layered code animation for the rest.

## As produced

- Running time **97 s** (voice-timed; the draft estimated 74 s).
- Spend: ~95 Higgsfield credits (10 plates + layers, 3 Kling clips, 2 MiniMax clips) and about $0.80 of ElevenLabs credits (voice + 12 ambient effects).
- Narration line for beat 1 became "This is Postcards from Africa. Stop one: Morocco." Beat 9's line was split into two sentences for pacing.
