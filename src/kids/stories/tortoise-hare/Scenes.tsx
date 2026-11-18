/**
 * The Tortoise and the Hare (2026 Edition) — one component per story beat. Each runs
 * inside its own <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to
 * narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Placed } from "../../kit";
import { Drone, Duck, Hare, Squirrel, TC, Tortoise, toScene } from "./Characters";
import { FinishArch, GROUND_Y, Park, Sign } from "./Backgrounds";
import type { Scene } from "./story";

type SceneProps = { scene: Scene };

const useCue = (scene: Scene) => {
  const { fps } = useVideoConfig();
  return (p: string) => cueFrame(scene, p, fps);
};

/** Pop in at `a`, out at `b`. */
const inOut = (frame: number, a: number, b: number) => popAt(frame, a, 8) * interpolate(frame, [b - 6, b], [1, 0], clamp);

const TORTOISE_SIZE = 300;
const HARE_SIZE = 430;

/** Where the tortoise's head is, for bubbles. */
const tortoiseHead = (p: Placed) => toScene({ size: TORTOISE_SIZE, ...p }, { x: 352, y: 200 });

/** Floating sleepy "z"s rising from (x, y). */
const Snores: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 30) % 90) / 90;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + t * 90 + Math.sin(t * 6) * 14,
              top: y - t * 200,
              fontSize: 50 + t * 40,
              fontWeight: 700,
              color: C.lavenderDark,
              opacity: opacity * interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
              rotate: "-12deg",
            }}
          >
            z
          </div>
        );
      })}
    </>
  );
};

/** Whoosh lines trailing a runner at (x, y). */
const SpeedLines: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - 260 - ((frame * 9 + i * 40) % 80),
            top: y - 300 + i * 70,
            width: 180 - i * 20,
            height: 14,
            borderRadius: 7,
            background: i % 2 ? C.cream : C.lavender,
            opacity,
          }}
        />
      ))}
    </>
  );
};

/** Falling pastel confetti from `at`. */
const Confetti: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const f = frame - at;
  const colors = [C.pinkDark, C.butterDark, C.mint, C.lavenderDark, C.blue];
  return (
    <>
      {Array.from({ length: 34 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 173 + Math.sin((f + i * 10) / 12) * 30) % 1920,
            top: -40 + f * (5 + (i % 4)) - (i % 7) * 60,
            width: 22,
            height: 22,
            borderRadius: i % 2 ? 11 : 4,
            background: colors[i % colors.length],
            rotate: `${f * 6 + i * 40}deg`,
          }}
        />
      ))}
    </>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Tortoise", es: "La Tortuga" }), t({ en: "and the", es: "y la" }), t({ en: "Hare", es: "Liebre" })];
  return (
    <Park trees={[240, 1700]} bushes={[960]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 260 }}>
        <div
          style={{
            background: C.cream,
            borderRadius: 64,
            padding: "46px 110px 56px",
            boxShadow: "0 16px 0 rgba(94,75,110,0.12)",
            textAlign: "center",
            scale: `${interpolate(frame, [0, 16], [0.6, 1], { ...clamp, easing: easeOut })}`,
            opacity: interpolate(frame, [0, 8], [0, 1], clamp),
          }}
        >
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                fontSize: i === 1 ? 64 : 118,
                fontWeight: 700,
                color: i === 0 ? TC.shellDark : i === 2 ? C.pinkDark : C.ink,
                lineHeight: 1.1,
                opacity: word(i),
                translate: `0px ${interpolate(word(i), [0, 1], [40, 0])}px`,
                rotate: `${Math.sin((frame + i * 20) / 18) * 1.5}deg`,
              }}
            >
              {l}
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 44, fontWeight: 600, color: C.lavenderDark, opacity: word(3) }}>
            {t({ en: "2026 Edition", es: "Edición 2026" })}
          </div>
        </div>
      </AbsoluteFill>
      <Tortoise x={interpolate(frame, [0, 150], [260, 440], clamp)} y={GROUND_Y + 10} size={TORTOISE_SIZE} walk={1} />
      <Hare x={1560} y={GROUND_Y + 10} size={HARE_SIZE} flip bounce={1} wave={frame > 40} />
    </Park>
  );
};

/* ───────────────────────────── 2 · The show-off ───────────────────────────── */

export const BragScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const fastest = cue("I’m the fastest");
  const gentle = cue("A gentle Tortoise");
  const shall = cue("Shall we");
  const laughed = cue("The Hare laughed");
  const youOn = cue("You? Race");
  const tx = interpolate(frame, [Math.max(0, gentle - 110), gentle + 10], [-200, 560], { ...clamp, easing: easeInOut });
  const T: Placed = { x: tx, y: GROUND_Y + 10 };
  const head = tortoiseHead(T);
  const showingOff = frame > fastest - 10 && frame < gentle;
  const laughing = frame > laughed && frame < youOn;
  return (
    <Camera from={1} to={1.05}>
      <Park trees={[260, 1640]} bushes={[1000]} bench={1420}>
        <Hare
          x={1180}
          y={GROUND_Y + 10}
          size={HARE_SIZE}
          flip={frame > gentle - 20}
          bounce={showingOff ? 1 : 0}
          wave={showingOff}
          laugh={laughing}
          eyes={laughing ? "closed" : "open"}
          mouthOpen={showingOff || laughing ? 0.4 + Math.abs(Math.sin(frame / 3)) * 0.5 : frame > youOn ? 0.5 : 0}
        />
        <Tortoise {...T} size={TORTOISE_SIZE} walk={frame < gentle + 10 ? 1 : 0} headTilt={frame > gentle ? 8 : 0} mouthOpen={frame > shall && frame < laughed ? 0.5 : 0} />
        <Bubble x={1240} y={470} tail="left" width={560} fontSize={54} color={C.butter} text={{ en: "I’m the fastest!", es: "¡Soy la más rápida!" }} pop={inOut(frame, fastest, gentle)} />
        <Bubble x={head.x} y={head.y - 30} tail="left" width={500} fontSize={52} color={C.mint} text={{ en: "Shall we race?", es: "¿Hacemos una carrera?" }} pop={inOut(frame, shall, laughed)} />
        {[0, 1].map((i) => (
          <Bubble
            key={i}
            x={1060 - i * 220}
            y={470 - i * 70}
            tail="right"
            width={200}
            fontSize={58}
            color={[C.peach, C.pink][i]}
            text={{ en: "Ha!", es: "¡Ja!" }}
            pop={inOut(frame, laughed + i * 10, youOn)}
          />
        ))}
        <Bubble x={1090} y={470} tail="right" width={460} fontSize={58} color={C.butter} text={{ en: "You’re on!", es: "¡Trato hecho!" }} pop={popAt(frame, youOn + 20, 8)} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={1020 + i * 150} y={420 - (i % 2) * 60} size={44} t={(frame - fastest - i * 6) / 8} />
        ))}
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 3 · Ready, steady, go ───────────────────────────── */

const DUCKS = [1240, 1390, 1540, 1700];

export const StartScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const ducksAt = cue("Ducks and");
  const droneAt = cue("a little camera drone");
  const ready = cue("Ready, steady");
  const go = cue("GO!");
  const zoom = cue("Zoom!");
  const hareX = interpolate(frame, [zoom, zoom + 26], [560, 2350], { ...clamp, easing: Easing_in });
  const running = frame > zoom;
  const tx = interpolate(frame, [zoom + 6, zoom + 200], [330, 470], clamp);
  return (
    <Camera from={1.02} to={1.07}>
      <Park trees={[1820]} bushes={[1000]}>
        <Sign x={130} text={{ en: "START", es: "SALIDA" }} />
        {DUCKS.map((x, i) => (
          <Duck key={i} x={x} y={GROUND_Y - 40} size={120} flip seed={i} cheer={frame > ducksAt && frame < ducksAt + 50 ? true : frame > go} opacity={popAt(frame, ducksAt - 20 + i * 5, 10)} />
        ))}
        <Squirrel x={860} y={GROUND_Y - 44} size={170} flip flagUp={interpolate(frame, [go - 4, go + 4], [0, 1], clamp)} mouthOpen={frame > ready && frame < zoom ? 0.8 : 0} />
        <Drone x={interpolate(frame, [droneAt, droneAt + 50], [2150, 1180], { ...clamp, easing: easeOut })} y={250} size={190} />
        <Tortoise x={tx} y={GROUND_Y + 10} size={TORTOISE_SIZE} walk={frame > zoom + 6 ? 1 : 0} />
        <SpeedLines x={hareX} y={GROUND_Y} opacity={running && hareX < 2300 ? 1 : 0} />
        <Hare x={hareX} y={GROUND_Y + 10} size={HARE_SIZE} pose={running ? "run" : "stand"} bounce={frame > ready && !running ? 0.4 : 0} />
        <Bubble x={900} y={560} tail="left" width={500} fontSize={52} color={C.cream} text={{ en: "Ready, steady…", es: "En sus marcas, listos…" }} pop={inOut(frame, ready, go)} />
        <Bubble x={900} y={560} tail="left" width={300} fontSize={80} color={C.butter} text={{ en: "GO!", es: "¡FUERA!" }} pop={inOut(frame, go, zoom + 30)} />
        <Bubble x={1300} y={640} tail="left" width={360} fontSize={74} color={C.pink} text={{ en: "Zoom!", es: "¡Zum!" }} pop={inOut(frame, zoom + 4, zoom + 50)} />
      </Park>
    </Camera>
  );
};

/** Accelerating ease for the Hare's take-off. */
const Easing_in = (t: number) => t * t;

/* ───────────────────────────── 4 · Just one more ───────────────────────────── */

const TREE_X = 1260;
const SIT_X = 1120;

export const SelfieScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const stopped = cue("he stopped");
  const selfie = cue("Time for");
  const click = cue("Click, click");
  const video = cue("Then he watched");
  const oneMore = cue("Just one more");
  const andMore = cue("And one more");
  const andMore2 = cue("and one more");
  const arrive = stopped + 6;
  const hx = interpolate(frame, [0, arrive], [-250, SIT_X], { ...clamp, easing: easeOut });
  const seated = frame >= arrive;
  const phone = interpolate(frame, [selfie - 8, selfie + 4], [0, 1], clamp);
  const flash = Math.max(
    interpolate(frame, [click, click + 3, click + 10], [0, 1, 0], clamp),
    interpolate(frame, [click + 14, click + 17, click + 24], [0, 1, 0], clamp),
  );
  const laughing = frame > video + 15 && frame < oneMore;
  const sleepy = frame > oneMore;
  return (
    <Camera from={1} to={1.07}>
      <Park trees={[TREE_X]} bushes={[420, 1760]}>
        {!seated ? <SpeedLines x={hx} y={GROUND_Y} opacity={1} /> : null}
        <Hare
          x={hx}
          y={GROUND_Y + 10}
          size={HARE_SIZE}
          pose={seated ? "sit" : "run"}
          phone={seated ? phone : 0}
          screen={frame > video ? "video" : "camera"}
          flash={flash}
          laugh={laughing}
          eyes={laughing ? "closed" : sleepy ? "sleepy" : "open"}
          droop={sleepy ? interpolate(frame, [oneMore, andMore2 + 20], [0.2, 0.6], clamp) : 0}
          mouthOpen={laughing ? 0.6 + Math.abs(Math.sin(frame / 3)) * 0.4 : frame > andMore && frame < andMore + 30 ? 1 : frame > selfie && frame < click ? 0.5 : 0}
        />
        <Bubble x={1300} y={520} tail="left" width={480} fontSize={54} color={C.butter} text={{ en: "Selfie time!", es: "¡Hora de una selfi!" }} pop={inOut(frame, selfie, click + 30)} />
        {[0, 1].map((i) => (
          <Bubble key={i} x={1360 + i * 230} y={600 - i * 80} tail="left" width={220} fontSize={56} color={C.pink} text={{ en: "Click!", es: "¡Clic!" }} pop={inOut(frame, click + i * 14, click + 50)} />
        ))}
        {[0, 1].map((i) => (
          <Bubble key={i} x={1330 + i * 200} y={560 - i * 70} tail="left" width={200} fontSize={58} color={[C.mint, C.peach][i]} text={{ en: "Ha!", es: "¡Ja!" }} pop={inOut(frame, video + 20 + i * 10, oneMore)} />
        ))}
        <Bubble x={1300} y={540} tail="left" width={500} fontSize={52} color={C.lavender} text={{ en: "Just one more…", es: "Solo uno más…" }} pop={inOut(frame, oneMore, andMore)} />
        <Bubble x={1330} y={560} tail="left" width={420} fontSize={52} color={C.lavender} text={{ en: "…one more…", es: "…uno más…" }} pop={popAt(frame, andMore, 8)} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={1250 + i * 70} y={560 - (i % 2) * 50} size={40} t={(frame - click - i * 5) / 6} color={C.cream} />
        ))}
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The nap ───────────────────────────── */

export const NapScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const { fps } = useVideoConfig();
  const asleep = cue("fell fast asleep");
  const meanwhile = cue("Meanwhile");
  const step = cue("Step, step");
  const watch = cue("His little watch");
  const b0 = cue("Beep!");
  const voEnd = Math.round((scene.lead + scene.voSeconds) * fps);
  const beeps = [0, 1, 2].map((i) => b0 + ((voEnd - b0) * i) / 3);
  const phone = interpolate(frame, [asleep - 12, asleep + 6], [1, 0], clamp);
  const tx = interpolate(frame, [meanwhile - 10, voEnd + 30], [-200, 640], clamp);
  const T: Placed = { x: tx, y: GROUND_Y + 22 };
  const head = tortoiseHead(T);
  const beep = beeps.reduce((m, b) => Math.max(m, interpolate(frame, [b, b + 3, b + 14], [0, 1, 0], clamp)), 0);
  const steps = Math.round(interpolate(frame, [step, voEnd + 30], [1200, 1460], clamp));
  return (
    <Camera from={1.04} to={1.0}>
      <Park trees={[TREE_X]} bushes={[420, 1760]}>
        <Hare
          x={SIT_X}
          y={GROUND_Y + 10}
          size={HARE_SIZE}
          pose="sit"
          phone={phone}
          screen="video"
          phoneOnTummy={phone < 0.05}
          eyes={frame > asleep ? "closed" : "sleepy"}
          droop={interpolate(frame, [0, asleep + 10], [0.6, 1], clamp)}
          headTilt={interpolate(frame, [asleep - 10, asleep + 20], [0, 12], clamp)}
        />
        <Snores x={SIT_X + 70} y={560} opacity={interpolate(frame, [asleep + 10, asleep + 30], [0, 1], clamp)} />
        <Tortoise {...T} size={TORTOISE_SIZE} walk={frame > meanwhile - 10 ? 1 : 0} beep={beep} />
        {/* the step counter */}
        <div
          style={{
            position: "absolute",
            left: head.x - 260,
            top: head.y - 330,
            width: 300,
            padding: "12px 0",
            background: C.cream,
            border: `6px solid ${C.lavenderDark}`,
            borderRadius: 30,
            textAlign: "center",
            fontSize: 44,
            fontWeight: 700,
            color: C.ink,
            scale: `${interpolate(popAt(frame, watch - 20, 12), [0, 0.7, 1], [0, 1.1, 1]) * (1 + beep * 0.08)}`,
          }}
        >
          {steps.toLocaleString("en-US")} {t({ en: "steps", es: "pasos" })}
        </div>
        {beeps.map((b, i) => (
          <Bubble
            key={i}
            x={head.x + 60 + i * 190}
            y={head.y - 40 - i * 50}
            tail="left"
            width={190}
            fontSize={46}
            color={[C.butter, C.mint, C.pink][i]}
            text={{ en: "Beep!", es: "¡Bip!" }}
            pop={inOut(frame, b, b + 40)}
          />
        ))}
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 6 · Slow and steady ───────────────────────────── */

export const PassScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const { durationInFrames } = useVideoConfig();
  const past = cue("right past");
  const steady = cue("Slow and steady");
  const tx = interpolate(frame, [0, durationInFrames], [160, 1520]);
  const T: Placed = { x: tx, y: GROUND_Y + 30 };
  const head = tortoiseHead(T);
  return (
    <Camera from={1} to={1.04}>
      <Park trees={[860]} bushes={[1500]}>
        <Sign x={1760} text={{ en: "Finish →", es: "Meta →" }} />
        <Hare x={720} y={GROUND_Y - 6} size={HARE_SIZE} pose="sit" phoneOnTummy eyes="closed" droop={1} headTilt={12} />
        <Snores x={790} y={540} />
        <Tortoise {...T} size={TORTOISE_SIZE} walk={1} />
        <Bubble x={head.x} y={470} tail="left" width={260} fontSize={52} color={C.lavender} text={{ en: "Shhh…", es: "Shhh…" }} pop={inOut(frame, past, past + 90)} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={head.x - 220 - i * 90} y={head.y + 40 + (i % 2) * 40} size={40} t={(frame - steady - i * 6) / 8} />
        ))}
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 7 · The finish line ───────────────────────────── */

const ARCH_X = 1320;

export const FinishScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const woke = cue("woke up");
  const ohNo = cue("Oh no");
  const raced = cue("He raced");
  const already = cue("but the Tortoise");
  const crossing = cue("crossing the finish");
  const cheered = cue("everyone cheered");
  const hooray = cue("Hooray");
  const tx = interpolate(frame, [0, crossing, crossing + 100], [700, 1010, 1300], clamp);
  const T: Placed = { x: tx, y: GROUND_Y + 20 };
  const head = tortoiseHead(T);
  const tape = interpolate(frame, [crossing, crossing + 14], [0, 1], clamp);
  const hareX = interpolate(frame, [raced, already, already + 40], [230, 620, 700], { ...clamp, easing: easeInOut });
  const running = frame > raced && frame < already + 40;
  const crossed = frame > crossing;
  return (
    <Camera from={1.02} to={1.06}>
      <Park trees={[300]} bushes={[1760]}>
        {DUCKS.map((x, i) => (
          <Duck key={i} x={x + 140} y={GROUND_Y - 40} size={110} flip seed={i} cheer={frame > cheered} />
        ))}
        <FinishArch x={ARCH_X} tape={tape} />
        <Drone x={interpolate(frame, [0, crossing, crossing + 90], [1060, 1240, 1500], clamp)} y={230} size={180} flip />
        <Hare
          x={hareX}
          y={GROUND_Y + 10}
          size={HARE_SIZE}
          pose={frame < ohNo ? "sit" : running ? "run" : "stand"}
          eyes={frame < woke ? "closed" : "wide"}
          droop={frame < woke ? 1 : 0}
          mouthOpen={frame > ohNo && frame < raced ? 0.9 : running ? 0.4 : 0}
          phoneOnTummy={frame < ohNo}
          pant={frame > already + 40}
        />
        <Tortoise {...T} size={TORTOISE_SIZE} walk={frame < crossing + 100 ? 1 : 0} eyes={crossed ? "happy" : "open"} mouthOpen={frame > hooray ? 0.6 : 0} />
        <Bubble x={300} y={470} tail="left" width={360} fontSize={64} color={C.peach} text={{ en: "Oh no!", es: "¡Ay, no!" }} pop={inOut(frame, ohNo, raced + 20)} />
        {[0, 1, 2].map((i) => (
          <Bubble
            key={i}
            x={1380 + i * 160}
            y={560 - (i % 2) * 70}
            tail="left"
            width={300}
            fontSize={56}
            color={[C.butter, C.mint, C.pink][i]}
            text={{ en: "Hooray!", es: "¡Hurra!" }}
            pop={popAt(frame, hooray + i * 10, 8)}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Sparkle key={i} x={head.x - 60 + i * 60} y={head.y - 60 - (i % 2) * 40} size={46} t={(frame - crossing - i * 5) / 8} />
        ))}
        <Confetti at={cheered} />
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 8 · Side by side ───────────────────────────── */

export const FriendsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const out = cue("all out of breath");
  const well = cue("Well done");
  const should = cue("I should have");
  const thanks = cue("Thank you");
  const shall = cue("Shall we walk");
  const soThey = cue("And so they did");
  const walking = frame > soThey;
  const walkX = interpolate(frame, [soThey, soThey + 240], [0, 420], clamp);
  const hareX = interpolate(frame, [0, out + 10], [-200, 760], { ...clamp, easing: easeOut }) + walkX;
  const T: Placed = { x: 1160 + walkX, y: GROUND_Y + 20, flip: !walking };
  const head = tortoiseHead({ ...T, size: TORTOISE_SIZE });
  return (
    <Camera from={1} to={1.05}>
      <Park trees={[180, 1760]} bushes={[1000]} evening>
        <FinishArch x={420} tape={1} />
        <Hare
          x={hareX}
          y={GROUND_Y + 10}
          size={HARE_SIZE}
          bounce={frame < out + 10 || walking ? 0.5 : 0}
          pant={frame > out && frame < should}
          mouthOpen={(frame > well && frame < thanks) ? Math.abs(Math.sin(frame / 3)) * 0.7 : frame < well ? 0.4 : 0}
          headTilt={frame > well && frame < thanks ? 8 : 0}
          eyes={walking ? "open" : frame > should && frame < thanks ? "sleepy" : "open"}
        />
        <Tortoise {...T} size={TORTOISE_SIZE} medal walk={walking ? 1 : 0} mouthOpen={frame > thanks && frame < soThey ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} eyes={walking ? "happy" : "open"} />
        <Bubble x={880} y={460} tail="left" width={420} fontSize={54} color={C.butter} text={{ en: "Well done!", es: "¡Bien hecho!" }} pop={inOut(frame, well, should)} />
        <Bubble x={880} y={460} tail="left" width={520} fontSize={50} color={C.butter} text={{ en: "I should have kept going.", es: "Debí seguir adelante." }} pop={inOut(frame, should, thanks)} />
        <Bubble x={head.x + 10} y={head.y - 40} tail="left" width={420} fontSize={52} color={C.mint} text={{ en: "Thank you!", es: "¡Gracias!" }} pop={inOut(frame, thanks, shall)} />
        <Bubble x={head.x + 10} y={head.y - 40} tail="left" width={520} fontSize={50} color={C.mint} text={{ en: "Shall we walk home together?", es: "¿Volvemos a casa juntas?" }} pop={inOut(frame, shall, soThey + 20)} />
        {walking
          ? [0, 1, 2].map((i) => (
              <Heart key={i} x={hareX + 200 + i * 80} y={420 - ((frame * 1.4 + i * 50) % 140)} size={50} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />
            ))
          : null}
      </Park>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("slow and"), cue("slow and") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("And sometimes"), cue("And sometimes") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: TC.path }}>
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 337) % 1920;
        const y = ((i * 211 + frame * (1 + (i % 3))) % 1200) - 60;
        const colors = [C.pink, C.butter, C.mint, C.cream, C.lavender];
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
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 150 }}>
        <div
          style={{
            width: 1360,
            background: C.cream,
            borderRadius: 64,
            padding: "54px 90px",
            textAlign: "center",
            boxShadow: "0 16px 0 rgba(94,75,110,0.14)",
            scale: `${interpolate(card, [0, 1], [0.7, 1])}`,
            opacity: card,
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 700, color: TC.shellDark, marginBottom: 22 }}>
            {t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}
          </div>
          <div style={{ fontSize: 72, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            {t({ en: "Slow and steady wins the race.", es: "Despacio y sin parar se gana la carrera." })}
          </div>
          <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.lavenderDark, lineHeight: 1.25, opacity: echo }}>
            {t({
              en: "And it’s okay to put the phone down and keep going.",
              es: "Y está bien dejar el teléfono a un lado y seguir adelante.",
            })}
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 124,
            fontWeight: 700,
            color: C.pinkDark,
            scale: `${interpolate(end, [0, 0.7, 1], [0, 1.15, 1])}`,
            rotate: `${Math.sin(frame / 12) * 3}deg`,
            textShadow: `0 8px 0 ${C.cream}`,
          }}
        >
          {t({ en: "The End", es: "Fin" })}
        </div>
      </AbsoluteFill>
      <Tortoise x={230} y={1070} size={300} medal eyes={end > 0 ? "happy" : "open"} />
      <Hare x={1710} y={1070} size={360} flip wave={end > 0} />
    </AbsoluteFill>
  );
};
