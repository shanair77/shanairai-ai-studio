/**
 * HeroScene — the opening statement.
 *
 * A centered stack of eyebrow → title → subtitle → actions, with the title revealed via
 * the composite HeroReveal and the rest rising in on a stagger. Content-agnostic: works
 * for a listing headline, a course intro, a product launch, a story cold-open, etc.
 * Pass any slot as text (styled here) or a node; append extras via `children`.
 */

import { FadeUp, HeroReveal } from "../animations";
import { Eyebrow, Headline, Subheadline } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type HeroSceneProps = SceneBaseProps & {
  /** Small label above the title. */
  eyebrow?: React.ReactNode;
  /** The hero line. Rendered as a display Headline. */
  title?: React.ReactNode;
  /** Supporting line beneath the title. */
  subtitle?: React.ReactNode;
  /** Call-to-action row / buttons (any node). */
  actions?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Measure for title/subtitle, in base-px. */
  maxWidth?: number;
};

export const HeroScene: React.FC<HeroSceneProps> = ({
  eyebrow,
  title,
  subtitle,
  actions,
  align = "center",
  maxWidth,
  surface,
  background,
  safeArea,
  delay = 0,
  style,
  className,
  children,
}) => {
  const ta = TEXT_ALIGN[align];
  const items: Array<(d: number) => React.ReactNode> = [];
  if (eyebrow) items.push((d) => <FadeUp delay={d}><Eyebrow align={ta}>{eyebrow}</Eyebrow></FadeUp>);
  if (title)
    items.push((d) => (
      <HeroReveal delay={d}>
        <Headline variant="display" align={ta} maxWidth={maxWidth}>{title}</Headline>
      </HeroReveal>
    ));
  if (subtitle)
    items.push((d) => (
      <FadeUp delay={d}><Subheadline align={ta} maxWidth={maxWidth}>{subtitle}</Subheadline></FadeUp>
    ));
  if (actions) items.push((d) => <FadeUp delay={d}>{actions}</FadeUp>);

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
      {renderStaggered(items, delay)}
      {children}
    </SceneFrame>
  );
};
