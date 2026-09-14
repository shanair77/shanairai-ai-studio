/**
 * promo/BrandFilm — "Your Brand, Cinematic": the photo-led client-pitch film.
 *
 * A different concept from the code-reveal promo. It runs on the clean high-res STILLS with slow
 * cinematic Ken Burns (an editorial feel), sells Shanair.AI's service to businesses, and signs off
 * on the real founder photo. Reuses the shared design system: brand theme, Text/SafeArea/useScale,
 * KenBurns, and the promo motion primitives. All motion is frame-driven.
 */

import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { KenBurns } from "../animations";
import { BrandProvider, resolveBrand } from "../brand";
import { Text } from "../components";
import { SafeArea, useScale } from "../format";
import { shanairAI } from "../shanairai/brand";
import { Wordmark } from "../shanairai/BrandMarks";
import {
  BF_COPY,
  BF_MUSIC,
  BF_SECTIONS,
  BF_SFX,
  BF_VOICEOVER,
  BF_FPS,
  FOUNDER_PHOTO,
  IMAGES,
} from "./brandfilmConfig";
import { FilmGrain, FxLayer, Handheld, type FxKey } from "./effects";
import { GOLD, INK, PLUM, PLUM_DEEP, withAlpha } from "./palette";
import { Appear, ClipRise, GoldRule, ramp, Scrim, Vignette } from "./primitives";

const brand = resolveBrand(shanairAI);

/* ─────────────────────────── photo plate ─────────────────────────── */

/**
 * A full-bleed still brought to life with frame-driven "cinemagraph" motion: a Ken Burns move,
 * optional slow rotate (flowing textures), handheld drift, and overlay effects (light-sweep,
 * bokeh, candle flicker). All pure functions of the frame — deterministic.
 */
const Photo: React.FC<{
  src: string;
  from?: number;
  to?: number;
  panX?: number;
  panY?: number;
  focalY?: number;
  len?: number;
  fx?: FxKey[];
  handheld?: boolean;
  rotate?: [number, number];
  bokehRgb?: string;
  flickerAt?: [number, number];
}> = ({ src, from = 1, to = 1.1, panX = 0, panY = 0, focalY = 0.42, len = 90, fx, handheld, rotate, bokehRgb, flickerAt }) => {
  const frame = useCurrentFrame();
  const rot = rotate ? interpolate(frame, [0, len], [rotate[0], rotate[1]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const img = (
    <div style={{ width: "100%", height: "100%", rotate: rotate ? `${rot}deg` : undefined, scale: rotate ? 1.12 : undefined }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `50% ${focalY * 100}%` }} />
    </div>
  );
  const plate = (
    <KenBurns from={from} to={to} panX={panX} panY={panY} easing="gentle">
      {img}
    </KenBurns>
  );
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: INK }}>
      {handheld ? <Handheld>{plate}</Handheld> : plate}
      <FxLayer fx={fx} len={len} bokehRgb={bokehRgb} flickerAt={flickerAt} />
    </AbsoluteFill>
  );
};

type Beat = {
  src: string;
  from: number;
  len: number;
  kb?: [number, number];
  panX?: number;
  panY?: number;
  focalY?: number;
  fx?: FxKey[];
  handheld?: boolean;
  rotate?: [number, number];
  bokehRgb?: string;
  flickerAt?: [number, number];
};

/** A cross-dissolving montage of stills (local frames). Consecutive beats overlap to dissolve. */
const PhotoMontage: React.FC<{ beats: Beat[]; fade?: number }> = ({ beats, fade = 14 }) => (
  <>
    {beats.map((b, i) => (
      <Sequence key={i} from={b.from} durationInFrames={b.len} name={`photo ${i + 1}`} layout="none">
        <FadePhoto fadeIn={fade} fadeOut={fade} len={b.len}>
          <Photo
            src={b.src}
            from={b.kb?.[0] ?? 1.02}
            to={b.kb?.[1] ?? 1.12}
            panX={b.panX}
            panY={b.panY}
            focalY={b.focalY}
            len={b.len}
            fx={b.fx}
            handheld={b.handheld}
            rotate={b.rotate}
            bokehRgb={b.bokehRgb}
            flickerAt={b.flickerAt}
          />
        </FadePhoto>
      </Sequence>
    ))}
  </>
);

/** Opacity fade wrapper (frame-driven), for cross-dissolves. */
const FadePhoto: React.FC<{ fadeIn: number; fadeOut: number; len: number; children: React.ReactNode }> = ({
  fadeIn,
  fadeOut,
  len,
  children,
}) => {
  const frame = useCurrentFrame();
  const o = Math.min(ramp(frame, [0, fadeIn]), ramp(frame, [len - fadeOut, len], [1, 0]));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/* ─────────────────────────── shared type helpers ─────────────────────────── */

const Display: React.FC<{
  children: React.ReactNode;
  px: number;
  color?: React.ComponentProps<typeof Text>["color"];
  style?: React.CSSProperties;
}> = ({ children, px, color = "textPrimary", style }) => {
  const { scale } = useScale();
  return (
    <Text variant="display" color={color} align="center" style={{ fontSize: scale(px), lineHeight: 1.03, letterSpacing: "-0.01em", ...style }}>
      {children}
    </Text>
  );
};

const Center: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties; justify?: string }> = ({ children, style, justify = "center" }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: justify, ...style }}>{children}</AbsoluteFill>
);

/* ═══════════════════════ 0:00–0:05 · THE PROMISE ═══════════════════════ */

const Hook: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <PhotoMontage
        beats={[
          { src: IMAGES.fashion, from: 0, len: 66, focalY: 0.45, kb: [1.04, 1.16], panX: -30, fx: ["sweep"] },
          { src: IMAGES.architecture, from: 52, len: 60, focalY: 0.5, kb: [1.05, 1.15], fx: ["sweep"] },
          { src: IMAGES.dining, from: 98, len: 62, focalY: 0.55, kb: [1.04, 1.12], fx: ["bokeh", "flicker"], bokehRgb: "255,196,120", flickerAt: [0.42, 0.74] },
        ]}
      />
      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(70) }}>
          <ClipRise in={[10, 28]}>
            <Display px={98} style={{ fontWeight: 600 }}>
              {BF_COPY.hook.line1}
            </Display>
          </ClipRise>
          <ClipRise in={[20, 38]}>
            <Display px={98} style={{ fontWeight: 700 }}>
              {BF_COPY.hook.line2}
            </Display>
          </ClipRise>
          <Appear in={[44, 60]} y={18} blur={5} style={{ marginTop: scale(20) }}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontStyle: "italic", fontSize: scale(44) }}>
              {BF_COPY.hook.sub}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:05–0:10 · THE FRICTION ═══════════════════════ */

const Problem: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* the "ordinary" stills, cooler and quieter */}
      <PhotoMontage
        beats={[
          { src: IMAGES.founder, from: 0, len: 84, focalY: 0.4, kb: [1.03, 1.1], handheld: true, fx: ["bokeh"], bokehRgb: "150,180,225" },
          { src: IMAGES.set, from: 70, len: 84, focalY: 0.5, kb: [1.04, 1.12], handheld: true, fx: ["sweep"] },
        ]}
      />
      <AbsoluteFill style={{ background: withAlpha(INK, 0.35) }} />
      <Vignette strength={0.8} />
      <Scrim from="bottom" strength={1.05} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(80) }}>
          <Appear in={[10, 26]} out={[64, 76]} y={20} blur={6}>
            <Display px={70} style={{ fontWeight: 600 }}>
              {BF_COPY.problem.a}
            </Display>
          </Appear>
          <Appear in={[78, 92]} y={18} blur={6} style={{ position: "absolute", bottom: scale(80) }}>
            <Text variant="h3" color="textSecondary" align="center" style={{ fontSize: scale(46), letterSpacing: "0.01em" }}>
              {BF_COPY.problem.b}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:10–0:13 · THE PIVOT ═══════════════════════ */

const Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const photoIn = ramp(frame, [10, 26]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* the pivot lands on an energetic still */}
      <AbsoluteFill style={{ opacity: photoIn }}>
        <Photo src={IMAGES.car} from={1.03} to={1.2} panX={-60} focalY={0.5} len={90} handheld fx={["sweep"]} />
        <Vignette strength={0.6} />
        <Scrim from="full" strength={0.5} />
      </AbsoluteFill>
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center>
          <ClipRise in={[6, 24]}>
            <Display px={110} color="accent" style={{ fontStyle: "italic", fontWeight: 700 }}>
              {BF_COPY.turn}
            </Display>
          </ClipRise>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:13–0:20 · THE OFFER ═══════════════════════ */

const Offer: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* the range of the work */}
      <PhotoMontage
        beats={[
          { src: IMAGES.skincare, from: 0, len: 60, focalY: 0.5, kb: [1.05, 1.13], fx: ["sweep"] },
          { src: IMAGES.watch, from: 46, len: 58, focalY: 0.5, kb: [1.06, 1.16], fx: ["sweep"] },
          { src: IMAGES.penthouse, from: 92, len: 56, focalY: 0.5, kb: [1.04, 1.12], fx: ["sweep"] },
          { src: IMAGES.startup, from: 136, len: 74, focalY: 0.5, kb: [1.05, 1.13], handheld: true, fx: ["bokeh"], bokehRgb: "255,206,150" },
        ]}
      />
      <Vignette strength={0.7} />
      <Scrim from="bottom" strength={1.05} />
      <Scrim from="top" strength={0.7} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        {/* lead, top */}
        <div style={{ position: "absolute", top: scale(60), left: 0, right: 0 }}>
          <Appear in={[8, 22]}>
            <Display px={56} style={{ fontWeight: 600 }}>
              {BF_COPY.offer.lead1}
            </Display>
          </Appear>
          <Appear in={[16, 30]} style={{ marginTop: scale(4) }}>
            <Display px={56} color="accent" style={{ fontStyle: "italic", fontWeight: 600 }}>
              {BF_COPY.offer.lead2}
            </Display>
          </Appear>
        </div>
        {/* capability chips, bottom */}
        <Center justify="flex-end" style={{ paddingBottom: scale(76) }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: scale(14), maxWidth: scale(900) }}>
            {BF_COPY.offer.chips.map((c, i) => (
              <Appear key={c} in={[44 + i * 8, 58 + i * 8]} y={14} scaleFrom={0.92}>
                <div style={{ border: `${Math.max(1, scale(1.5))}px solid ${withAlpha(GOLD, 0.6)}`, borderRadius: 999, padding: `${scale(12)}px ${scale(28)}px`, background: withAlpha(INK, 0.35) }}>
                  <Text variant="overline" color="accent" style={{ fontSize: scale(22), letterSpacing: "0.18em" }}>
                    {c}
                  </Text>
                </div>
              </Appear>
            ))}
          </div>
          <Appear in={[110, 126]} y={12} style={{ marginTop: scale(22) }}>
            <Text variant="caption" color="textSecondary" align="center" style={{ fontSize: scale(28), letterSpacing: "0.08em" }}>
              {BF_COPY.offer.powered}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:20–0:25 · YOUR STORY ═══════════════════════ */

const Vision: React.FC = () => {
  const { scale } = useScale();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <PhotoMontage
        beats={[
          { src: IMAGES.beauty, from: 0, len: 90, focalY: 0.35, kb: [1.03, 1.12], fx: ["sweep"] },
          { src: IMAGES.penthouse, from: 76, len: 74, focalY: 0.5, kb: [1.05, 1.12], fx: ["sweep"] },
        ]}
      />
      <Vignette strength={0.6} />
      <Scrim from="bottom" strength={1} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center justify="flex-end" style={{ paddingBottom: scale(80) }}>
          <Appear in={[10, 26]} out={[70, 82]} y={18} blur={5}>
            <Display px={66} style={{ fontWeight: 600 }}>
              {BF_COPY.vision.a}
            </Display>
          </Appear>
          <Appear in={[86, 102]} y={18} blur={5} style={{ position: "absolute", bottom: scale(80) }}>
            <Display px={66} color="accent" style={{ fontStyle: "italic", fontWeight: 600 }}>
              {BF_COPY.vision.b}
            </Display>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ═══════════════════════ 0:25–0:30 · THE SIGN-OFF ═══════════════════════ */

const CTA: React.FC = () => {
  const { scale, scaleRounded } = useScale();
  const frame = useCurrentFrame();
  const shimmer = 0.5 + 0.5 * Math.sin((frame / 150) * Math.PI);
  const avatar = scale(150);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_DEEP} 46%, ${INK} 100%)` }}>
      {/* the gold-silk texture dissolving away under the plum */}
      <AbsoluteFill style={{ opacity: ramp(frame, [0, 26], [0.55, 0.16]) }}>
        <Photo src={IMAGES.texture} from={1.04} to={1.16} focalY={0.5} len={150} rotate={[0, 7]} fx={["sweep"]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${withAlpha(PLUM, 0.4)} 0%, ${withAlpha(INK, 0.92)} 68%)` }} />
      <Vignette strength={0.6} />
      <SafeArea preset="social" style={{ display: "flex" }}>
        <Center>
          <Appear in={[8, 20]}>
            <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(24), letterSpacing: "0.28em" }}>
              {BF_COPY.cta.eyebrow.toUpperCase()}
            </Text>
          </Appear>

          <div style={{ height: scale(30) }} />
          <Appear in={[16, 30]}>
            <Wordmark size="lead" />
          </Appear>

          <div style={{ marginTop: scale(36), marginBottom: scale(36) }}>
            <GoldRule in={[34, 52]} width={220} color={GOLD} />
          </div>

          {/* founder avatar + name */}
          <Appear in={[40, 56]} y={16} scaleFrom={0.92}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: scale(14) }}>
              <div style={{ width: avatar, height: avatar, borderRadius: 999, overflow: "hidden", border: `${scaleRounded(2)}px solid ${withAlpha(GOLD, 0.7)}` }}>
                <Img src={staticFile(FOUNDER_PHOTO)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%" }} />
              </div>
              <Text variant="h3" color="textPrimary" align="center" style={{ fontSize: scale(38) }}>
                {BF_COPY.cta.name}
              </Text>
              <Text variant="overline" color="textSecondary" align="center" style={{ fontSize: scale(22), letterSpacing: "0.18em" }}>
                {BF_COPY.cta.role.toUpperCase()}
              </Text>
            </div>
          </Appear>

          {/* action chip */}
          <div style={{ height: scale(40) }} />
          <Appear in={[64, 80]} y={16} scaleFrom={0.94}>
            <div style={{ borderRadius: 999, padding: `${scale(20)}px ${scale(48)}px`, border: `${Math.max(2, scale(2))}px solid ${GOLD}`, boxShadow: `0 0 ${scale(30)}px ${withAlpha(GOLD, 0.25 + 0.25 * shimmer)}` }}>
              <Text variant="overline" color="accent" align="center" style={{ fontSize: scale(28), letterSpacing: "0.16em" }}>
                {BF_COPY.cta.action.toUpperCase()}
              </Text>
            </div>
          </Appear>
          <Appear in={[84, 100]} y={12} style={{ marginTop: scale(22) }}>
            <Text variant="caption" color="textMuted" align="center" style={{ fontSize: scale(28), letterSpacing: "0.14em" }}>
              {BF_COPY.cta.site}
            </Text>
          </Appear>
        </Center>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── assembly ─────────────────────────── */

const bfMusicVolume = (frame: number): number => {
  const windows: Array<[number, number]> = BF_VOICEOVER.enabled ? BF_VOICEOVER.clips.map((c) => [c.at, c.at + c.len]) : [];
  let duck = 1;
  for (const [s, e] of windows) {
    if (frame >= s - 10 && frame <= e + 10) {
      const edge = Math.max(0, Math.min(1, (frame - (s - 10)) / 10, (e + 10 - frame) / 10));
      duck = Math.min(duck, 1 - 0.7 * edge);
    }
  }
  const fadeIn = Math.min(1, frame / 18);
  const fadeOut = Math.min(1, (900 - frame) / 45);
  return BF_MUSIC.gain * fadeIn * fadeOut * duck;
};

export const BrandFilm: React.FC = () => (
  <BrandProvider brand={brand}>
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Sequence from={BF_SECTIONS.hook.from} durationInFrames={BF_SECTIONS.hook.len} name="1 · Promise"><Hook /></Sequence>
      <Sequence from={BF_SECTIONS.problem.from} durationInFrames={BF_SECTIONS.problem.len} name="2 · Friction"><Problem /></Sequence>
      <Sequence from={BF_SECTIONS.turn.from} durationInFrames={BF_SECTIONS.turn.len} name="3 · Pivot"><Turn /></Sequence>
      <Sequence from={BF_SECTIONS.offer.from} durationInFrames={BF_SECTIONS.offer.len} name="4 · Offer"><Offer /></Sequence>
      <Sequence from={BF_SECTIONS.vision.from} durationInFrames={BF_SECTIONS.vision.len} name="5 · Your story"><Vision /></Sequence>
      <Sequence from={BF_SECTIONS.cta.from} durationInFrames={BF_SECTIONS.cta.len} name="6 · Sign-off"><CTA /></Sequence>

      <Audio src={staticFile(BF_MUSIC.src)} trimBefore={Math.round(BF_MUSIC.startAt * BF_FPS)} volume={bfMusicVolume} name="Music bed" />
      {BF_SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={45} name={`SFX ${i + 1}`}>
          <Audio src={staticFile(s.src)} volume={() => s.gain} />
        </Sequence>
      ))}
      {BF_VOICEOVER.enabled
        ? BF_VOICEOVER.clips.map((c, i) => (
            <Sequence key={i} from={c.at} durationInFrames={c.len + 4} name={`VO ${i + 1}`}>
              <Audio src={staticFile(c.src)} volume={() => BF_VOICEOVER.gain} />
            </Sequence>
          ))
        : null}

      {/* a whisper of film grain over the whole film, for a cohesive cinematic texture */}
      <FilmGrain opacity={0.05} />
    </AbsoluteFill>
  </BrandProvider>
);
