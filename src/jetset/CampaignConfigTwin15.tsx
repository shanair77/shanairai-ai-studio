/**
 * jetset/CampaignConfigTwin15 — the 15-second twin-led cutdown.
 *
 * SAME EDIT AS THE LOCKED 15, DIFFERENT PICTURE. It mirrors `CampaignConfig15` — the same seven
 * shots, the same durations, the two surviving narration lines and the same mix imported
 * verbatim — and changes only the media, sourced from the twin master. Act 5 is cut entirely and
 * typography carries Breathe / Discover / Your Next Story, exactly as in the locked cutdown.
 *
 * TIMELINE: 360 frames at 24fps = 15.000s. Sum(scene) 15.8s - Sum(transition) 0.8s.
 */

import { type CompositionSchema } from "../composition";
import { JET_SET } from "./brand";
import { jetSetCampaign15Config } from "./CampaignConfig15";
import { SHOT, twinShotFrom } from "./deriveTwin";

export const jetSetTwin15Config: CompositionSchema = {
  id: "JetSet-Twin-Cutdown-15",
  format: "vertical",
  fps: 24,
  duration: 15,
  brand: JET_SET,

  // The locked 15's mix, unchanged.
  audio: jetSetCampaign15Config.audio,
  music: jetSetCampaign15Config.music,

  scenes: [
    twinShotFrom(SHOT.deskExhale, 2.0),
    twinShotFrom(SHOT.sandWalk, 2.2),
    twinShotFrom(SHOT.headWrap, 2.0),
    twinShotFrom(SHOT.hotelArrival, 2.0),
    twinShotFrom(SHOT.balconySunset, 2.6),
    twinShotFrom(SHOT.faceProfile, 2.4),
    twinShotFrom(SHOT.endcard, 2.6),
  ],
};
