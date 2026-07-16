/**
 * CTASection — a focused call-to-action block.
 *
 * eyebrow → title → subtitle → actions, centred, with the actions popping in via ScaleIn
 * for emphasis. Drop it mid-video or as a conversion beat: "book a viewing", "get a quote",
 * "start the trial", "enrol now". Slots are content-only; the actions node is yours.
 */

import { FadeUp, ScaleIn } from "../animations";
import { Eyebrow, Headline, Subheadline } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type CTASectionProps = SceneBaseProps & {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Call-to-action row / buttons (any node). Popped in via ScaleIn. */
  actions?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Measure for title/subtitle, in base-px. */
  maxWidth?: number;
};

export const CTASection: React.FC<CTASectionProps> = ({
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
    items.push((d) => <FadeUp delay={d}><Headline align={ta} maxWidth={maxWidth}>{title}</Headline></FadeUp>);
  if (subtitle)
    items.push((d) => (
      <FadeUp delay={d}><Subheadline align={ta} maxWidth={maxWidth}>{subtitle}</Subheadline></FadeUp>
    ));
  if (actions) items.push((d) => <ScaleIn delay={d}>{actions}</ScaleIn>);

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
