/**
 * OldMoneyReel — a 30-second, 1080×1920 Instagram Reel in the LuxuryReel montage format, themed on old-money country estates.
 *
 * Structure (bottom → top):
 *   1. Montage: every cut in `cuts` is a `<Sequence>` holding a `<Shot>` (hard cuts).
 *   2. Grade + Grain: the unifying film look over all footage.
 *   3. Caption: the persistent line, handing over to the EndCard in the final seconds.
 *   4. Fade from / to black at the edges, and optional music with a tail fade.
 *
 * Everything the reel shows is a prop (JSON-safe), so the Studio props panel, a server,
 * or an agent can re-cut it without touching this file. Duration is derived from `cuts`
 * by `calculateOldMoneyReelMetadata`, so lengthening the edit lengthens the composition.
 */

import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { Caption, EndCard, Grade, Grain } from "./Overlays";
import { Shot } from "./Shot";
import { CUT_LIST, SHOTS, getShot, type Cut, type Shot as ShotSpec } from "./shots";

export type OldMoneyReelProps = {
  /** The persistent caption. */
  caption: string;
  /** Your Instagram handle for the end-card. */
  handle: string;
  /** Optional line under the handle on the end-card. */
  tagline: string;
  /** `public/`-relative music file (e.g. "luxury/music.mp3"), or null for silent. */
  music: string | null;
  musicVolume: number;
  /** Seconds the end-card occupies at the tail of the reel. */
  endCardSeconds: number;
  /**
   * Optional second line that replaces the caption for the last `seconds` before the end-card —
   * the one "copy beat" that turns a mood reel into a promo. `null` for none.
   */
  interlude: { text: string; seconds: number } | null;
  shots: ShotSpec[];
  cuts: Cut[];
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const defaultOldMoneyReelProps: OldMoneyReelProps = {
  caption: "Old money.",
  handle: "@shanair.ai",
  tagline: "Shanair.AI Films",
  music: null,
  musicVolume: 0.8,
  endCardSeconds: 3.3,
  interlude: null,
  shots: SHOTS,
  cuts: CUT_LIST,
};

/**
 * The Blackwood Society promo: the same 36 clips and cut list, re-captioned. "Old money." stays
 * as the persistent line (it is the show's engine — the money ladder against the Crown ladder),
 * one interlude nods to the Black Letter narrator, and the end-card carries the title.
 */
export const blackwoodPromoProps: OldMoneyReelProps = {
  ...defaultOldMoneyReelProps,
  caption: "Old money.",
  interlude: { text: "Every house keeps a letter.", seconds: 2.5 },
  handle: "The Blackwood Society",
  tagline: "A Shanair.AI Films series · @shanair.ai",
};

/** Cut list → absolute frame ranges. Each cut is rounded individually so nothing drifts. */
const layoutCuts = (cuts: Cut[], fps: number) => {
  let from = 0;
  return cuts.map((cut) => {
    const durationInFrames = Math.max(1, Math.round(cut.seconds * fps));
    const placed = { ...cut, from, durationInFrames };
    from += durationInFrames;
    return placed;
  });
};

const totalFrames = (cuts: Cut[], fps: number): number =>
  layoutCuts(cuts, fps).reduce((sum, c) => sum + c.durationInFrames, 0);

export const calculateOldMoneyReelMetadata: CalculateMetadataFunction<OldMoneyReelProps> = ({ props }) => ({
  durationInFrames: totalFrames(props.cuts, FPS),
});

export const OldMoneyReel: React.FC<OldMoneyReelProps> = ({
  caption,
  handle,
  tagline,
  music,
  musicVolume,
  endCardSeconds,
  interlude,
  shots,
  cuts,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = layoutCuts(cuts, fps);
  const endCardAt = durationInFrames - Math.round(endCardSeconds * fps);
  const interludeFrames = interlude ? Math.round(interlude.seconds * fps) : 0;
  const interludeAt = endCardAt - interludeFrames;
  // The persistent caption hands over to the interlude (if any), else straight to the end-card.
  const captionOutAt = interlude ? interludeAt - 18 : endCardAt - 10;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.map((cut, i) => {
        const shot = getShot(cut.shot, shots);
        return (
          <Sequence
            key={`${i}-${cut.shot}`}
            name={`Shot ${i + 1} · ${shot.label}`}
            from={cut.from}
            durationInFrames={cut.durationInFrames}
          >
            <Shot shot={shot} durationInFrames={cut.durationInFrames} />
          </Sequence>
        );
      })}

      <Grade />
      <Grain />

      <Sequence name="Caption" layout="none">
        <Caption text={caption} inAt={Math.round(0.5 * fps)} outAt={captionOutAt} />
      </Sequence>
      {interlude ? (
        <Sequence name="Interlude" from={interludeAt} durationInFrames={interludeFrames} layout="none">
          <Caption text={interlude.text} inAt={0} outAt={interludeFrames - 12} size={60} />
        </Sequence>
      ) : null}
      <Sequence name="End card" from={endCardAt} layout="none">
        <EndCard handle={handle} tagline={tagline || undefined} startAt={0} />
      </Sequence>

      {/* fade from black on open, fade to black on close */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundColor: "#000",
          opacity: interpolate(
            frame,
            [0, Math.round(0.6 * fps), durationInFrames - Math.round(0.5 * fps), durationInFrames - 1],
            [1, 0, 0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
        }}
      />

      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(f) =>
            interpolate(f, [0, fps, durationInFrames - 2 * fps, durationInFrames], [0, musicVolume, musicVolume, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
