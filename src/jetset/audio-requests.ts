/**
 * jetset/audio-requests — the eight non-music sound assets for the LOCKED cut.
 *
 * Declared against the approved V3 edit (1440 frames @ 24fps = 60.000s). Windows below are the
 * real on-screen positions; frame numbers are given because the picture is locked and audio must
 * conform to it rather than the other way round.
 *
 * The music bed is deliberately ABSENT. It stays a manually selected premium licensed asset and
 * is added to the manifest only when supplied — see `manifest.ts`.
 *
 * Ambience prompts are written against the brief's constraints: natural, event-light, no
 * intelligible dialogue, no music, no risers or booms, and clean enough to loop. Generation is
 * asked for MORE than the window needs so the loop has headroom and the seam can be chosen.
 */

// `import type` is fully erased at compile time, so this declaration file can name the
// acquisition contract without ever pulling that layer into anything Remotion renders.
import type { AudioRequest } from "../acquisition";

/** Cue positions in the locked composition. Seconds are authoritative; frames are @24fps. */
export const CUE_WINDOWS = {
  ambRoomTone: { inSec: 0.0, outSec: 8.6, inFrame: 0, outFrame: 206 },
  sfxPhoneTap: { inSec: 7.0, outSec: 7.3, inFrame: 168, outFrame: 175 },
  sfxWhoosh: { inSec: 7.9, outSec: 9.3, inFrame: 190, outFrame: 223 },
  ambOcean: { inSec: 7.78, outSec: 15.08, inFrame: 187, outFrame: 362 },
  ambAccra: { inSec: 17.6, outSec: 24.58, inFrame: 422, outFrame: 590 },
  sfxLuggage: { inSec: 27.7, outSec: 30.2, inFrame: 665, outFrame: 725 },
  sfxSplash: { inSec: 37.6, outSec: 39.1, inFrame: 902, outFrame: 938 },
  ambBalconyWind: { inSec: 45.4, outSec: 60.0, inFrame: 1090, outFrame: 1440 },
} as const;

/** The four ambience beds — generated and auditioned FIRST, as the highest-risk category. */
export const ambienceRequests: AudioRequest[] = [
  {
    key: "ambRoomTone", kind: "ambience", loop: true, durationSeconds: 12, channels: 2, role: "ambience", targetPeakDb: -6,
    description:
      "Quiet empty domestic room tone. A still interior with a faint low hum and very distant muffled traffic outside a closed window. " +
      "Completely event-free: no voices, no footsteps, no clock, no birds, no music. Continuous and unchanging throughout, no fade in or out.",
  },
  {
    key: "ambOcean", kind: "ambience", loop: true, durationSeconds: 14, channels: 2, role: "ambience", targetPeakDb: -6,
    description:
      // v2: "waves breaking" produced 21dB of level swing and an audible loop point. Asking for a
      // constant distant wash instead of individual waves is what makes this usable as a bed.
      "A constant, even wash of distant ocean heard from a beach, like steady white noise with a gentle low-frequency roll. " +
      "Completely uniform from beginning to end at exactly the same volume throughout. No individual waves breaking, no swells, " +
      "no surges, no rising or falling, no gulls, no people, no voices, no boats, no music. Flat, continuous and unchanging.",
  },
  {
    key: "ambAccra", kind: "ambience", loop: true, durationSeconds: 14, channels: 2, role: "ambience", targetPeakDb: -6,
    description:
      "Busy West African open-air street market heard from within the crowd. A warm dense wash of many overlapping distant conversations " +
      "with no single voice clear enough to make out words, light passing traffic and general market activity. No music, no shouting, " +
      "no vehicle horns close to the microphone, no sudden events. Steady and continuous, no fade in or out.",
  },
  {
    key: "ambBalconyWind", kind: "ambience", loop: true, durationSeconds: 18, channels: 2, role: "ambience", targetPeakDb: -6,
    description:
      // v2: asking for "very quiet" produced a -48 dBFS file with too little bit depth to raise
      // cleanly. The mix decides the level; the recording only has to be clean and present.
      "Clearly audible steady wind on an elevated coastal clifftop, recorded at a strong healthy level, with a constant distant wash of surf far below. " +
      "Full and present, not faint. Completely uniform from beginning to end at exactly the same volume throughout. " +
      "No gusts, no swells, no rising or falling, no gulls, no voices, no rustling leaves, no music.",
  },
];

/**
 * The four one-shots — natural and restrained, never trailer-style.
 *
 * All declared stereo: the sound-effects endpoint delivers stereo regardless, and the mix places
 * these rather than relying on their imaging. An earlier `channels: 1` here rejected three good
 * files on a spec mismatch that had nothing to do with how they sounded.
 */
export const sfxRequests: AudioRequest[] = [
  {
    key: "sfxPhoneTap", kind: "sfx", loop: false, durationSeconds: 0.5, channels: 2, role: "sfx", targetPeakDb: -6,
    description:
      "A single short soft haptic buzz from a mobile phone resting on a wooden desk. Dry, close and subtle. " +
      "Not a notification chime, no melody, no reverb tail.",
  },
  {
    key: "sfxWhoosh", kind: "sfx", loop: false, durationSeconds: 1.5, channels: 2, role: "sfx", targetPeakDb: -9,
    description:
      // v2: the first take peaked at -0.3 dBFS with no headroom and read as aggressive. The mix
      // decides how present this is; the recording only has to be clean and gentle.
      "A soft, gentle, restrained rush of air moving past at a moderate distance, rising slowly and falling away smoothly. " +
      "Quiet and understated with plenty of dynamic headroom, never loud or aggressive, never peaking hard. " +
      "Natural moving air only. Not a synth riser, not a cinematic boom, whoosh-impact or transition hit, no metallic sweep, no reverb wash.",
  },
  {
    key: "sfxLuggage", kind: "sfx", loop: false, durationSeconds: 3, channels: 2, role: "sfx", targetPeakDb: -6,
    description:
      "Hard suitcase wheels rolling steadily across a polished stone floor in a large open lobby, with the natural bright reflections of the space. " +
      "Even and unhurried. No footsteps, no voices, no music.",
  },
  {
    key: "sfxSplash", kind: "sfx", loop: false, durationSeconds: 2, channels: 2, role: "sfx", targetPeakDb: -6,
    description:
      "One person entering a swimming pool feet-first: a single clean water impact followed by the natural settling of the water. " +
      "Bright and close. One event only, no repeated splashing, no voices, no music.",
  },
];

/** All eight, ambience first so the risky category is auditioned before spending on one-shots. */
export const jetSetAudioRequests: AudioRequest[] = [...ambienceRequests, ...sfxRequests];
