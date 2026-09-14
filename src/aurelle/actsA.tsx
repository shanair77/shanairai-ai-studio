/**
 * aurelle/actsA — Act 1 (the AURELLE illusion, 0–15s) and Act 2 (the interruption, 15–18s).
 *
 * Six restrained shots sell a real European luxury house, then the hero plate freezes at
 * exactly 0:15 and a design-tool cursor breaks the illusion. Motion here is slow, controlled,
 * expensive — the camera and light move, never the model. Each scene assumes it is mounted in
 * a <Sequence> so its local frame starts at 0.
 */

import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { SafeArea } from "../format";
import { Appear, GoldRule, ramp, Scrim, Vignette } from "../promo/primitives";
import { FilmGrain, LightSweep } from "../promo/effects";
import { CREAM, GOLD, INK, withAlpha } from "../promo/palette";
import { Cursor, DetailPlate, FlashBurst, Grade, Plate, SelectionBox, TrackingReveal } from "./primitives";
import type { MediaSlot } from "./media";
import { Display, Label } from "./type";
import { COPY, HERO_END_SCALE, HERO_FOCAL, MONTAGE_HITS, S } from "./config";

/** Shared layout for the hero type block so the freeze, the season line and the selection agree. */
const HERO_TYPE = { x: 84, y: 300, aurelleSize: 104 };
const AURELLE_RECT = { x: 66, y: 300, w: 620, h: 132 };
/** The hero clip's subtle settle-push; the interrupt locks to its end value so the freeze is seamless. */
const HERO_PUSH: [number, number] = [1, 1.05];
/** Detail-montage slots, in the GOLD·HEEL·STITCH·PARFUM·EYES·No.01 order. */
const MONTAGE_SLOTS: MediaSlot[] = ["gold", "heel", "stitch", "parfum", "eyes", "montageIcon"];

/* ─────────────────────────── S1 · Fragments ─────────────────────────── */

/** Begin near-black. A champagne highlight glides over the No.01's hardware; the house whispers. */
export const ShotFragments: React.FC = () => {
  const frame = useCurrentFrame();
  // The darkness lifts as the reveal opens — fragments first, never the whole bag at once.
  const open = ramp(frame, [0, 70], [0.86, 0.34]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Plate slot="product" focalX={0.5} focalY={0.56} from={1.24} to={1.14} brightnessFrom={0.55} brightnessTo={0.98} easing="luxe" videoPush={[1.06, 1.0]} />
      <LightSweep start={6} dur={52} angle={28} opacity={0.4} thickness={12} />
      <LightSweep start={40} dur={46} angle={24} opacity={0.26} thickness={9} />
      {/* Reveal mask: a heavy vignette that opens from near-black. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(76% 54% at 50% 58%, ${withAlpha(INK, 0)} 30%, ${withAlpha(INK, open)} 78%, ${withAlpha(INK, Math.min(1, open + 0.25))} 100%)`,
          pointerEvents: "none",
        }}
      />
      <FilmGrain opacity={0.05} />
      <SafeArea preset="social" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Appear in={[62, 86]} y={10} blur={4}>
          <Label size={26} tracking={0.6} color={withAlpha(CREAM, 0.92)}>
            {COPY.house}
          </Label>
        </Appear>
      </SafeArea>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── S2 · Arrival ─────────────────────────── */

/** The paparazzi moment: a slow push past a foreground obstruction, flashes, exposure reactions. */
export const ShotArrival: React.FC = () => {
  const frame = useCurrentFrame();
  const flashes = [14, 34, 58, 61, 64];
  // Exposure lifts a touch on each flash.
  const expo = flashes.reduce((m, f) => Math.max(m, ramp(frame, [f - 1, f], [0, 1]) * ramp(frame, [f, f + 8], [1, 0])), 0);
  // A nearer photographer's shoulder drifts across the lower-left — foreground occlusion.
  const fgX = interpolate(frame, [0, 96], [-6, 10]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Plate
        slot="arrival"
        focalX={0.52}
        focalY={0.4}
        from={1.05}
        to={1.17}
        panX={-16}
        easing="luxe"
        brightnessFrom={0.98}
        brightnessTo={1.0}
        videoPush={[1.0, 1.04]}
        style={{ filter: `brightness(${1 + expo * 0.14})` }}
      />
      {/* atmospheric haze near the press pit (upper right) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 28% at 82% 26%, ${withAlpha("#FFF6E6", 0.14)} 0%, transparent 70%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      {/* foreground occlusion — soft, dark, out of focus */}
      <div
        style={{
          position: "absolute",
          left: `${fgX}%`,
          bottom: "-14%",
          width: "46%",
          height: "42%",
          background: `radial-gradient(closest-side, ${withAlpha(INK, 0.92)} 55%, transparent 100%)`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <FlashBurst flashes={flashes} strength={0.85} />
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.06} />
    </AbsoluteFill>
  );
};

/* ─────────────────────────── S3 · Clasp ─────────────────────────── */

/** Extreme macro on the gold A. A slow push, a highlight travelling the metal, then the CLICK. */
export const ShotClasp: React.FC = () => {
  const frame = useCurrentFrame();
  // micro camera snap on the lock (the CLICK lands at len-8 in the audio schedule)
  const snap = ramp(frame, [S.clasp.len - 10, S.clasp.len - 6], [0, 1]) * ramp(frame, [S.clasp.len - 6, S.clasp.len - 2], [1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Plate
        slot="clasp"
        focalX={0.45}
        focalY={0.5}
        from={1.08}
        to={1.2}
        panY={-6}
        easing="luxe"
        videoPush={[1.0, 1.05]}
        style={{ translate: `0 ${snap * -4}px`, scale: 1 + snap * 0.004 }}
      />
      <LightSweep start={8} dur={40} angle={32} opacity={0.34} thickness={10} />
      {/* the lock catching light on the CLICK */}
      <LightSweep start={S.clasp.len - 12} dur={12} angle={40} opacity={0.5} thickness={6} />
      <Vignette strength={0.4} />
      <FilmGrain opacity={0.05} />
    </AbsoluteFill>
  );
};

/* ─────────────────────────── S4 · Gallery walk ─────────────────────────── */

/** A tracking shot through the colonnade. The frame drifts; the foreground column parallaxes. */
export const ShotGallery: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    <Plate slot="walk" focalX={0.5} focalY={0.5} from={1.06} to={1.15} panX={26} blurFrom={1.5} blurTo={0} easing="luxe" videoPush={[1.0, 1.03]} />
    <Scrim from="bottom" strength={0.85} />
    <Vignette strength={0.4} />
    <FilmGrain opacity={0.05} />
    <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end" }}>
      <GoldRule in={[22, 40]} width={120} height={3} color={GOLD} />
      <div style={{ height: "2.2%" }} />
      <Display size={80} color={CREAM} tracking={0.1} align="left" weight={600}>
        <span style={{ display: "block", overflow: "hidden" }}>
          <Appear in={[26, 46]} y={64} blur={6}>
            {COPY.house}
          </Appear>
        </span>
      </Display>
    </SafeArea>
  </AbsoluteFill>
);

/* ─────────────────────────── S5 · Detail montage ─────────────────────────── */

/** Six percussive hits pulled from the contact sheet: GOLD · HEEL · STITCH · PARFUM · EYES · No.01. */
const HIT_LEN = 9;
const LAST_HIT_LEN = 13;

const DetailHit: React.FC<{ index: number }> = ({ index }) => {
  const h = MONTAGE_HITS[index];
  const driftX = index % 2 === 0 ? 12 : -12;
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <DetailPlate slot={MONTAGE_SLOTS[index]} push={0.08} driftX={driftX} />
      {/* flash-frame on the cut */}
      <FlashBurst flashes={[0]} strength={0.5} />
      <Grade color={INK} strength={0.14} blend="multiply" />
      <SafeArea preset="social" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Appear in={[1, 4]} y={6} blur={2}>
          <Label size={30} tracking={0.4} color={CREAM} style={{ textShadow: `0 2px 18px ${withAlpha(INK, 0.9)}` }}>
            {h.label}
          </Label>
        </Appear>
      </SafeArea>
    </AbsoluteFill>
  );
};

export const ShotMontage: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    {MONTAGE_HITS.map((_, i) => {
      const last = i === MONTAGE_HITS.length - 1;
      return (
        <Sequence key={i} from={i * HIT_LEN} durationInFrames={last ? LAST_HIT_LEN : HIT_LEN} name={`hit ${i + 1} · ${MONTAGE_HITS[i].label}`} layout="none">
          <DetailHit index={i} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

/* ─────────────────────────── S6 · Hero (calm) ─────────────────────────── */

/** Everything calms. A large slow push; the house name and season settle into the negative space. */
export const ShotHero: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    <Plate slot="hero" focalX={HERO_FOCAL.x} focalY={HERO_FOCAL.y} from={1.05} to={HERO_END_SCALE} easing="luxe" videoPush={HERO_PUSH} />
    <Vignette strength={0.34} />
    <FilmGrain opacity={0.045} />
    <HeroTypeBlock reveal />
  </AbsoluteFill>
);

/** The AURELLE / AUTUMN·WINTER block — animated on reveal, static (with a late nudge) when frozen. */
const HeroTypeBlock: React.FC<{ reveal?: boolean; nudge?: number }> = ({ reveal = false, nudge = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: `${(HERO_TYPE.x / 1080) * 100}%`, top: `${(HERO_TYPE.y / 1920) * 100}%`, translate: `${nudge}px 0` }}>
      {reveal ? (
        <TrackingReveal in={[6, 34]} from={0.04} to={0.06}>
          <Display size={HERO_TYPE.aurelleSize} color={CREAM} align="left" tracking={0.06} weight={600}>
            {COPY.house}
          </Display>
        </TrackingReveal>
      ) : (
        <Display size={HERO_TYPE.aurelleSize} color={CREAM} align="left" tracking={0.06} weight={600}>
          {COPY.house}
        </Display>
      )}
      <div style={{ height: 18 }} />
      {reveal ? (
        <Appear in={[24, 46]} y={12} blur={3}>
          <SeasonLine />
        </Appear>
      ) : (
        <SeasonLine />
      )}
    </div>
  </AbsoluteFill>
);

const SeasonLine: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ width: 96, height: 2, background: withAlpha(GOLD, 0.9) }} />
    <Label size={22} tracking={0.42} color={withAlpha(CREAM, 0.9)} align="left">
      {COPY.season}
    </Label>
  </div>
);

/* ─────────────────────────── S7 · Interruption ─────────────────────────── */

/**
 * The frozen frame. The hero plate is locked at the push's terminal scale (invisible cut), the
 * music has already stopped, and a foreign design-tool cursor selects the AURELLE type — the
 * first crack in the illusion.
 */
export const ShotInterrupt: React.FC = () => {
  const frame = useCurrentFrame();
  // The selected word twitches once it is grabbed — the illusion visibly "un-sticks".
  const nudge = ramp(frame, [82, 90], [0, 14]);
  const desatur = ramp(frame, [66, 84], [0, 0.5]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* the SAME hero plate, locked: footage frozen at its last source frame, or the still at its terminal scale */}
      <Plate
        slot="hero"
        focalX={HERO_FOCAL.x}
        focalY={HERO_FOCAL.y}
        to={HERO_END_SCALE}
        videoPush={[HERO_PUSH[1], HERO_PUSH[1]]}
        freezeAtFrame={S.hero.len}
      />
      <Vignette strength={0.34} />
      {/* the image cools slightly as it becomes "just an asset" */}
      <AbsoluteFill style={{ background: withAlpha("#8FA4B8", desatur * 0.12), mixBlendMode: "overlay", pointerEvents: "none" }} />
      <FilmGrain opacity={0.045} />
      <HeroTypeBlock nudge={nudge} />
      <SelectionBox rect={AURELLE_RECT} in={[66, 78]} label="TYPE · AURELLE" />
      <Cursor path={[[0.62, 0.2], [0.42, 0.34], [0.3, 0.34]]} startF={16} endF={66} clickAt={66} />
    </AbsoluteFill>
  );
};
