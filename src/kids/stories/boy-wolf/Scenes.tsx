/**
 * The Boy Who Cried Wolf — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Localized, type Placed } from "../../kit";
import { GROUND_Y, Hills, LongGrass, Village } from "./Backgrounds";
import { BC, BeepWaves, Bear, Rider, Sheep, Villager, Wolf, toScene, type VillagerKind } from "./Characters";
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

const BEAR = 320;
const SHEEP = 230;
const VILL = 290;
const WOLF = 440;
const FEET = GROUND_Y + 40;

const bearHead = (p: Placed) => toScene({ size: BEAR, ...p }, { x: 210, y: 64 });
const villHead = (p: Placed) => toScene({ size: VILL, ...p }, { x: 206, y: 60 });

/** Floating counting numbers / question marks. */
const Floaty: React.FC<{ x: number; y: number; text: string; pop: number; color?: string; size?: number }> = ({ x, y, text, pop, color = C.lavenderDark, size = 70 }) => {
  const frame = useCurrentFrame();
  if (pop <= 0) return null;
  const p = Math.min(1, pop);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 50 + Math.sin(frame / 10 + x) * 6,
        width: 120,
        textAlign: "center",
        fontSize: size,
        fontWeight: 700,
        color,
        scale: `${interpolate(p, [0, 0.7, 1], [0, 1.2, 1])}`,
        textShadow: `0 5px 0 ${C.cream}`,
      }}
    >
      {text}
    </div>
  );
};

/** A big shout in the sky ("WOLF! WOLF!"), shaking a little. */
const Shout: React.FC<{ x: number; y: number; text: Localized; pop: number; color?: string }> = ({ x, y, text, pop, color = BC.alert }) => {
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
        fontSize: 110,
        whiteSpace: "nowrap",
        fontWeight: 700,
        color,
        WebkitTextStroke: `12px ${C.cream}`,
        paintOrder: "stroke fill",
        scale: `${interpolate(pop, [0, 0.7, 1], [0, 1.2, 1])}`,
        rotate: `${Math.sin(frame / 2) * 2}deg`,
        translate: `${Math.sin(frame / 1.5) * 3}px 0px`,
      }}
    >
      {t(text)}
    </div>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Boy Who", es: "El Pastorcito" }), t({ en: "Cried Wolf", es: "Mentiroso" })];
  return (
    <Hills trees={[200]} fence={[[0, 700]]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 330 }}>
        <div
          style={{
            background: C.cream,
            borderRadius: 64,
            padding: "50px 120px 60px",
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
                fontSize: 128,
                fontWeight: 700,
                color: i === 0 ? BC.bandanaDark : BC.alert,
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
      <Bear x={460} y={FEET} size={BEAR} wave={frame > 24} eyes="happy" />
      <Sheep x={1330} y={FEET} size={SHEEP} graze seed={1} ping />
      <Sheep x={1560} y={FEET + 20} size={SHEEP} flip seed={2} hop={frame > 30 ? 0.5 : 0} />
      <Sheep x={1770} y={FEET} size={SHEEP} graze seed={3} ping />
    </Hills>
  );
};

/* ───────────────────────────── 2 · Toby and the sheep ───────────────────────────── */

export const HillScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const gave = cue("The villagers gave");
  const ifWolf = cue("“If a wolf");
  const dogX = interpolate(frame, [gave - 20, gave + 30], [2150, 1560], { ...clamp, easing: easeOut });
  const handed = frame > gave + 34;
  const D: Placed = { x: dogX, y: FEET, size: VILL, flip: true };
  const dh = villHead(D);
  return (
    <Camera from={1} to={1.05}>
      <Hills trees={[180]} fence={[[0, 520]]}>
        <Bear x={520} y={FEET} size={BEAR} hold={handed ? "walkie" : "crook"} eyes={handed ? "happy" : "open"} headTilt={handed ? 4 : 0} />
        {handed && frame < gave + 70
          ? [0, 1, 2].map((i) => <Sparkle key={i} x={620 + i * 50} y={640 - (i % 2) * 60} size={50} t={(frame - gave - 34 - i * 5) / 6} />)
          : null}
        <Villager kind="dog" {...D} walk={frame < gave + 30 ? 1 : 0} wave={frame > ifWolf - 6 && frame < ifWolf + 40} mouthOpen={frame > ifWolf ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} />
        <Sheep x={820} y={FEET + 10} size={SHEEP} graze seed={1} />
        <Sheep x={1040} y={FEET + 30} size={SHEEP} flip seed={2} hop={frame < 40 ? 0.4 : 0} />
        <Sheep x={1250} y={FEET} size={SHEEP} graze seed={3} />
        <Bubble x={dh.x - 40} y={dh.y} tail="right" width={620} fontSize={50} color={C.butter} text={{ en: "If a wolf ever comes, just press the button!", es: "Si viene un lobo, ¡aprieta el botón!" }} pop={popAt(frame, ifWolf, 8)} />
      </Hills>
    </Camera>
  );
};

/* ───────────────────────────── 3 · Counting sheep ───────────────────────────── */

const CLOUD_NUMS: [number, number][] = [
  [620, 210],
  [1000, 330],
  [1380, 170],
];
const SHEEP_AT: [number, number][] = [
  [900, FEET + 10],
  [1150, FEET + 30],
  [1400, FEET],
  [1640, FEET + 20],
];

export const BoredScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const clouds = cue("Toby counted clouds");
  const sheep = cue("He counted sheep");
  const again = cue("Then he counted");
  const boring = cue("“This is boring");
  const trick = cue("I know a funny");
  const B: Placed = { x: 420, y: FEET, size: BEAR };
  const bh = bearHead(B);
  const counting = frame >= again && frame < boring;
  return (
    <Camera from={1.02} to={1.07}>
      <Hills trees={[140]} village={false}>
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
          <path d={`M 300 ${FEET} Q 300 ${FEET - 90} 420 ${FEET - 96} Q 540 ${FEET - 90} 540 ${FEET} Z`} fill="#CFC6DE" />
        </svg>
        <Bear {...B} y={FEET - 70} pose={frame >= again && frame < boring ? "yawn" : frame >= boring ? "think" : "sit"} eyes={frame >= boring ? "sly" : "open"} headTilt={frame < again ? Math.sin(frame / 20) * 6 : 0} />
        {CLOUD_NUMS.map(([x, y], i) => (
          <Floaty key={i} x={x} y={y} text={String(i + 1)} pop={popAt(frame, clouds + i * 12, 8) * interpolate(frame, [sheep - 6, sheep], [1, 0], clamp)} />
        ))}
        {SHEEP_AT.map(([x, y], i) => (
          <Sheep key={i} x={x} y={y} size={SHEEP} graze={i % 2 === 0} flip={i === 3} seed={i} eyes={counting && i === 1 ? "happy" : "open"} />
        ))}
        {SHEEP_AT.map(([x], i) => (
          <Floaty
            key={`s${i}`}
            x={x + 30}
            y={FEET - 300}
            text={String(i + 1)}
            color={C.pinkDark}
            pop={(popAt(frame, sheep + i * 8, 8) + popAt(frame, again + 20 + i * 10, 8)) * interpolate(frame, [boring - 6, boring], [1, 0], clamp)}
          />
        ))}
        {frame > boring && frame < trick + 60 ? <Sparkle x={bh.x + 150} y={bh.y - 40} size={90} t={(frame - trick) / 7} /> : null}
        <Bubble x={bh.x + 40} y={bh.y - 30} tail="left" width={560} fontSize={50} color={C.cream} text={{ en: "This is boring… I know a funny trick!", es: "Qué aburrido… ¡Ya sé un truco divertido!" }} pop={popAt(frame, boring, 8)} />
      </Hills>
    </Camera>
  );
};

/* ───────────────────────────── 4 · The first trick ───────────────────────────── */

const CREW: { kind: VillagerKind; vehicle: "bike" | "scooter"; x: number; d: number }[] = [
  { kind: "dog", vehicle: "bike", x: 1080, d: 0 },
  { kind: "rabbit", vehicle: "scooter", x: 1360, d: 14 },
  { kind: "goat", vehicle: "bike", x: 1640, d: 26 },
];

const PHONES: { kind: VillagerKind; x: number }[] = [
  { kind: "dog", x: 420 },
  { kind: "rabbit", x: 820 },
  { kind: "goat", x: 1220 },
  { kind: "duck", x: 1620 },
];

/** The village with every phone beeping. */
const BeepingVillage: React.FC<{ time?: "day" | "evening"; beep: boolean; shrug?: boolean; tired?: boolean }> = ({ time = "day", beep, shrug, tired }) => (
  <Village time={time}>
    {PHONES.map(({ kind, x }, i) => {
      const P: Placed = { x, y: FEET, size: VILL, flip: i % 2 === 1 };
      const ph = toScene(P, { x: 296, y: 268 });
      return (
        <React.Fragment key={kind}>
          <Villager kind={kind} {...P} phone beep={beep} eyes={tired ? "tired" : beep ? "wide" : "open"} shrug={shrug && !beep} seed={i * 3} mouthOpen={beep ? 0.5 : 0} />
          <BeepWaves x={ph.x} y={ph.y} on={beep} />
        </React.Fragment>
      );
    })}
  </Village>
);

export const Trick1Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const pressed = cue("Toby pressed");
  const wolfWolf = cue("“Wolf! Wolf! A wolf");
  const village = cue("Down in the village");
  const zoomed = cue("Everyone zoomed");
  const noWolf = cue("but there was no wolf");
  const haha = cue("“Ha ha");
  const B: Placed = { x: 560, y: FEET, size: BEAR };
  const bh = bearHead(B);
  return (
    <Camera from={1} to={1.04}>
      <Phase o={phase(frame, 0, village)}>
        <Hills trees={[160]}>
          <Bear {...B} hold="walkie" pose={frame > wolfWolf - 4 ? "shout" : "stand"} beep={frame > pressed + 10} eyes={frame > pressed && frame < wolfWolf ? "sly" : "open"} />
          <Sheep x={1000} y={FEET + 10} size={SHEEP} graze seed={1} eyes="happy" />
          <Sheep x={1240} y={FEET + 30} size={SHEEP} graze seed={2} />
          <Sheep x={1470} y={FEET} size={SHEEP} flip seed={3} eyes="happy" />
          <Shout x={800} y={300} text={{ en: "WOLF! WOLF!", es: "¡LOBO! ¡LOBO!" }} pop={popAt(frame, wolfWolf, 8)} />
          <Bubble x={bh.x + 50} y={bh.y - 10} tail="left" width={560} fontSize={48} color={C.cream} text={{ en: "A wolf is chasing the sheep!", es: "¡Un lobo persigue a las ovejas!" }} pop={popAt(frame, cue("A wolf is chasing"), 8)} />
        </Hills>
      </Phase>
      <Phase o={phase(frame, village, zoomed)}>
        <BeepingVillage beep />
      </Phase>
      <Phase o={phase(frame, zoomed)}>
        <Hills trees={[160]}>
          <Bear {...B} hold="walkie" pose={frame > haha - 4 ? "laugh" : "stand"} eyes={frame > noWolf ? "happy" : "open"} />
          {CREW.map(({ kind, vehicle, x, d }, i) => {
            const arrive = noWolf - 6;
            const rx = interpolate(frame, [zoomed + d, arrive + d * 0.3], [2300 + i * 160, x], { ...clamp, easing: easeOut });
            return frame < arrive + d * 0.3 ? (
              <Rider key={kind} kind={kind} vehicle={vehicle} x={rx} y={FEET} size={VILL * 1.1} flip seed={i * 4} eyes="wide" />
            ) : (
              <React.Fragment key={kind}>
                <Villager kind={kind} x={x} y={FEET} size={VILL} flip look puff={frame < haha} eyes={frame > haha ? "tired" : "open"} seed={i * 4} />
                <Floaty x={x} y={FEET - VILL - 100} text="?" pop={popAt(frame, noWolf + i * 6, 8)} color={C.lavenderDark} size={90} />
              </React.Fragment>
            );
          })}
          <Bubble x={bh.x + 50} y={bh.y - 10} tail="left" width={480} fontSize={54} color={C.butter} text={{ en: "Ha ha! Just joking!", es: "¡Ja, ja! ¡Era una broma!" }} pop={popAt(frame, haha, 8)} />
        </Hills>
      </Phase>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The second trick ───────────────────────────── */

const FROWNERS: { kind: VillagerKind; x: number }[] = [
  { kind: "dog", x: 1000 },
  { kind: "rabbit", x: 1260 },
  { kind: "goat", x: 1520 },
];

export const Trick2Scene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const notFunny = cue("“That wasn’t funny");
  const nextDay = cue("But the very next day");
  const wolfWolf = cue("“Wolf! Wolf!”");
  const upThey = cue("Up they all");
  const again = cue("and once again");
  const shook = cue("The villagers shook");
  const walked = cue("walked slowly home");
  const B: Placed = { x: 520, y: FEET, size: BEAR };
  const dogHead = villHead({ x: 1000, y: FEET, flip: true });
  return (
    <Camera from={1} to={1.04}>
      <Phase o={phase(frame, 0, nextDay)}>
        <Hills trees={[160]}>
          <Bear {...B} hold="walkie" eyes="open" headTilt={-6} />
          <Sheep x={200} y={FEET + 30} size={SHEEP} graze seed={2} />
          {FROWNERS.map(({ kind, x }, i) => (
            <Villager key={kind} kind={kind} x={x} y={FEET} size={VILL} flip frown seed={i * 5} mouthOpen={i === 0 && frame > notFunny && frame < nextDay - 10 ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0} />
          ))}
          <Bubble x={dogHead.x - 30} y={dogHead.y} tail="right" width={540} fontSize={52} color={C.cream} text={{ en: "That wasn’t funny, Toby.", es: "Eso no fue gracioso, Toby." }} pop={popAt(frame, notFunny, 8)} />
        </Hills>
      </Phase>
      <Phase o={phase(frame, nextDay, shook)}>
        <Hills trees={[160]}>
          <Bear {...B} hold="walkie" pose={frame > wolfWolf - 4 && frame < again ? "shout" : "stand"} beep={frame > wolfWolf - 10 && frame < again} eyes={frame > again ? "sly" : "open"} />
          <Sheep x={200} y={FEET + 30} size={SHEEP} graze seed={2} />
          {FROWNERS.map(({ kind, x }, i) => {
            const rx = interpolate(frame, [upThey - 10 + i * 10, again], [2200 + i * 150, x], { ...clamp, easing: easeOut });
            const there = frame >= again;
            return (
              <React.Fragment key={kind}>
                <Villager kind={kind} x={rx} y={FEET} size={VILL} flip run={!there && frame > upThey - 10} puff look={there} eyes={there ? "tired" : "open"} seed={i * 5} />
                <Floaty x={x} y={FEET - VILL - 100} text="?" pop={popAt(frame, again + 10 + i * 6, 8)} size={90} />
              </React.Fragment>
            );
          })}
          <Shout x={1100} y={300} text={{ en: "WOLF! WOLF!", es: "¡LOBO! ¡LOBO!" }} pop={popAt(frame, wolfWolf, 8) * interpolate(frame, [again - 6, again], [1, 0], clamp)} />
        </Hills>
      </Phase>
      <Phase o={phase(frame, shook)}>
        <Hills trees={[160]}>
          <Bear {...B} hold="walkie" eyes="open" headTilt={Math.sin(frame / 18) * 4} />
          <Sheep x={200} y={FEET + 30} size={SHEEP} graze seed={2} />
          {FROWNERS.map(({ kind, x }, i) => {
            const leaving = frame > walked - 10;
            const rx = interpolate(frame, [walked - 10, walked + 120], [x, x + 900], clamp);
            return <Villager key={kind} kind={kind} x={rx} y={FEET} size={VILL} flip={!leaving} shake={!leaving} walk={leaving ? 0.6 : 0} eyes="tired" seed={i * 5} />;
          })}
        </Hills>
      </Phase>
    </Camera>
  );
};

/* ───────────────────────────── 6 · A real wolf ───────────────────────────── */

export const RealWolfScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const rustled = cue("something rustled");
  const ears = cue("Two pointy ears");
  const tail = cue("a bushy grey tail");
  const real = cue("It was a real wolf");
  const shout = cue("“Wolf! Wolf! Please");
  const rise = interpolate(frame, [ears - 4, ears + 14, tail - 4, tail + 14, real - 4, real + 12], [300, 170, 170, 110, 110, 30], { ...clamp, easing: easeInOut });
  const rustle = interpolate(frame, [rustled, rustled + 10, ears + 20, ears + 40], [0, 1, 1, 0.2], clamp);
  const B: Placed = { x: 420, y: FEET, size: BEAR };
  const bh = bearHead(B);
  const scared = frame > real;
  return (
    <Camera from={1} to={1.06}>
      <Hills time="evening" trees={[1820]}>
        <Bear {...B} hold="walkie" pose={frame > shout - 4 ? "shout" : "stand"} beep={frame > shout - 4} eyes={scared ? "wide" : "open"} headTilt={frame > rustled && !scared ? 8 : 0} />
        <Sheep x={760} y={FEET + 20} size={SHEEP} graze={!scared} eyes={scared ? "wide" : "open"} seed={1} />
        <Sheep x={980} y={FEET} size={SHEEP} graze={!scared} eyes={scared ? "wide" : "open"} seed={2} hop={scared ? 0.3 : 0} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: GROUND_Y + 70, overflow: "hidden" }}>
          <Wolf x={1500} y={FEET + rise} size={WOLF} flip eyes="grumpy" seed={2} />
        </div>
        <LongGrass from={1160} to={1960} y={GROUND_Y + 80} h={300} rustle={rustle} />
        <Shout x={820} y={250} text={{ en: "WOLF! WOLF!", es: "¡LOBO! ¡LOBO!" }} pop={popAt(frame, shout, 8)} />
        <Bubble x={bh.x + 50} y={bh.y - 10} tail="left" width={560} fontSize={48} color={C.cream} text={{ en: "Please come, it’s real this time!", es: "¡Por favor, vengan, esta vez es verdad!" }} pop={popAt(frame, cue("Please come"), 8)} />
      </Hills>
    </Camera>
  );
};

/* ───────────────────────────── 7 · Nobody came ───────────────────────────── */

const SCATTER: { x0: number; x1: number; y0: number; y1: number; s1: number; flip: boolean }[] = [
  { x0: 700, x1: -260, y0: FEET + 20, y1: FEET + 30, s1: 1, flip: true },
  { x0: 860, x1: 260, y0: FEET, y1: GROUND_Y - 190, s1: 0.45, flip: true },
  { x0: 980, x1: 700, y0: FEET + 30, y1: GROUND_Y - 230, s1: 0.4, flip: true },
  { x0: 1100, x1: 1060, y0: FEET + 10, y1: GROUND_Y - 260, s1: 0.35, flip: false },
  { x0: 780, x1: 120, y0: FEET + 40, y1: FEET + 60, s1: 1.05, flip: true },
];

export const NobodyScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const said = cue("But everyone said");
  const nobody = cue("And nobody came");
  const scattered = cue("The sheep scattered");
  const gaveUp = cue("until the hungry wolf");
  const slunk = cue("slunk away");
  const rabbitHead = villHead({ x: 820, y: FEET, flip: true });
  const run = interpolate(frame, [scattered, gaveUp + 10], [0, 1], { ...clamp, easing: easeOut });
  const wolfX = frame < slunk ? interpolate(frame, [scattered - 10, gaveUp], [1900, 1320], clamp) : interpolate(frame, [slunk, slunk + 80], [1320, 2200], clamp);
  return (
    <Camera from={1} to={1.04}>
      <Phase o={phase(frame, 0, scattered)}>
        <BeepingVillage time="evening" beep={frame < said} shrug={frame > said} tired={frame > said} />
        <Bubble x={rabbitHead.x - 30} y={rabbitHead.y} tail="right" width={560} fontSize={50} color={C.cream} text={{ en: "Oh, it’s just Toby, joking again.", es: "Ay, es Toby, otra vez bromeando." }} pop={popAt(frame, said + 8, 8) * interpolate(frame, [nobody + 20, nobody + 30], [1, 0], clamp)} />
      </Phase>
      <Phase o={phase(frame, scattered)}>
        <Hills time="evening" trees={[1820]}>
          {SCATTER.map((s, i) => {
            const t = Math.min(1, run * (1 + i * 0.08));
            return <Sheep key={i} x={interpolate(t, [0, 1], [s.x0, s.x1])} y={interpolate(t, [0, 1], [s.y0, s.y1])} size={SHEEP * interpolate(t, [0, 1], [1, s.s1])} flip={s.flip} run={t < 1} hop={t >= 1 ? 0.3 : 0} eyes="wide" seed={i} />;
          })}
          <Bear x={300} y={FEET} size={BEAR * 0.9} pose="shout" hold="walkie" eyes="wide" />
          <Wolf x={wolfX} y={FEET + 30} size={WOLF} flip={frame < slunk} walk={frame < gaveUp || frame > slunk ? 1 : 0} droop={frame > gaveUp} eyes={frame > gaveUp ? "tired" : "grumpy"} seed={3} />
        </Hills>
      </Phase>
    </Camera>
  );
};

/* ───────────────────────────── 8 · Sorry ───────────────────────────── */

const LISTENERS: { kind: VillagerKind; x: number }[] = [
  { kind: "dog", x: 1060 },
  { kind: "rabbit", x: 1310 },
  { kind: "goat", x: 1560 },
  { kind: "duck", x: 1790 },
];

/** A big phone screen showing the hills and every sheep's tracker dot. */
const TrackerMap: React.FC<{ found: number; pop: number }> = ({ found, pop }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const dots: [number, number][] = [
    [120, 300],
    [260, 200],
    [400, 330],
    [520, 180],
    [600, 360],
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
      <div
        style={{
          width: 820,
          height: 620,
          borderRadius: 60,
          background: C.lavenderDark,
          padding: 26,
          scale: `${interpolate(pop, [0, 0.7, 1], [0.3, 1.06, 1])}`,
          opacity: pop,
          boxShadow: "0 18px 0 rgba(94,75,110,0.15)",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 40, background: C.mint, overflow: "hidden" }}>
          <svg viewBox="0 0 768 568" width="100%" height="100%" style={{ position: "absolute" }}>
            <ellipse cx={200} cy={520} rx={420} ry={240} fill={C.grass} />
            <ellipse cx={620} cy={560} rx={380} ry={220} fill={C.grassDark} />
            <path d="M 60 500 Q 300 380 420 260 Q 520 160 720 120" stroke={C.cream} strokeWidth={26} fill="none" strokeLinecap="round" />
            {dots.map(([x, y], i) => {
              const on = i < found;
              const ring = ((frame + i * 9) % 30) / 30;
              return (
                <g key={i}>
                  {on ? <circle cx={x} cy={y} r={20 + ring * 30} fill="none" stroke={C.pinkDark} strokeWidth={5} opacity={1 - ring} /> : null}
                  <circle cx={x} cy={y} r={20} fill={on ? C.pinkDark : C.cream} />
                  <circle cx={x} cy={y} r={8} fill="#fff" />
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontSize: 50, fontWeight: 700, color: C.ink }}>
            {t({ en: `Sheep found: ${found} of 5`, es: `Ovejas encontradas: ${found} de 5` })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SorryScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const sorry = cue("“I’m sorry");
  const meant = cue("The villagers could see");
  const checked = cue("They checked");
  const together = cue("and together");
  const safe = cue("safe and sound");
  const bx = interpolate(frame, [0, sorry - 6], [-200, 640], { ...clamp, easing: easeOut });
  const B: Placed = { x: bx, y: FEET, size: BEAR };
  const bh = bearHead(B);
  const soft = frame > meant;
  const found = Math.min(5, Math.floor(interpolate(frame, [checked + 14, together - 6], [0, 5.99], clamp)));
  return (
    <Camera from={1} to={1.04}>
      <Phase o={phase(frame, 0, checked)}>
        <Village time="evening">
          {LISTENERS.map(({ kind, x }, i) => (
            <Villager key={kind} kind={kind} x={x} y={FEET} size={VILL} flip frown={!soft} eyes={soft ? "happy" : "open"} seed={i * 4} />
          ))}
          <Bear {...B} run={frame < sorry - 6} tears eyes="sad" />
          {soft ? [0, 1, 2].map((i) => <Heart key={i} x={1100 + i * 260} y={560 - ((frame - meant) * 1.4 + i * 40) % 140} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />) : null}
          <Bubble x={bh.x + 50} y={bh.y - 10} tail="left" width={560} fontSize={46} color={C.cream} text={{ en: "I’m sorry I tricked you. I really need your help.", es: "Perdón por engañarlos. De verdad necesito su ayuda." }} pop={popAt(frame, sorry, 8)} />
        </Village>
      </Phase>
      <Phase o={phase(frame, checked, together)}>
        <Village time="evening">
          <Villager kind="dog" x={300} y={FEET} size={VILL} phone map seed={1} />
          <Bear x={1660} y={FEET} size={BEAR} flip eyes="wide" />
          <TrackerMap found={found} pop={popAt(frame, checked, 14)} />
        </Village>
      </Phase>
      <Phase o={phase(frame, together)}>
        <Hills time="evening" trees={[1820]}>
          {[
            [760, FEET + 20],
            [960, FEET],
            [1160, FEET + 30],
            [1360, FEET + 10],
            [1560, FEET + 30],
          ].map(([x, y], i) => (
            <Sheep key={i} x={x} y={y} size={SHEEP} eyes="happy" hop={frame > safe ? 0.4 : 0.1} ping flip={i % 2 === 1} seed={i} />
          ))}
          <Bear x={480} y={FEET} size={BEAR} eyes="happy" wave />
          <Villager kind="dog" x={220} y={FEET} size={VILL} eyes="happy" phone map seed={1} />
          <Villager kind="rabbit" x={1760} y={FEET} size={VILL} flip eyes="happy" wave seed={2} />
          {[0, 1, 2, 3].map((i) => (
            <Heart key={i} x={700 + i * 300} y={520 - ((frame * 1.3 + i * 40) % 150)} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />
          ))}
        </Hills>
      </Phase>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("if you tell fibs"), cue("if you tell fibs") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("So only call"), cue("So only call") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#D2ECF7" }}>
      <Hills trees={[]} village={false}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 170 }}>
          <div
            style={{
              width: 1340,
              background: C.cream,
              borderRadius: 64,
              padding: "48px 90px",
              textAlign: "center",
              boxShadow: "0 16px 0 rgba(94,75,110,0.14)",
              scale: `${interpolate(card, [0, 1], [0.7, 1])}`,
              opacity: card,
            }}
          >
            <div style={{ fontSize: 58, fontWeight: 700, color: BC.bandanaDark, marginBottom: 20 }}>
              {t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}
            </div>
            <div style={{ fontSize: 62, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
              {t({ en: "If you tell fibs, people may not believe you, even when you tell the truth.", es: "Si dices mentiras, puede que no te crean, aunque digas la verdad." })}
            </div>
            <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.pinkDark, lineHeight: 1.25, opacity: echo }}>
              {t({ en: "Only call for help when it’s real, and everyone will come running.", es: "Pide ayuda solo cuando sea de verdad, y todos vendrán corriendo." })}
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
        <Bear x={190} y={1066} size={330} wave={end > 0} eyes={end > 0 ? "happy" : "open"} />
        <Sheep x={1560} y={1066} size={250} flip hop={end > 0 ? 0.5 : 0} ping seed={1} />
        <Villager kind="dog" x={1790} y={1066} size={300} flip wave={end > 0} eyes="happy" seed={2} />
      </Hills>
    </AbsoluteFill>
  );
};

