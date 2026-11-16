/**
 * OdysseyStickman — a ~97 s, 1080×1920 faceless stickman cartoon retelling Odysseus's
 * journey to Troy and back home to Ithaca.
 *
 * Structure (bottom → top):
 *   1. Paper background.
 *   2. Scenes: one `<Sequence>` per story beat, drawn in SVG, fading through paper.
 *      Everything inside gets a "boiling ink" wobble (turbulence re-seeded every few
 *      frames), the classic hand-drawn cartoon look.
 *   3. HUD: title, a route bar with a little ship sailing Ithaca → Troy → Ithaca, and a
 *      year counter that ticks through the twenty years.
 *   4. Narration card: each beat's line revealed word by word (faceless-channel style).
 *
 * The story is data: edit `STORY` to re-time a beat or rewrite its narration. Duration is
 * derived from the beats, so the composition length follows automatically.
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { PAPER, RED } from "./Props";
import * as S from "./scenes";
import { INK } from "./Stickman";

/**
 * Fonts are vendored in public/odyssey/fonts (Patrick Hand — OFL, Permanent Marker —
 * Apache 2.0) so renders never depend on reaching Google Fonts.
 */
const HAND = "Patrick Hand";
const MARKER = "Permanent Marker";
const loadLocalFont = (family: string, file: string) => {
  if (typeof window === "undefined" || typeof FontFace === "undefined") return;
  const handle = delayRender(`Loading font ${family}`);
  const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`);
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => cancelRender(err));
};
loadLocalFont(HAND, "odyssey/fonts/PatrickHand.woff2");
loadLocalFont(MARKER, "odyssey/fonts/PermanentMarker.woff2");

export const ODYSSEY_FPS = 30;
export const ODYSSEY_WIDTH = 1080;
export const ODYSSEY_HEIGHT = 1920;

type Beat = {
  id: string;
  chapter: string;
  seconds: number;
  /** Year shown on the HUD at the start and end of the beat (null = hidden). */
  years: [number, number] | null;
  narration: string;
  Scene: React.FC<S.SceneProps>;
};

export const STORY: Beat[] = [
  { id: "intro", chapter: "", seconds: 4, years: null, Scene: S.Intro,
    narration: "He left home for a war that lasted ten years. Getting back took ten more." },
  { id: "ithaca", chapter: "Ithaca", seconds: 6, years: [0, 0], Scene: S.Ithaca,
    narration: "On the island of Ithaca, King Odysseus says goodbye to his wife Penelope and their newborn son." },
  { id: "sail", chapter: "To war", seconds: 5, years: [0, 0], Scene: S.SailToTroy,
    narration: "A great war has begun. He sails east to join the Greek army at Troy." },
  { id: "siege", chapter: "The siege of Troy", seconds: 6, years: [1, 10], Scene: S.Siege,
    narration: "For ten long years the Greeks attack. Troy's mighty walls never fall." },
  { id: "horse", chapter: "The wooden horse", seconds: 7, years: [10, 10], Scene: S.TrojanHorse,
    narration: "So Odysseus has an idea: a giant wooden horse, left as a gift... with soldiers hidden inside." },
  { id: "falls", chapter: "Victory", seconds: 5, years: [10, 10], Scene: S.TroyFalls,
    narration: "Troy falls. Odysseus sets sail for home. It should take a few weeks." },
  { id: "cyclops", chapter: "The Cyclops", seconds: 8, years: [10, 10], Scene: S.Cyclops,
    narration: "Instead, he lands on the island of the Cyclops, a one-eyed giant who traps his men in a cave. Odysseus blinds him, and they escape." },
  { id: "winds", chapter: "The bag of winds", seconds: 7, years: [11, 11], Scene: S.BagOfWinds,
    narration: "The wind god gives him a bag holding every storm. Home is in sight... when his curious crew opens it." },
  { id: "circe", chapter: "Circe", seconds: 7, years: [11, 11], Scene: S.Circe,
    narration: "The witch Circe turns his crew into pigs. Odysseus stands up to her and wins his men back." },
  { id: "sirens", chapter: "The Sirens", seconds: 7, years: [12, 12], Scene: S.Sirens,
    narration: "Next, the Sirens, whose song lures sailors to their doom. The crew plug their ears with wax. Odysseus, tied to the mast, listens." },
  { id: "scylla", chapter: "Scylla & Charybdis", seconds: 6, years: [12, 12], Scene: S.ScyllaCharybdis,
    narration: "Then a narrow strait: a six-headed monster on one side, a ship-swallowing whirlpool on the other." },
  { id: "calypso", chapter: "Calypso's island", seconds: 7, years: [12, 19], Scene: S.Calypso,
    narration: "Shipwrecked and alone, he washes up on the island of the nymph Calypso. She keeps him there for seven years." },
  { id: "return", chapter: "Home, in disguise", seconds: 6, years: [20, 20], Scene: S.Homecoming,
    narration: "Twenty years after he left, he reaches Ithaca dressed as a beggar. Only his old dog knows him. His palace is full of greedy suitors." },
  { id: "bow", chapter: "The bow", seconds: 7, years: [20, 20], Scene: S.BowContest,
    narration: "Penelope sets a test: string Odysseus's bow and shoot through twelve axes. Every suitor fails. The beggar does not." },
  { id: "reunion", chapter: "Home", seconds: 9, years: [20, 20], Scene: S.Reunion,
    narration: "The king is home at last. Twenty years. One journey." },
];

const FADE = 9;

const timeline = (() => {
  let at = 0;
  return STORY.map((b) => {
    const frames = Math.round(b.seconds * ODYSSEY_FPS);
    const span = { ...b, from: at, frames };
    at += frames;
    return span;
  });
})();

export const ODYSSEY_DURATION = timeline.reduce((n, b) => n + b.frames, 0);

/* ------------------------------------------------------------------ narration card */
const Narration: React.FC<{ text: string; chapter: string; index: number; frames: number }> = ({
  text,
  chapter,
  index,
  frames,
}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const revealEnd = frames * 0.72;
  const shown = interpolate(f, [6, revealEnd], [0, words.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardIn = interpolate(f, [0, 8], [40, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
      <div
        style={{
          width: 960,
          translate: `0 ${cardIn}px`,
          background: "#fffbe9",
          border: `6px solid ${INK}`,
          borderRadius: 28,
          boxShadow: `10px 12px 0 ${INK}`,
          padding: "30px 40px 36px",
          rotate: `${index % 2 ? 0.6 : -0.6}deg`,
        }}
      >
        {chapter ? (
          <div style={{ fontFamily: MARKER, fontSize: 34, color: RED, letterSpacing: 2, marginBottom: 10 }}>
            {index}. {chapter.toUpperCase()}
          </div>
        ) : null}
        <div style={{ fontFamily: HAND, fontSize: 60, lineHeight: 1.18, color: INK }}>
          {words.map((w, i) => {
            const o = interpolate(shown - i, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const current = shown - i > 0 && shown - i < 1.6;
            return (
              <span key={i} style={{ opacity: Math.max(0.14, o), color: current ? RED : INK }}>
                {w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ HUD */
const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const beatIndex = Math.max(0, timeline.findIndex((b) => frame >= b.from && frame < b.from + b.frames));
  const beat = timeline[beatIndex];
  const start = timeline[1].from;
  const opacity = interpolate(frame, [start - 10, start + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (!beat.years) return null;
  const year = Math.round(
    interpolate(frame, [beat.from + 5, beat.from + beat.frames - 20], beat.years, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  // Route progress: Ithaca (left) → Troy (right, reached at the end of the siege) → Ithaca again.
  const troyAt = timeline.find((b) => b.id === "falls")!.from;
  const homeAt = timeline.find((b) => b.id === "return")!.from;
  const x0 = 120;
  const x1 = 960;
  const outbound = interpolate(frame, [start, troyAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inbound = interpolate(frame, [troyAt, homeAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shipX = frame < troyAt ? x0 + (x1 - x0) * outbound : x1 - (x1 - x0) * inbound;
  const wobbleY = frame >= troyAt && frame < homeAt ? Math.sin(inbound * Math.PI * 6) * 26 : 0;
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <text x={60} y={128} fontFamily={MARKER} fontSize={52} fill={INK}>
          THE ODYSSEY
        </text>
        <g transform="translate(860 92)">
          <rect x={-10} y={-48} width={190} height={72} rx={18} fill={RED} stroke={INK} strokeWidth={5} />
          <text x={85} y={2} textAnchor="middle" fontFamily={MARKER} fontSize={38} fill="#fffbe9">
            YEAR {year}
          </text>
        </g>
        <path
          d={`M ${x0} 230 Q 540 170 ${x1} 230`}
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeDasharray="14 12"
          opacity={0.6}
        />
        {[
          { x: x0, label: "ITHACA" },
          { x: x1, label: "TROY" },
        ].map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={230} r={14} fill={p.label === "TROY" ? RED : "#b9c98a"} stroke={INK} strokeWidth={4} />
            <text x={p.x} y={286} textAnchor="middle" fontFamily={HAND} fontSize={34} fill={INK}>
              {p.label}
            </text>
          </g>
        ))}
        <g transform={`translate(${shipX} ${212 - Math.abs(Math.sin(((shipX - x0) / (x1 - x0)) * Math.PI)) * 30 + wobbleY}) scale(${frame >= troyAt ? -1 : 1} 1)`}>
          <path d="M -28 0 Q -22 14 0 14 Q 24 14 30 0 Z" fill="#a8743c" stroke={INK} strokeWidth={3} />
          <line x1={0} y1={0} x2={0} y2={-34} stroke={INK} strokeWidth={3} />
          <path d="M -14 -30 L 14 -30 L 15 -10 L -15 -10 Z" fill="#fffbe9" stroke={INK} strokeWidth={3} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ scene wrapper */
const SceneLayer: React.FC<{ beat: (typeof timeline)[number] }> = ({ beat }) => {
  const f = useCurrentFrame();
  const isFirst = beat.from === 0;
  const isLast = beat.from + beat.frames === ODYSSEY_DURATION;
  const fadeIn = isFirst ? 1 : interpolate(f, [0, FADE], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = isLast
    ? interpolate(f, [beat.frames - 20, beat.frames], [1, 0], { extrapolateLeft: "clamp" })
    : interpolate(f, [beat.frames - FADE, beat.frames], [1, 0], { extrapolateLeft: "clamp" });
  // Re-seed the turbulence every 4 frames → lines "boil" like hand-drawn animation.
  const seed = Math.floor(f / 4) % 5;
  const filterId = `boil-${beat.id}`;
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} />
            <feDisplacementMap in="SourceGraphic" scale={5} />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          <beat.Scene f={f} d={beat.frames} font={MARKER} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const OdysseyStickman: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,90,40,0.22) 100%)",
        }}
      />
      {timeline.map((beat, i) => (
        <Sequence key={beat.id} name={`${i}. ${beat.chapter || "Title"}`} from={beat.from} durationInFrames={beat.frames}>
          <SceneLayer beat={beat} />
          <Narration text={beat.narration} chapter={beat.chapter} index={i} frames={beat.frames} />
        </Sequence>
      ))}
      <Sequence name="HUD" durationInFrames={timeline[timeline.length - 1].from + 150}>
        <Hud />
      </Sequence>
    </AbsoluteFill>
  );
};
