/**
 * Caption — Small supporting text role.
 *
 * Sub-body annotations: image credits, footnotes, timestamps, fine print. Composes `Text`
 * with the `caption` token and the low-emphasis `textMuted` color. Size scales through
 * `useScale()`; nothing is hardcoded.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type CaptionProps = TextProps;

export const Caption: React.FC<CaptionProps> = ({
  variant = "caption",
  color = "textMuted",
  ...rest
}) => <Text variant={variant} color={color} {...rest} />;
