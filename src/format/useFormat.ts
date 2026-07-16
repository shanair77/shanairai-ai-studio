/**
 * useFormat() — Detect the active composition's shape at runtime.
 *
 * Reads dimensions from Remotion's `useVideoConfig()` and derives orientation
 * (portrait / landscape / square), aspect ratio, and short/long sides. If the
 * dimensions match a named preset in `config/Layout.ts`, `name` reports it;
 * otherwise `name` is "custom".
 *
 * Scenes use this to branch layout by orientation without hardcoding pixel sizes.
 */

import { useVideoConfig } from "remotion";
import { formats, type FormatName } from "../config/Layout";

export type Orientation = "portrait" | "landscape" | "square";

export type FormatInfo = {
  width: number;
  height: number;
  fps: number;
  aspectRatio: number;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  isSquare: boolean;
  shortSide: number;
  longSide: number;
  /** Matching preset name from config, or "custom" if dimensions are non-standard. */
  name: FormatName | "custom";
};

/** Derive orientation purely from dimensions. */
export const getOrientation = (width: number, height: number): Orientation => {
  if (width === height) return "square";
  return width > height ? "landscape" : "portrait";
};

/** Find a named format preset matching exact dimensions, else "custom". */
const matchFormatName = (width: number, height: number): FormatName | "custom" => {
  const names = Object.keys(formats) as FormatName[];
  for (const name of names) {
    if (formats[name].width === width && formats[name].height === height) {
      return name;
    }
  }
  return "custom";
};

export const useFormat = (): FormatInfo => {
  const { width, height, fps } = useVideoConfig();
  const orientation = getOrientation(width, height);

  return {
    width,
    height,
    fps,
    aspectRatio: width / height,
    orientation,
    isPortrait: orientation === "portrait",
    isLandscape: orientation === "landscape",
    isSquare: orientation === "square",
    shortSide: Math.min(width, height),
    longSide: Math.max(width, height),
    name: matchFormatName(width, height),
  };
};
