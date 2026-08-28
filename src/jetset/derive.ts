/**
 * jetset/derive — shot reuse for the derivative cuts.
 *
 * The 30s and 15s cuts are genuinely different EDITS: different shot lists, different
 * durations, different music placement, a different subset of narration. What they must NOT
 * differ in is the picture TREATMENT — the source clip, the in-point corrections, the Ken
 * Burns move, the scrim and the typography. Duplicating those into three files is how a grade
 * fix lands in the master and silently misses the cutdowns.
 *
 * So each derivative names a master shot by its label and supplies only a new duration. The
 * master's `transition` comes along with it, which is what keeps the single earned dissolve on
 * the 6.1 -> 6.2 payoff pair in every cut that includes both.
 *
 * `shotFrom` throws on an unknown label rather than returning undefined: a typo here would
 * otherwise produce a composition that is silently missing a shot but still compiles.
 */

import { jetSetCampaignConfig } from "./CampaignConfig";

type Scene = NonNullable<typeof jetSetCampaignConfig.scenes>[number];

const byLabel = new Map<string, Scene>(
  (jetSetCampaignConfig.scenes ?? []).map((s) => [s.label ?? "", s]),
);

/** The master's treatment of `label`, re-timed to `duration` seconds. */
export const shotFrom = (label: string, duration: number): Scene => {
  const master = byLabel.get(label);
  if (!master) {
    throw new Error(
      `derive: no shot labelled "${label}" in the master. Available: ${[...byLabel.keys()].join(", ")}`,
    );
  }
  return { ...master, duration };
};

/** Master shot labels, so a cut references them symbolically rather than by loose string. */
export const SHOT = {
  deskExhale: "1.1 desk exhale",
  reachPhone: "1.3 reach phone",
  balconyDoors: "2.1 balcony doors",
  sandWalk: "2.2 sand walk · BREATHE",
  yacht: "2.3 yacht",
  accraMarket: "3.1 accra market",
  headWrap: "3.2 head-wrap · DISCOVER",
  nightDance: "3.4 night dance",
  hotelArrival: "4.1 hotel arrival · LIVE",
  skyline: "4.2 skyline",
  rooftopDinner: "4.3 rooftop dinner",
  poolJump: "5.2 pool jump",
  nightOut: "5.5 night out",
  boardwalk: "5.4 boardwalk",
  balconySunset: "6.1 balcony sunset",
  faceProfile: "6.2 profile · YOUR NEXT STORY",
  endcard: "7.1 endcard",
} as const;
