/**
 * LogoRevealScene — choreography for a mark reveal (brings no mark of its own).
 *
 * Scales in whatever `mark` node the caller supplies and lets it drift with an ambient
 * Float, then fades a tagline up beneath it. Ships no logo, asset, or wordmark — it is the
 * motion, not the identity. Pass a real-estate crest, an app icon, an author name, a
 * channel handle: the scene just reveals it.
 */

import { FadeUp, Float, ScaleIn } from "../animations";
import { Subheadline } from "../components";
import { SceneFrame, TEXT_ALIGN, renderStaggered, type Alignment, type SceneBaseProps } from "./SceneFrame";

export type LogoRevealSceneProps = SceneBaseProps & {
  /** The mark to reveal (any node — image, wordmark, icon). Supplied by the caller. */
  mark?: React.ReactNode;
  /** Optional line beneath the mark. Rendered as a Subheadline. */
  tagline?: React.ReactNode;
  /** Content alignment. Default "center". */
  align?: Alignment;
  /** Idle drift amplitude for the mark, in base-px. Default 10. */
  drift?: number;
};

export const LogoRevealScene: React.FC<LogoRevealSceneProps> = ({
  mark,
  tagline,
  align = "center",
  drift = 10,
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
  if (mark)
    items.push((d) => (
      <ScaleIn delay={d}><Float amplitude={drift} delay={d}>{mark}</Float></ScaleIn>
    ));
  if (tagline)
    items.push((d) => <FadeUp delay={d}><Subheadline align={ta}>{tagline}</Subheadline></FadeUp>);

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
