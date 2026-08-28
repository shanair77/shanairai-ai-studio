/**
 * jetset/CampaignConfigTwin30 — the 30-second twin-led cutdown.
 *
 * SAME EDIT AS THE LOCKED 30, DIFFERENT PICTURE. This mirrors `CampaignConfig30` exactly — the
 * same ten shots, the same durations, the same four-line narration and the same audio/music mix
 * imported verbatim — and swaps only the media, by sourcing each shot from the twin master. That
 * isolation is deliberate: the cutdown decisions (which act survives, where the music sits, which
 * cues carry a J-cut) were measured once on the locked film and are not re-litigated here.
 *
 * The one earned dissolve (6.1 balcony sunset -> 6.2 profile) survives because both shots are in
 * the cut and the twin master carries the dissolve on 6.2, exactly as the locked film does.
 *
 * TIMELINE: 720 frames at 24fps = 30.000s. Sum(scene) 30.8s - Sum(transition) 0.8s.
 */

import { type CompositionSchema } from "../composition";
import { JET_SET } from "./brand";
import { jetSetCampaign30Config } from "./CampaignConfig30";
import { SHOT, twinShotFrom } from "./deriveTwin";

export const jetSetTwin30Config: CompositionSchema = {
  id: "JetSet-Twin-Cutdown-30",
  format: "vertical",
  fps: 24,
  duration: 30,
  brand: JET_SET,

  // The locked 30's mix, unchanged — same narration subset, same cues, same bed in-point.
  audio: jetSetCampaign30Config.audio,
  music: jetSetCampaign30Config.music,

  scenes: [
    twinShotFrom(SHOT.deskExhale, 3.2),
    twinShotFrom(SHOT.balconyDoors, 2.2),
    twinShotFrom(SHOT.sandWalk, 2.4),
    twinShotFrom(SHOT.accraMarket, 2.2),
    twinShotFrom(SHOT.headWrap, 2.4),
    twinShotFrom(SHOT.hotelArrival, 2.4),
    twinShotFrom(SHOT.poolJump, 2.2),
    twinShotFrom(SHOT.balconySunset, 4.2),
    twinShotFrom(SHOT.faceProfile, 4.0),
    twinShotFrom(SHOT.endcard, 5.6),
  ],
};
