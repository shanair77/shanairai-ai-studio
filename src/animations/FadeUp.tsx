/**
 * FadeUp — fade in while travelling upward.
 *
 * Starts a scaled `distance` below its resting spot and rises into place as it fades in.
 * The signature entrance for headlines and stacked copy.
 */

import { SlideFade, type DirectionalFadeProps } from "./SlideFade";

export type FadeUpProps = DirectionalFadeProps;

export const FadeUp: React.FC<FadeUpProps> = (props) => (
  <SlideFade axis="y" sign={1} {...props} />
);
