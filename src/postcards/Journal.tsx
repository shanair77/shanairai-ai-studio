/**
 * Postcards from Africa — the "open journal" layout: a 1920×1080 landscape version for
 * regular (long-form) YouTube, built from the same episode data and media as the
 * vertical Shorts.
 *
 *   left page  · the picture as a taped 4:5 photo, or a code-drawn scene as a pasted card
 *   right page · series header, mini season map, place, fact note, and the narration
 *                written onto ruled lines word by word
 *
 * `PostcardsSeason` plays several episodes back to back (each episode's title beat acts as
 * its chapter card) and ends on an end card with room for YouTube end-screen elements.
 */

import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from "remotion";
import { AFRICA_PATH, HAND, MARKER, proj } from "../styletest/shared";
import {
  AmbientBed,
  BeatAudio,
  ClipPicture,
  EpisodeAmbience,
  FADE,
  LEAD,
  PlatePicture,
  POSTCARDS_FPS,
  Scribbles,
  Tape,
  beatFrames,
  episodeFrames,
} from "./Episode";
import { FootprintsScene, HookScene, INK, MoonbowScene, RiverScene, TreesScene, NextScene, NotesScene, PAPER, RED, TimelineScene, TitleScene } from "./scenes";
import type { Beat, Episode } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920;
const H = 1080;
/** Seconds of end card after the last episode (YouTube end screens run 5–20 s). */
export const END_CARD_SECONDS = 14;

/* ------------------------------------------------------------------ the open journal */
/** Desk, two pages and a gutter shadow. Static, so it reads as one book across cuts. */
const OpenJournal: React.FC = () => (
  <AbsoluteFill style={{ background: "#4a3a2c" }}>
    <svg width={W} height={H} style={{ position: "absolute", opacity: 0.35 }}>
      <filter id="desk-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.4" numOctaves={3} seed={7} />
        <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.07  0 0 0 0.9 0" />
      </filter>
      <rect width={W} height={H} filter="url(#desk-grain)" />
    </svg>
    <div style={{ position: "absolute", left: 62, top: 34, width: W - 124, height: H - 60, background: "#d9cdb4", borderRadius: 10, boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }} />
    {(["left", "right"] as const).map((side) => (
      <div
        key={side}
        style={{
          position: "absolute",
          top: 40,
          height: H - 76,
          left: side === "left" ? 74 : W / 2,
          width: W / 2 - 74,
          background: PAPER,
          borderRadius: side === "left" ? "8px 2px 2px 8px" : "2px 8px 8px 2px",
          backgroundImage:
            side === "left"
              ? "linear-gradient(90deg, rgba(120,90,40,0.10) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 86%, rgba(70,50,20,0.28) 100%)"
              : "linear-gradient(90deg, rgba(70,50,20,0.28) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 88%, rgba(120,90,40,0.10) 100%)",
        }}
      />
    ))}
    <svg width={W} height={H} style={{ position: "absolute", opacity: 0.2, mixBlendMode: "multiply" }}>
      <filter id="page-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.35 0" />
      </filter>
      <rect x={74} y={40} width={W - 148} height={H - 76} filter="url(#page-grain)" />
    </svg>
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ left page */
const LEFT_CX = 74 + (W / 2 - 74) / 2;

/** A clip or plate as a taped 4:5 photo. The plates are tall paintings on paper, so the
 *  window keeps their upper-middle, where the painted scene sits. */
const JournalPhoto: React.FC<{ beat: Beat; frames: number }> = ({ beat, frames }) => {
  const v = beat.visual;
  const w = 690;
  const h = 862;
  return (
    <div style={{ position: "absolute", left: LEFT_CX - w / 2, top: 100, width: w, height: h, rotate: "-1.4deg" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", border: "14px solid #fbf6ea", boxShadow: "0 10px 28px rgba(0,0,0,0.32)" }}>
        {v.kind === "clip" ? <ClipPicture v={v} frames={frames} focusY="30%" /> : v.kind === "plate" ? <PlatePicture v={v} frames={frames} focusY="30%" /> : null}
        {beat.scribbles ? <Scribbles items={beat.scribbles} /> : null}
      </div>
      <Tape style={{ left: -60, top: -10, rotate: "-35deg" }} />
      <Tape style={{ right: -60, top: -10, rotate: "35deg" }} />
      <Tape style={{ left: -60, bottom: -10, rotate: "35deg" }} />
      <Tape style={{ right: -60, bottom: -10, rotate: "-35deg" }} />
    </div>
  );
};

/** A code-drawn vertical scene, shrunk onto the left page as a pasted card. */
const SceneCard: React.FC<{ ep: Episode; scene: Extract<Beat["visual"], { kind: "scene" }>["scene"] }> = ({ ep, scene }) => {
  const s = 0.47;
  return (
    <div style={{ position: "absolute", left: LEFT_CX - (1080 * s) / 2, top: 82, width: 1080 * s, height: 1920 * s, rotate: "-1deg", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }}>
      <div style={{ position: "absolute", width: 1080, height: 1920, scale: `${s}`, transformOrigin: "0 0", overflow: "hidden" }}>
        {scene === "hook" ? (
          <HookScene />
        ) : scene === "timeline" ? (
          <TimelineScene ep={ep} />
        ) : scene === "footprints" ? (
          <FootprintsScene ep={ep} />
        ) : scene === "moonbow" ? (
          <MoonbowScene ep={ep} />
        ) : scene === "river" ? (
          <RiverScene ep={ep} />
        ) : scene === "trees" ? (
          <TreesScene ep={ep} />
        ) : scene === "title" ? (
          <TitleScene ep={ep} />
        ) : scene === "notes" ? (
          <NotesScene ep={ep} />
        ) : (
          <NextScene ep={ep} />
        )}
      </div>
      <Tape style={{ left: 190, top: -22, width: 150, height: 42, rotate: "-3deg" }} />
    </div>
  );
};

/* ------------------------------------------------------------------ right page */
const RIGHT_X = W / 2 + 70;
const RIGHT_W = W / 2 - 74 - 140;

/** Small Africa map: the season's earlier stops in grey and this stop's pin in red. */
const MiniMap: React.FC<{ ep: Episode }> = ({ ep }) => {
  const stops = [...ep.route, ep.pin].map(([lo, la]) => proj(lo, la));
  const d = stops.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(stops[i - 1].x + p.x) / 2} ${Math.min(stops[i - 1].y, p.y) - 26} ${p.x} ${p.y}`)).join(" ");
  const here = stops[stops.length - 1];
  return (
    <svg width={230} height={252} viewBox="-10 -10 220 240" style={{ position: "absolute", right: 100, top: 150, rotate: "3deg" }}>
      <path d={AFRICA_PATH} fill="#e2b874" opacity={0.6} />
      <path d={AFRICA_PATH} fill="none" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {stops.length > 1 ? <path d={d} fill="none" stroke="#7a7a7a" strokeWidth={1.6} strokeDasharray="4 3" /> : null}
      {stops.slice(0, -1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#7a7a7a" stroke={INK} strokeWidth={1} />
      ))}
      <circle cx={here.x} cy={here.y} r={5.5} fill={RED} stroke={INK} strokeWidth={1.2} />
    </svg>
  );
};

const RightPageHeader: React.FC<{ ep: Episode }> = ({ ep }) => (
  <div style={{ position: "absolute", left: RIGHT_X, width: RIGHT_W, top: 76, display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `3px solid ${INK}`, paddingBottom: 10 }}>
    <div style={{ fontFamily: MARKER, fontSize: 36, color: INK }}>{ep.series}</div>
    <div style={{ fontFamily: HAND, fontSize: 38, color: RED }}>
      Stop {String(ep.number).padStart(2, "0")} · {ep.country}
    </div>
  </div>
);

const PlaceLine: React.FC<{ place: string }> = ({ place }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [6, 18], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: RIGHT_X, top: 170, width: RIGHT_W - 280, fontFamily: MARKER, fontSize: 58, lineHeight: 1.1, color: INK, opacity: o, translate: `${(1 - o) * -20}px 0` }}>
      {place}
    </div>
  );
};

const JournalNote: React.FC<{ label: string; text: string }> = ({ label, text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = Math.round(1.3 * fps);
  const o = interpolate(f, [at, at + 12], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: RIGHT_X + 10,
        top: 330,
        width: 560,
        padding: "20px 28px 24px",
        background: "#fff3c4",
        boxShadow: "4px 7px 16px rgba(0,0,0,0.22)",
        rotate: "-1.5deg",
        opacity: o,
        scale: `${interpolate(o, [0, 1], [0.92, 1])}`,
      }}
    >
      <Tape style={{ top: -20, left: 190, width: 150, height: 40, rotate: "3deg" }} />
      <div style={{ fontFamily: MARKER, fontSize: 28, color: RED, letterSpacing: 1, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: HAND, fontSize: 38, color: INK, lineHeight: 1.18 }}>{text}</div>
    </div>
  );
};

/** The narration, written onto ruled lines word by word as it is spoken. */
const Handwriting: React.FC<{ text: string; voSeconds: number }> = ({ text, voSeconds }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const start = LEAD * fps;
  const shown = interpolate(f, [start, start + voSeconds * fps * 0.95], [0, words.length], clamp);
  const line = 66;
  return (
    <div
      style={{
        position: "absolute",
        left: RIGHT_X,
        width: RIGHT_W,
        top: 640,
        height: line * 5,
        backgroundImage: `repeating-linear-gradient(transparent 0px, transparent ${line - 3}px, #c9d6e8 ${line - 3}px, #c9d6e8 ${line}px)`,
      }}
    >
      <div style={{ fontFamily: HAND, fontSize: 50, lineHeight: `${line}px`, color: INK, paddingLeft: 6, marginTop: -6 }}>
        {words.map((w, i) => {
          const d = shown - i;
          return (
            <span key={i} style={{ opacity: interpolate(d, [0, 0.6], [0, 1], clamp), color: d > 0 && d < 1.4 ? RED : INK }}>
              {w}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ beat & episode */
const JournalBeat: React.FC<{ ep: Episode; beat: Beat; frames: number }> = ({ ep, beat, frames }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, FADE], [0, 1], clamp), interpolate(f, [frames - 6, frames], [1, 0], clamp));
  const v = beat.visual;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: o }}>
        {v.kind === "scene" ? <SceneCard ep={ep} scene={v.scene} /> : <JournalPhoto beat={beat} frames={frames} />}
        {beat.place ? <PlaceLine place={beat.place} /> : null}
        {beat.note ? <JournalNote {...beat.note} /> : null}
        <Handwriting text={beat.text} voSeconds={beat.voSeconds} />
      </AbsoluteFill>
      <BeatAudio beat={beat} />
    </AbsoluteFill>
  );
};

/** One episode on the journal spread. The header and mini map stay put; the pages change per beat. */
export const JournalEpisode: React.FC<{ episode: Episode }> = ({ episode }) => {
  let at = 0;
  return (
    <AbsoluteFill>
      <EpisodeAmbience episode={episode} />
      <RightPageHeader ep={episode} />
      <MiniMap ep={episode} />
      {episode.beats.map((b, i) => {
        const frames = beatFrames(b);
        const from = at;
        at += frames;
        return (
          <Sequence key={b.id} name={`${String(i).padStart(2, "0")} · ${b.id}`} from={from} durationInFrames={frames}>
            <JournalBeat ep={episode} beat={b} frames={frames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ end card */
/** The whole season's route with every stop, plus clear space on the right page where
 *  YouTube's end-screen elements (subscribe button, next-video boxes) are placed. */
const EndCard: React.FC<{ episodes: Episode[] }> = ({ episodes }) => {
  const f = useCurrentFrame();
  const last = episodes[episodes.length - 1];
  const stops = [...last.route, last.pin].map(([lo, la]) => proj(lo, la));
  const nextPin = proj(last.next.pin[0], last.next.pin[1]);
  const d = stops.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `Q ${(stops[i - 1].x + p.x) / 2} ${Math.min(stops[i - 1].y, p.y) - 26} ${p.x} ${p.y}`)).join(" ");
  const here = stops[stops.length - 1];
  const nextD = `M ${here.x} ${here.y} Q ${(here.x + nextPin.x) / 2} ${Math.min(here.y, nextPin.y) - 26} ${nextPin.x} ${nextPin.y}`;
  const draw = interpolate(f, [10, 70], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const o = interpolate(f, [0, 15], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 74, width: W / 2 - 74, top: 90, textAlign: "center" }}>
        <div style={{ fontFamily: MARKER, fontSize: 70, color: INK }}>{last.series}</div>
        <div style={{ fontFamily: HAND, fontSize: 46, color: RED }}>{episodes.map((e) => e.country).join(" · ")}</div>
      </div>
      <svg width={660} height={720} viewBox="-10 -10 220 240" style={{ position: "absolute", left: LEFT_CX - 330, top: 260 }}>
        <path d={AFRICA_PATH} fill="#e2b874" opacity={0.65} />
        <path d={AFRICA_PATH} fill="none" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={RED} strokeWidth={1.4} strokeDasharray="4 3" />
        <path d={d} fill="none" stroke={PAPER} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={draw - 1} />
        <path d={nextD} fill="none" stroke="#7a7a7a" strokeWidth={1.2} strokeDasharray="2 3" opacity={interpolate(f, [70, 85], [0, 1], clamp)} />
        {stops.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={RED} stroke={INK} strokeWidth={1.1} opacity={interpolate(f, [10 + i * 25, 18 + i * 25], [0, 1], clamp)} />
        ))}
        <circle cx={nextPin.x} cy={nextPin.y} r={4.5} fill="none" stroke="#7a7a7a" strokeWidth={1.4} opacity={interpolate(f, [80, 90], [0, 1], clamp)} />
      </svg>
      <div style={{ position: "absolute", left: RIGHT_X, width: RIGHT_W, top: 110, opacity: interpolate(f, [20, 35], [0, 1], clamp) }}>
        <div style={{ fontFamily: HAND, fontSize: 56, color: INK, lineHeight: 1.25 }}>Thanks for travelling with us.</div>
        <div style={{ fontFamily: HAND, fontSize: 44, color: RED, marginTop: 10 }}>Next stop: {last.next.country}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ season */
export type SeasonProps = { episodes: Episode[] };

export const seasonFrames = (episodes: Episode[], fps = POSTCARDS_FPS) =>
  episodes.reduce((n, e) => n + episodeFrames(e, fps), 0) + END_CARD_SECONDS * fps;

/** Start time in seconds of each episode, for YouTube chapter timestamps. */
export const seasonChapters = (episodes: Episode[], fps = POSTCARDS_FPS) => {
  let at = 0;
  const list = episodes.map((e) => {
    const s = at;
    at += episodeFrames(e, fps);
    return { title: `Stop ${String(e.number).padStart(2, "0")} · ${e.country}`, seconds: s / fps };
  });
  return [...list, { title: "Season map & what's next", seconds: at / fps }];
};

export const calculateSeasonMetadata: CalculateMetadataFunction<SeasonProps> = ({ props }) => ({
  durationInFrames: seasonFrames(props.episodes),
  fps: POSTCARDS_FPS,
  width: W,
  height: H,
});

export const PostcardsSeason: React.FC<SeasonProps> = ({ episodes }) => {
  const { fps } = useVideoConfig();
  let at = 0;
  const last = episodes[episodes.length - 1];
  const lastAmbient = [...last.beats].reverse().find((b) => b.ambient)?.ambient;
  return (
    <AbsoluteFill>
      <OpenJournal />
      {episodes.map((e) => {
        const frames = episodeFrames(e, fps);
        const from = at;
        at += frames;
        return (
          <Sequence key={e.country} name={`Stop ${e.number} · ${e.country}`} from={from} durationInFrames={frames}>
            <JournalEpisode episode={e} />
          </Sequence>
        );
      })}
      <Sequence name="End card" from={at} durationInFrames={END_CARD_SECONDS * fps}>
        <EndCard episodes={episodes} />
        {lastAmbient ? <AmbientBed sound={lastAmbient} frames={END_CARD_SECONDS * fps} /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};
