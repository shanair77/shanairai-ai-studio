/**
 * FadeRight — fade in while travelling rightward.
 *
 * Starts a scaled `distance` to the left of its resting spot and slides right into place
 * as it fades in. Mirror of FadeLeft.
 */

import { SlideFade, type DirectionalFadeProps } from "./SlideFade";

export type FadeRightProps = DirectionalFadeProps;

export const FadeRight: React.FC<FadeRightProps> = (props) => (
  <SlideFade axis="x" sign={-1} {...props} />
);
