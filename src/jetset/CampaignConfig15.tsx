/**
 * jetset/CampaignConfig15 — the 15-second cutdown.
 *
 * TYPOGRAPHY CARRIES THE SCRIPT. At this length there is no room to narrate and still let the
 * picture breathe, so only two lines survive: the opening question and the sign-off (9.9s of
 * the 15s). Breathe, Discover and Your Next Story are already on screen as type — the four
 * shots carrying them are kept precisely so the words do the work the dropped narration did.
 *
 * ONE SHOT PER ACT, and Act 5 is cut entirely: at 2s a shot the celebration cannot register as
 * anything but a flash, and losing it buys the payoff and endcard the time they need to land.
 *
 * MUSIC IS DELIBERATELY UNDYNAMIC HERE. The master and the 30s both ride the bed's decay onto
 * the payoff, but that arrangement takes ten seconds to fall and recover and this whole cut is
 * fifteen. Rather than crush it, the in-point moves to 69s — the track's sustained late
 * section — so the 15 seconds run at consistent energy and finish on the bed's loudest bar.
 *
 * The splash, luggage and Accra cues are dropped for the same reason as Act 5: a one-shot that
 * lands under a 2s shot reads as a click, not a place.
 *
 * TIMELINE: 360 frames at 24fps = 15.000s. Sum(scene) 15.8s - Sum(transition) 0.8s.
 */

import { type CompositionSchema } from "../composition";
import { JET_SET } from "./brand";
import { SHOT, shotFrom } from "./derive";

export const jetSetCampaign15Config: CompositionSchema = {
  id: "JetSet-Cutdown-15",
  format: "vertical",
  fps: 24,
  duration: 15,
  brand: JET_SET,

  audio: [
    { asset: "vo01Hook", role: "voiceover", startAt: 0.4, label: "VO 1 · hook" },
    { asset: "vo10Signoff", role: "voiceover", startAt: 9.0, label: "VO 10 · sign-off" },

    { asset: "ambRoomTone", role: "ambience", startAt: 0.0, duration: 2.2, volume: 4.0, loop: false, fadeIn: 0.4, fadeOut: 0.6, label: "AMB · room tone" },
    { asset: "sfxWhoosh", role: "sfx", startAt: 1.52, volume: 0.35, fadeOut: 0.3, label: "SFX · whoosh" },
    { asset: "ambOcean", role: "ambience", startAt: 1.4, duration: 2.8, volume: 0.27, loop: false, fadeIn: 0.3, fadeOut: 0.8, label: "AMB · ocean (J-cut)" },
    { asset: "ambBalconyWind", role: "ambience", startAt: 7.7, duration: 7.3, volume: 0.48, loop: false, fadeIn: 0.5, fadeOut: 2.0, label: "AMB · balcony wind (L-cut)" },
  ],

  music: {
    asset: "musicBed",
    startAt: 2.0,
    trimBefore: 69,
    volume: 0.55,
    loop: false,
    fadeIn: 0.2,
    fadeOut: 2.0,
    ducking: { level: 0.28, ramp: 0.35 },
  },

  scenes: [
    shotFrom(SHOT.deskExhale, 2.0),
    shotFrom(SHOT.sandWalk, 2.2),
    shotFrom(SHOT.headWrap, 2.0),
    shotFrom(SHOT.hotelArrival, 2.0),
    shotFrom(SHOT.balconySunset, 2.6),
    shotFrom(SHOT.faceProfile, 2.4),
    shotFrom(SHOT.endcard, 2.6),
  ],
};
