/**
 * SceneFrame — the shared shell every scene is built on.
 *
 * Owns the concerns each scene repeats, using only existing primitives:
 *   • fills the frame and paints a `surface` color (semantic theme token — never a hex),
 *   • layers an optional full-bleed `background` node behind the content (media/gradient),
 *   • insets content with `<SafeArea>` so it stays platform-safe in any format,
 *   • aligns/distributes content through a `Column` (spacing scales via `useScale()`).
 *
 * It holds no content or copy of its own — scenes drop role slots into `children`. Also
 * exports the small helpers scenes share: alignment mapping and stagger timing.
 */

import React from "react";
import { Column, Container, Stack } from "../components";
import { type SafeAreaToken, type SpacingToken } from "../config/Layout";
import { theme } from "../config/Theme";
import { SafeArea } from "../format";

/** Any semantic color token from the active theme. */
export type ColorToken = keyof typeof theme.colors;

/** Content alignment shorthand shared by scenes. */
export type Alignment = "start" | "center" | "end";

type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

/** Map content alignment to a typography `align` value. */
export const TEXT_ALIGN: Record<Alignment, "left" | "center" | "right"> = {
  start: "left",
  center: "center",
  end: "right",
};

/** Per-slot entrance offset in seconds (house stagger cadence). */
export const STAGGER_STEP = theme.timing.stagger.base;

/** Base delay + i stagger steps, in seconds. */
export const staggered = (base: number, i: number): number => base + i * STAGGER_STEP;

/**
 * Render an ordered list of slot builders, each offset one stagger step later than the
 * last. Only pass builders for slots that are actually present, so timing stays contiguous.
 */
export const renderStaggered = (
  items: Array<(delay: number) => React.ReactNode>,
  base = 0,
): React.ReactNode =>
  items.map((build, i) => <React.Fragment key={i}>{build(staggered(base, i))}</React.Fragment>);

/** Props shared by every scene: surface, background layer, safe area, timing, escapes. */
export type SceneBaseProps = {
  /** Full-bleed surface color (semantic token). Default "background". */
  surface?: ColorToken;
  /** Full-bleed layer rendered behind content — pass a media/gradient node. */
  background?: React.ReactNode;
  /** Safe-area preset. Default "default". */
  safeArea?: SafeAreaToken;
  /** Base entrance delay in seconds. Default 0. */
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export type SceneFrameProps = {
  surface?: ColorToken;
  background?: React.ReactNode;
  safeArea?: SafeAreaToken;
  /** Cross-axis (horizontal) alignment of content. Default "center". */
  align?: Alignment | "stretch";
  /** Main-axis (vertical) distribution of content. Default "center". */
  justify?: Justify;
  /** Gap between direct content children. Default "lg". */
  gap?: SpacingToken;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const SceneFrame: React.FC<SceneFrameProps> = ({
  surface = "background",
  background,
  safeArea = "default",
  align = "center",
  justify = "center",
  gap = "lg",
  style,
  className,
  children,
}) => {
  const layers: React.ReactNode[] = [<Container key="surface" fill background={surface} />];
  if (background) layers.push(background);
  layers.push(
    <SafeArea key="content" preset={safeArea} style={{ display: "flex" }}>
      <Column fill align={align} justify={justify} gap={gap} style={{ width: "100%" }}>
        {children}
      </Column>
    </SafeArea>,
  );

  return (
    <Stack className={className} style={style}>
      {layers}
    </Stack>
  );
};
