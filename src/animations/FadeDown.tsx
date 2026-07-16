/**
 * FadeDown — fade in while travelling downward.
 *
 * Starts a scaled `distance` above its resting spot and settles down into place as it
 * fades in. Mirror of FadeUp.
 */

import { SlideFade, type DirectionalFadeProps } from "./SlideFade";

export type FadeDownProps = DirectionalFadeProps;

export const FadeDown: React.FC<FadeDownProps> = (props) => (
  <SlideFade axis="y" sign={-1} {...props} />
);
