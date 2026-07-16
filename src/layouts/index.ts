/**
 * layouts/ — Scene layout frames.
 *
 * Structural shells that place content within the safe area for the active format:
 * SafeArea wrapper, CenteredStack, SplitLayout, LowerThirdFrame, HeroFrame. They own
 * positioning and spacing (from `config/Layout.ts`) but no content — scenes drop
 * children into their slots.
 *
 * Layouts prevent overlap by construction: reserve a slot per element, animate from it.
 */

export {};
