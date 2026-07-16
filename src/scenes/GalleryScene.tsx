/**
 * GalleryScene — a set of items shown together.
 *
 * An optional eyebrow/title header, then each child scales in on a stagger, arranged in a
 * wrapping row (or a column). The items are yours — photos, frames, cards, thumbnails; the
 * scene handles rhythm and spacing. Reusable for a property gallery, a trip lookbook, a
 * model showcase, a set of generated results.
 */

import React from "react";
import { FadeUp, ScaleIn } from "../animations";
import { Column, Eyebrow, Headline, Row } from "../components";
import { type SpacingToken } from "../config/Layout";
import { SceneFrame, STAGGER_STEP, TEXT_ALIGN, staggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type GallerySceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** Lay items in a row (default) or a column. */
  direction?: "row" | "column";
  /** Content alignment for the header. Default "center". */
  align?: Alignment;
  /** Gap between items. Default "md". */
  gap?: SpacingToken;
};

export const GalleryScene: React.FC<GallerySceneProps> = ({
  eyebrow,
  title,
  direction = "row",
  align = "center",
  gap = "md",
  surface,
  background,
  safeArea,
  delay = 0,
  style,
  className,
  children,
}) => {
  const ta = TEXT_ALIGN[align];
  const header: Array<(d: number) => React.ReactNode> = [];
  if (eyebrow) header.push((d) => <FadeUp delay={d}><Eyebrow align={ta}>{eyebrow}</Eyebrow></FadeUp>);
  if (title) header.push((d) => <FadeUp delay={d}><Headline align={ta}>{title}</Headline></FadeUp>);

  const kids = React.Children.toArray(children);
  const itemBase = delay + header.length * STAGGER_STEP;
  const items = kids.map((child, i) => (
    <ScaleIn key={i} delay={staggered(itemBase, i)}>{child}</ScaleIn>
  ));

  return (
    <SceneFrame
      surface={surface}
      background={background}
      safeArea={safeArea}
      align={align}
      justify="center"
      style={style}
      className={className}
    >
      {header.map((build, i) => (
        <React.Fragment key={i}>{build(staggered(delay, i))}</React.Fragment>
      ))}
      {kids.length > 0 ? (
        direction === "column" ? (
          <Column gap={gap} align="center" justify="center">{items}</Column>
        ) : (
          <Row gap={gap} align="center" justify="center" wrap>{items}</Row>
        )
      ) : null}
    </SceneFrame>
  );
};
