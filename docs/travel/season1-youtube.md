# Postcards from Africa · Season 1 — YouTube upload notes

**Season 1 is the whole Africa run.** It grows with every new African stop: add the episode to `SEASON_1` in `src/postcards/seasons.ts` (in travel order), re-render `PostcardsSeason1`, and update the chapters below. Each destination also stays a standalone vertical Short.

| | |
|---|---|
| **Long-form** | `PostcardsSeason1` · 1920×1080, 30 fps → `out/PostcardsFromAfrica-Season1-Journal.mp4` |
| **Stops so far** | 5: Morocco, Egypt, Tanzania, Victoria Falls, Okavango Delta · **9 min 0 s** |
| **Shorts** | `PostcardsMorocco`, `PostcardsEgypt`, `PostcardsTanzania`, `PostcardsVictoriaFalls`, `PostcardsOkavango` · 1080×1920, 96–119 s each |
| **Layout** | Open journal: picture taped on the left page; place, fact note, mini map and handwritten narration on the right (`src/postcards/Journal.tsx`) |
| **End screen** | The last 14 s are an end card with the season route; the right page is left clear for YouTube's end-screen elements (subscribe button, next video) |

## Suggested title

Africa in 9 Minutes: Morocco to the Okavango Delta | Postcards from Africa · Season 1

## Description (paste as is; chapters must start at 0:00)

A hand-painted travel journal across Africa: five stops, their history, wildlife and food, and practical tips for your own trip.

0:00 Stop 01 · Morocco
1:37 Stop 02 · Egypt
3:29 Stop 03 · Tanzania
5:28 Stop 04 · Victoria Falls
7:09 Stop 05 · Okavango Delta
8:45 Season map & what's next

Next stop: Namibia.

Animation made with AI-assisted illustration and narration. Facts were checked in November 2026; prices, visa and currency rules change, so confirm them before you travel.

## Upload checklist

- Upload the master, not a phone copy.
- **Replacing an earlier, shorter upload:** YouTube doesn't let you swap the video file of a published upload. If an earlier version is already public, upload this as a new video and point the old one's end screen at it (or unlist the old one).
- **Altered or synthetic content:** this is a stylised watercolor cartoon, so it is unlikely to need YouTube's disclosure label (meant for realistic footage). Read YouTube's "Disclosing altered or synthetic content" help page before the first upload and tick it if unsure.
- **Shorts:** link each Short to this long video with YouTube's "related video" field so viewers can move from the Short to the full season.
- Chapter times come from the episode data (`seasonChapters` in `src/postcards/Journal.tsx`); recompute them whenever a stop is added or an episode is re-timed.
