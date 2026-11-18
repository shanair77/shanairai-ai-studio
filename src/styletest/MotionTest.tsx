/**
 * MotionTest — can the painted styles (5 · journal, 6 · diorama) move like the code-drawn
 * ones? Five 5-second segments, each with the same teaching overlays as the style test:
 *
 *   5 · Journal take 1   — AI image-to-video (Seedance 2.5)
 *   5 · Journal take 2   — AI image-to-video
 *   5 · Journal take 1   — LAYERED: clean painted plate + a two-frame watercolor walk
 *                          cycle animated in code (nearly free, fully controllable)
 *   6 · Diorama take 1   — AI image-to-video
 *   6 · Diorama take 2   — AI image-to-video
 *
 * Media lives in public/motiontest/. A missing file renders a labelled placeholder.
 */

import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { StyleTag } from "./shared";
import { DioramaFrame, JournalFrame, MissingPlate, hasPlate } from "./TravelStyleTest";

export const MOTION_TEST_FPS = 30;
const SEG = 5 * MOTION_TEST_FPS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Clip: React.FC<{ file: string }> = ({ file }) =>
  hasPlate(file) ? (
    <Video src={staticFile(file)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
  ) : (
    <MissingPlate file={file} />
  );

/**
 * The layered "storybook" approach: the painted background with the traveler removed,
 * plus the traveler as a separate sprite that alternates two stride poses and walks
 * into the depth of the alley. Lantern glow and drifting dust are code on top.
 */
const LayeredJournal: React.FC = () => {
  const f = useCurrentFrame();
  const files = ["motiontest/journal-1-clean.png", "motiontest/traveler-a.png", "motiontest/traveler-b.png"];
  const missing = files.find((x) => !hasPlate(x));
  if (missing) return <MissingPlate file={missing} />;
  const t = interpolate(f, [0, SEG], [0, 1], clamp);
  const stride = Math.floor(f / 9) % 2; // swap stride pose every 9 frames
  const bob = Math.abs(Math.sin((f / 9) * Math.PI)) * 0.4;
  const flicker = 0.18 + Math.sin(f * 0.33) * 0.05 + Math.sin(f * 0.13) * 0.04;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(files[0])}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: `${interpolate(f, [0, SEG], [1.04, 1.12], clamp)}`,
          transformOrigin: "50% 55%",
        }}
      />
      {/* warm lantern glow breathing over the upper half */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 45% 30%, rgba(255,200,90,1) 0%, rgba(255,200,90,0) 60%)",
          opacity: flicker,
          mixBlendMode: "screen",
        }}
      />
      {/* the traveler sprite walking away into the alley */}
      <div
        style={{
          position: "absolute",
          left: `${interpolate(t, [0, 1], [44, 47])}%`,
          bottom: `${interpolate(t, [0, 1], [22, 33]) + bob}%`,
          height: `${interpolate(t, [0, 1], [31, 19])}%`,
          aspectRatio: "2 / 3",
          translate: "-50% 0",
        }}
      >
        <Img src={staticFile(files[1 + stride])} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      {/* drifting dust motes in the light */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = (i * 137) % 100;
        const y = ((i * 61 + f * (0.25 + (i % 5) * 0.08)) % 110) - 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x + Math.sin(f * 0.03 + i) * 2}%`,
              top: `${100 - y}%`,
              width: 6 + (i % 3) * 3,
              height: 6 + (i % 3) * 3,
              borderRadius: "50%",
              background: "rgba(255,236,190,0.75)",
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SEGMENTS: { id: string; n: string; name: string; note: string; El: React.FC }[] = [
  { id: "j1-ai", n: "5", name: "Illustrated journal", note: "Take 1 · AI video", El: () => <JournalFrame><Clip file="motiontest/journal-1.mp4" /></JournalFrame> },
  { id: "j2-ai", n: "5", name: "Illustrated journal", note: "Take 2 · AI video", El: () => <JournalFrame><Clip file="motiontest/journal-2.mp4" /></JournalFrame> },
  { id: "j1-layer", n: "5", name: "Illustrated journal", note: "Take 1 · Layered, animated in code", El: () => <JournalFrame><LayeredJournal /></JournalFrame> },
  { id: "d1-ai", n: "6", name: "Miniature diorama", note: "Take 1 · AI video", El: () => <DioramaFrame><Clip file="motiontest/diorama-1.mp4" /></DioramaFrame> },
  { id: "d2-ai", n: "6", name: "Miniature diorama", note: "Take 2 · AI video", El: () => <DioramaFrame><Clip file="motiontest/diorama-2.mp4" /></DioramaFrame> },
];

export const MOTION_TEST_DURATION = SEGMENTS.length * SEG;

const Segment: React.FC<{ s: (typeof SEGMENTS)[number] }> = ({ s }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [SEG - 8, SEG], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <s.El />
      <StyleTag n={s.n} name={s.name} note={s.note} />
    </AbsoluteFill>
  );
};

export const MotionTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    {SEGMENTS.map((s, i) => (
      <Sequence key={s.id} name={`Style ${s.n} · ${s.note}`} from={i * SEG} durationInFrames={SEG}>
        <Segment s={s} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
