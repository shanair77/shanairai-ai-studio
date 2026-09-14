/**
 * aurelle/actsB — Act 3 (the deconstruction, 18–26s) and Act 4 (the reveal, 26–31s).
 *
 * The pristine campaign is pulled apart into a Remotion composition: depth-separated layers
 * fan out in pseudo-3D, become real (readable) code, then a labelled timeline of nodes — a
 * professional creative workspace, never a hacker screen. Then the film tells the truth in
 * hard, type-led beats: none of it was real, but the skill that built it is.
 */

import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SafeArea } from "../format";
import { useScale } from "../format";
import { Appear, ClipRise, ramp, Vignette } from "../promo/primitives";
import { FilmGrain } from "../promo/effects";
import { CodeBlock, TerminalWindow, type CodeLineTokens } from "../promo/ui";
import { CREAM, GOLD, INK, withAlpha } from "../promo/palette";
import { LayerCard, Plate, SelectionBox } from "./primitives";
import { hasVideo, slotVideo, type MediaSlot } from "./media";
import { Display } from "./type";
import { A, COPY, HERO_END_SCALE, HERO_FOCAL, S } from "./config";

/* A plain cover-crop of a still, sized to its parent — the content inside a layer/thumbnail. */
const Crop: React.FC<{ src: string; focalX?: number; focalY?: number; style?: React.CSSProperties }> = ({
  src,
  focalX = 0.5,
  focalY = 0.5,
  style,
}) => (
  <Img
    src={staticFile(src)}
    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%`, ...style }}
  />
);

/* ─────────────────────────── Act 3 · Deconstruction ─────────────────────────── */

/** Real Remotion fragments — the actual concepts this film is built from. */
const CODE: Array<{ tokens: CodeLineTokens; indent?: number }> = [
  { tokens: [{ k: "keyword", v: "export const " }, { k: "plain", v: "Hero" }, { k: "punct", v: " = () => {" }] },
  { tokens: [{ k: "keyword", v: "const " }, { k: "plain", v: "frame" }, { k: "punct", v: " = " }, { k: "keyword", v: "useCurrentFrame" }, { k: "punct", v: "();" }], indent: 1 },
  { tokens: [{ k: "keyword", v: "const " }, { k: "plain", v: "push" }, { k: "punct", v: " = " }, { k: "keyword", v: "interpolate" }, { k: "punct", v: "(frame, [" }, { k: "number", v: "0" }, { k: "punct", v: ", " }, { k: "number", v: "48" }, { k: "punct", v: "], [" }, { k: "number", v: "1.05" }, { k: "punct", v: ", " }, { k: "number", v: "1.12" }, { k: "punct", v: "]);" }], indent: 1 },
  { tokens: [{ k: "keyword", v: "return " }, { k: "tag", v: "<AbsoluteFill" }, { k: "punct", v: ">" }], indent: 1 },
  { tokens: [{ k: "tag", v: "<Img " }, { k: "attr", v: "src" }, { k: "punct", v: "={" }, { k: "keyword", v: "staticFile" }, { k: "punct", v: "(" }, { k: "string", v: '"06-campaign-hero.png"' }, { k: "punct", v: ")}" }, { k: "punct", v: " style={{ scale: push }} />" }], indent: 2 },
  { tokens: [{ k: "tag", v: "<Sequence " }, { k: "attr", v: "from" }, { k: "punct", v: "={" }, { k: "number", v: "402" }, { k: "punct", v: "}>" }, { k: "plain", v: " …" }, { k: "tag", v: " </Sequence>" }], indent: 2 },
  { tokens: [{ k: "tag", v: "</AbsoluteFill>" }], indent: 1 },
  { tokens: [{ k: "punct", v: "};" }] },
];

// Plain-language labels (not code jargon) foregrounded on the exploded planes.
const LAYERS: Array<{ label: string; x: number; y: number; depth: number; rot: number; src: keyof typeof A | "type"; focalX?: number; focalY?: number }> = [
  { label: "COMMERCIAL", x: -300, y: 250, depth: 0.62, rot: -6, src: "icon", focalX: 0.5, focalY: 0.85 },
  { label: "BRAND", x: 300, y: 210, depth: 0.7, rot: 5, src: "icon", focalX: 0.5, focalY: 0.55 },
  { label: "CAMPAIGN", x: -320, y: -230, depth: 0.72, rot: -4, src: "type" },
  { label: "MOTION", x: 320, y: -210, depth: 0.66, rot: 6, src: "clasp", focalX: 0.45, focalY: 0.5 },
];

export const ActDeconstruct: React.FC = () => {
  const frame = useCurrentFrame();
  const { scale } = useScale();

  // Compact phase envelopes (local frames): the campaign explodes into labelled planes.
  const bgRecede = ramp(frame, [2, 52]);
  const explodeIn: [number, number] = [6, 52];
  const layersOut: [number, number] = [92, 110];
  const codeIn = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* the hero campaign, receding into depth as it comes apart */}
      <AbsoluteFill
        style={{
          scale: interpolate(bgRecede, [0, 1], [HERO_END_SCALE, 0.82]),
          opacity: interpolate(frame, [0, 36, 80], [1, 0.5, 0.16], { extrapolateRight: "clamp" }) * (1 - ramp(frame, [88, 108])),
          filter: `blur(${bgRecede * 3}px) brightness(${1 - bgRecede * 0.35})`,
        }}
      >
        {/* the frozen hero — footage held at its last frame, or the still — flattened as it comes apart */}
        <Plate slot="hero" focalX={HERO_FOCAL.x} focalY={HERO_FOCAL.y} to={1} videoPush={[1, 1]} freezeAtFrame={S.hero.len} />
      </AbsoluteFill>
      <Vignette strength={0.5} />

      {/* connector wires from a central node to each plane */}
      <ConnectorWires layers={LAYERS} in={[18, 64]} out={layersOut} />

      {/* the exploded layer planes */}
      {LAYERS.map((l) => (
        <LayerCard
          key={l.label}
          label={l.label}
          x={l.x}
          y={l.y}
          depth={l.depth}
          rotate={l.rot}
          in={explodeIn}
          out={layersOut}
          width={l.src === "type" ? 520 : 460}
          height={l.src === "type" ? 300 : 360}
          selected={l.label === "MOTION"}
        >
          {l.src === "type" ? (
            <AbsoluteFill style={{ background: withAlpha(INK, 0.72), alignItems: "center", justifyContent: "center" }}>
              <Display size={72} color={CREAM} tracking={0.06}>
                {COPY.house}
              </Display>
            </AbsoluteFill>
          ) : (
            <Crop src={A[l.src]} focalX={l.focalX} focalY={l.focalY} />
          )}
        </LayerCard>
      ))}

      {/* Code kept only as faint TEXTURE behind — the labels above are the message. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: scale(96), opacity: 0.28, pointerEvents: "none" }}>
        <Appear in={[codeIn, codeIn + 16]} y={16} blur={8}>
          <TerminalWindow title="ai-studio — ShanairAICommercial45.tsx" width={700}>
            <CodeBlock lines={CODE} start={codeIn + 6} stagger={4} size={20} />
          </TerminalWindow>
        </Appear>
      </AbsoluteFill>

      <FilmGrain opacity={0.05} />
    </AbsoluteFill>
  );
};

/** Thin gold wires drawn from a central node out to each exploded plane. */
const ConnectorWires: React.FC<{ layers: typeof LAYERS; in: [number, number]; out: [number, number] }> = ({ layers, in: inRange, out }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, inRange);
  const pOut = ramp(frame, out, [1, 0]);
  const op = p * pOut;
  if (op <= 0.01) return null;
  const cx = 540;
  const cy = 960;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: op }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
        {layers.map((l) => {
          const tx = cx + l.x * p;
          const ty = cy + l.y * p;
          return <line key={l.label} x1={cx} y1={cy} x2={tx} y2={ty} stroke={withAlpha(GOLD, 0.5)} strokeWidth={2} strokeDasharray="6 8" />;
        })}
        <circle cx={cx} cy={cy} r={7} fill={GOLD} />
      </svg>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── Act 4 · Reveal ─────────────────────────── */

const Framed: React.FC<{ src: string; slot?: MediaSlot; focalX?: number; focalY?: number; w: number; h: number; dim: number; inRange: [number, number] }> = ({
  src,
  slot,
  focalX = 0.5,
  focalY = 0.5,
  w,
  h,
  dim,
  inRange,
}) => {
  const { scale, scaleRounded } = useScale();
  const frame = useCurrentFrame();
  const p = ramp(frame, inRange);
  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${focalX * 100}% ${focalY * 100}%`,
    // a continuous slow push so the thumbnail always MOVES behind the line (no dead board)
    scale: 1 + 0.12 * ramp(frame, [0, 40]),
    filter: `grayscale(${dim}) brightness(${1 - dim * 0.5})`,
  };
  // A live clip if the slot has one (a generated asset being deconstructed); otherwise the still.
  const media =
    slot && hasVideo(slot) ? (
      <OffthreadVideo src={staticFile(slotVideo(slot))} muted style={mediaStyle} />
    ) : (
      <Img src={staticFile(src)} style={mediaStyle} />
    );
  return (
    <div style={{ position: "relative", width: scale(w), height: scale(h), opacity: p, scale: 0.94 + p * 0.06 }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: scale(10), border: `${scaleRounded(2)}px solid ${withAlpha(GOLD, 0.5)}` }}>
        {media}
      </div>
    </div>
  );
};

/** One "…doesn't exist" beat: an asset thumbnail selected, a question, then the verdict stamps in. */
const ExistBeat: React.FC<{ question: string; image?: { src: string; slot?: MediaSlot; focalX?: number; focalY?: number; label: string } }> = ({ question, image }) => {
  const frame = useCurrentFrame();
  const dim = ramp(frame, [8, 16], [0, 0.85]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center" }}>
      <SafeArea preset="social" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
        {image ? (
          <div style={{ position: "relative" }}>
            <Framed src={image.src} slot={image.slot} focalX={image.focalX} focalY={image.focalY} w={520} h={560} dim={dim} inRange={[0, 5]} />
            <div style={{ position: "absolute", inset: 0 }}>
              <SelectionBox rect={{ x: 0, y: 0, w: 520, h: 560 }} in={[2, 8]} label={image.label} handles="corners" />
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <ClipRise in={[0, 8]}>
            <Display size={66} color={withAlpha(CREAM, 0.92)} tracking={0.04} weight={600}>
              {question}
            </Display>
          </ClipRise>
          <Appear in={[8, 15]} y={16} blur={5} scaleFrom={1.08}>
            <Display size={88} color={GOLD} tracking={0.02} weight={700}>
              {COPY.doesntExist}
            </Display>
          </Appear>
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/**
 * Act 4 · the reveal — "AURELLE doesn't exist / product / flagship / campaign" (Shanair VO).
 * Four fast beats (~35f each) with the asset thumbnail always MOVING behind the line.
 */
export const ActReveal: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INK }}>
    <Sequence durationInFrames={35} name="AURELLE?" layout="none">
      <ExistBeat question={COPY.house} />
    </Sequence>
    <Sequence from={35} durationInFrames={35} name="the product?" layout="none">
      <ExistBeat question={COPY.product} image={{ src: A.icon, slot: "icon", focalX: 0.5, focalY: 0.55, label: "RENDER · THE BAG" }} />
    </Sequence>
    <Sequence from={70} durationInFrames={35} name="the flagship?" layout="none">
      <ExistBeat question={COPY.flagship} image={{ src: A.flagship, slot: "flagship", focalX: 0.5, focalY: 0.4, label: "SET · FLAGSHIP" }} />
    </Sequence>
    <Sequence from={105} durationInFrames={35} name="the campaign?" layout="none">
      <ExistBeat question={COPY.campaign} image={{ src: A.beauty, slot: "beauty", focalX: 0.55, focalY: 0.35, label: "CAMPAIGN · A/W26" }} />
    </Sequence>
    <FilmGrain opacity={0.05} />
  </AbsoluteFill>
);
