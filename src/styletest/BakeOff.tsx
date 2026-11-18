/**
 * BakeOff — the same journal frame (style 5, take 2) and the same prompt, animated by four
 * image-to-video models. Each model gets a 5-second turn under the journal overlays, then
 * all four play together in a 2×2 grid so the same moment can be compared directly.
 *
 * Clips live in public/bakeoff/ (the Seedance baseline is reused from public/motiontest/).
 * A missing clip renders a labelled placeholder.
 */

import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ROUND, StyleTag } from "./shared";
import { JournalFrame, MissingPlate, hasPlate } from "./TravelStyleTest";

export const BAKEOFF_FPS = 30;
const SEG = 5 * BAKEOFF_FPS;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const MODELS: { id: string; name: string; note: string; file: string }[] = [
  { id: "seedance", name: "Seedance 2.5", note: "Baseline · 35 credits", file: "motiontest/journal-2.mp4" },
  { id: "kling", name: "Kling 4.0", note: "11.25 credits", file: "bakeoff/kling-4.mp4" },
  { id: "gemini", name: "Gemini Omni Flash", note: "15 credits", file: "bakeoff/gemini-omni.mp4" },
  { id: "minimax", name: "MiniMax H3 Max", note: "12.5 credits", file: "bakeoff/minimax-h3.mp4" },
];

const Clip: React.FC<{ file: string }> = ({ file }) =>
  hasPlate(file) ? (
    <Video src={staticFile(file)} muted objectFit="cover" style={{ width: "100%", height: "100%" }} />
  ) : (
    <MissingPlate file={file} />
  );

const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [SEG - 8, SEG], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** All four clips at once, each labelled, so the same moment is compared side by side. */
const Grid: React.FC = () => (
  <AbsoluteFill style={{ background: "#111", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 6 }}>
    {MODELS.map((m) => (
      <div key={m.id} style={{ position: "relative", overflow: "hidden" }}>
        <Clip file={m.file} />
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 18,
            background: "rgba(20,16,30,0.82)",
            color: "#fff",
            fontFamily: ROUND,
            fontSize: 34,
            padding: "8px 20px",
            borderRadius: 999,
          }}
        >
          {m.name}
          <span style={{ fontSize: 24, opacity: 0.7 }}> · {m.note}</span>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const BAKEOFF_DURATION = (MODELS.length + 1) * SEG;

export const BakeOff: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    {MODELS.map((m, i) => (
      <Sequence key={m.id} name={`Model · ${m.name}`} from={i * SEG} durationInFrames={SEG}>
        <Fade>
          <JournalFrame>
            <Clip file={m.file} />
          </JournalFrame>
          <StyleTag n="5" name={m.name} note={`Same frame, same prompt · ${m.note}`} />
        </Fade>
      </Sequence>
    ))}
    <Sequence name="All four side by side" from={MODELS.length * SEG} durationInFrames={SEG}>
      <Fade>
        <Grid />
      </Fade>
    </Sequence>
  </AbsoluteFill>
);
