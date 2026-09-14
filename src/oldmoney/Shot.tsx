/**
 * Shot — one cut of the montage.
 *
 * Renders the shot's footage (video or still) or its placeholder plate, then applies a slow
 * camera move on top. The move is the "hidden hand" that makes a static clip feel filmed:
 * a 4–8% push or drift over the cut is enough — anything faster reads as a gimmick.
 *
 * All motion reads `useCurrentFrame()` (0 = the first frame of THIS cut, thanks to the
 * parent `<Sequence>`) and maps it over the cut's length, so a 0.5s cut and a 1.4s cut
 * both complete the same move — the short cut just moves faster, which is what you want.
 */

import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { easings } from "../config/Animation";
import { Placeholder } from "./Placeholder";
import { type Shot as ShotSpec, type ShotMotion } from "./shots";

const IMAGE_EXT = /\.(png|jpe?g|webp|avif|gif)$/i;

/** Start → end camera state for each move (scale + percentage translate). */
const MOVES: Record<ShotMotion, { scale: [number, number]; translate: [string, string] }> = {
  "push-in": { scale: [1.04, 1.12], translate: ["0% 0%", "0% 0%"] },
  "pull-out": { scale: [1.14, 1.06], translate: ["0% 0%", "0% 0%"] },
  "drift-left": { scale: [1.1, 1.1], translate: ["1.5% 0%", "-1.5% 0%"] },
  "drift-right": { scale: [1.1, 1.1], translate: ["-1.5% 0%", "1.5% 0%"] },
  rise: { scale: [1.08, 1.1], translate: ["0% 1.5%", "0% -1%"] },
};

const resolveSrc = (src: string): string => (/^https?:\/\//.test(src) ? src : staticFile(src));

const Footage: React.FC<{ shot: ShotSpec }> = ({ shot }) => {
  const { fps } = useVideoConfig();
  if (!shot.src) return <Placeholder shot={shot} />;

  const src = resolveSrc(shot.src);
  const fill = { width: "100%", height: "100%", objectFit: "cover" as const };

  if (IMAGE_EXT.test(shot.src)) return <Img src={src} style={fill} />;

  return (
    <Video
      src={src}
      muted
      trimBefore={Math.round((shot.trimStart ?? 0) * fps)}
      style={fill}
    />
  );
};

export const Shot: React.FC<{ shot: ShotSpec; durationInFrames: number }> = ({ shot, durationInFrames }) => {
  const frame = useCurrentFrame();
  const move = MOVES[shot.motion];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          // Estate grade: daylight footage, so lift less and crush less than LuxuryReel;
          // desaturate a touch so greens go mossy and creams stay parchment, not yellow.
          filter: "contrast(1.04) saturate(0.82) brightness(0.96)",
          scale: String(
            interpolate(frame, [0, durationInFrames], move.scale, {
              extrapolateRight: "clamp",
              easing: easings.gentle,
            }),
          ),
          translate: interpolate(frame, [0, durationInFrames], move.translate, {
            extrapolateRight: "clamp",
            easing: easings.gentle,
          }),
        }}
      >
        <Footage shot={shot} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
