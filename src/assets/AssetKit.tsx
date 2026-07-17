/**
 * assets/AssetKit — the typed asset kit factory + React context (ADR-003 §4.2).
 *
 * `createAssetKit(map)` closes over the map's literal type `M`, so its components enforce
 * category-safe literal names at compile time (`kit.Image({ name: "heroBg" })` is valid;
 * `kit.Image({ name: "bed" })` is a compile error when "bed" is audio). Components resolve from
 * the closed-over map — they do NOT rely on context for typing. `AssetRegistryProvider` /
 * `useAssetRegistry` (the approved context vocabulary) exist for the engine and the
 * runtime-validated escape hatch. Renderers use current Remotion media APIs.
 */

import React, { createContext, createElement, useContext } from "react";
import { Audio, Img, OffthreadVideo, Video, useVideoConfig } from "remotion";
import { radii, type RadiusToken } from "../config/Layout";
import { secondsToFrames } from "../config/Timing";
import { useScale } from "../format";
import { createRegistry, type Registry } from "../registry";
import { audioVolume } from "./audio";
import { assertCategory, resolveAsset } from "./resolve";
import { DEFAULT_RESOLVERS } from "./resolvers";
import {
  type AssetCategory,
  type AssetMap,
  type AssetRegistry,
  type AssetSourceResolver,
  type Fit,
  type NamesOfCategory,
  type ResolvedAsset,
} from "./types";

type Dimension = number | string;

/** Shared visual props for the image/video/svg/logo box. */
type BoxProps = {
  fit?: Fit;
  focalX?: number;
  focalY?: number;
  width?: Dimension;
  height?: Dimension;
  radius?: RadiusToken;
  opacity?: number;
  style?: React.CSSProperties;
};

export type AssetImageProps<M extends AssetMap> = BoxProps & { name: NamesOfCategory<M, "image" | "svg"> };
export type AssetSvgProps<M extends AssetMap> = BoxProps & { name: NamesOfCategory<M, "svg"> };
export type AssetLogoProps<M extends AssetMap> = Omit<BoxProps, "fit"> & { name: NamesOfCategory<M, "image" | "svg"> };
export type AssetVideoProps<M extends AssetMap> = BoxProps & {
  name: NamesOfCategory<M, "video">;
  muted?: boolean;
  loop?: boolean;
  volume?: number;
  /** Seconds trimmed from the start. */
  trimBefore?: number;
  /** Seconds trimmed from the end. */
  trimAfter?: number;
};
export type AssetAudioProps<M extends AssetMap> = {
  name: NamesOfCategory<M, "audio">;
  volume?: number;
  loop?: boolean;
  trimBefore?: number;
  trimAfter?: number;
  fadeIn?: number;
  fadeOut?: number;
};

export type AssetKit<M extends AssetMap> = {
  registry: Registry<M>;
  Provider: React.FC<{ children?: React.ReactNode }>;
  useAssetRegistry: () => Registry<M>;
  useAsset: <N extends keyof M & string>(name: N) => ResolvedAsset;
  resolve: <N extends keyof M & string>(name: N) => ResolvedAsset;
  Image: React.FC<AssetImageProps<M>>;
  Video: React.FC<AssetVideoProps<M>>;
  Audio: React.FC<AssetAudioProps<M>>;
  Svg: React.FC<AssetSvgProps<M>>;
  Logo: React.FC<AssetLogoProps<M>>;
};

// --- Shared context (Correction 2: the ONLY thing called a "Provider"). ---
const AssetRegistryContext = createContext<AssetRegistry | null>(null);

/** Read the active asset registry (erased). Throws outside a provider. */
export const useAssetRegistry = (): AssetRegistry => {
  const registry = useContext(AssetRegistryContext);
  if (!registry) {
    throw new Error("useAssetRegistry: no <AssetRegistryProvider> found in the tree.");
  }
  return registry;
};

/** Provide an asset registry to the tree. */
export const AssetRegistryProvider: React.FC<{ registry: AssetRegistry; children?: React.ReactNode }> = ({
  registry,
  children,
}) => createElement(AssetRegistryContext.Provider, { value: registry }, children);

/** Narrow a resolved asset to its file src (MVP supports file-backed assets only). */
const fileSrc = (resolved: ResolvedAsset): string => {
  if (resolved.kind !== "file") {
    throw new Error(`Unsupported resolved asset kind "${resolved.kind}" (MVP supports file-backed assets only).`);
  }
  return resolved.src;
};

/** Pure box + media style computation for the image/video renderers. */
const computeBox = (
  box: BoxProps,
  defaultFit: Fit,
  scale: (n: number) => number,
): { boxStyle: React.CSSProperties; mediaStyle: React.CSSProperties } => {
  const dim = (v: Dimension | undefined, fallback: Dimension): Dimension =>
    v === undefined ? fallback : typeof v === "number" ? scale(v) : v;
  const boxStyle: React.CSSProperties = {
    overflow: "hidden",
    width: dim(box.width, "100%"),
    height: dim(box.height, "100%"),
    ...(box.radius !== undefined ? { borderRadius: scale(radii[box.radius]) } : {}),
    ...(box.opacity !== undefined ? { opacity: box.opacity } : {}),
    ...box.style,
  };
  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: box.fit ?? defaultFit,
    objectPosition: `${(box.focalX ?? 0.5) * 100}% ${(box.focalY ?? 0.5) * 100}%`,
  };
  return { boxStyle, mediaStyle };
};

/** An image-backed asset rendered into a clipping box (image / svg / logo share this). */
const BoxedImage: React.FC<{ src: string; box: BoxProps; defaultFit: Fit }> = ({ src, box, defaultFit }) => {
  const { scale } = useScale();
  const { boxStyle, mediaStyle } = computeBox(box, defaultFit, scale);
  return createElement("div", { style: boxStyle }, createElement(Img, { src, style: mediaStyle }));
};

export const createAssetKit = <M extends AssetMap>(
  map: M,
  options?: { resolvers?: AssetSourceResolver[] },
): AssetKit<M> => {
  const resolvers = options?.resolvers ?? DEFAULT_RESOLVERS;
  const registry = createRegistry(map);

  const lookup = (name: string, allowed?: readonly AssetCategory[]): ResolvedAsset => {
    const def = map[name];
    if (!def) {
      throw new Error(`Asset "${name}" is not registered. Registered: ${Object.keys(map).join(", ") || "(none)"}.`);
    }
    if (allowed) assertCategory(name, def, allowed);
    return resolveAsset(name, def, resolvers);
  };

  const resolve = <N extends keyof M & string>(name: N): ResolvedAsset => lookup(name);

  // --- Renderers ---
  const Image: React.FC<AssetImageProps<M>> = ({ name, ...box }) =>
    createElement(BoxedImage, { src: fileSrc(lookup(name, ["image", "svg"])), box, defaultFit: "cover" });

  const Svg: React.FC<AssetSvgProps<M>> = ({ name, ...box }) =>
    createElement(BoxedImage, { src: fileSrc(lookup(name, ["svg"])), box, defaultFit: "contain" });

  const Logo: React.FC<AssetLogoProps<M>> = ({ name, ...box }) =>
    createElement(BoxedImage, { src: fileSrc(lookup(name, ["image", "svg"])), box, defaultFit: "contain" });

  const VideoRenderer: React.FC<AssetVideoProps<M>> = ({ name, muted, loop, volume, trimBefore, trimAfter, ...box }) => {
    const { fps } = useVideoConfig();
    const { scale } = useScale();
    const src = fileSrc(lookup(name, ["video"]));
    const { boxStyle, mediaStyle } = computeBox(box, "cover", scale);
    // OffthreadVideo is render-preferred but has no loop; use Video only when looping.
    const media = {
      src,
      muted,
      volume,
      style: mediaStyle,
      ...(trimBefore !== undefined ? { trimBefore: secondsToFrames(trimBefore, fps) } : {}),
      ...(trimAfter !== undefined ? { trimAfter: secondsToFrames(trimAfter, fps) } : {}),
    };
    const inner = loop ? createElement(Video, { ...media, loop: true }) : createElement(OffthreadVideo, media);
    return createElement("div", { style: boxStyle }, inner);
  };

  const AudioRenderer: React.FC<AssetAudioProps<M>> = ({
    name,
    volume = 1,
    loop,
    trimBefore,
    trimAfter,
    fadeIn = 0,
    fadeOut = 0,
  }) => {
    const { fps, durationInFrames } = useVideoConfig();
    const src = fileSrc(lookup(name, ["audio"]));
    const vol = audioVolume(volume, secondsToFrames(fadeIn, fps), secondsToFrames(fadeOut, fps), durationInFrames);
    return createElement(Audio, {
      src,
      volume: vol,
      loop: loop ?? false,
      ...(trimBefore !== undefined ? { trimBefore: secondsToFrames(trimBefore, fps) } : {}),
      ...(trimAfter !== undefined ? { trimAfter: secondsToFrames(trimAfter, fps) } : {}),
    });
  };

  const Provider: React.FC<{ children?: React.ReactNode }> = ({ children }) =>
    createElement(AssetRegistryContext.Provider, { value: registry }, children);

  return {
    registry,
    Provider,
    useAssetRegistry: () => registry,
    useAsset: resolve,
    resolve,
    Image,
    Video: VideoRenderer,
    Audio: AudioRenderer,
    Svg,
    Logo,
  };
};
