/**
 * Postcards from Africa — the episode engine. Renders any `Episode` (see types.ts) as a
 * 1080×1920 faceless travel short in the watercolor-journal style:
 *
 *   picture (AI clip / layered plate / code scene) inside a taped journal photo
 *   + series header, location chip, taped fact note, scribbles
 *   + word-by-word caption synced to the voiceover
 *   + voiceover, looping ambient bed and one-shot effects per beat.
 *
 * Each beat lasts LEAD + its voiceover + TAIL (or `minSeconds`), so re-recording a line
 * re-times the edit automatically.
 */

import { Audio, Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { HAND, MARKER } from "../styletest/shared";
import { HookScene, INK, NextScene, NotesScene, PAPER, RED, TimelineScene, TitleScene } from "./scenes";
import type { Beat, Episode, Sound } from "./types";

export const POSTCARDS_FPS = 30;
const LEAD = 0.45;
const TAIL = 0.85;
const FADE = 9;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const beatFrames = (b: Beat, fps = POSTCARDS_FPS) =>
  Math.round(Math.max(b.minSeconds ?? 0, LEAD + b.voSeconds + TAIL) * fps);

export const episodeFrames = (ep: Episode, fps = POSTCARDS_FPS) => ep.beats.reduce((n, b) => n + beatFrames(b, fps), 0);

export type EpisodeProps = { episode: Episode };

export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeProps> = ({ props }) => ({
  durationInFrames: episodeFrames(props.episode),
  fps: POSTCARDS_FPS,
  width: 1080,
  height: 1920,
});

/* ------------------------------------------------------------------ picture */
const ClipPicture: React.FC<{ v: Extract<Beat["visual"], { kind: "clip" }>; frames: number }> = ({ v, frames }) => {
  const { fps } = useVideoConfig();
  // Slow the clip a little to fill the beat (never below 0.8×); a freeze on the last
  // frame covers whatever is left.
  const rate = Math.min(1, Math.max(0.8, v.seconds / (frames / fps)));
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, frames], [1.02, 1.07], clamp);
  return (
    <AbsoluteFill style={{ scale: `${drift}` }}>
      <Img src={staticFile(v.still)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
      <Video src={staticFile(v.src)} muted playbackRate={rate} objectFit="cover" style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

const PlatePicture: React.FC<{ v: Extract<Beat["visual"], { kind: "plate" }>; frames: number }> = ({ v, frames }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, frames], [0, 1], clamp);
  const plateStyle: React.CSSProperties =
    v.motion === "push"
      ? { scale: `${interpolate(t, [0, 1], [1.04, 1.13])}`, transformOrigin: "50% 45%" }
      : v.motion === "tilt"
        ? { scale: "1.25", translate: `0 ${interpolate(t, [0, 1], [-8, 8])}%` }
        : { scale: "1.22", translate: `${interpolate(t, [0, 1], [5, -5])}% 0` };
  return (
    <AbsoluteFill>
      <Img src={staticFile(v.src)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", ...plateStyle }} />
      {v.fg ? (
        <Img
          src={staticFile(v.fg.src)}
          style={{
            position: "absolute",
            width: `${v.fg.width}%`,
            left: `${interpolate(t, [0, 1], [v.fg.from[0], v.fg.to[0]])}%`,
            bottom: `${interpolate(t, [0, 1], [v.fg.from[1], v.fg.to[1]])}%`,
            rotate: v.fg.rotate ? `${interpolate(t, [0, 1], v.fg.rotate)}deg` : undefined,
            filter: "drop-shadow(6px 10px 12px rgba(40,25,10,0.35))",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ journal overlays */
const Tape: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: "absolute", width: 170, height: 46, background: "rgba(226,208,150,0.82)", ...style }} />
);

/** The taped photo window that holds the picture. */
const JournalPhoto: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <AbsoluteFill style={{ padding: "150px 30px 30px", rotate: "-0.5deg" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", border: "14px solid #fbf6ea", boxShadow: "0 10px 30px rgba(0,0,0,0.32)" }}>
        {children}
      </div>
    </AbsoluteFill>
    <Tape style={{ left: -10, top: 132, rotate: "-35deg" }} />
    <Tape style={{ right: -10, top: 132, rotate: "35deg" }} />
    <Tape style={{ left: -10, bottom: 10, rotate: "35deg" }} />
    <Tape style={{ right: -10, bottom: 10, rotate: "-35deg" }} />
  </>
);

const SeriesHeader: React.FC<{ ep: Episode }> = ({ ep }) => (
  <div style={{ position: "absolute", top: 48, left: 46, right: 46, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
    <div style={{ fontFamily: MARKER, fontSize: 40, color: INK }}>{ep.series}</div>
    <div style={{ fontFamily: HAND, fontSize: 40, color: RED }}>
      Stop {String(ep.number).padStart(2, "0")} · {ep.country}
    </div>
  </div>
);

const PlaceChip: React.FC<{ place: string }> = ({ place }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [6, 18], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 205,
        left: 70,
        padding: "12px 26px 14px",
        background: "rgba(251,246,234,0.94)",
        boxShadow: "3px 5px 12px rgba(0,0,0,0.22)",
        fontFamily: HAND,
        fontSize: 50,
        color: INK,
        rotate: "-2deg",
        opacity: o,
        translate: `${(1 - o) * -30}px 0`,
      }}
    >
      📍 {place}
    </div>
  );
};

const FactNote: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.round(1.3 * fps);
  const o = interpolate(f, [at, at + 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 320,
        right: 64,
        width: 470,
        padding: "22px 28px 26px",
        background: "#fff3c4",
        boxShadow: "4px 7px 16px rgba(0,0,0,0.25)",
        rotate: "2deg",
        opacity: o,
        scale: `${interpolate(o, [0, 1], [0.9, 1])}`,
      }}
    >
      <Tape style={{ top: -20, left: 150, width: 150, height: 40, rotate: "-4deg" }} />
      <div style={{ fontFamily: MARKER, fontSize: 30, color: RED, letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: HAND, fontSize: 42, color: INK, lineHeight: 1.15 }}>{text}</div>
    </div>
  );
};

const Scribbles: React.FC<{ items: string[] }> = ({ items }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spots = [
    { right: 80, top: 360, rotate: 6 },
    { left: 90, top: 560, rotate: -5 },
    { right: 110, top: 740, rotate: 4 },
  ];
  return (
    <>
      {items.map((s, i) => {
        const at = Math.round((3.4 + i * 0.7) * fps);
        const o = interpolate(f, [at, at + 8], [0, 1], clamp);
        const pos = spots[i % spots.length];
        return (
          <div
            key={s}
            style={{
              position: "absolute",
              ...pos,
              rotate: `${pos.rotate}deg`,
              fontFamily: HAND,
              fontSize: 64,
              color: "#fffbea",
              textShadow: "0 3px 10px rgba(20,30,70,0.6)",
              opacity: o,
              scale: `${interpolate(o, [0, 1], [1.3, 1])}`,
            }}
          >
            {s}
          </div>
        );
      })}
    </>
  );
};

/** Word-by-word caption, paced across the voiceover line. */
const Caption: React.FC<{ text: string; voSeconds: number }> = ({ text, voSeconds }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const start = LEAD * fps;
  const shown = interpolate(f, [start, start + voSeconds * fps * 0.95], [0, words.length], clamp);
  const rise = interpolate(f, [0, 10], [40, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 120, translate: `0 ${rise}px` }}>
      <div style={{ background: "rgba(251,246,234,0.95)", padding: "26px 36px 30px", boxShadow: "3px 6px 16px rgba(0,0,0,0.25)", rotate: "-0.6deg" }}>
        <div style={{ fontFamily: HAND, fontSize: 56, lineHeight: 1.2, color: INK }}>
          {words.map((w, i) => {
            const d = shown - i;
            return (
              <span key={i} style={{ opacity: interpolate(d, [0, 1], [0.18, 1], clamp), color: d > 0 && d < 1.4 ? RED : INK }}>
                {w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ sound */
const BeatAudio: React.FC<{ beat: Beat }> = ({ beat }) => {
  const { fps } = useVideoConfig();
  const lead = Math.round(LEAD * fps);
  return (
    <>
      <Sequence name="Voiceover" from={lead} layout="none">
        <Audio src={staticFile(beat.vo)} volume={1} />
      </Sequence>
      {(beat.sfx ?? []).map((s, i) => (
        <Sequence key={i} name={`Effect ${s.src.split("/").pop()}`} from={Math.round((s.at ?? 0) * fps)} layout="none">
          <Audio src={staticFile(s.src)} volume={() => s.volume} />
        </Sequence>
      ))}
    </>
  );
};

/* ------------------------------------------------------------------ beat */
const BeatView: React.FC<{ ep: Episode; beat: Beat; frames: number; first: boolean; last: boolean }> = ({ ep, beat, frames, first, last }) => {
  const f = useCurrentFrame();
  const fadeIn = first ? 1 : interpolate(f, [0, FADE], [0, 1], clamp);
  const fadeOut = last ? interpolate(f, [frames - 20, frames], [1, 0], clamp) : 1;
  const v = beat.visual;
  const isScene = v.kind === "scene";
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
      {v.kind === "scene" ? (
        v.scene === "hook" ? (
          <HookScene />
        ) : v.scene === "timeline" ? (
          <TimelineScene ep={ep} />
        ) : v.scene === "title" ? (
          <TitleScene ep={ep} />
        ) : v.scene === "notes" ? (
          <NotesScene ep={ep} />
        ) : (
          <NextScene ep={ep} />
        )
      ) : (
        <AbsoluteFill style={{ background: PAPER }}>
          <JournalPhoto>{v.kind === "clip" ? <ClipPicture v={v} frames={frames} /> : <PlatePicture v={v} frames={frames} />}</JournalPhoto>
          <SeriesHeader ep={ep} />
          {beat.place ? <PlaceChip place={beat.place} /> : null}
          {beat.note ? <FactNote {...beat.note} /> : null}
          {beat.scribbles ? <Scribbles items={beat.scribbles} /> : null}
        </AbsoluteFill>
      )}
      {!isScene || v.scene === "hook" || v.scene === "timeline" || v.scene === "notes" ? <Caption text={beat.text} voSeconds={beat.voSeconds} /> : null}
      <BeatAudio beat={beat} />
    </AbsoluteFill>
  );
};

/** Frames each ambient bed runs into the next beat, crossfading with the next bed. */
const XFADE = 18;

/** One looping ambient bed, fading in and out over XFADE so neighbouring beds overlap. */
const AmbientBed: React.FC<{ sound: Sound; frames: number }> = ({ sound, frames }) => (
  <Audio
    src={staticFile(sound.src)}
    loop
    volume={(f) =>
      sound.volume * Math.min(interpolate(f, [0, XFADE], [0, 1], clamp), interpolate(f, [frames - XFADE, frames], [1, 0], clamp))
    }
  />
);

export const PostcardsEpisode: React.FC<EpisodeProps> = ({ episode }) => {
  let at = 0;
  const total = episodeFrames(episode);
  const starts = episode.beats.map((b) => {
    const s = at;
    at += beatFrames(b);
    return s;
  });
  at = 0;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {episode.beats.map((b, i) => {
        if (!b.ambient) return null;
        const from = Math.max(0, starts[i] - (i > 0 ? XFADE / 2 : 0));
        const frames = Math.min(total - from, beatFrames(b) + XFADE);
        return (
          <Sequence key={`amb-${b.id}`} name={`Ambience · ${b.id}`} from={from} durationInFrames={frames} layout="none">
            <AmbientBed sound={b.ambient} frames={frames} />
          </Sequence>
        );
      })}
      {episode.beats.map((b, i) => {
        const frames = beatFrames(b);
        const from = at;
        at += frames;
        return (
          <Sequence key={b.id} name={`${String(i).padStart(2, "0")} · ${b.id}`} from={from} durationInFrames={frames}>
            <BeatView ep={episode} beat={b} frames={frames} first={i === 0} last={i === episode.beats.length - 1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
