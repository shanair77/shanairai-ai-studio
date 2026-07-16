/**
 * FeatureScene — a header over a row of features.
 *
 * eyebrow → title → subtitle, centred, then each child fades up in turn as a wrapping,
 * centred row of items. The children are yours (cards, icons+labels, stats, steps); the
 * scene distributes and staggers them. Reusable for amenities, plan perks, capabilities,
 * curriculum modules, itinerary highlights.
 */

import React from "react";
import { FadeUp } from "../animations";
import { Eyebrow, Headline, Row, Subheadline } from "../components";
import { type SpacingToken } from "../config/Layout";
import { SceneFrame, STAGGER_STEP, TEXT_ALIGN, staggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type FeatureSceneProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Content alignment for the header. Default "center". */
  align?: Alignment;
  /** Measure for the header text, in base-px. */
  maxWidth?: number;
  /** Gap between feature items. Default "lg". */
  gap?: SpacingToken;
};

export const FeatureScene: React.FC<FeatureSceneProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  maxWidth,
  gap = "lg",
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
  if (title)
    header.push((d) => <FadeUp delay={d}><Headline align={ta} maxWidth={maxWidth}>{title}</Headline></FadeUp>);
  if (subtitle)
    header.push((d) => (
      <FadeUp delay={d}><Subheadline align={ta} maxWidth={maxWidth}>{subtitle}</Subheadline></FadeUp>
    ));

  const kids = React.Children.toArray(children);
  const featureBase = delay + header.length * STAGGER_STEP;

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
        <Row gap={gap} align="stretch" justify="center" wrap>
          {kids.map((child, i) => (
            <FadeUp key={i} delay={staggered(featureBase, i)}>{child}</FadeUp>
          ))}
        </Row>
      ) : null}
    </SceneFrame>
  );
};
