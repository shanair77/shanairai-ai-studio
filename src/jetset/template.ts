/**
 * jetset/template — the Jet Set Adventures campaign as a programmatic template.
 *
 * THIS FILE ADDS AN ENTRY POINT. It does not add an edit. The three cuts are
 * locked in `CampaignConfig{,30,15}` and remain the authority for every frame of
 * picture and every audio cue; this template selects one of them and hands it
 * back. Nothing here re-authors a shot, re-times a cue or re-grades an image,
 * and `src/JetSetCampaign.tsx` keeps consuming the configs directly, unchanged.
 * A regression test asserts the two paths agree scene-for-scene and cue-for-cue,
 * so an edit made in a config reaches this template automatically and an edit
 * attempted *here* fails the suite.
 *
 * WHY A TEMPLATE AT ALL, then. The config path requires a caller who can import
 * a TypeScript module holding JSX and hand it to `buildComposition`. That is a
 * person at a keyboard. A template is addressable by name over a wire: a caller
 * who knows the string "jetset-campaign" and the string "30" gets the approved
 * 30-second cut without being able to express anything that was not approved.
 * The parameter surface is the point — it is small because the campaign is
 * locked, and `cut` is the only choice that exists.
 *
 * THE BOUNDARY THIS DEMONSTRATES. `build` returns scene props that contain live
 * JSX (the endcard's `children`), while `params` stay pure JSON. That split is
 * the intended one: JSON crosses the process boundary, React never does. It is
 * also why the template can wrap a real commercial rather than a simplified
 * imitation of one.
 */

import { DomainError } from "../errors";
import { defineTemplate } from "../templates";
import { type CompositionSchema } from "../composition";
import { jetSetCampaignConfig } from "./CampaignConfig";
import { jetSetCampaign30Config } from "./CampaignConfig30";
import { jetSetCampaign15Config } from "./CampaignConfig15";

/**
 * Bump on any change to what this template produces for the same params.
 *
 * The cuts it selects are picture-locked, so in practice this moves when the
 * selection itself changes — a cut added, a cut withdrawn, the default reassigned.
 */
export const JET_SET_TEMPLATE_VERSION = "1.0.0";

/** The approved cuts, by length in seconds. */
export const JET_SET_CUTS = {
  "60": jetSetCampaignConfig,
  "30": jetSetCampaign30Config,
  "15": jetSetCampaign15Config,
} as const satisfies Record<string, CompositionSchema>;

export type JetSetCut = keyof typeof JET_SET_CUTS;

/** Every param this campaign accepts. JSON-safe by construction. */
export type JetSetCampaignParams = {
  /** Which approved cut to render. */
  cut: JetSetCut;
};

const CUT_KEYS = Object.keys(JET_SET_CUTS) as JetSetCut[];

/** Shot counts across the approved cuts — read from the cuts, so they cannot drift. */
const SHOT_COUNTS = Object.values(JET_SET_CUTS).map((cut) => cut.scenes?.length ?? 0);

const isCut = (value: unknown): value is JetSetCut =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(JET_SET_CUTS, value);

export const jetSetCampaignTemplate = defineTemplate<JetSetCampaignParams>({
  name: "jetset-campaign",
  version: JET_SET_TEMPLATE_VERSION,
  format: "vertical",
  // The footage is 24fps and the `vertical` preset is 30. See `TemplateDefinition.fps`.
  fps: 24,

  capabilities: {
    // Vertical only. The cuts are framed for it — reframing is a new edit, not a parameter.
    formats: ["vertical"],
    requiresBrand: true,
    providesMusic: true,
    // The shortest and longest approved cuts — 7 shots in the 15, 17 in the master.
    // These bound what `build` may hand back, so a selection bug cannot quietly ship
    // a composition with the wrong number of shots in it.
    minScenes: Math.min(...SHOT_COUNTS),
    maxScenes: Math.max(...SHOT_COUNTS),
  },

  parameters: {
    parameters: [
      {
        key: "cut",
        type: "enum",
        default: "60",
        constraints: {
          options: [
            { value: "60", label: "60 seconds · master" },
            { value: "30", label: "30 seconds · cutdown" },
            { value: "15", label: "15 seconds · cutdown" },
          ],
        },
        metadata: {
          label: "Cut",
          description: "Which approved length to render. Each is a distinct edit, not a trim of the master.",
        },
      },
    ],
  },

  /**
   * The schema above already rejects anything but the three values. This runs
   * anyway because the schema is optional to the engine and this invariant is
   * not: `build` indexes `JET_SET_CUTS` with the result, and the failure that
   * would produce — a composition with no scenes — is far from its cause.
   */
  validate: (params) => {
    if (!isCut(params.cut)) {
      throw new DomainError({
        code: "invalid-parameters",
        message: `jetset-campaign: unknown cut ${JSON.stringify(params.cut)}. Approved cuts: ${CUT_KEYS.join(", ")}.`,
        path: "cut",
        expected: CUT_KEYS.join(" | "),
        actual: params.cut,
      });
    }
  },

  /**
   * Selection, and nothing else.
   *
   * `duration` is forwarded rather than derived, and that is not incidental.
   * Deriving rounds each scene up to a whole frame independently, which for the
   * 30-second cutdown sums to 722 frames against a picture lock of 720. The
   * locked configs each state their length; passing it through is what makes
   * the programmatic path land on the approved frame count.
   */
  build: (params) => {
    const cut = JET_SET_CUTS[params.cut];
    return {
      scenes: cut.scenes ?? [],
      ...(cut.duration !== undefined ? { duration: cut.duration } : {}),
      ...(cut.audio !== undefined ? { audio: cut.audio } : {}),
      ...(cut.music !== undefined ? { music: cut.music } : {}),
    };
  },

  meta: {
    description:
      "Jet Set Adventures — the approved luxury-travel campaign, in its 60, 30 and 15 second cuts.",
    category: "campaign",
    previewParams: { cut: "15" },
  },
});
