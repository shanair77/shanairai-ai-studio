/**
 * jetset/deriveTwin — shot reuse for the twin-led derivative cuts.
 *
 * Identical in spirit to `derive.ts`, but the source of truth is the TWIN master
 * (`jetSetTwinConfig`) rather than the locked film. That is the whole point: the twin cutdowns
 * must inherit the twin's picture — its media, in-points, Ken Burns move, scrim and typography —
 * so a treatment fix on the twin master lands in its cutdowns instead of silently missing them.
 *
 * The shot LABELS are identical between the two masters (the twin was authored as "same film,
 * different picture"), so the `SHOT` label map is shared from `derive.ts` and only the lookup
 * table changes. `twinShotFrom` throws on an unknown label for the same reason `shotFrom` does:
 * a typo must fail the build, not compile to a silently missing shot.
 */

import { jetSetTwinConfig } from "./CampaignConfigTwin";

type Scene = NonNullable<typeof jetSetTwinConfig.scenes>[number];

const byLabel = new Map<string, Scene>(
  (jetSetTwinConfig.scenes ?? []).map((s) => [s.label ?? "", s]),
);

/** The twin master's treatment of `label`, re-timed to `duration` seconds. */
export const twinShotFrom = (label: string, duration: number): Scene => {
  const shot = byLabel.get(label);
  if (!shot) {
    throw new Error(
      `deriveTwin: no shot labelled "${label}" in the twin master. Available: ${[...byLabel.keys()].join(", ")}`,
    );
  }
  return { ...shot, duration };
};

// Labels are shared with the locked film; re-export so twin cuts reference shots symbolically.
export { SHOT } from "./derive";
