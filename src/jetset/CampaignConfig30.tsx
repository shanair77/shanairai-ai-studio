/**
 * jetset/CampaignConfig30 — the 30-second cutdown.
 *
 * A COMPRESSION OF THE MASTER, NOT A SUMMARY. Ten of the seventeen shots survive, chosen so
 * every act still lands once: ordinary life, the escape, Ghana, Dubai, the celebration, the
 * payoff, the endcard. All four typography beats are kept — Breathe, Discover, Live and Your
 * Next Story — because at this length the words carry the script faster than narration can.
 *
 * NARRATION IS CUT TO FOUR LINES, not compressed. The master runs 36.9s of voiceover in 60s
 * (62%); holding that ratio here allows ~18.6s. VO 1, 2, 9 and 10 total 18.3s and keep the
 * shape intact: the question, one "somewhere", the campaign line, the sign-off. The dropped
 * lines are the ones whose typography already says them on screen.
 *
 * THE PHONE TAP IS DROPPED because shot 1.3 is — the cue existed to sell a reach that is no
 * longer in the cut. Every other sound cue survives at its master level, repositioned onto
 * this timeline's boundaries and keeping its J-cut or L-cut lead.
 *
 * MUSIC IS DELIBERATELY UNDYNAMIC HERE, and this was measured rather than assumed. An earlier
 * in-point of 24.8s rode the bed's decay onto the payoff the way the master does — and put a
 * five-second hole at -33 to -37 dBFS across 14-19s, because the breakdown needs ten seconds
 * to fall and recover and this cut has only 7.4s between the payoff and the endcard. There is
 * no in-point that fits it: landing the recovery on the endcard forces the decay into the
 * middle of the montage, and landing the decay on the payoff silences the endcard.
 *
 * So the in-point moves to 56s — the bed's sustained late section — and the 30 seconds run at
 * consistent energy, finishing on the track's loudest bar. The release is a 60-second luxury.
 *
 * TIMELINE: 720 frames at 24fps = 30.000s. Sum(scene) 30.8s - Sum(transition) 0.8s.
 */

import { type CompositionSchema } from "../composition";
import { JET_SET } from "./brand";
import { SHOT, shotFrom } from "./derive";

export const jetSetCampaign30Config: CompositionSchema = {
  id: "JetSet-Cutdown-30",
  format: "vertical",
  fps: 24,
  duration: 30,
  brand: JET_SET,

  audio: [
    { asset: "vo01Hook", role: "voiceover", startAt: 0.6, label: "VO 1 · hook" },
    { asset: "vo02Breathe", role: "voiceover", startAt: 5.5, label: "VO 2 · breathe" },
    { asset: "vo09NextStory", role: "voiceover", startAt: 19.9, label: "VO 9 · next story" },
    { asset: "vo10Signoff", role: "voiceover", startAt: 24.3, label: "VO 10 · sign-off" },

    // Act 1 is 3.2s here rather than 8.4s, so the room tone is correspondingly short.
    { asset: "ambRoomTone", role: "ambience", startAt: 0.0, duration: 3.4, volume: 4.0, loop: false, fadeIn: 0.5, fadeOut: 0.8, label: "AMB · room tone" },
    // 0.48s ahead of the 3.2s smash cut — the master's own lead.
    { asset: "sfxWhoosh", role: "sfx", startAt: 2.72, volume: 0.35, fadeOut: 0.3, label: "SFX · whoosh" },
    // J-cut: 0.6s ahead of the picture, as in the master.
    { asset: "ambOcean", role: "ambience", startAt: 2.6, duration: 5.2, volume: 0.27, loop: false, fadeIn: 0.4, fadeOut: 1.2, label: "AMB · ocean (J-cut)" },
    // J-cut: 0.4s ahead of Ghana.
    { asset: "ambAccra", role: "ambience", startAt: 7.4, duration: 5.0, volume: 0.3, loop: false, fadeIn: 0.4, fadeOut: 1.0, label: "AMB · Accra street (J-cut)" },
    { asset: "sfxLuggage", role: "sfx", startAt: 12.5, volume: 0.26, fadeIn: 0.2, fadeOut: 0.5, label: "SFX · luggage on marble" },
    { asset: "sfxSplash", role: "sfx", startAt: 15.2, volume: 0.9, label: "SFX · pool splash" },
    // L-cut: leads the payoff by 0.5s and carries unbroken through the endcard.
    { asset: "ambBalconyWind", role: "ambience", startAt: 16.5, duration: 13.5, volume: 0.48, loop: false, fadeIn: 0.6, fadeOut: 2.0, label: "AMB · balcony wind (L-cut)" },
  ],

  music: {
    asset: "musicBed",
    startAt: 3.2,
    trimBefore: 56,
    volume: 0.55,
    loop: false,
    fadeIn: 0.2,
    fadeOut: 2.5,
    ducking: { level: 0.28, ramp: 0.35 },
  },

  scenes: [
    shotFrom(SHOT.deskExhale, 3.2),
    shotFrom(SHOT.balconyDoors, 2.2),
    shotFrom(SHOT.sandWalk, 2.4),
    shotFrom(SHOT.accraMarket, 2.2),
    shotFrom(SHOT.headWrap, 2.4),
    shotFrom(SHOT.hotelArrival, 2.4),
    shotFrom(SHOT.poolJump, 2.2),
    shotFrom(SHOT.balconySunset, 4.2),
    shotFrom(SHOT.faceProfile, 4.0),
    shotFrom(SHOT.endcard, 5.6),
  ],
};
