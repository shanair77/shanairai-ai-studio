/**
 * TravelStyleTest — the same 6-second Marrakech moment ("traveler arrives at the souk,
 * lanterns overhead") in four candidate looks for the faceless travel series:
 *
 *   2 · Flat vector          — 100% code (SoukScene "flat")
 *   3 · Paper cut-out        — 100% code (SoukScene "paper")
 *   5 · Illustrated journal  — AI watercolor plate + code overlays, pen route, tape
 *   6 · Miniature diorama    — AI clay-diorama plate + tilt-shift blur + code overlays
 *
 * Styles 5 and 6 read their plates from public/styletest/journal.png and
 * public/styletest/diorama.png. A missing plate renders a labelled placeholder.
 */

import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SoukScene } from "./SoukScene";
import { Caption, HAND, LocationCard, ROUND, Stamp, StyleTag, type Skin } from "./shared";

export const STYLE_TEST_FPS = 30;
const SEG = 6 * STYLE_TEST_FPS;
const CAPTION = "Welcome to the souks of Marrakech: a maze of thousands of stalls under glowing lanterns.";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const hasPlate = (file: string) => getStaticFiles().some((f) => f.name === file);

const MissingPlate: React.FC<{ file: string }> = ({ file }) => (
  <AbsoluteFill style={{ background: "#3a3046", alignItems: "center", justifyContent: "center", padding: 80 }}>
    <div style={{ fontFamily: ROUND, color: "#fff", fontSize: 46, textAlign: "center", lineHeight: 1.3 }}>
      Painted plate missing
      <div style={{ fontSize: 34, opacity: 0.7, marginTop: 20 }}>public/{file}</div>
    </div>
  </AbsoluteFill>
);

/** Slow push-in on a still plate, from a chosen focal point. */
const Plate: React.FC<{ file: string; from?: number; to?: number; origin?: string; style?: React.CSSProperties }> = ({
  file,
  from = 1.04,
  to = 1.14,
  origin = "50% 60%",
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <Img
      src={staticFile(file)}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        scale: `${interpolate(f, [0, SEG], [from, to], clamp)}`,
        transformOrigin: origin,
        ...style,
      }}
    />
  );
};

/* ------------------------------------------------------------------ style 5 */
const JournalStyle: React.FC = () => {
  const f = useCurrentFrame();
  const file = "styletest/journal.png";
  // A pen-drawn dashed route across the page, drawing itself in.
  const routeLen = 1400;
  const drawn = interpolate(f, [10, 110], [routeLen, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#efe6d2" }}>
      <AbsoluteFill style={{ padding: "150px 34px 34px", rotate: "-0.6deg" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", border: "14px solid #fbf6ea" }}>
          {hasPlate(file) ? <Plate file={file} /> : <MissingPlate file={file} />}
        </div>
      </AbsoluteFill>
      {/* tape on the photo corners */}
      {[
        { left: 0, top: 130, r: "-35deg" },
        { right: 0, top: 130, r: "35deg" },
        { left: 0, bottom: 12, r: "35deg" },
        { right: 0, bottom: 12, r: "-35deg" },
      ].map((t, i) => (
        <div key={i} style={{ position: "absolute", width: 170, height: 48, background: "rgba(226,208,150,0.8)", rotate: t.r, ...t }} />
      ))}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <path
          d="M 120 640 C 300 560, 380 820, 560 760 S 860 880, 940 1100"
          fill="none"
          stroke="#2a2a3a"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${routeLen}`}
          strokeDashoffset={drawn}
          opacity={0.85}
        />
        <text x={810} y={1080} fontFamily={HAND} fontSize={44} fill="#2a2a3a" opacity={interpolate(f, [100, 115], [0, 1], clamp)}>
          you are here ✕
        </text>
      </svg>
      <LocationCard skin="journal" />
      <Stamp skin="journal" />
      <Caption skin="journal" text={CAPTION} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ style 6 */
const DioramaStyle: React.FC = () => {
  const file = "styletest/diorama.png";
  if (!hasPlate(file)) {
    return (
      <AbsoluteFill>
        <MissingPlate file={file} />
        <LocationCard skin="diorama" />
        <Caption skin="diorama" text={CAPTION} />
      </AbsoluteFill>
    );
  }
  // Tilt-shift: a sharp plate, plus blurred copies masked to the top and bottom bands.
  const band = (dir: "top" | "bottom") => (
    <Plate
      file={file}
      style={{
        filter: "blur(9px) saturate(1.1)",
        WebkitMaskImage: `linear-gradient(to ${dir === "top" ? "bottom" : "top"}, black 0%, black 18%, transparent 42%)`,
        maskImage: `linear-gradient(to ${dir === "top" ? "bottom" : "top"}, black 0%, black 18%, transparent 42%)`,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: "#2a1a10" }}>
      <Plate file={file} style={{ filter: "saturate(1.12) contrast(1.04)" }} />
      {band("top")}
      {band("bottom")}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 50%, rgba(30,15,5,0.45) 100%)" }} />
      <LocationCard skin="diorama" />
      <Stamp skin="diorama" />
      <Caption skin="diorama" text={CAPTION} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ styles 2 & 3 */
const CodeStyle: React.FC<{ skin: Extract<Skin, "flat" | "paper"> }> = ({ skin }) => (
  <AbsoluteFill style={{ background: skin === "flat" ? "#ffe2a0" : "#f2e3c4" }}>
    <SoukScene variant={skin} durationInFrames={SEG} />
    <LocationCard skin={skin} />
    <Stamp skin={skin} />
    <Caption skin={skin} text={CAPTION} />
  </AbsoluteFill>
);

const STYLES: { n: number; name: string; note: string; El: React.FC }[] = [
  { n: 2, name: "Flat vector", note: "100% code · $0 per episode", El: () => <CodeStyle skin="flat" /> },
  { n: 3, name: "Paper cut-out", note: "100% code · $0 per episode", El: () => <CodeStyle skin="paper" /> },
  { n: 5, name: "Illustrated journal", note: "AI-painted plates + code overlays", El: JournalStyle },
  { n: 6, name: "Miniature diorama", note: "AI clay-diorama plates + code overlays", El: DioramaStyle },
];

export const STYLE_TEST_DURATION = STYLES.length * SEG;

const Segment: React.FC<{ s: (typeof STYLES)[number] }> = ({ s }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [SEG - 8, SEG], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <s.El />
      <StyleTag n={s.n} name={s.name} note={s.note} />
    </AbsoluteFill>
  );
};

export const TravelStyleTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    {STYLES.map((s, i) => (
      <Sequence key={s.n} name={`Style ${s.n} · ${s.name}`} from={i * SEG} durationInFrames={SEG}>
        <Segment s={s} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
