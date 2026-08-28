/**
 * jetset/BrandMarks — campaign graphic treatments for Jet Set Adventures.
 *
 * These sit ON TOP of the established identity rather than replacing it: the badge is the real
 * mark, unmodified; the CTA reuses the site's own gold pill with navy sentence-case type; the
 * destination label borrows the site's existing eyebrow treatment (uppercase, 0.16em tracking,
 * soft gold) rather than inventing a new one.
 *
 * The only genuinely new element is the hairline rule under the wordmark, which is marked as a
 * proposed campaign addition in the brand audit and is trivial to remove.
 */

import { Column, Container, CTA, Eyebrow, Headline, Stack, Text } from "../components";
import { useTheme } from "../config/ThemeContext";
import { useAssetRegistry, resolveAsset } from "../assets";
import { Img } from "remotion";
import { useScale } from "../format";

/** The real circular badge, resolved from the brand kit. */
export const Badge: React.FC<{ size?: number }> = ({ size = 190 }) => {
  const registry = useAssetRegistry();
  const { scale } = useScale();
  const resolved = resolveAsset("badge", registry.require("badge"));
  const src = resolved.kind === "file" ? resolved.src : "";
  return <Img src={src} style={{ width: scale(size), height: scale(size), objectFit: "contain" }} />;
};

/** Shanair's cutout portrait, for the endcard. */
export const AdvisorPortrait: React.FC<{ height?: number }> = ({ height = 560 }) => {
  const registry = useAssetRegistry();
  const { scale } = useScale();
  const resolved = resolveAsset("advisor", registry.require("advisor"));
  const src = resolved.kind === "file" ? resolved.src : "";
  return <Img src={src} style={{ height: scale(height), width: "auto", objectFit: "contain" }} />;
};

/** The site's own CTA: gold pill, navy sentence-case label, full pill radius. */
export const PlanMyTripButton: React.FC<{ label?: string }> = ({ label = "Plan My Trip" }) => {
  const theme = useTheme();
  return (
    <Container
      radius="pill"
      paddingX="xl"
      paddingY="md"
      style={{ backgroundColor: theme.colors.primary }}
    >
      <CTA align="center" color="onPrimary" style={{ letterSpacing: "-0.025em" }}>
        {label}
      </CTA>
    </Container>
  );
};

/** A destination label in the site's existing eyebrow treatment. */
export const DestinationLabel: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Eyebrow align="left">{children}</Eyebrow>
);

/** PROPOSED campaign addition: a gold hairline rule. */
export const GoldRule: React.FC<{ width?: number }> = ({ width = 120 }) => (
  <Container background="accent" width={width} height={3} radius="pill" />
);

/**
 * The full endcard: Shanair anchored to the bottom of the frame with the brand stack above her.
 *
 * She is the business — the site's own line is "You're not hiring an agency. You're hiring
 * Shanair." — so the close introduces her rather than ending on an anonymous logo card. Her
 * cutout is bottom-anchored because the source portrait is cropped at the arms, which reads as
 * deliberate framing rather than a floating cut-out.
 *
 * The website is set at body scale, not caption, so it is comfortably readable at arm's length
 * on a phone. It renders exactly as www.thejetsetadventures.com.
 */
export const EndCard: React.FC = () => (
  <Stack>
    <Container fill style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <Column align="center" justify="end" gap="xs">
        <Headline variant="h3" align="center" style={{ letterSpacing: "-0.01em" }}>
          Shanair Johnson
        </Headline>
        <Eyebrow align="center">Owner &amp; Travel Advisor</Eyebrow>
        <AdvisorPortrait height={720} />
      </Column>
    </Container>

    <Container fill safeArea="social">
      <Column align="center" justify="start" gap="sm" style={{ width: "100%" }}>
        <Badge size={200} />
        <GoldRule width={110} />
        <Headline variant="h2" align="center" maxWidth={860} style={{ letterSpacing: "-0.03em" }}>
          Plan your next adventure
        </Headline>
        <Text variant="body" align="center" color="textPrimary" style={{ letterSpacing: "0.01em" }}>
          www.thejetsetadventures.com
        </Text>
        <PlanMyTripButton />
        <Eyebrow align="center">Luxury · Culture · Adventure · Group Travel</Eyebrow>
      </Column>
    </Container>
  </Stack>
);
