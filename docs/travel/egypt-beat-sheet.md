# Postcards from Africa · Episode 02 — Egypt: Beat Sheet (v2, decisions locked)

| | |
|---|---|
| **Format** | 1080×1920 vertical, ~95–100 s (voice-timed), 30 fps |
| **Look** | Watercolor travel journal: taped photo, pen route, passport stamp (same as episode 01) |
| **Guide** | The same nameless, faceless traveler, seen from behind: wide-brim tan hat, long wavy brown hair, mustard-yellow backpack, cream shirt, red patterned scarf, sage skirt |
| **Motion** | Kling 4.0 for hero shots · MiniMax H3 Max for atmosphere shots · layered code animation for in-between beats · map, captions, cards and stamps drawn in Remotion |
| **Audio** | ElevenLabs voiceover (Kimberly), ambient sound only (no music), word-by-word captions |
| **Tone** | Documentary-cozy: calm, curious, respectful |
| **Composition** | `PostcardsEgypt` (to build) → `src/postcards/egypt.ts` + the shared engine |

**Shot types:** **AI-K** Kling 4.0 hero clip · **AI-M** MiniMax atmosphere clip · **LAYER** painted plate animated in code · **CODE** drawn in Remotion

---

## Beats

### 0 · Hook — CODE
- **Picture:** A pen draws a timeline across the journal page with three pins: the Great Pyramid (~2560 BC), Cleopatra (~30 BC), the Moon landing (1969). Brackets measure the gaps: about 2,500 years, then about 2,000.
- **Narration:** "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid."
- **On screen:** The two bracket lengths, so the surprise is visible, not just heard.

### 1 · Title — CODE
- **Picture:** The Africa map draws in; the route line from the last episode runs from Morocco east to Egypt; the stamp lands.
- **Narration:** "This is Postcards from Africa. Stop two: Egypt."
- **On screen:** Location card with Egypt's flag; stamp "STOP 02 · EGYPT".

### 2 · The pyramids of Giza — AI-K (hero)
- **Picture:** Dawn on the Giza plateau. The traveler sits on a camel on a rise, seen from behind, looking out at the three pyramids as the sun comes up.
- **Narration:** "At Giza, the Great Pyramid was the tallest thing humans had ever built, and it held that record for nearly four thousand years."
- **Fact card:** "It's the only one of the Seven Wonders of the Ancient World still standing."

### 3 · The Great Sphinx — LAYER
- **Picture:** The Sphinx in warm late light, a pyramid behind it; drifting sand haze as a foreground layer.
- **Narration:** "Beside it, the Great Sphinx was carved from a single ridge of limestone, about seventy-three metres long."

### 4 · Khan el-Khalili, Cairo — LAYER
- **Picture:** An evening bazaar alley: hanging brass lamps, perfume bottles, stacked spices and textiles; the traveler small in the middle distance. Lamps sway in code.
- **Narration:** "In Cairo's Khan el-Khalili bazaar, merchants have been trading under these arches for more than six hundred years."
- **Local tip:** "Bargaining is expected. Start low and keep it friendly."

### 5 · Koshary — AI-M (atmosphere)
- **Picture:** Close-up of a steaming bowl of koshary on a café table: rice, lentils and pasta under tomato sauce and crispy onions; hands only.
- **Narration:** "Hungry? Try koshary: rice, lentils and pasta, topped with tomato sauce and crispy fried onions."
- **Say it:** "Ahlan — hello"

### 6 · A felucca on the Nile — AI-K (hero)
- **Picture:** Sunset at Aswan. The traveler sits in a white-sailed felucca drifting past granite boulders and palm-lined banks.
- **Narration:** "The Nile flows north for over six thousand kilometres, and most Egyptians live along its banks."
- **Fact card:** "Without the Nile, almost all of Egypt would be desert."

### 7 · Karnak, Luxor — LAYER
- **Picture:** The Great Hypostyle Hall: a forest of giant carved columns. The traveler is tiny at their base; the camera tilts slowly up.
- **Narration:** "At Karnak, in Luxor, one great hall holds a hundred and thirty-four giant stone columns."

### 8 · Valley of the Kings — LAYER
- **Picture:** Sun-baked valley walls, a tomb entrance; inside, painted hieroglyph walls fan open as a foreground layer.
- **Narration:** "Across the river, pharaohs were buried in hidden tombs. Tutankhamun's was found almost untouched in 1922."

### 8b · The Grand Egyptian Museum — LAYER
- **Picture:** The museum's soaring entrance atrium: the colossal standing statue of Ramesses II, a grand staircase lined with ancient statues rising behind; the traveler small at the statue's feet, looking up. A golden burial mask (painted, not a reproduction of any photo) as a foreground layer that rises into view.
- **Narration:** "Today, more than five thousand of his treasures are shown together for the first time, at the Grand Egyptian Museum beside the pyramids."
- **Fact card:** "A 3,200-year-old statue of Ramesses II, about 11 metres tall, greets visitors at the door."

### 9 · Abu Simbel — AI-K (hero)
- **Picture:** The four colossal seated statues of Ramesses II at sunrise; the traveler stands small at their feet looking up.
- **Narration:** "In the 1960s, these giant temples were cut into blocks and moved uphill to save them from a rising lake."
- **Fact card:** "Twice a year, sunrise lights up statues deep inside the temple."

### 10 · The Red Sea — AI-M (atmosphere)
- **Picture:** Underwater: a coral reef with drifting shoals of fish and shafts of sunlight. No people.
- **Narration:** "And to the east, the Red Sea's coral reefs are some of the best snorkelling spots on Earth."

### 11 · Traveler's notes — CODE
- **Picture:** A journal page fills with ticked notes.
- **Notes:**
  - **Best time:** October to April; summer in Luxor and Aswan is extremely hot.
  - **Budget:** $–$$, very good value.
  - **Money:** Egyptian pound; small tips (*baksheesh*) are customary for help and services.
  - **Language:** Arabic; English is common in tourist areas.
  - **Respect:** cover shoulders and knees at mosques and churches, and ask before photographing people.
- **Narration:** "Go between October and April, carry small change for tips, and cover up at religious sites."

### 12 · Next stop — CODE
- **Picture:** The passport page; the route line continues south from Egypt to Tanzania (Serengeti and Zanzibar sketch).
- **Narration:** "Next stop: Tanzania."
- **On screen:** "STOP 03 → TANZANIA"; stamp "VISITED · EGYPT".

**Narration:** about 225 words across 14 beats. **Estimated running time:** ~105 s once each scene is timed to its line.

---

## Production plan

**Painted plates to generate** (watercolor journal style; the traveler from behind where she appears; journal take 2 as the reference image on every generation):
1. Giza at dawn with the traveler on a camel (beat 2)
2. The Sphinx with a pyramid behind (beat 3) + a sand-haze foreground cut-out
3. Khan el-Khalili bazaar alley at evening (beat 4) + a hanging-lamps foreground cut-out
4. Koshary bowl close-up (beat 5)
5. Felucca on the Nile at sunset (beat 6)
6. Karnak's hypostyle hall, tall composition for a tilt (beat 7)
7. Valley of the Kings entrance (beat 8) + a painted-tomb-wall foreground cut-out
8. Abu Simbel at sunrise (beat 9)
9. Red Sea reef (beat 10)
10. Grand Egyptian Museum atrium with the Ramesses II statue (beat 8b) + a golden-mask foreground cut-out

**Estimated credits (Higgsfield):**

| Item | Count | Each | Total |
|---|---|---|---|
| Painted plates | 10 | 1 | 10 |
| Foreground cut-outs | 4 | 1 | 4 |
| Kling 4.0 hero clips (beats 2, 6, 9), 7–8 s | 3 | 15.75–18 | ~52 |
| MiniMax atmosphere clips (beats 5, 10) | 2 | 12.5–15 | ~28 |
| **Total** | | | **~94 credits** + a small retake buffer |

**ElevenLabs:** 14 voice lines (~$0.25) + about 10 ambient sounds (~$0.40): the Giza wind at dawn, camel bells, Cairo street murmur, bazaar chatter and a call to prayer faint in the distance (locked decision), café clatter and sizzling, a hushed museum hall with soft footsteps and murmurs, Nile water lapping and the sail rope creaking, footsteps echoing in a stone hall, desert wind in the valley, an underwater bubble ambience, plus the reused pen, stamp and notes sounds.

**Normalize every new sound file** the same way as Morocco: ambient beds to ≈ -32 dB RMS and effects to ≈ -30 dB before mixing.

**Engine work needed** (the Morocco engine has a few Morocco-only parts):
- [ ] A new **timeline** hook scene (beat 0); the strait map stays for Morocco.
- [ ] A per-country **flag** (Egypt: red, white and black bands with the gold eagle); the title card currently draws Morocco's flag.
- [ ] A **multi-stop route** on the title and next-stop maps, so the line shows Morocco → Egypt → Tanzania building up across the season.
- [ ] A **tilt** motion for the Karnak plate (the engine has push and pan only).

---

## Facts to verify before publishing

- [ ] Great Pyramid built c. 2560 BC; tallest human-made structure for ~3,800 years (until Lincoln Cathedral's spire, c. 1311)
- [ ] Cleopatra VII died 30 BC; the Moon landing was 1969 (≈2,000 years apart vs ≈2,500)
- [ ] Only surviving Wonder of the Ancient World
- [ ] Sphinx length ≈ 73 m, carved from one limestone mass
- [ ] Khan el-Khalili dates to the late 1300s ("more than six hundred years")
- [ ] Nile length (≈6,650 km) and "most Egyptians live along its banks"
- [ ] Karnak's Great Hypostyle Hall: 134 columns
- [ ] Tutankhamun's tomb found in 1922, largely intact
- [ ] Abu Simbel relocated 1964–68 because of Lake Nasser; the sun alignment twice a year (around 22 February and 22 October)
- [ ] Best-season advice and tipping guidance
- [x] Grand Egyptian Museum: fully opened 1 November 2025 beside the Giza pyramids; Tutankhamun's complete collection (5,000+ objects) shown together for the first time; colossal Ramesses II statue (~11 m, 83 t) in the atrium. Sources: [Al-Monitor](https://www.al-monitor.com/originals/2025/11/egypt-officially-opens-grand-museum-near-pyramids), [Euronews](https://www.euronews.com/2025/11/05/the-1-billion-grand-egyptian-museum-opens-to-the-public-showcasing-tutankhamun-treasures), [Khaleej Times](https://www.khaleejtimes.com/world/mena/grand-egyptian-museum-opening-5-highlights). Total artefact counts differ between sources, so none is used.
- [ ] Ramesses II statue age (~3,200 years) and current visiting hours before publishing

---

## Decisions (locked)

1. **Hook:** the Cleopatra timeline.
2. **Call to prayer:** in the bazaar ambience, faint and in the distance.
3. **Next stop:** Tanzania.
4. **Grand Egyptian Museum:** added as beat 8b, right after the Valley of the Kings.
