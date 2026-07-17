# public/ — static assets

Files here are served via Remotion's `staticFile()` and referenced by asset definitions
(`source: "images/…"`). See [docs/FONTS.md](../docs/FONTS.md) is unrelated; for assets see the
asset engine (`src/assets`) and ADR-003.

## Test fixtures

Tiny, repository-safe media used only by the asset-engine render tests (Phase 15). They are
deliberately minimal — solid colors / a short tone — not sample content.

| File | Purpose | Size |
|---|---|---|
| `images/fixture.png` | image asset render test (32×32 solid) | ~105 B |
| `svg/fixture.svg` | SVG-file asset render test | ~317 B |
| `audio/fixture.wav` | audio asset render test (0.5s 440 Hz tone, 8 kHz mono) | ~8 KB |
| `video/fixture.mp4` | video asset render test (64×64, 15 frames solid) | ~25 KB |

Real project assets (brand logos, background media, music) are supplied per video/brand and are
not committed to the framework.
