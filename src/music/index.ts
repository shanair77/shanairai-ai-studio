/**
 * music/ — Audio & music track registry.
 *
 * Metadata and `staticFile()` references for background music, stingers, and SFX:
 * track id, source path, bpm (for beat-synced motion), loop points, and mood/brand
 * tags. Playback uses `<Audio>` from `@remotion/media`.
 *
 * The actual audio files live in `public/` (e.g. `public/audio/…`) so `staticFile()`
 * can resolve them — this module is the code-side catalog, not the media itself.
 */

export {};
