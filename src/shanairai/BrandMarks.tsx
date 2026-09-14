/**
 * shanairai/BrandMarks — the Shanair.AI identity nodes the scenes are handed.
 *
 * The scene primitives deliberately ship no identity: `LogoRevealScene`/`OutroScene` take a
 * `mark` node, `CTASection` takes an `actions` node, and `FeatureScene` distributes whatever
 * children it is given. These are those nodes — and they are composed ONLY from existing
 * primitives (`Container`, `Column`, `Headline`, `Eyebrow`, `Caption`, `CTA`) reading the
 * active brand theme through `useTheme()`. No new layout system, no hardcoded sizes: every
 * dimension is a `Layout` token that `Container` scales via `useScale()`, and every color is
 * a semantic role the brand pack owns.
 *
 * Motion is not applied here — the scenes own the choreography (ScaleIn / Float / FadeUp),
 * so these stay pure content and remain reusable in any scene slot.
 */

import { Caption, Column, Container, CTA, Eyebrow, Headline } from "../components";
import { useTheme } from "../config/ThemeContext";

export type WordmarkProps = {
  /** "lead" is the opening treatment (display type); "sign-off" is the smaller closing one. */
  size?: "lead" | "sign-off";
};

/**
 * The Shanair.AI wordmark: serif name, gold suffix, and a gold rule beneath it.
 * Typographic by construction, so it needs no image asset and scales with the format.
 */
export const Wordmark: React.FC<WordmarkProps> = ({ size = "lead" }) => {
  const theme = useTheme();
  const lead = size === "lead";

  return (
    <Column align="center" gap={lead ? "md" : "sm"}>
      <Headline variant={lead ? "display" : "h1"} align="center">
        Shanair<span style={{ color: theme.colors.accent }}>.AI</span>
      </Headline>
      <Container background="accent" width={lead ? 220 : 140} height={3} radius="pill" />
    </Column>
  );
};

export type CapabilityPillProps = {
  /** The capability name (overline treatment, accent color). */
  label: React.ReactNode;
  /** One supporting line beneath it. */
  detail?: React.ReactNode;
};

/** A bordered capability chip for the feature beat. Full-measure, so it stacks in 9:16. */
export const CapabilityPill: React.FC<CapabilityPillProps> = ({ label, detail }) => {
  const theme = useTheme();

  return (
    <Container
      background="surface"
      radius="pill"
      paddingX="xl"
      paddingY="md"
      width={760}
      style={{ border: `1px solid ${theme.colors.border}` }}
    >
      <Column align="center" gap="xxs">
        <Eyebrow align="center">{label}</Eyebrow>
        {detail ? <Caption align="center">{detail}</Caption> : null}
      </Column>
    </Container>
  );
};

export type ActionChipProps = {
  children?: React.ReactNode;
};

/** The outlined gold action chip used as the `actions` node on the CTA and outro scenes. */
export const ActionChip: React.FC<ActionChipProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Container
      radius="pill"
      paddingX="xl"
      paddingY="md"
      style={{ border: `2px solid ${theme.colors.accent}` }}
    >
      <CTA uppercase align="center">
        {children}
      </CTA>
    </Container>
  );
};
