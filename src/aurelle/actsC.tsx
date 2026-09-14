/**
 * aurelle/actsC — Act 5 (the capability montage, 31–38s) and Act 6 (Shanair.AI + CTA, 38–45s).
 *
 * The energy flips: fast, confident, rhythmic. Four real industries each keep their OWN grade
 * (no recolour into the brand palette), then pull back into a grid that proves one system,
 * any industry. Then the creator steps out — the brand world in plum / cream / rose / gold —
 * with the honest "how" (AI + Claude Code + Remotion + creative direction) and a clean CTA the
 * final second can be screenshotted on.
 */

import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SafeArea, useScale } from "../format";
import { Appear, ClipRise, GoldRule, ramp, Scrim, Vignette } from "../promo/primitives";
import { Bokeh, FilmGrain, LightSweep } from "../promo/effects";
import { CREAM, GOLD, INK, PLUM, PLUM_DEEP, ROSE, withAlpha } from "../promo/palette";
import { Plate, TrackingReveal } from "./primitives";
import { hasVideo, slotStill, slotVideo, type MediaSlot } from "./media";
import { Display, Label } from "./type";
import { COPY } from "./config";

/* ─────────────────────────── Act 5 · Capability montage ─────────────────────────── */

/** One industry hero: a fast push that keeps the source's native colour, a whip-in, a label. */
const IndustryShot: React.FC<{
  slot: MediaSlot;
  label: string;
  focalX: number;
  focalY: number;
  panX?: number;
  panY?: number;
  sweep?: boolean;
  align?: "flex-start" | "center";
}> = ({ slot, label, focalX, focalY, panX = 0, panY = 0, sweep = false, align = "flex-start" }) => {
  const frame = useCurrentFrame();
  const inBlur = ramp(frame, [0, 5], [16, 0]);
  const inOp = ramp(frame, [0, 4], [0.15, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ opacity: inOp, filter: `blur(${inBlur}px)` }}>
        <Plate slot={slot} focalX={focalX} focalY={focalY} from={1.03} to={1.14} panX={panX} panY={panY} easing="entrance" videoPush={[1.0, 1.05]} />
      </AbsoluteFill>
      {sweep ? <LightSweep start={4} dur={22} angle={26} opacity={0.3} thickness={9} /> : null}
      <Scrim from="bottom" strength={0.9} />
      <Vignette strength={0.36} />
      <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: align, justifyContent: "flex-end" }}>
        <GoldRule in={[4, 16]} width={90} height={3} color={GOLD} />
        <div style={{ height: "1.6%" }} />
        <Appear in={[3, 14]} y={26} blur={5}>
          <Label size={40} tracking={0.22} color={CREAM} align={align === "center" ? "center" : "left"} style={{ textShadow: `0 3px 22px ${withAlpha(INK, 0.9)}` }}>
            {label}
          </Label>
        </Appear>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Act 5 · proof + brand ─────────────────────────── */

/** A moving "campaign board" — one AURELLE asset shown as a produced deliverable. */
const Board: React.FC<{ slot: MediaSlot; focalX: number; focalY: number; label: string; index: number }> = ({ slot, focalX, focalY, label, index }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, [4 + index * 6, 20 + index * 6]);
  const push = 1 + 0.08 * ramp(frame, [0, 90]);
  const media: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%`, scale: push };
  return (
    <div style={{ position: "relative", flex: 1, height: scale(430), borderRadius: scale(10), overflow: "hidden", border: `${scaleRounded(1)}px solid ${withAlpha(GOLD, 0.4)}`, opacity: p, translate: `0 ${scale(30) * (1 - p)}px`, boxShadow: `0 ${scale(20)}px ${scale(50)}px rgba(0,0,0,0.5)` }}>
      {hasVideo(slot) ? <OffthreadVideo src={staticFile(slotVideo(slot))} muted style={media} /> : <Img src={staticFile(slotStill(slot))} style={media} />}
      <Scrim from="bottom" strength={0.72} />
      <div style={{ position: "absolute", left: scale(12), bottom: scale(10) }}>
        <Label size={17} tracking={0.2} color={withAlpha(CREAM, 0.85)} align="left">
          {label}
        </Label>
      </div>
    </div>
  );
};

/** Process/proof: the AURELLE pieces as produced boards, then the brand steps in EARLY (~0:24). */
export const ActProof: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: PLUM_DEEP }}>
      <BrandBg />
      <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: scale(34) }}>
        <div style={{ display: "flex", gap: scale(14), width: "100%", justifyContent: "center" }}>
          <Board slot="product" focalX={0.5} focalY={0.56} label="BRAND" index={0} />
          <Board slot="flagship" focalX={0.5} focalY={0.4} label="CAMPAIGN" index={1} />
          <Board slot="icon" focalX={0.5} focalY={0.55} label="COMMERCIAL" index={2} />
        </div>
        <Appear in={[28, 46]} y={18} blur={6} scaleFrom={1.04}>
          <Display size={78} color={CREAM} weight={700} tracking={0.02}>
            BUILT WITH <span style={{ color: GOLD }}>Shanair.AI</span>
          </Display>
        </Appear>
        <Appear in={[42, 56]} y={12}>
          <Label size={20} tracking={0.26} color={withAlpha(CREAM, 0.7)}>
            {COPY.deconLabels.join(" · ")}
          </Label>
        </Appear>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Act 6 · the offer ─────────────────────────── */

export const ActOffer: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: PLUM_DEEP }}>
      <BrandBg />
      <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: scale(20) }}>
        <ClipRise in={[4, 20]}>
          <Display size={64} color={GOLD} weight={700} tracking={0.03}>
            {COPY.offerLead}
          </Display>
        </ClipRise>
        <Appear in={[22, 38]} y={16}>
          <Display size={44} color={withAlpha(CREAM, 0.92)} weight={500} tracking={0.03} align="center" style={{ maxWidth: scale(860) }}>
            {COPY.offerBody}
          </Display>
        </Appear>
        <div style={{ height: scale(6) }} />
        {/* NOW punches in timed to the spoken "now" at the end of the ~4.6s VO line. */}
        <TrackingReveal in={[118, 136]} from={0.02} to={0.1}>
          <Display size={128} color={CREAM} weight={700} tracking={0.02}>
            {COPY.offerNow}
          </Display>
        </TrackingReveal>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Act 7 · industries ─────────────────────────── */

export const ActIndustries: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    <Sequence durationInFrames={35} name="restaurants" layout="none">
      <IndustryShot slot="restaurant" label={COPY.industries[0].label} focalX={0.52} focalY={0.55} panY={-10} />
    </Sequence>
    <Sequence from={35} durationInFrames={35} name="real estate" layout="none">
      <IndustryShot slot="realEstate" label={COPY.industries[1].label} focalX={0.5} focalY={0.46} panY={-8} />
    </Sequence>
    <Sequence from={70} durationInFrames={35} name="travel" layout="none">
      <IndustryShot slot="travel" label={COPY.industries[2].label} focalX={0.58} focalY={0.5} panX={-14} />
    </Sequence>
    <Sequence from={105} durationInFrames={35} name="beauty" layout="none">
      <IndustryShot slot="founder" label={COPY.industries[3].label} focalX={0.42} focalY={0.55} panY={-8} sweep />
    </Sequence>
  </AbsoluteFill>
);

/* ─────────────────────────── the brand world (plum) ─────────────────────────── */

/** The brand world backdrop — deep plum with a soft gold sheen. */
const BrandBg: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 30%, ${PLUM} 0%, ${PLUM_DEEP} 62%, ${INK} 100%)` }} />
    <Bokeh count={10} seed={12} rgb="212,175,55" maxOpacity={0.28} drift={16} />
    <Vignette strength={0.5} />
    <FilmGrain opacity={0.05} />
  </AbsoluteFill>
);

/** The Shanair.AI wordmark — Playfair name, gold .AI suffix, gold rule. */
const BrandWordmark: React.FC<{ size?: number }> = ({ size = 138 }) => {
  const { scale } = useScale();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: scale(18) }}>
      <Display size={size} color={CREAM} weight={700} tracking={0.01}>
        Shanair<span style={{ color: GOLD }}>{COPY.brandSuffix}</span>
      </Display>
      <GoldRule in={[10, 30]} width={250} height={3} color={GOLD} />
    </div>
  );
};

/* ─────────────────────────── Act 6 · the client pivot ─────────────────────────── */

/* ─────────────────────────── Act 8 · Shanair.AI + CTA ─────────────────────────── */

export const ActFinale: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: PLUM_DEEP }}>
      <BrandBg />
      <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: scale(26) }}>
        <Appear in={[6, 26]} y={24} blur={6} scaleFrom={1.04}>
          <BrandWordmark />
        </Appear>
        <Appear in={[22, 40]} y={16}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: scale(4) }}>
            <Display size={54} color={CREAM} weight={600} tracking={0.03}>
              {COPY.unforgettable[0]}
            </Display>
            <Display size={92} color={GOLD} weight={700} tracking={0.02}>
              {COPY.unforgettable[1]}
            </Display>
          </div>
        </Appear>
        <Appear in={[40, 54]} y={12} style={{ marginTop: scale(8) }}>
          <div
            style={{
              border: `${scale(2)}px solid ${GOLD}`,
              borderRadius: 999,
              padding: `${scale(14)}px ${scale(34)}px`,
              display: "flex",
              alignItems: "center",
              gap: scale(16),
            }}
          >
            <Label size={24} tracking={0.2} color={GOLD}>
              {COPY.cta}
            </Label>
            <div style={{ width: scale(6), height: scale(6), borderRadius: 999, background: withAlpha(ROSE, 0.9) }} />
            <Label size={24} tracking={0.12} color={CREAM}>
              {COPY.site}
            </Label>
          </div>
        </Appear>
        <Appear in={[52, 66]} y={10} style={{ marginTop: scale(2) }}>
          <Label size={18} tracking={0.26} color={withAlpha(CREAM, 0.6)}>
            {COPY.withStack.join(" · ").replace(/\.$/g, "")}
          </Label>
        </Appear>
      </SafeArea>
    </AbsoluteFill>
  );
};
