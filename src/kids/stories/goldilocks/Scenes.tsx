/**
 * Goldilocks and the Three Bears — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Localized } from "../../kit";
import { BELL, Bedroom, DOOR_X, FLOOR_Y, Forest, GROUND_Y, Kitchen, SHELF, SPEAKER_OUT, Table, Zzz } from "./Backgrounds";
import { BED_TOP, Bear, Bed, Bowl, Chair, GC, Lamb, NightLight, Pot, SEAT_H, SmartSpeaker, type LambPose } from "./Characters";
import type { Scene } from "./story";

type SceneProps = { scene: Scene };

const useCue = (scene: Scene) => {
  const { fps } = useVideoConfig();
  return (p: string) => cueFrame(scene, p, fps);
};

/** 1 while frame is in [a, b), with 8-frame cross-fades at both edges (a ≤ 0 means "from the start"). */
const phase = (frame: number, a: number, b = 1e9) =>
  (a <= 0 ? 1 : interpolate(frame, [a - 4, a + 4], [0, 1], clamp)) * (b >= 1e9 ? 1 : interpolate(frame, [b - 4, b + 4], [1, 0], clamp));

const Phase: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) =>
  o > 0 ? <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill> : null;

/** Gentle push-in (scale) for a whole shot. */
const Push: React.FC<{ from?: number; to?: number; originX?: number; originY?: number; children: React.ReactNode }> = ({ from = 1, to = 1.05, originX = 960, originY = 540, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ scale: `${interpolate(frame, [0, durationInFrames], [from, to], clamp)}`, transformOrigin: `${originX}px ${originY}px` }}>{children}</AbsoluteFill>
  );
};

/** Big wobbly sound word ("Knock, knock!", "Crack!"). */
const Shout: React.FC<{ x: number; y: number; text: Localized; pop: number; color?: string; size?: number }> = ({ x, y, text, pop, color = C.pinkDark, size = 96 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  if (pop <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 450,
        top: y - 70,
        width: 900,
        textAlign: "center",
        fontSize: size,
        whiteSpace: "nowrap",
        fontWeight: 700,
        color,
        WebkitTextStroke: `12px ${C.cream}`,
        paintOrder: "stroke fill",
        scale: `${interpolate(pop, [0, 0.7, 1], [0, 1.2, 1])}`,
        rotate: `${Math.sin(frame / 2) * 2}deg`,
      }}
    >
      {t(text)}
    </div>
  );
};

/** Fade-out helper: 1 until `at`, then 0 over `len` frames. */
const until = (frame: number, at: number, len = 10) => interpolate(frame, [at, at + len], [1, 0], clamp);

/** Move along keyframes with easing. */
const glide = (frame: number, keys: number[], values: number[]) => interpolate(frame, keys, values, { ...clamp, easing: easeInOut });

/** Ease-in curve for riding off. */
const easeInQuad = (t: number) => t * t;

const OUT = GROUND_Y + 5; // outdoor feet line
const IN = FLOOR_Y; // indoor feet line
const SIZE = { papa: 420, mama: 350, baby: 260, lamb: 260 };

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "Goldilocks", es: "Ricitos de Oro" }), t({ en: "and the Three Bears", es: "y los Tres Osos" })];
  const skip = interpolate(frame, [20, 110], [2100, 1700], { ...clamp, easing: easeOut });
  return (
    <Forest>
      <Bear kind="papa" x={300} y={OUT} size={SIZE.papa} pose={frame > 30 ? "wave" : "stand"} eyes="happy" />
      <Bear kind="mama" x={560} y={OUT} size={SIZE.mama} pose={frame > 40 ? "wave" : "stand"} seed={1} />
      <Bear kind="baby" x={780} y={OUT} size={SIZE.baby} pose={frame > 50 ? "cheer" : "stand"} eyes="happy" seed={2} />
      <Lamb x={skip} y={OUT} size={SIZE.lamb} pose={frame < 110 ? "skip" : "wave"} eyes="happy" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 420 }}>
        <div
          style={{
            background: C.cream,
            borderRadius: 64,
            padding: "44px 100px 54px",
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
                fontSize: i === 0 ? 132 : 92,
                fontWeight: 700,
                color: i === 0 ? GC.curlDark : GC.papaDark,
                WebkitTextStroke: i === 0 ? `3px ${GC.papaDark}` : undefined,
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
    </Forest>
  );
};

/* ───────────────────────────── 2 · The three bears ───────────────────────────── */

export const CabinScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const outside = cue("for a bike ride") - 26;
  const off = cue("So off they pedalled");
  const inside = phase(frame, 0, outside);
  const out = phase(frame, outside);
  const papa = popAt(frame, cue("big Papa Bear"));
  const mama = popAt(frame, cue("middle-sized Mama Bear"));
  const baby = popAt(frame, cue("little Baby Bear"));
  const hot = frame >= cue("too hot to eat");
  const go = interpolate(frame, [off, off + 110], [0, 1], { ...clamp, easing: easeInQuad });
  return (
    <>
      <Phase o={inside}>
        <Push to={1.05} originY={500}>
          <Kitchen>
            <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} />
            <Bear kind="papa" x={520} y={780} size={SIZE.papa} pose={hot ? "fan" : papa > 0 && frame < cue("middle-sized Mama Bear") ? "wave" : "stand"} eyes={papa > 0 && !hot ? "happy" : "open"} />
            <Bear kind="mama" x={900} y={760} size={SIZE.mama} pose={mama > 0 && frame < cue("little Baby Bear") ? "wave" : "stand"} eyes={hot ? "wide" : "open"} seed={1} />
            <Bear kind="baby" x={1270} y={700} size={SIZE.baby} pose={baby > 0 && !hot ? "cheer" : "stand"} mouthOpen={hot ? 0.35 : 0} eyes={baby > 0 && !hot ? "happy" : "open"} seed={2} />
            <Table x={900} w={1180} top={620} />
            <Bowl x={690} y={624} kind="big" steam={1} />
            <Bowl x={1060} y={624} kind="middle" steam={1} />
            <Bowl x={1420} y={624} kind="little" steam={1} />
            <Shout x={900} y={300} text={{ en: "Too hot!", es: "¡Muy caliente!" }} pop={popAt(frame, cue("too hot to eat") + 8)} color={C.pinkDark} />
          </Kitchen>
        </Push>
      </Phase>
      <Phase o={out}>
        <Forest>
          <Bear kind="papa" x={520 + go * 1700} y={OUT} size={SIZE.papa} pose="ride" pedal={frame > off ? 1 : 0} eyes="happy" />
          <Bear kind="mama" x={850 + go * 1700} y={OUT} size={SIZE.mama} pose="ride" pedal={frame > off ? 1 : 0} mouthOpen={frame < off ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0} seed={1} />
          <Bear kind="baby" x={1120 + go * 1700} y={OUT} size={SIZE.baby + 20} pose="ride" pedal={frame > off ? 1.3 : 0} eyes="happy" seed={2} />
          <Bubble x={900} y={470} text={{ en: "Let’s go for a bike ride!", es: "¡Vamos en bici!" }} pop={popAt(frame, outside + 8) * until(frame, off + 20)} width={560} />
        </Forest>
      </Phase>
    </>
  );
};

/* ───────────────────────────── 3 · Knock, knock ───────────────────────────── */

export const KnockScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const arrive = cue("She knocked") - 6;
  const inside = cue("tiptoed inside");
  const x = interpolate(frame, [0, arrive], [-160, 1170], { ...clamp, easing: easeOut });
  const tip = interpolate(frame, [inside, inside + 50], [1170, DOOR_X], { ...clamp, easing: easeInOut });
  const knocking = frame >= cue("She knocked") && frame < cue("The bears");
  const talk = frame >= cue("smart speaker beeped") && frame < cue("But the door") ? 1 : 0;
  const doorOpen = interpolate(frame, [cue("But the door"), cue("But the door") + 20, inside, inside + 40], [0, 0.22, 0.22, 0.75], clamp);
  const name = popAt(frame, cue("Her name was Goldilocks"));
  let pose: LambPose = "skip";
  if (frame >= arrive) pose = "stand";
  if (knocking) pose = "knock";
  if (frame >= inside) pose = "tiptoe";
  const lampX = frame >= inside ? tip : x;
  const fade = interpolate(frame, [inside + 30, inside + 56], [1, 0], clamp);
  return (
    <Forest doorOpen={doorOpen}>
      <SmartSpeaker x={SPEAKER_OUT.x} y={SPEAKER_OUT.y} size={88} talk={talk} />
      <Lamb
        x={lampX}
        y={OUT}
        size={SIZE.lamb}
        pose={pose}
        eyes={talk ? "wide" : frame >= cue("But the door") ? "open" : "happy"}
        headTilt={frame >= cue("But the door") && frame < inside ? 10 : 0}
        opacity={fade}
      />
      {name > 0 && frame < arrive + 20 ? (
        <div
          style={{
            position: "absolute",
            left: x - 170,
            top: OUT - SIZE.lamb - 110,
            width: 340,
            textAlign: "center",
            fontSize: 52,
            fontWeight: 700,
            color: GC.curlDark,
            WebkitTextStroke: `10px ${C.cream}`,
            paintOrder: "stroke fill",
            scale: `${interpolate(name, [0, 0.7, 1], [0, 1.15, 1])}`,
            opacity: until(frame, arrive + 6),
          }}
        >
          {t({ en: "Goldilocks", es: "Ricitos de Oro" })}
        </div>
      ) : null}
      {name > 0 && frame < arrive ? <Sparkle x={x + 130} y={OUT - SIZE.lamb - 30} size={50} t={frame / 6} /> : null}
      <Shout x={DOOR_X + 260} y={470} text={{ en: "Knock, knock!", es: "¡Toc, toc!" }} pop={popAt(frame, cue("She knocked") + 10) * until(frame, cue("The bears"))} size={84} />
      <Bubble
        x={SPEAKER_OUT.x - 60}
        y={SPEAKER_OUT.y - 110}
        tail="right"
        text={{ en: "Hello! Nobody’s home!", es: "¡Hola! ¡No hay nadie en casa!" }}
        pop={popAt(frame, cue("Hello!") - 4) * until(frame, cue("But the door") + 10)}
        width={520}
        color="#E6FAF3"
      />
    </Forest>
  );
};

/* ───────────────────────────── 4 · Porridge ───────────────────────────── */

const BOWL_X = { big: 600, middle: 960, little: 1320 };

export const PorridgeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const big = cue("She tasted the big bowl");
  const hot = cue("Ooh, too hot!");
  const mid = cue("She tasted the middle bowl");
  const cold = cue("Brr, too cold!");
  const lit = cue("Then she tasted the little bowl");
  const right = cue("Mmm, just right!");
  const ate = cue("And she ate it all up");
  const x = glide(frame, [big - 14, big + 6, mid - 6, mid + 14, lit - 6, lit + 14], [BOWL_X.big - 185, BOWL_X.big - 185, BOWL_X.big - 185, BOWL_X.middle - 165, BOWL_X.middle - 165, BOWL_X.little - 145]);
  const enter = interpolate(frame, [0, 24], [-200, 0], { ...clamp, easing: easeOut });
  let pose: LambPose = "stand";
  let eyes: "open" | "happy" | "wide" = "open";
  let mouth = 0;
  if (frame >= big + 6) pose = "eat";
  if (frame >= hot && frame < mid) {
    eyes = "wide";
    mouth = 0.7;
  }
  if (frame >= mid + 14) pose = "eat";
  if (frame >= cold && frame < lit) {
    pose = "shiver";
    eyes = "wide";
  }
  if (frame >= lit + 14) pose = "eat";
  if (frame >= right) eyes = "happy";
  if (frame >= ate + 50) pose = "cheer";
  const littleFill = interpolate(frame, [ate, ate + 46], [1, 0], clamp);
  return (
    <Push to={1.06} originY={520}>
      <Kitchen>
        <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} />
        <Lamb x={x + enter} y={672} size={300} pose={pose} eyes={eyes} mouthOpen={mouth} yum={frame >= right} />
        <Table x={960} w={1300} top={620} />
        <Bowl x={BOWL_X.big} y={624} kind="big" steam={frame >= big ? 1 : 0.6} fill={0.82} />
        <Bowl x={BOWL_X.middle} y={624} kind="middle" frost={frame >= cold ? 1 : 0} fill={0.85} />
        <Bowl x={BOWL_X.little} y={624} kind="little" steam={0.25} fill={littleFill} />
        <Bubble x={BOWL_X.big - 150} y={290} text={{ en: "Ooh, too hot!", es: "¡Uy, muy caliente!" }} pop={popAt(frame, hot) * until(frame, mid)} width={440} />
        <Bubble x={BOWL_X.middle - 130} y={290} text={{ en: "Brr, too cold!", es: "¡Brr, muy fría!" }} pop={popAt(frame, cold) * until(frame, lit)} width={420} color="#E3F4FC" />
        <Bubble x={BOWL_X.little - 120} y={290} text={{ en: "Mmm, just right!", es: "¡Mmm, perfecta!" }} pop={popAt(frame, right) * until(frame, ate + 10)} width={440} />
        {frame >= ate + 40
          ? [0, 1, 2].map((i) => <Heart key={i} x={BOWL_X.little - 240 + i * 110} y={330 - i * 30} size={70} beat={Math.max(0, Math.sin((frame - ate) / 6 + i))} />)
          : null}
      </Kitchen>
    </Push>
  );
};

/* ───────────────────────────── 5 · Chairs ───────────────────────────── */

const CHAIR_X = { big: 860, middle: 1260, little: 1620 };
const seatY = (k: "big" | "middle" | "little", sink = 0) => IN - SEAT_H[k] + 20 + sink;

export const ChairsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const big = cue("The big chair was too hard");
  const mid = cue("The middle chair was too squishy");
  const lit = cue("The little chair was just right");
  const rock = cue("But she rocked");
  const crack = cue("crack!");
  const ohno = cue("Oh no!");
  const squish = interpolate(frame, [mid + 10, mid + 26], [0, 1], clamp) * interpolate(frame, [lit - 8, lit], [1, 0], clamp);
  const broken = interpolate(frame, [crack, crack + 14], [0, 1], { ...clamp, easing: easeOut });
  // where the lamb is: walking in, on each chair, then on the floor
  const hopBig = interpolate(frame, [big + 10, big + 18, big + 26, big + 34], [0, -50, 0, -26], clamp);
  let x = interpolate(frame, [0, big - 4], [300, CHAIR_X.big], { ...clamp, easing: easeOut });
  let y = interpolate(frame, [big - 12, big - 2], [IN, seatY("big")], clamp) + hopBig;
  let pose: LambPose = frame < big - 4 ? "skip" : "sit";
  let eyes: "open" | "happy" | "wide" | "worried" = frame >= big + 8 ? "wide" : "open";
  if (frame >= mid - 10) {
    x = glide(frame, [mid - 10, mid + 4], [CHAIR_X.big, CHAIR_X.middle]);
    y = interpolate(frame, [mid - 10, mid - 3, mid + 4], [seatY("big"), seatY("big") - 80, seatY("middle")], clamp) + squish * 30;
    eyes = frame >= mid + 10 ? "wide" : "open";
    pose = "sit";
  }
  if (frame >= lit - 10) {
    x = glide(frame, [lit - 10, lit + 4], [CHAIR_X.middle, CHAIR_X.little]);
    y = interpolate(frame, [lit - 10, lit - 3, lit + 4], [seatY("middle"), seatY("middle") - 80, seatY("little")], clamp);
    eyes = frame >= lit + 6 ? "happy" : "open";
  }
  if (frame >= rock) pose = "wiggle";
  if (frame >= crack) {
    y = interpolate(frame, [crack, crack + 10], [seatY("little"), IN], { ...clamp, easing: easeInOut });
    pose = "shock";
    eyes = "wide";
  }
  if (frame >= ohno) eyes = "worried";
  const rockAngle = frame >= rock && frame < crack ? Math.sin(frame / 3) * 6 : 0;
  return (
    <Push to={1.05} originX={1200} originY={600}>
      <Kitchen fireplace>
        <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} />
        <Chair x={CHAIR_X.big} floorY={IN} kind="big" />
        <Chair x={CHAIR_X.middle} floorY={IN} kind="middle" squish={squish} />
        <Chair x={CHAIR_X.little} floorY={IN} kind="little" broken={broken} rock={rockAngle} />
        <Lamb x={x} y={y} size={SIZE.lamb} pose={pose} eyes={eyes} mouthOpen={frame >= ohno ? 0.6 : 0} rotate={frame >= rock && frame < crack ? rockAngle : 0} />
        <Shout x={CHAIR_X.big} y={330} text={{ en: "Too hard!", es: "¡Muy dura!" }} pop={popAt(frame, big + 10) * until(frame, mid - 10)} size={80} color={GC.papaDark} />
        <Shout x={CHAIR_X.middle} y={420} text={{ en: "Too squishy!", es: "¡Muy blandita!" }} pop={popAt(frame, mid + 12) * until(frame, lit - 10)} size={80} color={C.pinkDark} />
        <Shout x={CHAIR_X.little - 160} y={560} text={{ en: "Just right!", es: "¡Perfecta!" }} pop={popAt(frame, lit + 6) * until(frame, rock)} size={80} color={GC.curlDark} />
        <Shout x={CHAIR_X.little - 260} y={560} text={{ en: "CRACK!", es: "¡CRAC!" }} pop={popAt(frame, crack, 8) * until(frame, ohno)} size={130} color={GC.woodDark} />
        <Bubble x={CHAIR_X.little - 100} y={IN - SIZE.lamb - 10} tail="right" text={{ en: "Oh no!", es: "¡Ay, no!" }} pop={popAt(frame, ohno)} width={320} />
      </Kitchen>
    </Push>
  );
};

/* ───────────────────────────── 6 · Beds ───────────────────────────── */

const BED_X = { big: 480, middle: 1010, little: 1520 };
const bedY = (k: "big" | "middle" | "little", sink = 0) => IN - BED_TOP[k] + 26 + sink;

export const BedsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const big = cue("The big bed was too high");
  const mid = cue("The middle bed was too soft");
  const lit = cue("But the little bed");
  const glow = cue("glowing star night-light");
  const right = cue("was just right");
  const sleep = cue("And she fell fast asleep");
  const squish = interpolate(frame, [mid + 8, mid + 24], [0, 1], clamp) * interpolate(frame, [lit - 8, lit], [1, 0], clamp);
  let x = interpolate(frame, [0, 40], [120, 260], { ...clamp, easing: easeOut });
  let y = IN;
  let pose: LambPose = frame < 40 ? "tiptoe" : "yawn";
  let eyes: "open" | "happy" | "wide" | "closed" = "open";
  if (frame >= big - 16) {
    x = glide(frame, [big - 16, big - 2], [260, BED_X.big + 40]);
    pose = frame >= big ? "stretch" : "skip";
  }
  if (frame >= mid - 12) {
    x = glide(frame, [mid - 12, mid + 4], [BED_X.big + 40, BED_X.middle]);
    y = interpolate(frame, [mid - 12, mid - 2, mid + 4], [IN, bedY("middle") - 90, bedY("middle")], clamp) + squish * 34;
    pose = "stand";
    eyes = frame >= mid + 10 ? "wide" : "open";
  }
  if (frame >= lit - 12) {
    x = glide(frame, [lit - 12, lit + 4], [BED_X.middle, BED_X.little + 40]);
    y = interpolate(frame, [lit - 12, lit - 4, lit + 4], [bedY("middle"), bedY("middle") - 90, bedY("little")], clamp);
    pose = "stand";
    eyes = "open";
  }
  if (frame >= right) {
    eyes = "happy";
    pose = "yawn";
  }
  const asleep = frame >= sleep;
  const dim = interpolate(frame, [sleep, sleep + 30], [0, 1], clamp);
  const lightOn = interpolate(frame, [glow, glow + 12], [0.15, 1], clamp);
  return (
    <Push to={1.05} originX={1300} originY={620}>
      <Bedroom dim={dim}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={1760} y={IN - 170} width={110} height={170} rx={14} fill={GC.woodDark} />
          <rect x={1750} y={IN - 186} width={130} height={26} rx={10} fill={GC.wood} />
        </svg>
        <NightLight x={1815} y={IN - 240} size={70} glow={lightOn} />
        <Bed x={BED_X.big} floorY={IN} kind="big" />
        <Bed x={BED_X.middle} floorY={IN} kind="middle" squish={squish} />
        <Bed x={BED_X.little} floorY={IN} kind="little" sleeper={asleep} />
        {!asleep ? <Lamb x={x} y={y} size={SIZE.lamb} pose={pose} eyes={eyes} /> : null}
        <Shout x={BED_X.big + 60} y={330} text={{ en: "Too high!", es: "¡Muy alta!" }} pop={popAt(frame, big + 8) * until(frame, mid - 10)} size={80} color={GC.bowTie} />
        <Shout x={BED_X.middle} y={480} text={{ en: "Too soft!", es: "¡Muy blanda!" }} pop={popAt(frame, mid + 10) * until(frame, lit - 10)} size={80} color={C.pinkDark} />
        <Shout x={BED_X.little} y={380} text={{ en: "Just right!", es: "¡Perfecta!" }} pop={popAt(frame, right) * until(frame, sleep)} size={80} color={GC.curlDark} />
        <Zzz x={BED_X.little - 140} y={IN - BED_TOP.little - 150} on={asleep ? 1 : 0} />
      </Bedroom>
    </Push>
  );
};

/* ───────────────────────────── 7 · The bears come home ───────────────────────────── */

const HOME = { papa: 360, mama: 760, baby: 1120 };
const HOME_BOWL = { big: 560, middle: 930, little: 1270 };

export const HomeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const inside = cue("been eating my porridge") - 14;
  const papaSays = cue("been eating my porridge");
  const mamaSays = cue("been sitting in my chair");
  const babySays = cue("Someone ate all my porridge");
  const beep = cue("The smart speaker beeped");
  const ride = interpolate(frame, [0, inside - 6], [1, 0], { ...clamp, easing: easeOut });
  const out = phase(frame, 0, inside);
  const inn = phase(frame, inside);
  const talk = frame >= beep ? 1 : 0;
  return (
    <>
      <Phase o={out}>
        <Forest>
          <Bear kind="papa" x={600 + ride * 1500} y={OUT} size={SIZE.papa} pose="ride" flip pedal={ride > 0.02 ? 1 : 0} eyes="happy" />
          <Bear kind="mama" x={900 + ride * 1600} y={OUT} size={SIZE.mama} pose="ride" flip pedal={ride > 0.02 ? 1 : 0} seed={1} />
          <Bear kind="baby" x={1160 + ride * 1700} y={OUT} size={SIZE.baby + 20} pose="ride" flip pedal={ride > 0.02 ? 1.3 : 0} eyes="happy" seed={2} />
        </Forest>
      </Phase>
      <Phase o={inn}>
        <Push to={1.04} originY={500}>
          <Kitchen>
            <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} talk={talk} />
            <Bear kind="papa" x={HOME.papa} y={730} size={SIZE.papa} pose={frame >= papaSays && frame < mamaSays ? "point" : "stand"} eyes={frame >= papaSays ? "wide" : "open"} mouthOpen={frame >= papaSays && frame < mamaSays ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} />
            <Bear kind="mama" x={HOME.mama} y={700} size={SIZE.mama} pose={frame >= mamaSays && frame < babySays ? "point" : "stand"} eyes={frame >= mamaSays ? "wide" : "open"} mouthOpen={frame >= mamaSays && frame < babySays ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0} seed={1} />
            <Bear kind="baby" x={HOME.baby} y={650} size={SIZE.baby} pose={frame >= babySays && frame < beep ? "cry" : "stand"} eyes={frame >= babySays && frame < beep ? "sad" : frame >= beep ? "wide" : "open"} seed={2} />
            <Table x={830} w={1140} top={620} />
            <Bowl x={HOME_BOWL.big} y={624} kind="big" fill={0.6} />
            <Bowl x={HOME_BOWL.middle} y={624} kind="middle" fill={0.7} />
            <Bowl x={HOME_BOWL.little} y={624} kind="little" fill={0} />
            <Chair x={1560} floorY={IN} kind="middle" />
            <Chair x={1790} floorY={IN} kind="little" broken={1} />
            <Bubble x={HOME.papa + 60} y={330} text={{ en: "Someone’s been eating my porridge!", es: "¡Alguien ha comido de mi avena!" }} pop={popAt(frame, papaSays) * until(frame, mamaSays)} width={520} />
            <Bubble x={HOME.mama + 40} y={400} text={{ en: "Someone’s been sitting in my chair!", es: "¡Alguien se ha sentado en mi silla!" }} pop={popAt(frame, mamaSays) * until(frame, babySays)} width={520} />
            <Bubble x={HOME.baby} y={400} tail="right" text={{ en: "And broke my chair!", es: "¡Y rompió mi sillita!" }} pop={popAt(frame, babySays) * until(frame, beep)} width={440} />
            <Bubble x={SHELF.x + 40} y={SHELF.y - 140} tail="right" text={{ en: "Visitor upstairs!", es: "¡Visita arriba!" }} pop={popAt(frame, cue("Visitor upstairs") - 4)} width={430} color="#E6FAF3" />
          </Kitchen>
        </Push>
      </Phase>
    </>
  );
};

/* ───────────────────────────── 8 · Someone's in my bed ───────────────────────────── */

export const FoundScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const says = cue("sleeping in my bed");
  const wake = cue("Goldilocks woke up");
  const three = cue("Three bears!");
  const calm = cue("But they weren");
  const sorry = cue("so sorry");
  const walk = interpolate(frame, [0, says - 4], [0, 1], { ...clamp, easing: easeOut });
  const awake = frame >= wake + 4;
  const jump = awake ? -Math.max(0, Math.sin(((frame - wake) / 22) * Math.PI)) * 70 * (frame < wake + 26 ? 1 : 0) : 0;
  const dim = interpolate(frame, [wake, wake + 16], [1, 0], clamp);
  const bearPose = frame < says - 4 ? "tiptoe" : frame >= calm ? "stand" : "shock";
  const bearEyes = frame >= calm ? "happy" : frame >= three ? "wide" : "open";
  return (
    <Push to={1.05} originX={1200} originY={600}>
      <Bedroom dim={dim}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={1760} y={IN - 170} width={110} height={170} rx={14} fill={GC.woodDark} />
          <rect x={1750} y={IN - 186} width={130} height={26} rx={10} fill={GC.wood} />
        </svg>
        <NightLight x={1815} y={IN - 240} size={70} glow={1 - (1 - dim) * 0.6} />
        <Bed x={BED_X.big} floorY={IN} kind="big" />
        <Bed x={BED_X.middle} floorY={IN} kind="middle" />
        <Bed x={BED_X.little} floorY={IN} kind="little" sleeper={!awake} />
        {awake ? (
          <Lamb
            x={BED_X.little + 20}
            y={bedY("little") + jump}
            size={SIZE.lamb}
            pose={frame >= sorry ? "sorry" : "shock"}
            eyes={frame >= sorry ? "worried" : "wide"}
            mouthOpen={frame < calm ? 0.6 : 0}
          />
        ) : null}
        <Zzz x={BED_X.little - 140} y={IN - BED_TOP.little - 150} on={awake ? 0 : 1} />
        <Bear kind="papa" x={-200 + walk * 460} y={IN + 20} size={SIZE.papa} pose={bearPose} eyes={bearEyes} />
        <Bear kind="mama" x={-420 + walk * 900} y={IN + 20} size={SIZE.mama} pose={bearPose} eyes={bearEyes} seed={1} />
        <Bear kind="baby" x={-600 + walk * 1360} y={IN + 20} size={SIZE.baby} pose={frame >= says && frame < wake ? "point" : bearPose} eyes={bearEyes} mouthOpen={frame >= says && frame < wake ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0} seed={2} />
        <Bubble x={820} y={IN - SIZE.baby - 20} text={{ en: "Someone’s sleeping in my bed!", es: "¡Alguien duerme en mi camita!" }} pop={popAt(frame, says) * until(frame, wake)} width={520} />
        <Shout x={1180} y={500} text={{ en: "Three bears!", es: "¡Tres osos!" }} pop={popAt(frame, three) * until(frame, calm + 10)} size={90} color={GC.papaDark} />
        <Bubble x={BED_X.little + 80} y={bedY("little") - SIZE.lamb - 10} tail="right" text={{ en: "I’m so sorry!", es: "¡Lo siento mucho!" }} pop={popAt(frame, sorry)} width={400} />
        {frame >= calm + 10 && frame < sorry ? <Heart x={480} y={360} size={70} beat={Math.max(0, Math.sin((frame - calm) / 6))} /> : null}
      </Bedroom>
    </Push>
  );
};

/* ───────────────────────────── 9 · Fixing the chair ───────────────────────────── */

export const FixScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const pot = cue("and Mama Bear made");
  const friends = cue("Baby Bear and Goldilocks became");
  const next = cue("And the next time");
  const bell = cue("she rang the doorbell");
  const waited = cue("and waited");
  const fixed = interpolate(frame, [12, pot - 10], [1, 0], { ...clamp, easing: easeInOut });
  const a = phase(frame, 0, friends);
  const b = phase(frame, friends, next);
  const c = phase(frame, next);
  const ring = frame >= bell + 10 && frame < waited + 30 ? 1 : 0;
  const door = interpolate(frame, [waited + 20, waited + 40], [0, 0.75], clamp);
  return (
    <>
      <Phase o={a}>
        <Push to={1.05}>
          <Kitchen>
            <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} />
            <Bear kind="papa" x={500} y={IN} size={SIZE.papa} pose="glue" eyes={fixed < 0.05 ? "happy" : "open"} />
            <Chair x={800} floorY={IN} kind="little" broken={fixed} />
            <Lamb x={1060} y={IN} size={SIZE.lamb} pose="glue" eyes={fixed < 0.05 ? "happy" : "open"} seed={1} />
            {fixed < 0.05 ? [0, 1, 2].map((i) => <Sparkle key={i} x={730 + i * 70} y={620 - (i % 2) * 60} size={60} t={(frame - pot) / 5 + i} />) : null}
            <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={1560} y={IN - 200} width={300} height={200} rx={20} fill="#D9D1E3" />
              <rect x={1540} y={IN - 214} width={340} height={28} rx={12} fill="#C6BCD6" />
              <circle cx={1640} cy={IN - 110} r={20} fill="#C6BCD6" />
              <circle cx={1780} cy={IN - 110} r={20} fill="#C6BCD6" />
            </svg>
            <Pot x={1710} y={IN - 210} steam={frame >= pot ? 1 : 0.3} />
            <Bear kind="mama" x={1430} y={IN + 10} size={SIZE.mama} pose={frame >= pot ? "stir" : "stand"} eyes="happy" seed={2} />
          </Kitchen>
        </Push>
      </Phase>
      <Phase o={b}>
        <Push to={1.06} originY={600}>
          <Kitchen>
            <SmartSpeaker x={SHELF.x} y={SHELF.y} size={100} />
            <Chair x={1500} floorY={IN} kind="little" />
            <Bear kind="papa" x={260} y={IN} size={SIZE.papa} pose="cheer" eyes="happy" />
            <Bear kind="mama" x={1740} y={IN} size={SIZE.mama} pose="wave" eyes="happy" seed={1} />
            <Bear kind="baby" x={910} y={IN} size={SIZE.baby} pose="hug" eyes="happy" seed={2} />
            <Lamb x={1040} y={IN} size={SIZE.lamb} pose="hug" eyes="happy" seed={3} />
            {[0, 1, 2].map((i) => (
              <Heart key={i} x={860 + i * 100} y={500 - (i % 2) * 50} size={80} beat={Math.max(0, Math.sin((frame - friends) / 7 + i))} />
            ))}
          </Kitchen>
        </Push>
      </Phase>
      <Phase o={c}>
        <Forest doorOpen={door} bellGlow={ring}>
          <SmartSpeaker x={SPEAKER_OUT.x} y={SPEAKER_OUT.y} size={88} talk={ring} />
          <Lamb
            x={interpolate(frame, [next, bell + 6], [300, BELL.x + 95], { ...clamp, easing: easeOut })}
            y={OUT}
            size={SIZE.lamb}
            pose={frame < bell + 4 ? "skip" : frame < waited ? "bell" : door > 0.3 ? "wave" : "stand"}
            eyes="happy"
            flip
          />
          {door > 0.3 ? <Bear kind="baby" x={DOOR_X} y={OUT - 4} size={SIZE.baby - 20} pose="wave" eyes="happy" seed={2} opacity={interpolate(door, [0.3, 0.6], [0, 1], clamp)} /> : null}
          <Shout x={BELL.x + 190} y={540} text={{ en: "Ding-dong!", es: "¡Din-don!" }} pop={popAt(frame, bell + 12) * until(frame, waited + 30)} size={84} color={C.butterDark} />
          <div
            style={{
              position: "absolute",
              left: 420,
              top: 420,
              width: 600,
              textAlign: "center",
              fontSize: 54,
              fontWeight: 700,
              color: C.ink,
              opacity: popAt(frame, waited) * until(frame, waited + 30),
            }}
          >
            {t({ en: "…and waited.", es: "…y esperó." })}
          </div>
        </Forest>
      </Phase>
    </>
  );
};

/* ───────────────────────────── 10 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("always ask before"), cue("always ask before") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("And if you make a mistake"), cue("And if you make a mistake") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <Forest>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
        <div
          style={{
            width: 1300,
            background: C.cream,
            borderRadius: 64,
            padding: "48px 90px",
            textAlign: "center",
            boxShadow: "0 16px 0 rgba(94,75,110,0.14)",
            scale: `${interpolate(card, [0, 1], [0.7, 1])}`,
            opacity: card,
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 700, color: GC.papaDark, marginBottom: 20 }}>{t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}</div>
          <div style={{ fontSize: 64, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            {t({ en: "Always ask first.", es: "Pide permiso primero." })}
          </div>
          <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.pinkDark, lineHeight: 1.25, opacity: echo }}>
            {t({ en: "Made a mistake? Say sorry and help put it right!", es: "¿Te equivocaste? ¡Pide perdón y ayuda a arreglarlo!" })}
          </div>
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 120,
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
      <Bear kind="papa" x={170} y={1070} size={330} pose={end > 0 ? "cheer" : "stand"} eyes={end > 0 ? "happy" : "open"} />
      <Bear kind="mama" x={400} y={1070} size={280} pose={end > 0 ? "wave" : "stand"} eyes="happy" seed={1} />
      <Bear kind="baby" x={1540} y={1070} size={220} pose={end > 0 ? "cheer" : "stand"} eyes="happy" seed={2} />
      <Lamb x={1750} y={1070} size={230} pose={end > 0 ? "cheer" : "wave"} eyes="happy" seed={3} />
    </Forest>
  );
};
