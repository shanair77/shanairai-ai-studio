/**
 * promo/Commercial45 — the 45s "made with Claude Code + Remotion" commercial, cut from NEW
 * moving footage (cinematic AI-generated clips, not the Jet Set master).
 *
 * Same concept, copy and cloned-voice narration as the original 30s film; reuses the shared
 * design system (brand theme, Text/SafeArea/useScale, primitives) and the code/terminal/timeline
 * motion-graphics from ./ui. Footage is played with <OffthreadVideo> so it actually moves. All
 * motion is frame-driven.
 */

import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { KenBurns, type KenBurnsProps } from "../animations";
import { BrandProvider, resolveBrand } from "../brand";
import { Text } from "../components";
import { SafeArea, useScale } from "../format";
import { shanairAI } from "../shanairai/brand";
import { Wordmark } from "../shanairai/BrandMarks";
import {
  C45_COPY as COPY,
  C45_MUSIC,
  C45_SECTIONS as S,
  C45_SFX,
  C45_VOICEOVER,
  C45_FPS,
  C45_DURATION,
  CLIPS,
} from "./commercial45Config";
import { MONO } from "./fonts";
import { CREAM, GOLD, GOLD_SOFT, INK, PLUM, PLUM_DEEP, withAlpha } from "./palette";
import { Appear, ClipRise, GoldRule, ramp, Scrim, Vignette } from "./primitives";
import { CodeBlock, FrameCounter, TerminalWindow, TimelineTracks, Typed, type CodeLineTokens } from "./ui";

const brand = resolveBrand(shanairAI);

/* ─────────────────────────── shared helpers ─────────────────────────── */

const Center: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties; justify?: string }> = ({ children, style, justify = "center" }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: justify, ...style }}>{children}</AbsoluteFill>
);

const Display: React.FC<{ children: React.ReactNode; px: number; color?: React.ComponentProps<typeof Text>["color"]; style?: React.CSSProperties }> = ({ children, px, color = "textPrimary", style }) => {
  const { scale } = useScale();
  return (
    <Text variant="display" color={color} align="center" style={{ fontSize: scale(px), lineHeight: 1.02, letterSpacing: "-0.01em", ...style }}>
      {children}
    </Text>
  );
};

/** A moving footage clip, full-bleed, muted, optionally with a subtle Ken Burns on top. */
const Clip: React.FC<{ src: string; trimStart?: number; kenBurns?: KenBurnsProps; focalY?: number; opacity?: number }> = ({ src, trimStart = 0, kenBurns, focalY = 0.5, opacity }) => {
  const { fps } = useVideoConfig();
  const video = (
    <OffthreadVideo
      src={staticFile(src)}
      muted
      trimBefore={Math.round(trimStart * fps)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${focalY * 100}%` }}
    />
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK, opacity }}>
      {kenBurns ? <KenBurns {...kenBurns}>{video}</KenBurns> : video}
    </AbsoluteFill>
  );
};

const Cut: React.FC<{ from: number; len: number; src: string; kb?: [number, number]; focalY?: number }> = ({ from, len, src, kb, focalY }) => (
  <Sequence from={from} durationInFrames={len} name={`cut · ${src.split("/").pop()}`} layout="none">
    <Clip src={src} focalY={focalY} kenBurns={kb ? { from: kb[0], to: kb[1], easing: "gentle" } : undefined} />
  </Sequence>
);

/* ═══════════════════════ 0:00–0:06 · HOOK ═══════════════════════ */

const Hook: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Cut from={0} len={40} src={CLIPS.fashion} kb={[1.02, 1.07]} focalY={0.45} />
      <Cut from={40} len={38} src={CLIPS.car} kb={[1.02, 1.07]} />
      <Cut from={78} len={36} src={CLIPS.architecture} kb={[1.03, 1.08]} />
      <Cut from={114} len={36} src={CLIPS.penthouse} kb={[1.02, 1.07]} />
      <Cut from={150} len={30} src={CLIPS.beauty} kb={[1.02, 1.06]} focalY={0.38} />

      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(80) }}>
          <Appear in={[0, 2]} out={[112, 124]} y={0} blur={0} style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ClipRise in={[12, 30]}>
                <Display px={104} style={{ fontWeight: 600 }}>
                  {COPY.hook.line1}
                </Display>
              </ClipRise>
              <ClipRise in={[22, 40]}>
                <Display px={104} style={{ fontWeight: 700 }}>
                  {COPY.hook.line2}
                </Display>
              </ClipRise>
            </div>
          </Appear>
          <Appear in={[128, 144]} y={20} blur={6} style={{ marginTop: scale(26) }}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontStyle: "italic", fontSize: scale(46) }}>
              {COPY.hook.turn}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:06–0:12 · REVEAL ═══════════════════════ */

const GuideOverlay: React.FC<{ in: [number, number] }> = ({ in: inRange }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, inRange);
  const line = (s: React.CSSProperties) => <div style={{ position: "absolute", background: withAlpha(GOLD, 0.55), ...s }} />;
  return (
    <AbsoluteFill style={{ opacity: p * 0.55 }}>
      {line({ left: "33.33%", top: 0, bottom: 0, width: scaleRounded(1) })}
      {line({ left: "66.66%", top: 0, bottom: 0, width: scaleRounded(1) })}
      {line({ top: "33.33%", left: 0, right: 0, height: scaleRounded(1) })}
      {line({ top: "66.66%", left: 0, right: 0, height: scaleRounded(1) })}
      <div style={{ position: "absolute", top: scale(120), left: scale(48) }}>
        <FrameCounter base={720} />
      </div>
      <div style={{ position: "absolute", top: scale(120), right: scale(48), fontFamily: MONO, fontSize: scale(20), color: GOLD_SOFT, letterSpacing: "0.12em" }}>
        9:16 · 1080×1920
      </div>
    </AbsoluteFill>
  );
};

const Reveal: React.FC = () => {
  const { scale } = useScale();
  const frame = useCurrentFrame();
  const inkIn = ramp(frame, [116, 132]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Clip src={CLIPS.architecture} kenBurns={{ from: 1.02, to: 1.1, easing: "gentle" }} />
      <GuideOverlay in={[24, 60]} />
      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1.05} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(80) }}>
          <Appear in={[10, 26]} out={[48, 60]} y={22} blur={6}>
            <Display px={78} style={{ fontWeight: 600 }}>
              {COPY.reveal.a}
            </Display>
          </Appear>
          <Appear in={[64, 80]} out={[100, 112]} y={22} blur={6} style={{ position: "absolute", bottom: scale(80) }}>
            <Display px={78} style={{ fontWeight: 600 }}>
              {COPY.reveal.b}
            </Display>
          </Appear>
        </Center>
      </SafeArea>
      <AbsoluteFill style={{ backgroundColor: INK, opacity: inkIn }}>
        <Center>
          <Appear in={[130, 146]} y={0} blur={0} style={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
            <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(24), marginBottom: scale(28) }}>
              BUILT WITH
            </Text>
            <ClipRise in={[136, 152]}>
              <Display px={92}>{COPY.reveal.tool1}</Display>
            </ClipRise>
            <div style={{ height: scale(10) }} />
            <ClipRise in={[146, 162]}>
              <Display px={92} color="accent" style={{ fontStyle: "italic" }}>
                {COPY.reveal.plus} {COPY.reveal.tool2}
              </Display>
            </ClipRise>
            <div style={{ marginTop: scale(34) }}>
              <GoldRule in={[154, 172]} width={260} color={GOLD} />
            </div>
          </Appear>
        </Center>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:12–0:21 · CLAUDE CODE ═══════════════════════ */

const CODE_LINES: Array<{ tokens: CodeLineTokens; indent?: number }> = [
  { tokens: [{ k: "keyword", v: "export const " }, { k: "plain", v: "Commercial " }, { k: "punct", v: "= () => (" }] },
  { tokens: [{ k: "tag", v: "<Composition" }, { k: "attr", v: " id" }, { k: "punct", v: "=" }, { k: "string", v: '"ShanairAI"' }, { k: "attr", v: " fps" }, { k: "punct", v: "={" }, { k: "number", v: "30" }, { k: "punct", v: "}" }], indent: 1 },
  { tokens: [{ k: "attr", v: "width" }, { k: "punct", v: "={" }, { k: "number", v: "1080" }, { k: "punct", v: "} " }, { k: "attr", v: "height" }, { k: "punct", v: "={" }, { k: "number", v: "1920" }, { k: "punct", v: "} />" }], indent: 2 },
  { tokens: [{ k: "tag", v: "<Sequence" }, { k: "attr", v: " from" }, { k: "punct", v: "={" }, { k: "number", v: "0" }, { k: "punct", v: "}>" }], indent: 1 },
  { tokens: [{ k: "tag", v: "<Shot" }, { k: "attr", v: " media" }, { k: "punct", v: "=" }, { k: "string", v: '"fashion"' }, { k: "attr", v: " grade" }, { k: "punct", v: "=" }, { k: "string", v: '"cinematic"' }, { k: "punct", v: " />" }], indent: 2 },
  { tokens: [{ k: "comment", v: "// every frame, driven by code" }], indent: 2 },
];

const ClaudeCode: React.FC = () => {
  const { scale } = useScale();
  const frame = useCurrentFrame();
  const termOut = ramp(frame, [128, 144], [1, 0]);
  const codeIn = ramp(frame, [136, 152]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 20%, ${withAlpha(PLUM, 0.5)} 0%, ${INK} 62%)` }}>
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-start" style={{ paddingTop: scale(50) }}>
          <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(23), marginBottom: scale(34) }}>
            I DIRECT · CLAUDE CODE BUILDS
          </Text>
          <div style={{ opacity: termOut, position: codeIn > 0.02 ? "absolute" : "relative", top: scale(170) }}>
            <TerminalWindow width={840}>
              <div style={{ display: "flex", flexDirection: "column", gap: scale(14) }}>
                <div style={{ fontFamily: MONO, fontSize: scale(20), color: withAlpha(CREAM, 0.4) }}>claude-code · session started</div>
                <Typed text={COPY.claude.prompt} start={16} cps={0.7} size={27} prefix={<span style={{ color: GOLD, marginRight: scale(10) }}>&gt;</span>} />
              </div>
            </TerminalWindow>
          </div>
          {codeIn > 0.01 ? (
            <div style={{ opacity: codeIn, translate: `0 ${(1 - codeIn) * scale(26)}px`, width: "100%", alignItems: "center", display: "flex", flexDirection: "column" }}>
              <div style={{ width: scale(880), background: withAlpha("#0E0910", 0.9), border: `1px solid ${withAlpha(GOLD, 0.18)}`, borderRadius: scale(18), padding: `${scale(30)}px ${scale(36)}px` }}>
                <CodeBlock lines={CODE_LINES} start={150} stagger={9} size={25} />
              </div>
            </div>
          ) : null}
        </Center>
        <Center justify="flex-end" style={{ paddingBottom: scale(84) }}>
          <Appear in={[196, 212]} y={20} blur={5}>
            <Display px={64} style={{ fontWeight: 600 }}>
              {COPY.claude.direct}
            </Display>
          </Appear>
          <Appear in={[214, 230]} y={20} blur={5} style={{ marginTop: scale(8) }}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(46) }}>
              {COPY.claude.build}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:21–0:30 · REMOTION ═══════════════════════ */

/** Composition frame with a moving clip inside + chrome. */
const CompFrameClip: React.FC<{ src: string; width?: number; start?: number }> = ({ src, width = 560, start = 0 }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, [start, start + 16]);
  const h = width * (16 / 9);
  const sweep = ramp(frame, [start + 8, start + 200]);
  const tick = scale(26);
  const corner = (pos: React.CSSProperties): React.CSSProperties => ({ position: "absolute", width: tick, height: tick, ...pos });
  return (
    <div style={{ opacity: p, scale: 0.94 + p * 0.06 }}>
      <div style={{ position: "relative", width: scale(width), height: scale(h) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: scale(22), overflow: "hidden", border: `${scaleRounded(2)}px solid ${withAlpha(GOLD, 0.5)}` }}>
          <Clip src={src} kenBurns={{ from: 1.03, to: 1.08, easing: "gentle" }} />
        </div>
        <div style={corner({ top: -scale(6), left: -scale(6), borderTop: `${scaleRounded(3)}px solid ${GOLD}`, borderLeft: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ top: -scale(6), right: -scale(6), borderTop: `${scaleRounded(3)}px solid ${GOLD}`, borderRight: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ bottom: -scale(6), left: -scale(6), borderBottom: `${scaleRounded(3)}px solid ${GOLD}`, borderLeft: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ bottom: -scale(6), right: -scale(6), borderBottom: `${scaleRounded(3)}px solid ${GOLD}`, borderRight: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={{ position: "absolute", top: scale(18), left: scale(18), fontFamily: MONO, fontSize: scale(18), letterSpacing: "0.12em", color: CREAM, background: withAlpha("#000000", 0.42), padding: `${scale(4)}px ${scale(10)}px`, borderRadius: scale(6) }}>
          1080×1920 · 30 FPS
        </div>
      </div>
      <div style={{ width: scale(width), marginTop: scale(20), height: scale(12), borderRadius: 999, background: withAlpha(CREAM, 0.12), position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, width: `${sweep * 100}%`, background: withAlpha(GOLD, 0.6), borderRadius: 999 }} />
        <div style={{ position: "absolute", top: -scale(6), left: `${sweep * 100}%`, width: scaleRounded(3), height: scale(24), background: GOLD }} />
      </div>
    </div>
  );
};

const RemotionSection: React.FC = () => {
  const { scale } = useScale();
  const frame = useCurrentFrame();
  const tracksOut = ramp(frame, [140, 156], [1, 0]);
  const frameIn = ramp(frame, [146, 162]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 80%, ${withAlpha(PLUM, 0.45)} 0%, ${INK} 60%)` }}>
      <SafeArea preset="social" style={{ display: "flex" }}>
        <div style={{ position: "absolute", top: scale(60), left: 0, right: 0 }}>
          <Appear in={[8, 24]} out={[140, 156]} y={18} blur={5}>
            <Display px={60} style={{ fontWeight: 600 }}>
              {COPY.remotion.lead}
            </Display>
          </Appear>
        </div>
        <Center style={{ opacity: tracksOut }}>
          <TimelineTracks labels={[...COPY.remotion.tracks]} start={20} playheadStart={54} playheadLen={90} width={900} />
        </Center>
        {frameIn > 0.01 ? (
          <Center style={{ opacity: frameIn }}>
            <CompFrameClip src={CLIPS.penthouse} width={560} start={150} />
            <div style={{ position: "absolute", bottom: scale(160), display: "flex", flexDirection: "column", alignItems: "center", gap: scale(4) }}>
              {COPY.remotion.every.map((line, i) => (
                <Appear key={line} in={[196 + i * 10, 208 + i * 10]} y={12} blur={4}>
                  <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(40) }}>
                    {line}
                  </Text>
                </Appear>
              ))}
            </div>
          </Center>
        ) : null}
        <Center justify="flex-end" style={{ paddingBottom: scale(70) }}>
          <Appear in={[236, 252]} y={18} blur={6}>
            <Display px={72} color="accent" style={{ fontWeight: 700 }}>
              {COPY.remotion.built}
            </Display>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:30–0:37.5 · RESULT ═══════════════════════ */

const Result: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Cut from={0} len={62} src={CLIPS.penthouse} kb={[1.02, 1.06]} />
      <Cut from={62} len={58} src={CLIPS.car} kb={[1.02, 1.06]} />
      <Cut from={120} len={55} src={CLIPS.fashion} kb={[1.02, 1.06]} focalY={0.45} />
      <Cut from={175} len={50} src={CLIPS.dining} kb={[1.02, 1.06]} />
      <Vignette strength={0.55} />
      <Scrim from="bottom" strength={0.95} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(84) }}>
          <Appear in={[14, 30]} out={[52, 62]} y={18} blur={5}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(48), fontStyle: "italic" }}>
              {COPY.result.q}
            </Text>
          </Appear>
          <Appear in={[74, 90]} out={[150, 162]} y={20} blur={6} style={{ position: "absolute", bottom: scale(84) }}>
            <Display px={84} style={{ fontWeight: 700 }}>
              {COPY.result.a}
            </Display>
          </Appear>
          <Appear in={[176, 192]} y={16} blur={5} style={{ position: "absolute", bottom: scale(90) }}>
            <Text variant="overline" color="textPrimary" align="center" style={{ fontSize: scale(30), letterSpacing: "0.22em" }}>
              {COPY.result.b}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:37.5–0:45 · CTA ═══════════════════════ */

const CTA: React.FC = () => {
  const { scale } = useScale();
  const frame = useCurrentFrame();
  const drift = ramp(frame, [0, 225]);
  const shimmer = 0.5 + 0.5 * Math.sin((frame / 225) * Math.PI);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DEEP} 46%, ${INK} 100%)` }}>
      <Clip src={CLIPS.texture} opacity={ramp(frame, [0, 30], [0.5, 0.14])} kenBurns={{ from: 1.04, to: 1.14 }} />
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${withAlpha(PLUM, 0.4)} 0%, ${withAlpha(INK, 0.92)} 68%)` }} />
      <Vignette strength={0.6} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${(1 - drift) * scale(16)}px` }}>
          <Appear in={[10, 24]}>
            <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(24), letterSpacing: "0.28em" }}>
              {COPY.cta.eyebrow.toUpperCase()}
            </Text>
          </Appear>
          <div style={{ height: scale(24) }} />
          <ClipRise in={[20, 40]}>
            <Display px={66} style={{ fontWeight: 700, maxWidth: scale(900) }}>
              {COPY.cta.head}
            </Display>
          </ClipRise>
          <div style={{ height: scale(40) }} />
          <Appear in={[52, 68]} y={16}>
            <Text variant="h3" color="textPrimary" align="center" style={{ fontSize: scale(44) }}>
              {COPY.cta.sub1}
            </Text>
          </Appear>
          <Appear in={[64, 80]} y={14} style={{ marginTop: scale(6) }}>
            <Text variant="body" color="textSecondary" align="center" style={{ fontSize: scale(32), letterSpacing: "0.06em" }}>
              {COPY.cta.sub2}
            </Text>
          </Appear>
          <div style={{ marginTop: scale(40), marginBottom: scale(40) }}>
            <GoldRule in={[82, 100]} width={220} color={GOLD} />
          </div>
          <Appear in={[92, 108]} y={16} scaleFrom={0.94}>
            <div style={{ borderRadius: 999, padding: `${scale(20)}px ${scale(48)}px`, border: `${Math.max(2, scale(2))}px solid ${GOLD}`, boxShadow: `0 0 ${scale(30)}px ${withAlpha(GOLD, 0.25 + 0.25 * shimmer)}` }}>
              <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(28), letterSpacing: "0.16em" }}>
                {COPY.cta.action.toUpperCase()}
              </Text>
            </div>
          </Appear>
          <div style={{ height: scale(56) }} />
          <Appear in={[112, 128]} y={14}>
            <Wordmark size="sign-off" />
          </Appear>
          <Appear in={[126, 142]} y={12} style={{ marginTop: scale(18) }}>
            <Text variant="caption" color="textMuted" align="center" style={{ fontSize: scale(28), letterSpacing: "0.14em" }}>
              {COPY.cta.site}
            </Text>
          </Appear>
        </AbsoluteFill>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── assembly ─────────────────────────── */

const musicVolume = (frame: number): number => {
  const windows: Array<[number, number]> = C45_VOICEOVER.enabled ? C45_VOICEOVER.clips.map((c) => [c.at, c.at + c.len]) : [];
  let duck = 1;
  for (const [s, e] of windows) {
    if (frame >= s - 10 && frame <= e + 10) {
      const edge = Math.max(0, Math.min(1, (frame - (s - 10)) / 10, (e + 10 - frame) / 10));
      duck = Math.min(duck, 1 - 0.7 * edge);
    }
  }
  const fadeIn = Math.min(1, frame / 18);
  const fadeOut = Math.min(1, (C45_DURATION - frame) / 45);
  return C45_MUSIC.gain * fadeIn * fadeOut * duck;
};

export const Commercial45: React.FC = () => (
  <BrandProvider brand={brand}>
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={S.hook.from} durationInFrames={S.hook.len} name="1 · Hook"><Hook /></Sequence>
      <Sequence from={S.reveal.from} durationInFrames={S.reveal.len} name="2 · Reveal"><Reveal /></Sequence>
      <Sequence from={S.claude.from} durationInFrames={S.claude.len} name="3 · Claude Code"><ClaudeCode /></Sequence>
      <Sequence from={S.remotion.from} durationInFrames={S.remotion.len} name="4 · Remotion"><RemotionSection /></Sequence>
      <Sequence from={S.result.from} durationInFrames={S.result.len} name="5 · Result"><Result /></Sequence>
      <Sequence from={S.cta.from} durationInFrames={S.cta.len} name="6 · CTA"><CTA /></Sequence>

      <Audio src={staticFile(C45_MUSIC.src)} trimBefore={Math.round(C45_MUSIC.startAt * C45_FPS)} volume={musicVolume} name="Music bed" />
      {C45_SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={45} name={`SFX ${i + 1}`}>
          <Audio src={staticFile(s.src)} volume={() => s.gain} />
        </Sequence>
      ))}
      {C45_VOICEOVER.enabled
        ? C45_VOICEOVER.clips.map((c, i) => (
            <Sequence key={i} from={c.at} durationInFrames={c.len + 4} name={`VO ${i + 1}`}>
              <Audio src={staticFile(c.src)} volume={() => C45_VOICEOVER.gain} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  </BrandProvider>
);
