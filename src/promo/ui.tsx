/**
 * promo/ui — the abstract "how it was built" motion graphics.
 *
 * A tasteful, brand-colored impression of a code editor, a terminal, a composition frame and a
 * layer timeline — NOT a fake screenshot of real software. Everything is drawn from primitives
 * and driven by `useCurrentFrame()`. Sizes are base-px scaled by `useScale()`.
 */

import React from "react";
import { useCurrentFrame } from "remotion";
import { useScale } from "../format";
import { MONO } from "./fonts";
import { Appear, HeroClip, ramp } from "./primitives";
import {
  CREAM,
  GOLD,
  GOLD_SOFT,
  PLATINUM,
  ROSE,
  SYNTAX,
  TERM,
  withAlpha,
} from "./palette";

/* ─────────────────────────── terminal ─────────────────────────── */

export const TerminalWindow: React.FC<{
  title?: string;
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ title = "claude-code — ~/ai-studio", width = 820, style, children }) => {
  const { scale, scaleRounded } = useScale();
  return (
    <div
      style={{
        width: scale(width),
        borderRadius: scale(20),
        background: TERM.bg,
        border: `${scaleRounded(1)}px solid ${TERM.border}`,
        boxShadow: `0 ${scale(40)}px ${scale(90)}px ${withAlpha("#000000", 0.55)}`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: scale(56),
          background: TERM.bar,
          borderBottom: `${scaleRounded(1)}px solid ${withAlpha(CREAM, 0.06)}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: scale(24),
          gap: scale(12),
          position: "relative",
        }}
      >
        {[TERM.dot1, TERM.dot2, TERM.dot3].map((c, i) => (
          <div key={i} style={{ width: scale(15), height: scale(15), borderRadius: 999, background: c }} />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontSize: scale(20),
            color: withAlpha(CREAM, 0.4),
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ padding: `${scale(30)}px ${scale(34)}px` }}>{children}</div>
    </div>
  );
};

/** A line typed out character-by-character, with a blinking block cursor. */
export const Typed: React.FC<{
  text: string;
  /** Local frame to begin typing. */
  start: number;
  /** Characters per frame. Default ~0.9 (≈27 cps). */
  cps?: number;
  prefix?: React.ReactNode;
  color?: string;
  size?: number;
  cursor?: boolean;
}> = ({ text, start, cps = 0.9, prefix, color = withAlpha(CREAM, 0.92), size = 26, cursor = true }) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  const shown = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  const typing = frame >= start && shown < text.length;
  const cursorOn = cursor && (typing || Math.floor(frame / 15) % 2 === 0);
  return (
    <div style={{ fontFamily: MONO, fontSize: scale(size), lineHeight: 1.5, color, display: "flex", flexWrap: "wrap" }}>
      {prefix}
      <span>{text.slice(0, shown)}</span>
      <span
        style={{
          display: "inline-block",
          width: scale(size * 0.55),
          height: scale(size * 1.05),
          marginLeft: scale(4),
          background: cursorOn ? GOLD : "transparent",
          translate: `0 ${scale(size * 0.18)}px`,
        }}
      />
    </div>
  );
};

/* ─────────────────────────── code ─────────────────────────── */

export type Tok = { k: keyof typeof SYNTAX; v: string };
export type CodeLineTokens = Tok[];

const CodeLine: React.FC<{ tokens: CodeLineTokens; size: number; indent?: number }> = ({ tokens, size, indent = 0 }) => {
  const { scale } = useScale();
  return (
    <div style={{ fontFamily: MONO, fontSize: scale(size), lineHeight: 1.72, paddingLeft: scale(indent * 22), whiteSpace: "pre" }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: SYNTAX[t.k] }}>
          {t.v}
        </span>
      ))}
    </div>
  );
};

/** A block of syntax-colored code whose lines rise in on a stagger. */
export const CodeBlock: React.FC<{
  lines: Array<{ tokens: CodeLineTokens; indent?: number }>;
  /** Local frame the first line appears. */
  start: number;
  /** Frames between lines. Default 6. */
  stagger?: number;
  size?: number;
}> = ({ lines, start, stagger = 6, size = 24 }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    {lines.map((ln, i) => (
      <Appear key={i} in={[start + i * stagger, start + i * stagger + 12]} y={14} blur={5}>
        <CodeLine tokens={ln.tokens} size={size} indent={ln.indent} />
      </Appear>
    ))}
  </div>
);

/* ─────────────────────────── timeline / layers ─────────────────────────── */

const TRACK_COLORS = [GOLD, ROSE, PLATINUM, GOLD_SOFT, CREAM];

/** Five labeled tracks that build in, with a playhead sweeping across. */
export const TimelineTracks: React.FC<{
  labels: string[];
  /** Local frame the first track appears. */
  start: number;
  /** Local frame the playhead begins its sweep. */
  playheadStart: number;
  /** Length of the playhead sweep in frames. */
  playheadLen: number;
  width?: number;
}> = ({ labels, start, playheadStart, playheadLen, width = 900 }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const rowH = 62;
  const gap = 16;
  const labelW = 210;
  const laneW = width - labelW - 24;
  const sweep = ramp(frame, [playheadStart, playheadStart + playheadLen]);

  // Deterministic clip layout per track (varying block runs), no randomness.
  const layouts: Array<Array<[number, number]>> = [
    [[0, 0.34], [0.36, 0.62], [0.64, 1]],
    [[0.05, 0.3], [0.5, 0.78]],
    [[0, 0.5], [0.54, 0.8], [0.82, 1]],
    [[0.1, 1]],
    [[0.62, 1]],
  ];

  return (
    <div style={{ width: scale(width), position: "relative" }}>
      {labels.map((label, r) => {
        const appear = ramp(frame, [start + r * 7, start + r * 7 + 14]);
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", height: scale(rowH), marginBottom: scale(gap), opacity: appear }}>
            <div
              style={{
                width: scale(labelW),
                fontFamily: MONO,
                fontSize: scale(21),
                letterSpacing: "0.18em",
                color: withAlpha(CREAM, 0.5),
              }}
            >
              {label}
            </div>
            <div
              style={{
                width: scale(laneW),
                height: scale(rowH),
                borderRadius: scale(10),
                background: withAlpha(CREAM, 0.05),
                border: `${scaleRounded(1)}px solid ${withAlpha(CREAM, 0.08)}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {(layouts[r] ?? [[0, 1]]).map(([a, b], i) => {
                const grow = ramp(frame, [start + r * 7 + 6 + i * 4, start + r * 7 + 20 + i * 4]);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: scale(8),
                      bottom: scale(8),
                      left: `${a * 100}%`,
                      width: `${(b - a) * 100 * grow}%`,
                      background: `linear-gradient(90deg, ${withAlpha(TRACK_COLORS[r], 0.85)}, ${withAlpha(TRACK_COLORS[r], 0.5)})`,
                      borderRadius: scale(6),
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      {/* playhead */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: scale(gap),
          left: scale(labelW + 24) + sweep * scale(width - labelW - 24 - 6),
          width: scaleRounded(3),
          background: GOLD,
          boxShadow: `0 0 ${scale(16)}px ${withAlpha(GOLD, 0.8)}`,
          opacity: frame >= playheadStart ? 1 : 0,
        }}
      />
    </div>
  );
};

/** A running frame counter chip. */
export const FrameCounter: React.FC<{ base?: number; label?: string }> = ({ base = 0, label = "FRAME" }) => {
  const frame = useCurrentFrame();
  const { scale } = useScale();
  const n = String(base + frame).padStart(4, "0");
  return (
    <div style={{ fontFamily: MONO, fontSize: scale(20), letterSpacing: "0.14em", color: GOLD_SOFT }}>
      {label} {n}
    </div>
  );
};

/**
 * A clean composition frame with chrome: the real Jet Set footage inside a rounded 9:16 frame,
 * corner ticks, a resolution label, and a mini timeline with a sweeping playhead beneath it.
 */
export const CompositionFrame: React.FC<{
  at: number;
  width?: number;
  /** Local frame the frame draws in. */
  start?: number;
}> = ({ at, width = 620, start = 0 }) => {
  const frame = useCurrentFrame();
  const { scale, scaleRounded } = useScale();
  const p = ramp(frame, [start, start + 16]);
  const h = width * (16 / 9);
  const sweep = ramp(frame, [start + 8, start + 150]);
  const tick = scale(26);

  const corner = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: tick,
    height: tick,
    borderColor: GOLD,
    ...pos,
  });

  return (
    <div style={{ opacity: p, scale: 0.94 + p * 0.06 }}>
      <div style={{ position: "relative", width: scale(width), height: scale(h) }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: scale(22),
            overflow: "hidden",
            border: `${scaleRounded(2)}px solid ${withAlpha(GOLD, 0.5)}`,
          }}
        >
          <HeroClip at={at} kenBurns={{ from: 1.04, to: 1.12, easing: "gentle" }} />
        </div>
        {/* corner ticks */}
        <div style={corner({ top: -scale(6), left: -scale(6), borderTop: `${scaleRounded(3)}px solid ${GOLD}`, borderLeft: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ top: -scale(6), right: -scale(6), borderTop: `${scaleRounded(3)}px solid ${GOLD}`, borderRight: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ bottom: -scale(6), left: -scale(6), borderBottom: `${scaleRounded(3)}px solid ${GOLD}`, borderLeft: `${scaleRounded(3)}px solid ${GOLD}` })} />
        <div style={corner({ bottom: -scale(6), right: -scale(6), borderBottom: `${scaleRounded(3)}px solid ${GOLD}`, borderRight: `${scaleRounded(3)}px solid ${GOLD}` })} />
        {/* resolution label */}
        <div
          style={{
            position: "absolute",
            top: scale(18),
            left: scale(18),
            fontFamily: MONO,
            fontSize: scale(18),
            letterSpacing: "0.12em",
            color: CREAM,
            background: withAlpha("#000000", 0.42),
            padding: `${scale(4)}px ${scale(10)}px`,
            borderRadius: scale(6),
          }}
        >
          1080×1920 · 30 FPS
        </div>
      </div>
      {/* mini timeline */}
      <div style={{ width: scale(width), marginTop: scale(20), height: scale(12), borderRadius: 999, background: withAlpha(CREAM, 0.12), position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, width: `${sweep * 100}%`, background: withAlpha(GOLD, 0.6), borderRadius: 999 }} />
        <div style={{ position: "absolute", top: -scale(6), left: `${sweep * 100}%`, width: scaleRounded(3), height: scale(24), background: GOLD }} />
      </div>
    </div>
  );
};
