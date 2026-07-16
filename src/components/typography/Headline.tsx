/**
 * Headline — Primary title role.
 *
 * The dominant line in a scene. Composes `Text` with the `h1` type token, so size scales
 * through `useScale()` and family/weight/tracking come from the theme — nothing hardcoded.
 * For an oversized hero treatment pass `variant="display"`.
 *
 * Inherits all `Text` props: `align`, `maxWidth`, `opacity`, semantic `color`, `lineClamp`.
 * Animation-ready — pass a helper's returned transform/opacity via `style` (merged last).
 * Renders in normal document flow, so it sits correctly inside `<SafeArea>` / `<Container>`.
 */

import { Text, type TextProps } from "../Text";

export type HeadlineProps = TextProps;

export const Headline: React.FC<HeadlineProps> = ({
  variant = "h1",
  color = "textPrimary",
  ...rest
}) => <Text variant={variant} color={color} {...rest} />;
