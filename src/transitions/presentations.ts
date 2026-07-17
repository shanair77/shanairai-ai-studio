/**
 * transitions/presentations — custom transition presentations.
 *
 * `dissolve` is the framework's transparency-safe cross-dissolve (ADR-002 §4.3): unlike
 * Remotion's built-in `fade()` (which animates only the incoming layer and therefore needs
 * an opaque incoming scene), this presentation animates BOTH layers — exiting `1 → 0` and
 * entering `0 → 1` — so it composites correctly even when a scene is transparent.
 */

import { createElement } from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type DissolveProps = Record<string, never>;

const DissolveComponent = ({
  children,
  presentationDirection,
  presentationProgress,
}: TransitionPresentationComponentProps<DissolveProps>): React.ReactElement =>
  createElement(
    AbsoluteFill,
    { style: { opacity: presentationDirection === "entering" ? presentationProgress : 1 - presentationProgress } },
    children,
  );

/** Transparency-safe cross-dissolve: animates both the exiting and entering layers. */
export const dissolve = (): TransitionPresentation<DissolveProps> => ({
  component: DissolveComponent,
  props: {},
});
