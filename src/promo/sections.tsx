/**
 * promo/sections — the six beats of the film, each authored against local frame 0 (they run
 * inside their own <Sequence>). Footage is the real Jet Set master via <HeroClip>; motion is
 * frame-driven; type reuses the <Text> primitive + Shanair.AI brand theme. Copy/timing come
 * from ./config so this file stays structure, not content.
 */

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Text } from "../components";
import { SafeArea } from "../format";
import { useScale } from "../format";
import { Wordmark } from "../shanairai/BrandMarks";
import { SHOTS } from "./config";
import { useCopy } from "./PromoContext";
import { MONO } from "./fonts";
import { CREAM, GOLD, GOLD_SOFT, INK, PLUM, PLUM_DEEP, withAlpha } from "./palette";
import { Appear, ClipRise, GoldRule, HeroClip, ramp, Scrim, Vignette } from "./primitives";
import {
  CodeBlock,
  CompositionFrame,
  FrameCounter,
  TerminalWindow,
  TimelineTracks,
  Typed,
  type CodeLineTokens,
} from "./ui";

/** Absolutely-centered flex column. */
const Center: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties; justify?: string }> = ({
  children,
  style,
  justify = "center",
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: justify, ...style }}>{children}</AbsoluteFill>
);

/** Custom-sized display line reusing the Text primitive (theme font + color). */
const Display: React.FC<{
  children: React.ReactNode;
  px: number;
  color?: React.ComponentProps<typeof Text>["color"];
  style?: React.CSSProperties;
}> = ({ children, px, color = "textPrimary", style }) => {
  const { scale } = useScale();
  return (
    <Text
      variant="display"
      color={color}
      align="center"
      style={{ fontSize: scale(px), lineHeight: 1.02, letterSpacing: "-0.01em", ...style }}
    >
      {children}
    </Text>
  );
};

/* ═══════════════════════ 0:00–0:04 · THE HOOK ═══════════════════════ */

const HookCut: React.FC<{ from: number; len: number; at: number; kb: [number, number] }> = ({ from, len, at, kb }) => (
  <Sequence from={from} durationInFrames={len} name={`hook-cut@${at}s`} layout="none">
    <HeroClip at={at} kenBurns={{ from: kb[0], to: kb[1], easing: "gentle" }} />
  </Sequence>
);

export const Hook: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* fast premium cuts of the strongest shots */}
      <HookCut from={0} len={30} at={SHOTS.balconyDoors} kb={[1.06, 1.14]} />
      <HookCut from={30} len={28} at={SHOTS.poolJump} kb={[1.05, 1.13]} />
      <HookCut from={58} len={28} at={SHOTS.dubaiSkyline} kb={[1.04, 1.12]} />
      <HookCut from={86} len={22} at={SHOTS.neonDance} kb={[1.06, 1.14]} />
      <HookCut from={108} len={12} at={SHOTS.boardwalk} kb={[1.04, 1.1]} />

      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1} />

      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(60) }}>
          {/* the hook statement */}
          <Appear in={[0, 2]} out={[74, 84]} y={0} blur={0} style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ClipRise in={[8, 24]}>
                <Display px={104} style={{ fontWeight: 600 }}>
                  {copy.hook.line1}
                </Display>
              </ClipRise>
              <ClipRise in={[16, 32]}>
                <Display px={104} color="textPrimary" style={{ fontWeight: 700 }}>
                  {copy.hook.line2}
                </Display>
              </ClipRise>
            </div>
          </Appear>

          {/* the turn — carries into the reveal */}
          <Appear in={[84, 100]} y={20} blur={6} style={{ marginTop: scale(26) }}>
            <Text
              variant="h3"
              color="textSecondary"
              align="center"
              style={{ fontStyle: "italic", fontSize: scale(46), letterSpacing: "0.01em" }}
            >
              {copy.hook.turn}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:04–0:08 · THE REVEAL ═══════════════════════ */

/** Thin rule-of-thirds guides + corner frame numbers — hints "this is a composition". */
const GuideOverlay: React.FC<{ in: [number, number] }> = ({ in: inRange }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, inRange);
  const line = (s: React.CSSProperties) => (
    <div style={{ position: "absolute", background: withAlpha(GOLD, 0.55), ...s }} />
  );
  return (
    <AbsoluteFill style={{ opacity: p * 0.55 }}>
      {line({ left: "33.33%", top: 0, bottom: 0, width: scaleRounded(1) })}
      {line({ left: "66.66%", top: 0, bottom: 0, width: scaleRounded(1) })}
      {line({ top: "33.33%", left: 0, right: 0, height: scaleRounded(1) })}
      {line({ top: "66.66%", left: 0, right: 0, height: scaleRounded(1) })}
      <div style={{ position: "absolute", top: scale(120), left: scale(48) }}>
        <FrameCounter base={480} />
      </div>
      <div style={{ position: "absolute", top: scale(120), right: scale(48), fontFamily: MONO, fontSize: scale(20), color: GOLD_SOFT, letterSpacing: "0.12em" }}>
        9:16 · 1080×1920
      </div>
    </AbsoluteFill>
  );
};

export const Reveal: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  const frame = useCurrentFrame();
  const inkIn = ramp(frame, [78, 92]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* Phase A — the finished commercial, revealed as a composition */}
      <HeroClip at={SHOTS.nightDance} kenBurns={{ from: 1.03, to: 1.12, easing: "gentle" }} />
      <GuideOverlay in={[24, 60]} />
      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1.05} />

      <SafeArea preset="social" style={{ display: "flex" }}>
        {/* the two denials land one at a time — the first fully exits before the second enters */}
        <Center justify="flex-end" style={{ paddingBottom: scale(70) }}>
          <Appear in={[8, 22]} out={[38, 50]} y={22} blur={6}>
            <Display px={78} style={{ fontWeight: 600 }}>
              {copy.reveal.a}
            </Display>
          </Appear>
          <Appear in={[50, 64]} out={[80, 92]} y={22} blur={6} style={{ position: "absolute", bottom: scale(70) }}>
            <Display px={78} style={{ fontWeight: 600 }}>
              {copy.reveal.b}
            </Display>
          </Appear>
        </Center>
      </SafeArea>

      {/* Phase B — the reveal proper */}
      <AbsoluteFill style={{ backgroundColor: INK, opacity: inkIn }}>
        <Center>
          <Appear in={[92, 104]} y={0} blur={0} style={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
            <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(24), marginBottom: scale(28) }}>
              BUILT WITH
            </Text>
            <ClipRise in={[96, 112]}>
              <Display px={92} color="textPrimary">
                {copy.reveal.tool1}
              </Display>
            </ClipRise>
            <div style={{ height: scale(10) }} />
            <ClipRise in={[104, 118]}>
              <Display px={92} color="accent" style={{ fontStyle: "italic" }}>
                {copy.reveal.plus} {copy.reveal.tool2}
              </Display>
            </ClipRise>
            <div style={{ marginTop: scale(34) }}>
              <GoldRule in={[112, 130]} width={260} color={GOLD} />
            </div>
          </Appear>
        </Center>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:08–0:14 · CLAUDE CODE ═══════════════════════ */

const CLAUDE_CODE_LINES: Array<{ tokens: CodeLineTokens; indent?: number }> = [
  { tokens: [{ k: "keyword", v: "export const " }, { k: "plain", v: "JetSetAd " }, { k: "punct", v: "= () => (" }] },
  { tokens: [{ k: "tag", v: "<Composition" }, { k: "attr", v: " id" }, { k: "punct", v: "=" }, { k: "string", v: '"JetSet"' }, { k: "attr", v: " fps" }, { k: "punct", v: "={" }, { k: "number", v: "30" }, { k: "punct", v: "}" }], indent: 1 },
  { tokens: [{ k: "attr", v: "width" }, { k: "punct", v: "={" }, { k: "number", v: "1080" }, { k: "punct", v: "} " }, { k: "attr", v: "height" }, { k: "punct", v: "={" }, { k: "number", v: "1920" }, { k: "punct", v: "} />" }], indent: 2 },
  { tokens: [{ k: "tag", v: "<Sequence" }, { k: "attr", v: " from" }, { k: "punct", v: "={" }, { k: "number", v: "0" }, { k: "punct", v: "}>" }], indent: 1 },
  { tokens: [{ k: "tag", v: "<Shot" }, { k: "attr", v: " media" }, { k: "punct", v: "=" }, { k: "string", v: '"balconyDoors"' }, { k: "punct", v: " />" }], indent: 2 },
  { tokens: [{ k: "comment", v: "// every frame, driven by code" }], indent: 2 },
];

export const ClaudeCode: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  const frame = useCurrentFrame();
  const termOut = ramp(frame, [92, 106], [1, 0]);
  const codeIn = ramp(frame, [98, 112]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 20%, ${withAlpha(PLUM, 0.5)} 0%, ${INK} 62%)` }}>
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-start" style={{ paddingTop: scale(40) }}>
          <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(23), marginBottom: scale(30) }}>
            I DIRECT · CLAUDE CODE BUILDS
          </Text>

          {/* Phase 1 — the prompt, typed */}
          <div style={{ opacity: termOut, position: codeIn > 0.02 ? "absolute" : "relative", top: scale(150) }}>
            <TerminalWindow width={840}>
              <div style={{ display: "flex", flexDirection: "column", gap: scale(14) }}>
                <div style={{ fontFamily: MONO, fontSize: scale(20), color: withAlpha(CREAM, 0.4) }}>
                  claude-code · session started
                </div>
                <Typed
                  text={copy.claude.prompt}
                  start={10}
                  cps={0.82}
                  size={27}
                  prefix={<span style={{ color: GOLD, marginRight: scale(10) }}>&gt;</span>}
                />
              </div>
            </TerminalWindow>
          </div>

          {/* Phase 2 — code assembles */}
          {codeIn > 0.01 ? (
            <div style={{ opacity: codeIn, translate: `0 ${(1 - codeIn) * scale(26)}px`, width: "100%", alignItems: "center", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  width: scale(880),
                  background: withAlpha("#0E0910", 0.9),
                  border: `1px solid ${withAlpha(GOLD, 0.18)}`,
                  borderRadius: scale(18),
                  padding: `${scale(30)}px ${scale(36)}px`,
                }}
              >
                <CodeBlock lines={CLAUDE_CODE_LINES} start={104} stagger={7} size={25} />
              </div>
            </div>
          ) : null}
        </Center>

        {/* directive copy */}
        <Center justify="flex-end" style={{ paddingBottom: scale(70) }}>
          <Appear in={[126, 140]} y={20} blur={5}>
            <Display px={64} style={{ fontWeight: 600 }}>
              {copy.claude.direct}
            </Display>
          </Appear>
          <Appear in={[144, 158]} y={20} blur={5} style={{ marginTop: scale(8) }}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(46) }}>
              {copy.claude.build}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:14–0:20 · REMOTION ═══════════════════════ */

export const RemotionSection: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  const frame = useCurrentFrame();
  const tracksOut = ramp(frame, [82, 96], [1, 0]);
  const frameIn = ramp(frame, [86, 100]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 80%, ${withAlpha(PLUM, 0.45)} 0%, ${INK} 60%)` }}>
      <SafeArea preset="social" style={{ display: "flex" }}>
        {/* lead line, top — fades out as the composition frame takes over */}
        <div style={{ position: "absolute", top: scale(56), left: 0, right: 0 }}>
          <Appear in={[6, 20]} out={[80, 94]} y={18} blur={5}>
            <Display px={60} style={{ fontWeight: 600 }}>
              {copy.remotion.lead}
            </Display>
          </Appear>
        </div>

        {/* Phase 1 — the five tracks build */}
        <Center style={{ opacity: tracksOut }}>
          <TimelineTracks labels={[...copy.remotion.tracks]} start={16} playheadStart={40} playheadLen={70} width={900} />
        </Center>

        {/* Phase 2 — footage inside a clean composition frame */}
        {frameIn > 0.01 ? (
          <Center style={{ opacity: frameIn }}>
            <CompositionFrame at={SHOTS.rooftopDinner} width={560} start={88} />
            <div style={{ position: "absolute", bottom: scale(150), display: "flex", flexDirection: "column", alignItems: "center", gap: scale(4) }}>
              {copy.remotion.every.map((line, i) => (
                <Appear key={line} in={[120 + i * 9, 130 + i * 9]} y={12} blur={4}>
                  <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(40) }}>
                    {line}
                  </Text>
                </Appear>
              ))}
            </div>
          </Center>
        ) : null}

        {/* closing period */}
        <Center justify="flex-end" style={{ paddingBottom: scale(60) }}>
          <Appear in={[152, 166]} y={18} blur={6}>
            <Display px={72} color="accent" style={{ fontWeight: 700 }}>
              {copy.remotion.built}
            </Display>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:20–0:25 · THE RESULT ═══════════════════════ */

const ResultCut: React.FC<{ from: number; len: number; at: number; focalY?: number }> = ({ from, len, at, focalY }) => (
  <Sequence from={from} durationInFrames={len} name={`result-cut@${at}s`} layout="none">
    <HeroClip at={at} focalY={focalY} kenBurns={{ from: 1.02, to: 1.09, easing: "gentle" }} />
  </Sequence>
);

export const Result: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <ResultCut from={0} len={40} at={SHOTS.rooftopDinner} />
      <ResultCut from={40} len={38} at={SHOTS.poolJump} />
      <ResultCut from={78} len={38} at={SHOTS.dubaiSkyline} />
      <ResultCut from={116} len={34} at={SHOTS.balconySunset} />

      <Vignette strength={0.55} />
      <Scrim from="bottom" strength={0.95} />

      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(64) }}>
          <Appear in={[10, 24]} out={[38, 46]} y={18} blur={5}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(48), fontStyle: "italic" }}>
              {copy.result.q}
            </Text>
          </Appear>
          <Appear in={[52, 66]} out={[104, 114]} y={20} blur={6} style={{ position: "absolute", bottom: scale(64) }}>
            <Display px={84} style={{ fontWeight: 700 }}>
              {copy.result.a}
            </Display>
          </Appear>
          <Appear in={[120, 134]} y={16} blur={5} style={{ position: "absolute", bottom: scale(70) }}>
            <Text variant="overline" color="textPrimary" align="center" style={{ fontSize: scale(30), letterSpacing: "0.22em" }}>
              {copy.result.b}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:25–0:30 · BUSINESS CTA ═══════════════════════ */

export const CTASection: React.FC = () => {
  const { scale } = useScale();
  const copy = useCopy();
  const frame = useCurrentFrame();
  const drift = ramp(frame, [0, 150], [0, 1], undefined);
  const shimmer = 0.5 + 0.5 * Math.sin((frame / 150) * Math.PI);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DEEP} 46%, ${INK} 100%)` }}>
      {/* last footage frame dissolving away, keeps continuity */}
      <HeroClip at={SHOTS.balconySunset} opacity={ramp(frame, [0, 22], [0.5, 0])} kenBurns={{ from: 1.02, to: 1.1 }} />
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${withAlpha(PLUM, 0.4)} 0%, ${withAlpha(INK, 0.9)} 70%)` }} />
      <Vignette strength={0.6} />

      <SafeArea preset="social" style={{ display: "flex" }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${(1 - drift) * scale(16)}px` }}>
          <Appear in={[8, 20]}>
            <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(24), letterSpacing: "0.28em" }}>
              {copy.cta.eyebrow.toUpperCase()}
            </Text>
          </Appear>

          <div style={{ height: scale(24) }} />
          <ClipRise in={[16, 34]}>
            <Display px={66} style={{ fontWeight: 700, maxWidth: scale(900) }}>
              {copy.cta.head}
            </Display>
          </ClipRise>

          <div style={{ height: scale(40) }} />
          <Appear in={[42, 56]} y={16}>
            <Text variant="h3" color="textPrimary" align="center" style={{ fontSize: scale(44) }}>
              {copy.cta.sub1}
            </Text>
          </Appear>
          <Appear in={[52, 66]} y={14} style={{ marginTop: scale(6) }}>
            <Text variant="body" color="textSecondary" align="center" style={{ fontSize: scale(32), letterSpacing: "0.06em" }}>
              {copy.cta.sub2}
            </Text>
          </Appear>

          <div style={{ marginTop: scale(40), marginBottom: scale(40) }}>
            <GoldRule in={[64, 82]} width={220} color={GOLD} />
          </div>

          {/* action chip */}
          <Appear in={[72, 88]} y={16} scaleFrom={0.94}>
            <div
              style={{
                borderRadius: 999,
                padding: `${scale(20)}px ${scale(48)}px`,
                border: `${Math.max(2, scale(2))}px solid ${GOLD}`,
                boxShadow: `0 0 ${scale(30)}px ${withAlpha(GOLD, 0.25 + 0.25 * shimmer)}`,
              }}
            >
              <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(28), letterSpacing: "0.16em" }}>
                {copy.cta.action.toUpperCase()}
              </Text>
            </div>
          </Appear>

          {/* wordmark + site */}
          <div style={{ height: scale(56) }} />
          <Appear in={[92, 108]} y={14}>
            <Wordmark size="sign-off" />
          </Appear>
          <Appear in={[106, 120]} y={12} style={{ marginTop: scale(18) }}>
            <Text variant="caption" color="textMuted" align="center" style={{ fontSize: scale(28), letterSpacing: "0.14em" }}>
              {copy.cta.site}
            </Text>
          </Appear>
        </AbsoluteFill>
      </SafeArea>
    </AbsoluteFill>
  );
};
