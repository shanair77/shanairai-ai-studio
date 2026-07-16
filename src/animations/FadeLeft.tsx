/**
 * FadeLeft — fade in while travelling leftward.
 *
 * Starts a scaled `distance` to the right of its resting spot and slides left into place
 * as it fades in.
 */

import { SlideFade, type DirectionalFadeProps } from "./SlideFade";

export type FadeLeftProps = DirectionalFadeProps;

export const FadeLeft: React.FC<FadeLeftProps> = (props) => (
  <SlideFade axis="x" sign={1} {...props} />
);
