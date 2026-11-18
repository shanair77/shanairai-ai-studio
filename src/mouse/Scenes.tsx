/**
 * One component per story beat. Each runs inside its own <Sequence>, so
 * `useCurrentFrame()` is scene-local; story beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Berries,
  Bubble,
  Cake,
  Camera,
  Cheese,
  Corn,
  Heart,
  Jelly,
  Seeds,
  Sparkle,
  Suitcase,
  clamp,
  easeInOut,
  easeOut,
  popAt,
} from "../kids/kit";
import { Cat, Dog, Mouse } from "./Characters";
import { CityStreet, DiningRoom, EyesInHole, FLOOR_Y, HOLE_X, Meadow, OakTree, Skyline, Sky, TABLE_Y } from "./Backgrounds";
import { C, type Scene, cueFrame } from "./story";

type SceneProps = { scene: Scene };

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = ["The Country Mouse", "and the", "City Mouse"];
  return (
    <Meadow treeX={null}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 220 }}>
        <div
          style={{
            background: C.cream,
            borderRadius: 64,
            padding: "50px 110px 60px",
            boxShadow: "0 16px 0 rgba(94,75,110,0.12)",
            textAlign: "center",
            scale: `${interpolate(frame, [0, 16], [0.6, 1], { ...clamp, easing: easeOut })}`,
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        >
          {lines.map((l, i) => (
            <div
              key={l}
              style={{
                fontSize: i === 1 ? 64 : 120,
                fontWeight: 700,
                color: i === 0 ? C.leafDark : i === 2 ? C.lavenderDark : C.ink,
                lineHeight: 1.1,
                opacity: word(i),
                translate: `0px ${interpolate(word(i), [0, 1], [40, 0])}px`,
                rotate: `${Math.sin((frame + i * 20) / 18) * 1.5}deg`,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Mouse kind="country" x={interpolate(frame, [0, 30], [-200, 330], { ...clamp, easing: easeOut })} y={980} size={340} walk={frame < 30 ? 1 : 0} wave={frame > 30} />
      <Mouse kind="city" flip x={interpolate(frame, [0, 30], [2120, 1590], { ...clamp, easing: easeOut })} y={980} size={340} walk={frame < 30 ? 1 : 0} wave={frame > 36} />
    </Meadow>
  );
};

/* ───────────────────────────── 2 · Meadow ───────────────────────────── */

export const MeadowScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const walkStart = cue("Her home");
  const walkEnd = walkStart + 70;
  const x = interpolate(frame, [walkStart, walkEnd], [560, 1010], { ...clamp, easing: easeInOut });
  const walking = frame > walkStart && frame < walkEnd;
  // mouse peeks out of the burrow at the very start
  const peek = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Camera>
      <Meadow treeX={480}>
        <Mouse
          kind="country"
          x={x}
          y={interpolate(peek, [0, 1], [1080, 915])}
          size={280}
          walk={walking ? 1 : 0}
          nibble={frame > cue("nibbled")}
          wave={frame > cue("there lived") && frame < walkStart}
        />
        <Seeds x={1200} y={930} size={120} pop={popAt(frame, cue("seeds"))} />
        <Berries x={1350} y={930} size={130} pop={popAt(frame, cue("sweet berries"))} />
        <Corn x={1510} y={930} size={150} pop={popAt(frame, cue("golden corn"))} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={1200 + i * 155} y={760} size={50} t={(frame - cue("seeds") - i * 15) / 10} />
        ))}
      </Meadow>
    </Camera>
  );
};

/* ───────────────────────────── 3 · Visit ───────────────────────────── */

export const VisitScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const arriveStart = cue("her cousin");
  const arriveEnd = arriveStart + 75;
  const cityX = interpolate(frame, [arriveStart, arriveEnd], [2150, 1270], { ...clamp, easing: easeInOut });
  const snooty = interpolate(frame, [cue("wrinkled"), cue("wrinkled") + 10], [0, -22], clamp);
  const speaking = frame > cue("Seeds and");
  return (
    <Camera>
      <Meadow treeX={260}>
        <Mouse kind="country" x={760} y={915} size={280} wave={frame > arriveEnd && frame < cue("shared")} mouthOpen={0} />
        <Suitcase x={1460} y={915} size={110} pop={popAt(frame, arriveEnd - 4)} />
        <Mouse
          kind="city"
          flip
          x={cityX}
          y={915}
          size={280}
          walk={frame > arriveStart && frame < arriveEnd ? 1 : 0}
          headTilt={snooty}
          mouthOpen={speaking ? Math.abs(Math.sin(frame / 3)) : 0}
        />
        {/* the little leaf picnic */}
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", opacity: popAt(frame, cue("shared")) }}>
          <ellipse cx={1010} cy={918} rx={130} ry={24} fill={C.leafDark} />
        </svg>
        <Seeds x={960} y={925} size={90} pop={popAt(frame, cue("shared") + 4)} />
        <Berries x={1060} y={925} size={100} pop={popAt(frame, cue("favorite food"))} />
        <Bubble x={1170} y={640} tail="right" width={620} fontSize={50} text="Come to the city! We eat like kings!" pop={popAt(frame, cue("you must come"))} />
      </Meadow>
    </Camera>
  );
};

/* ───────────────────────────── 4 · Journey ───────────────────────────── */

export const JourneyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cityAt = cueFrame(scene, "until the fields", fps);
  const pan = interpolate(frame, [0, durationInFrames - 20], [0, -2500], { ...clamp, easing: easeInOut });
  const skyT = interpolate(frame, [cityAt - 20, cityAt + 40], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <Sky color={interpolateColors(skyT, [0, 1], [C.sky, C.lavender])} sunColor={interpolateColors(skyT, [0, 1], [C.sun, C.peach])} />
        {/* far layer: hills then city, slower parallax */}
        <g style={{ translate: `${pan * 0.5}px 0px` }}>
          <ellipse cx={500} cy={900} rx={800} ry={250} fill={C.hill} />
          <ellipse cx={1500} cy={920} rx={700} ry={220} fill={C.grassDark} opacity={0.7} />
        </g>
        {/* near layer */}
        <g style={{ translate: `${pan}px 0px` }}>
          <g style={{ scale: "0.6", transformOrigin: "0px 880px" }}>
            <OakTree x={600} />
            <OakTree x={1700} />
          </g>
          <Skyline offsetX={2700} />
          <Skyline offsetX={4700} />
          {/* ground: grass turns into pavement */}
          <rect x={-200} y={880} width={2900} height={200} fill={C.grass} />
          <rect x={2700} y={880} width={4000} height={200} fill="#CFC8DE" />
          {/* winding road */}
          <path d="M -200 900 Q 400 870 900 905 T 1900 900 T 2900 900 L 6700 900 L 6700 950 L -200 950 Z" fill={C.butter} />
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={-100 + i * 230} y={920} width={90} height={10} rx={5} fill={C.cream} />
          ))}
        </g>
      </svg>
      <Mouse kind="country" x={800} y={935} size={260} walk={1} />
      <Mouse kind="city" x={1100} y={935} size={260} walk={1} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── 5 · Feast ───────────────────────────── */

export const FeastScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const enter = interpolate(frame, [0, 60], [0, 1], { ...clamp, easing: easeInOut });
  const ohMy = cue("Oh my");
  const jump = frame > ohMy ? Math.abs(Math.sin((frame - ohMy) / 6)) * -40 * interpolate(frame, [ohMy, ohMy + 60], [1, 0], clamp) : 0;
  return (
    <Camera>
      <DiningRoom>
        <Mouse kind="city" x={interpolate(enter, [0, 1], [380, 760])} y={TABLE_Y + 4} size={190} walk={enter < 1 ? 1 : 0} wave={frame > cue("feast") && frame < cue("Creamy")} />
        <Mouse
          kind="country"
          x={interpolate(enter, [0, 1], [240, 590])}
          y={TABLE_Y + 4 + jump}
          size={190}
          walk={enter < 1 ? 1 : 0}
          mouthOpen={frame > ohMy ? 1 : 0}
        />
        <Cheese x={960} y={TABLE_Y + 8} size={170} pop={popAt(frame, cue("Creamy cheese"))} />
        <Cake x={1170} y={TABLE_Y + 8} size={190} pop={popAt(frame, cue("fluffy cake"))} />
        <Jelly x={1380} y={TABLE_Y + 8} size={170} pop={popAt(frame, cue("wobbly pink"))} />
        {[
          [520, 420],
          [690, 460],
          [600, 330],
        ].map(([x, y], i) => (
          <Sparkle key={i} x={x} y={y} size={60} t={(frame - ohMy - i * 8) / 8} />
        ))}
      </DiningRoom>
    </Camera>
  );
};

/* ───────────────────────────── 6 · Cat ───────────────────────────── */

/** Path from the table top down to the mouse hole, as a hop arc. */
const dash = (t: number, startX: number) => ({
  x: interpolate(t, [0, 1], [startX, HOLE_X], clamp),
  y: interpolate(t, [0, 0.35, 1], [TABLE_Y + 4, FLOOR_Y + 4, FLOOR_Y + 4], clamp) - Math.sin(Math.min(1, t / 0.35) * Math.PI) * 80,
});

export const CatScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const doorAt = cue("the door creaked");
  const catAt = cue("In crept");
  const runAt = cue("“Run!”");
  const run = interpolate(frame, [runAt + 6, runAt + 46], [0, 1], { ...clamp, easing: easeInOut });
  const inHole = run >= 1;
  const a = dash(run, 640);
  const b = dash(interpolate(frame, [runAt + 2, runAt + 42], [0, 1], { ...clamp, easing: easeInOut }), 800);
  const catX = interpolate(frame, [catAt, runAt, runAt + 10, runAt + 60], [-260, 420, 420, 1100], { ...clamp, easing: easeInOut });
  const thumps = ["thump, thump, thump", "thump, thump.", "thump."].map((p) => cue(p));
  const beat = thumps.reduce((m, t) => Math.max(m, interpolate(frame, [t, t + 4, t + 12], [0, 1, 0], clamp)), 0);
  return (
    <Camera from={1.02} to={1.08}>
      <DiningRoom doorOpen={interpolate(frame, [doorAt, doorAt + 30], [0, 1], { ...clamp, easing: easeOut })}>
        <Cheese x={960} y={TABLE_Y + 8} size={170} />
        <Cake x={1170} y={TABLE_Y + 8} size={190} />
        <Jelly x={1380} y={TABLE_Y + 8} size={170} />
        {!inHole ? (
          <>
            <Mouse kind="country" x={a.x} y={a.y} size={170} nibble={frame < doorAt} walk={run > 0 ? 1.4 : 0} shake={frame > catAt && run === 0 ? 3 : 0} />
            <Mouse kind="city" x={b.x} y={b.y} size={170} nibble={frame < doorAt} walk={run > 0 ? 1.4 : 0} shake={frame > catAt && run === 0 ? 3 : 0} />
          </>
        ) : null}
        <Cat x={catX} y={FLOOR_Y + 6} size={520} creep={frame > catAt ? 1 : 0} />
        <Bubble x={830} y={TABLE_Y - 170} tail="left" width={260} fontSize={70} color={C.butter} text="Run!" pop={popAt(frame, runAt, 8) * interpolate(frame, [runAt + 40, runAt + 50], [1, 0], clamp)} />
        <EyesInHole opacity={inHole ? 1 : 0} shake={1.5} />
        <Heart x={HOLE_X - 40} y={FLOOR_Y - 200} size={70} beat={inHole ? beat : 0} />
        <Heart x={HOLE_X + 50} y={FLOOR_Y - 230} size={56} beat={inHole ? beat : 0} color={C.lavenderDark} />
      </DiningRoom>
    </Camera>
  );
};

/* ───────────────────────────── 7 · Dog ───────────────────────────── */

export const DogScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const woof1 = cue("WOOF! WOOF");
  const woof2 = woof1 + 18;
  const backAt = cue("Back into");
  const out = interpolate(frame, [8, woof1 - 6], [0, 1], { ...clamp, easing: easeInOut });
  const back = interpolate(frame, [woof1 + 4, woof1 + 30], [0, 1], { ...clamp, easing: easeInOut });
  const pos = (start: number) => interpolate(out, [0, 1], [HOLE_X, start]) + back * (HOLE_X - start);
  const hidden = back >= 1 || out === 0;
  const dogX = interpolate(frame, [woof1 - 4, woof1 + 40], [-420, 760], { ...clamp, easing: easeOut });
  const tiptoe = out > 0 && out < 1 ? 0.5 : back > 0 && back < 1 ? 1.6 : 0;
  return (
    <Camera from={1.0} to={1.05}>
      <DiningRoom doorOpen={1}>
        <Cheese x={960} y={TABLE_Y + 8} size={170} />
        <Cake x={1170} y={TABLE_Y + 8} size={190} />
        <Jelly x={1380} y={TABLE_Y + 8} size={170} />
        {!hidden ? (
          <>
            <Mouse kind="city" flip={back === 0} x={pos(1520)} y={FLOOR_Y + 4} size={160} walk={tiptoe} />
            <Mouse kind="country" flip={back === 0} x={pos(1380)} y={FLOOR_Y + 4} size={160} walk={tiptoe} shake={frame > woof1 && back === 0 ? 4 : 0} />
          </>
        ) : null}
        <Dog x={dogX} y={FLOOR_Y + 6} size={500} bound={frame > woof1 - 4 && frame < woof1 + 40 ? 1 : 0} bark={frame > woof1} />
        <Bubble x={dogX + 160} y={560} tail="left" width={340} fontSize={80} color={C.butter} text="WOOF!" pop={popAt(frame, woof1, 6)} />
        <Bubble x={dogX + 260} y={330} tail="left" width={340} fontSize={80} color={C.mint} text="WOOF!" pop={popAt(frame, woof2, 6)} />
        <EyesInHole opacity={hidden ? 1 : 0} shake={frame > backAt ? 4 : 1} />
      </DiningRoom>
    </Camera>
  );
};

/* ───────────────────────────── 8 · Home ───────────────────────────── */

export const HomeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const goingAt = cue("“Thank you");
  const meadowAt = cue("And back to her");
  const meadowT = interpolate(frame, [meadowAt - 10, meadowAt + 14], [0, 1], clamp);
  const walkHome = interpolate(frame, [meadowAt + 10, durationInFrames - 30], [1400, 640], { ...clamp, easing: easeInOut });
  return (
    <AbsoluteFill>
      <CityStreet>
        <Mouse kind="city" flip x={1180} y={905} size={240} wave={frame > goingAt + 20} />
        <Mouse
          kind="country"
          x={interpolate(frame, [goingAt, goingAt + 40], [760, 700], clamp)}
          y={905}
          size={240}
          headTilt={interpolate(frame, [0, 20, 40], [0, -10, 0], clamp)}
          wave={frame > goingAt && frame < goingAt + 60}
          mouthOpen={frame > goingAt && frame < meadowAt ? Math.abs(Math.sin(frame / 3)) * 0.8 : 0}
        />
      </CityStreet>
      <AbsoluteFill style={{ opacity: meadowT }}>
        <Meadow treeX={480} warm>
          <Mouse kind="country" flip x={walkHome} y={915} size={280} walk={walkHome > 645 ? 1 : 0} mouthOpen={0} />
          {[0, 1, 2, 3].map((i) => (
            <Heart key={i} x={walkHome - 60 + i * 50} y={640 - ((frame * 1.5 + i * 40) % 160)} size={40} beat={meadowT * 0.2} color={i % 2 ? C.pink : C.pinkDark} />
          ))}
        </Meadow>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (p: string) => cueFrame(scene, p, fps);
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("a simple life"), cue("a simple life") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: C.lavender }}>
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 337) % 1920;
        const y = ((i * 211 + frame * (1 + (i % 3))) % 1200) - 60;
        const colors = [C.pink, C.butter, C.mint, C.cream, C.peach];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 26,
              height: 26,
              borderRadius: i % 2 ? 13 : 6,
              background: colors[i % colors.length],
              rotate: `${frame * 2 + i * 30}deg`,
              opacity: 0.9,
            }}
          />
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
        <div
          style={{
            width: 1360,
            background: C.cream,
            borderRadius: 64,
            padding: "60px 90px",
            textAlign: "center",
            boxShadow: "0 16px 0 rgba(94,75,110,0.14)",
            scale: `${interpolate(card, [0, 1], [0.7, 1])}`,
            opacity: card,
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 700, color: C.lavenderDark, marginBottom: 24 }}>The Moral of the Story</div>
          <div style={{ fontSize: 66, fontWeight: 600, color: C.ink, lineHeight: 1.25, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            A simple life with peace and safety is better than a fancy life full of worry.
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            fontSize: 130,
            fontWeight: 700,
            color: C.pinkDark,
            scale: `${interpolate(end, [0, 0.7, 1], [0, 1.15, 1])}`,
            rotate: `${Math.sin(frame / 12) * 3}deg`,
            textShadow: `0 8px 0 ${C.cream}`,
          }}
        >
          The End
        </div>
      </AbsoluteFill>
      <Mouse kind="country" x={230} y={1060} size={260} wave={end > 0} />
      <Mouse kind="city" flip x={1690} y={1060} size={260} wave={end > 0} />
    </AbsoluteFill>
  );
};
