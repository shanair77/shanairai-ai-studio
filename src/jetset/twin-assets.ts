/**
 * jetset/twin-assets — media for the twin-led version.
 *
 * Kept in its OWN kit rather than added to `jetSetAssets`, because the locked film's manifest
 * asserts that every asset in that kit is a requirement of the delivered master. Twin media is
 * an exploration, not a requirement, and must not make the readiness report lie.
 *
 * ELEVEN shots have generated motion; SIX are stills. That split is deliberate and not merely
 * budgetary: a still driven by the composition's own KenBurns is free, deterministic and
 * frame-exact, and for a static composition it is indistinguishable from generated video that
 * mostly drifts. The stills are 1440x2560 against a 1080x1920 frame — 33% of headroom — so a
 * scale-and-pan move stays inside the source pixels and never softens.
 */

import { defineAsset, defineAssetKit } from "../assets";
import { jetSetAssets } from "./assets";

const still = (file: string) =>
  defineAsset({ category: "image", source: `jetset/twin/stills/${file}` });

const clip = (file: string, durationInSeconds: number) =>
  defineAsset({ category: "video", source: `jetset/twin/video/${file}`, metadata: { durationInSeconds } });

export const jetSetTwinAssets = {
  ...jetSetAssets,

  // --- generated motion (11) ---
  // The five below replaced stills after review: each shot is a human ACTION (an exhale, a
  // reach, walking, dancing) and a frozen subject performing it reads as broken, not stylised.
  twDeskExhale: clip("01-desk-exhale.mp4", 5.04),
  twReachPhone: clip("02-reach-phone.mp4", 4.04),
  twAccraStreet: clip("06-accra-street.mp4", 4.04),
  twNightDance: clip("08-night-dance.mp4", 4.04),
  twNightOut: clip("13-night-out.mp4", 3.04),

  twBalconyDoors: clip("03-balcony-doors.mp4", 5.04),
  twSandWalk: clip("04-sand-walk.mp4", 3.04),
  twYacht: clip("05-yacht.mp4", 3.04),
  twHotelArrival: clip("09-hotel-arrival.mp4", 4.04),
  twPoolJump: clip("12-pool-jump.mp4", 5.04),
  twBoardwalk: clip("14-boardwalk.mp4", 3.04),

  // --- stills, moved by the composition (6) ---
  // These remain stills because the camera move IS the shot: a static figure at a rail, a
  // scripted "slow push" to a face, a scripted "aerial pull-back". Generated motion would add
  // drift, not meaning, and KenBurns is frame-exact, free, and cannot hallucinate.
  twFabricDetail: still("07-a3FabricDetail.png"),
  twSkyline: still("10-a4Skyline.png"),
  twRooftopDinner: still("11-a4RooftopDinner.png"),
  twBalconySunset: still("15-a6BalconySunset.png"),
  twFaceProfile: still("16-a6FaceProfile.png"),
  twCoastPullback: still("17-a7CoastPullback.png"),
} as const;

export const jetSetTwinKit = defineAssetKit(jetSetTwinAssets);
