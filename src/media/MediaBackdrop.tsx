/**
 * MediaBackdrop — full-bleed image or video behind a scene's content.
 *
 * The single piece of plumbing every footage-led scene repeats: resolve a named asset, fill
 * the frame without distortion, optionally drift it with KenBurns, and lay a legibility scrim
 * over it so typography survives whatever the footage is doing underneath. Doing that inline in
 * each scene means copying four concerns across every shot in a commercial; this owns them once.
 *
 * The asset is resolved from the ACTIVE registry via context rather than a closed-over kit, so
 * one backdrop works for any brand's media. Video uses `OffthreadVideo` (render-accurate) unless
 * looping is requested, which only `Video` supports — the same trade-off the AssetKit makes.
 *
 * The scrim is directional, not a flat wash: a gradient that is dense where the text sits and
 * clear where the picture should breathe. Its default shape is taken from a real four-stop
 * campaign scrim rather than invented, and it scales with `strength`.
 */

import React, { useMemo } from "react";
import { AbsoluteFill, Img, OffthreadVideo, Video, useVideoConfig } from "remotion";
import { KenBurns } from "../animations";
import { type EasingLike } from "../animations";
import { withAlpha } from "../config/Theme";
import { useTheme } from "../config/ThemeContext";
import { secondsToFrames } from "../config/Timing";
import { assertCategory, resolveAsset, useAssetRegistry, type Fit } from "../assets";

/** Which edge the scrim is anchored to — i.e. where the type is going to sit. */
export type ScrimDirection = "bottom" | "top" | "left" | "right" | "full" | "none";

/** A drifting camera move over the plate. Omit for a locked-off frame. */
export type KenBurnsSpec = {
  from?: number;
  to?: number;
  panX?: number;
  panY?: number;
  /** Seconds. Omit to span the whole scene. */
  duration?: number;
  easing?: EasingLike;
};

export type ScrimSpec = {
  /** Edge to anchor the gradient to. Default "bottom". */
  direction?: ScrimDirection;
  /** 0–1 multiplier on the scrim's opacity ramp. Default 1. */
  strength?: number;
  /** Scrim colour. Defaults to the active theme's background, so it is brand-aware. */
  color?: string;
};

export type MediaBackdropProps = {
  /** Named image or video asset from the active registry. */
  asset: string;
  /** Object-fit. Default "cover" — a backdrop should always fill. */
  fit?: Fit;
  /** Focal point as 0–1 fractions, for cropping that keeps the subject framed. */
  focalX?: number;
  focalY?: number;
  /** Drift the plate. Omit for a static frame. */
  kenBurns?: KenBurnsSpec;
  /** Legibility scrim. Omit for no scrim; pass `{ direction: "none" }` to disable explicitly. */
  scrim?: ScrimSpec;
  /** Overall opacity of the backdrop layer. */
  opacity?: number;
  // --- video only ---
  loop?: boolean;
  /** Default true — a backdrop should not fight the mix. */
  muted?: boolean;
  volume?: number;
  /** Seconds trimmed from the start / end of the source. */
  trimBefore?: number;
  trimAfter?: number;
  style?: React.CSSProperties;
};

/** The four-stop ramp the scrim uses, as [position%, alpha-multiplier] pairs. */
const RAMP: Array<[number, number]> = [
  [0, 0.8],
  [24, 0.52],
  [46, 0.18],
  [66, 0],
];

const ANGLE: Record<Exclude<ScrimDirection, "none" | "full">, string> = {
  bottom: "0deg",
  top: "180deg",
  left: "96deg",
  right: "276deg",
};

/** Build the scrim gradient for a direction and strength. */
export const scrimGradient = (direction: ScrimDirection, strength: number, color: string): string | undefined => {
  if (direction === "none") return undefined;
  if (direction === "full") return `linear-gradient(0deg, ${withAlpha(color, 0.55 * strength)} 0%, ${withAlpha(color, 0.55 * strength)} 100%)`;
  const stops = RAMP.map(([pos, a]) => `${withAlpha(color, Math.min(1, a * strength))} ${pos}%`).join(", ");
  return `linear-gradient(${ANGLE[direction]}, ${stops})`;
};

export const MediaBackdrop: React.FC<MediaBackdropProps> = ({
  asset,
  fit = "cover",
  focalX = 0.5,
  focalY = 0.5,
  kenBurns,
  scrim,
  opacity,
  loop,
  muted = true,
  volume,
  trimBefore,
  trimAfter,
  style,
}) => {
  const registry = useAssetRegistry();
  const theme = useTheme();
  const { fps } = useVideoConfig();

  const resolved = useMemo(() => {
    const def = registry.require(asset);
    assertCategory(asset, def, ["image", "svg", "video"]);
    const r = resolveAsset(asset, def);
    if (r.kind !== "file") {
      throw new Error(`MediaBackdrop: asset "${asset}" did not resolve to a file-backed source.`);
    }
    return { src: r.src, category: def.category };
  }, [registry, asset]);

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: fit,
    objectPosition: `${focalX * 100}% ${focalY * 100}%`,
  };

  const plate =
    resolved.category === "video"
      ? (() => {
          const props = {
            src: resolved.src,
            muted,
            style: mediaStyle,
            ...(volume !== undefined ? { volume } : {}),
            ...(trimBefore !== undefined ? { trimBefore: secondsToFrames(trimBefore, fps) } : {}),
            ...(trimAfter !== undefined ? { trimAfter: secondsToFrames(trimAfter, fps) } : {}),
          };
          // OffthreadVideo is render-preferred but cannot loop; fall back to Video when it must.
          return loop ? <Video {...props} loop /> : <OffthreadVideo {...props} />;
        })()
      : <Img src={resolved.src} style={mediaStyle} />;

  const gradient = scrim
    ? scrimGradient(scrim.direction ?? "bottom", scrim.strength ?? 1, scrim.color ?? theme.colors.background)
    : undefined;

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...(opacity !== undefined ? { opacity } : {}), ...style }}>
      {kenBurns ? <KenBurns {...kenBurns}>{plate}</KenBurns> : plate}
      {gradient ? <AbsoluteFill style={{ backgroundImage: gradient }} /> : null}
    </AbsoluteFill>
  );
};
