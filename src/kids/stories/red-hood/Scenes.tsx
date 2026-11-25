/**
 * Little Red Riding Hood — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Localized, type Placed } from "../../kit";
import { BigTrunk, BedFront, Bedroom, Cottage, FlowerPatch, GROUND_Y, Posy, Woods } from "./Backgrounds";
import { BasketShape, BeepWaves, Beaver, Bunny, EScooter, Muffin, RC, Wolf, WolfDisguise, toScene } from "./Characters";
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

/** Shown from cue `a` until cue `b` (exclusive). */
const during = (frame: number, a: number, b = 1e9) => (frame >= a && frame < b ? popAt(frame, a, 8) : 0);

const RED = 300;
const MUM = 320;
const GRAN = 300;
const WOLF = 440;
const BEAV = 340;
const FEET = GROUND_Y + 20;

const bunnyHead = (p: Placed) => toScene({ size: RED, ...p }, { x: 208, y: 0 });
const wolfHead = (p: Placed) => toScene({ size: WOLF, ...p }, { x: 230, y: 10 });

/** A front tree trunk drawn over characters (so the wolf can hide behind it). */
const TrunkFront: React.FC<{ x: number }> = ({ x }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
    <BigTrunk x={x} />
  </svg>
);

/** Big wobbly sound word ("Knock, knock!", "BEEP! BEEP!"). */
const Shout: React.FC<{ x: number; y: number; text: Localized; pop: number; color?: string; size?: number }> = ({ x, y, text, pop, color = RC.alert, size = 100 }) => {
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

/** The watch screen, zoomed in: footprints and "2,000 steps". Centre at (x, y). */
const WatchPopup: React.FC<{ x: number; y: number; pop: number }> = ({ x, y, pop }) => {
  const frame = useCurrentFrame();
  const t = useT();
  if (pop <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        top: y - 170,
        width: 340,
        height: 340,
        borderRadius: 90,
        background: RC.watch,
        boxShadow: "0 12px 0 rgba(94,75,110,0.14)",
        scale: `${interpolate(pop, [0, 0.7, 1], [0, 1.12, 1])}`,
        rotate: `${Math.sin(frame / 14) * 2}deg`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 26,
          borderRadius: 66,
          background: RC.screen,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: C.ink,
        }}
      >
        <svg viewBox="0 0 120 60" width={120} height={60}>
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={(Math.floor(frame / 8) + i) % 3 === 0 ? 1 : 0.45}>
              <ellipse cx={20 + i * 40} cy={i % 2 ? 22 : 38} rx={11} ry={15} fill={RC.capeDark} />
            </g>
          ))}
        </svg>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1 }}>2,000</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: RC.watchDark }}>{t({ en: "steps", es: "pasos" })}</div>
      </div>
    </div>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "Little Red", es: "Caperucita" }), t({ en: "Riding Hood", es: "Roja" })];
  const peek = interpolate(frame, [40, 60], [0, 1], { ...clamp, easing: easeOut });
  return (
    <Woods trees={[300, 1000]} trunk={null}>
      <Wolf x={1640 - peek * 110} y={FEET} size={360} flip eyes="grumpy" seed={1} />
      <TrunkFront x={1720} />
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
                color: i === 0 ? RC.capeDark : RC.watchDark,
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
      <Bunny x={420} y={FEET} size={RED} pose={frame > 24 ? "wave" : "stand"} eyes="happy" />
      <div style={{ position: "absolute", left: 600, top: FEET - 120 }}>
        <svg viewBox="-60 -20 120 120" width={130} height={130}>
          <BasketShape />
        </svg>
      </div>
    </Woods>
  );
};

/* ───────────────────────────── 2 · Red and the basket ───────────────────────────── */

export const HomeScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const called = cue("Everyone called");
  const packed = cue("her mum packed");
  const grandma = cue("for Grandma");
  const stay = cue("“Stay on the path");
  const watch = cue("follow your watch");
  const mumX = interpolate(frame, [packed - 10, packed + 40], [230, 600], { ...clamp, easing: easeOut });
  const handed = frame >= grandma + 10;
  const M: Placed = { x: mumX, y: FEET, size: MUM };
  const mh = toScene(M, { x: 208, y: 10 });
  return (
    <Camera from={1} to={1.05}>
      <Woods trees={[1250, 1700]} path>
        <Cottage x={40} w={500} h={360} wall={C.peach} roof="#F6B3A9" smoke />
        <Bunny {...M} kind="mum" pose={frame >= grandma - 4 && frame < grandma + 16 ? "give" : frame >= stay ? "point" : "stand"} basket={!handed && frame >= packed - 10} walk={frame < packed + 40 && frame > packed - 10 ? 1 : 0} mouthOpen={frame >= stay ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} eyes="happy" seed={2} />
        <Bunny x={880} y={FEET} size={RED} flip pose={frame >= watch && frame < watch + 40 ? "press" : "stand"} basket={handed} beep={frame >= watch && frame < watch + 40} eyes={frame >= called && frame < called + 50 ? "happy" : "open"} headTilt={Math.sin(frame / 22) * 4} />
        {frame >= called && frame < called + 50
          ? [0, 1, 2, 3].map((i) => <Sparkle key={i} x={760 + i * 80} y={520 - (i % 2) * 70} size={56} t={(frame - called - i * 5) / 6} />)
          : null}
        {frame >= watch && frame < watch + 40 ? <BeepWaves {...toScene({ x: 880, y: FEET, size: RED, flip: true }, { x: 286, y: 244 })} /> : null}
        <Bubble x={mh.x - 10} y={mh.y} tail="left" width={620} fontSize={50} color={C.butter} text={{ en: "Stay on the path, and don’t chat with strangers!", es: "¡Quédate en el camino y no hables con desconocidos!" }} pop={popAt(frame, stay, 8)} />
      </Woods>
    </Camera>
  );
};

/* ───────────────────────────── 3 · Along the path ───────────────────────────── */

export const PathScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const steps = cue("“Two thousand");
  const skipped = cue("She skipped");
  const then = cue("Then, from behind");
  const out = cue("out stepped");
  const redX = interpolate(frame, [skipped, then], [380, 820], clamp);
  const skipping = frame >= skipped && frame < then;
  const wolfX = interpolate(frame, [out - 6, out + 18], [1720, 1430], { ...clamp, easing: easeOut });
  const R: Placed = { x: redX, y: FEET, size: RED };
  const rh = bunnyHead(R);
  return (
    <Camera from={1.02} to={1.06}>
      <Woods trees={[200, 700, 1200]} path>
        {frame >= out - 6 ? <Wolf x={wolfX} y={FEET} size={WOLF} flip eyes="grumpy" mouthOpen={frame > out + 18 ? 0.25 : 0} seed={1} /> : null}
        <TrunkFront x={1720} />
        <Bunny {...R} pose={frame < skipped ? "press" : "stand"} skip={skipping} basket={frame >= skipped} beep={frame < skipped} eyes={frame >= out ? "wide" : "happy"} />
        <WatchPopup x={rh.x + 260} y={rh.y + 60} pop={during(frame, steps - 6, skipped + 6)} />
        {frame < skipped ? <BeepWaves x={toScene(R, { x: 286, y: 244 }).x} y={toScene(R, { x: 286, y: 244 }).y} on={Math.floor(frame / 20) % 2 === 0} color={RC.watchDark} /> : null}
      </Woods>
    </Camera>
  );
};

/* ───────────────────────────── 4 · The wolf asks ───────────────────────────── */

export const ChatScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const morning = cue("“Good morning");
  const forgot = cue("Red forgot");
  const toG = cue("“To Grandma");
  const lovely = cue("“How lovely");
  const why = cue("“Why not");
  const W: Placed = { x: 1260, y: FEET, size: WOLF, flip: true };
  const R: Placed = { x: 620, y: FEET, size: RED };
  const wh = wolfHead(W);
  const rh = bunnyHead(R);
  const wolfTalking = (frame >= morning && frame < forgot) || frame >= lovely;
  return (
    <Camera from={1} to={1.05}>
      <Woods trees={[300, 1500]} path>
        <FlowerPatch x={960} y={FEET + 10} picked={0} />
        <Wolf {...W} eyes="grumpy" mouthOpen={wolfTalking ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} seed={1} />
        <Bunny {...R} basket eyes={frame >= toG && frame < lovely ? "happy" : "open"} mouthOpen={frame >= toG && frame < lovely ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} headTilt={frame >= forgot && frame < toG ? 8 : 0} />
        {frame >= why ? [0, 1, 2].map((i) => <Sparkle key={i} x={820 + i * 140} y={FEET - 120 - (i % 2) * 50} size={50} t={(frame - why - i * 5) / 6} />) : null}
        <Bubble x={wh.x} y={wh.y} tail="right" width={560} fontSize={50} text={{ en: "Good morning! Where are you off to?", es: "¡Buenos días! ¿Adónde vas?" }} pop={during(frame, morning, toG)} />
        <Bubble x={rh.x} y={rh.y} tail="left" width={540} fontSize={50} color={C.butter} text={{ en: "To Grandma’s cottage!", es: "¡A la casita de mi abuelita!" }} pop={during(frame, toG, why)} />
        <Bubble x={wh.x} y={wh.y} tail="right" width={560} fontSize={50} text={{ en: "Why not pick her some flowers?", es: "¿Por qué no le llevas unas flores?" }} pop={popAt(frame, why, 8)} />
      </Woods>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The shortcut ───────────────────────────── */

export const ShortcutScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const hopped = cue("the wolf hopped");
  const zoomed = cue("zoomed down");
  const knock = cue("Knock, knock!");
  const squeak = cue("“Grandma, it’s me");
  const peeked = cue("But Grandma peeked");
  const ears = cue("two furry grey ears");
  const wink = cue("Quick as a wink");
  const a = phase(frame, 0, knock - 6);
  const b = phase(frame, knock - 6);
  const wolfX = interpolate(frame, [hopped, zoomed, knock - 8], [900, 1000, 2300], { ...clamp, easing: easeInOut });
  const riding = frame >= hopped;
  const W: Placed = { x: 860, y: FEET, size: WOLF };
  const wh = wolfHead(W);
  const peek = interpolate(frame, [peeked, peeked + 14], [0, 1], clamp) * interpolate(frame, [wink, wink + 8], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Phase o={a}>
        <Woods trees={[400, 1100, 1700]} path scroll={riding ? Math.max(0, frame - zoomed) * 6 : 0}>
          <FlowerPatch x={300} y={FEET + 10} picked={interpolate(frame, [0, knock], [0, 0.6], clamp)} />
          <Bunny x={300} y={FEET} size={RED} pose={Math.floor(frame / 24) % 2 ? "pick" : "stand"} eyes="happy" seed={3} />
          <Posy x={toScene({ x: 300, y: FEET, size: RED }, { x: 150, y: 330 }).x} y={toScene({ x: 300, y: FEET, size: RED }, { x: 150, y: 330 }).y} size={90} />
          {riding && frame > zoomed
            ? [0, 1, 2].map((i) => (
                <div key={i} style={{ position: "absolute", left: wolfX - 260 - i * 30, top: FEET - 250 + i * 70, width: 180, height: 12, borderRadius: 6, background: C.cream, opacity: 0.8 }} />
              ))
            : null}
          {riding ? <EScooter x={wolfX + 60} y={FEET} size={200} zoom={frame > zoomed} /> : <EScooter x={1080} y={FEET} size={200} />}
          <Wolf x={wolfX} y={riding ? FEET - 6 : FEET} size={400} ring={riding} eyes="grumpy" mouthOpen={riding ? 0.4 : 0} seed={1} />
        </Woods>
      </Phase>
      <Phase o={b}>
        <Woods trees={[200]} path={false}>
          <Cottage x={900} w={620} h={380} wall={C.cream} roof={C.lavenderDark} peek={peek} peekEyes={frame >= ears ? "wide" : "open"} />
          <EScooter x={480} y={FEET} size={200} />
          <Wolf {...W} ring={frame < peeked} eyes="grumpy" mouthOpen={frame >= squeak && frame < peeked ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} seed={1} />
          <Shout x={1110} y={360} text={{ en: "Knock, knock!", es: "¡Toc, toc!" }} pop={during(frame, knock, squeak + 10)} color={C.lavenderDark} />
          <Bubble x={wh.x} y={wh.y} tail="left" width={520} fontSize={50} text={{ en: "Grandma, it’s me, Red!", es: "Abuelita, ¡soy yo, Caperucita!" }} pop={during(frame, squeak, peeked)} />
          {frame >= wink && frame < wink + 30 ? [0, 1, 2].map((i) => <Sparkle key={i} x={1340 + (i - 1) * 90} y={560 - (i % 2) * 40} size={50} t={(frame - wink - i * 4) / 5} />) : null}
        </Woods>
      </Phase>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── 6 · What big ears ───────────────────────────── */

const BED_WOLF: Placed = { x: 1150, y: FEET - 50, size: WOLF, flip: true };

export const BedScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const cap = cue("nightcap");
  const glasses = cue("glasses");
  const jumped = cue("jumped into");
  const soon = cue("Soon, Red arrived");
  const bigEars = cue("“Grandma, what big ears");
  const hear = cue("“All the better to hear");
  const bigEyes = cue("“Grandma, what big eyes");
  const see = cue("“All the better to see");
  const jt = interpolate(frame, [jumped, jumped + 18], [0, 1], { ...clamp, easing: easeInOut });
  const W: Placed = { x: interpolate(jt, [0, 1], [560, BED_WOLF.x]), y: interpolate(jt, [0, 1], [FEET, BED_WOLF.y]) - Math.sin(jt * Math.PI) * 220, size: WOLF, flip: true };
  const redX = interpolate(frame, [soon - 6, soon + 40], [-200, 480], { ...clamp, easing: easeOut });
  const R: Placed = { x: redX, y: FEET, size: RED };
  const rh = bunnyHead(R);
  const wh = wolfHead(BED_WOLF);
  const wolfTalk = (frame >= hear && frame < bigEyes) || frame >= see;
  return (
    <Camera from={1} to={1.05}>
      <Bedroom peek door={interpolate(frame, [soon - 16, soon], [0, 1], clamp)}>
        <Wolf {...W} eyes={frame >= bigEyes ? "surprised" : "grumpy"} mouthOpen={wolfTalk ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} seed={1} />
        <WolfDisguise {...W} cap={frame >= cap} glasses={frame >= glasses} seed={1} earWiggle={frame >= hear && frame < bigEyes ? 1 : 0} />
        {frame >= cap && frame < cap + 20 ? <Sparkle x={toScene(W, { x: 200, y: 40 }).x} y={toScene(W, { x: 200, y: 40 }).y} size={60} t={(frame - cap) / 6} /> : null}
        {frame >= glasses && frame < glasses + 20 ? <Sparkle x={toScene(W, { x: 222, y: 114 }).x} y={toScene(W, { x: 222, y: 114 }).y} size={60} t={(frame - glasses) / 6} /> : null}
        <BedFront />
        <Bunny {...R} basket walk={frame < soon + 40 ? 1 : 0} eyes={frame >= bigEars ? "wide" : "open"} headTilt={frame >= bigEars ? 6 : 0} mouthOpen={(frame >= bigEars && frame < hear) || (frame >= bigEyes && frame < see) ? Math.abs(Math.sin(frame / 3)) * 0.5 : 0} />
        <Bubble x={rh.x} y={rh.y} tail="left" width={540} fontSize={52} color={C.butter} text={{ en: "Grandma, what big ears you have!", es: "Abuelita, ¡qué orejas tan grandes tienes!" }} pop={during(frame, bigEars, hear)} />
        <Bubble x={wh.x} y={wh.y} tail="right" width={540} fontSize={52} text={{ en: "All the better to hear you with!", es: "¡Son para oírte mejor!" }} pop={during(frame, hear, bigEyes)} />
        <Bubble x={rh.x} y={rh.y} tail="left" width={540} fontSize={52} color={C.butter} text={{ en: "Grandma, what big eyes you have!", es: "Abuelita, ¡qué ojos tan grandes tienes!" }} pop={during(frame, bigEyes, see)} />
        <Bubble x={wh.x} y={wh.y} tail="right" width={540} fontSize={52} text={{ en: "All the better to see you with!", es: "¡Son para verte mejor!" }} pop={popAt(frame, see, 8)} />
      </Bedroom>
    </Camera>
  );
};

/* ───────────────────────────── 7 · What big teeth ───────────────────────────── */

export const TeethScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const gobble = cue("“All the better to…");
  const leapt = cue("The wolf leapt");
  const grabbed = cue("grabbed the basket");
  const pressed = cue("Red pressed");
  const beep = cue("Beep, beep");
  const jt = interpolate(frame, [leapt, leapt + 16], [0, 1], { ...clamp, easing: easeInOut });
  const out = frame >= leapt;
  const W: Placed = { x: interpolate(jt, [0, 1], [BED_WOLF.x, 830]), y: interpolate(jt, [0, 1], [BED_WOLF.y, FEET]) - Math.sin(jt * Math.PI) * 240, size: WOLF, flip: true };
  const R: Placed = { x: 480, y: FEET, size: RED };
  const rh = bunnyHead(R);
  const wh = wolfHead(BED_WOLF);
  const grabbedIt = frame >= grabbed;
  const wolfEls = (
    <>
      <Wolf {...W} eyes="grumpy" mouthOpen={frame >= gobble && frame < leapt ? 0.7 + Math.abs(Math.sin(frame / 3)) * 0.3 : out ? 0.3 : 0.15} seed={1} />
      <WolfDisguise {...W} basket={grabbedIt} seed={1} />
    </>
  );
  const watchAt = toScene(R, { x: 286, y: 244 });
  return (
    <Camera from={1.03} to={1.08}>
      <Bedroom peek>
        {!out ? wolfEls : null}
        <BedFront />
        {out ? wolfEls : null}
        <Bunny {...R} basket={!grabbedIt} pose={frame >= pressed ? "press" : grabbedIt ? "gasp" : "stand"} eyes={grabbedIt ? "wide" : "worried"} shiver={frame < gobble} beep={frame >= pressed} mouthOpen={frame < gobble ? Math.abs(Math.sin(frame / 3)) * 0.4 : grabbedIt && frame < pressed ? 0.8 : 0} />
        {frame >= pressed ? <BeepWaves x={watchAt.x} y={watchAt.y} /> : null}
        <Shout x={700} y={rh.y - 200} text={{ en: "BEEP! BEEP!", es: "¡BIP! ¡BIP!" }} pop={popAt(frame, beep, 8)} />
        <Bubble x={rh.x} y={rh.y} tail="left" width={540} fontSize={52} color={C.butter} text={{ en: "Grandma… what big teeth you have!", es: "Abuelita… ¡qué dientes tan grandes tienes!" }} pop={during(frame, 0, gobble)} />
        <Bubble x={wh.x} y={wh.y} tail="right" width={560} fontSize={52} text={{ en: "All the better to… gobble up your muffins!", es: "¡Son para… comerme tus panquecitos!" }} pop={during(frame, gobble, leapt)} />
      </Bedroom>
    </Camera>
  );
};

/* ───────────────────────────── 8 · The woodcutter ───────────────────────────── */

export const WoodcutterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const shoo = cue("“Shoo, wolf!");
  const dropped = cue("The wolf dropped");
  const popped = cue("Out of the wardrobe");
  const hug = cue("Red gave her");
  const shared = cue("Then they shared");
  const beaverX = interpolate(frame, [0, shoo - 4], [-200, 250], { ...clamp, easing: easeOut });
  const wolfX = interpolate(frame, [dropped, dropped + 40], [830, 2300], { ...clamp, easing: easeInOut });
  const grannyX = interpolate(frame, [popped + 10, hug], [1690, 860], { ...clamp, easing: easeOut });
  const redX = interpolate(frame, [popped + 10, hug], [480, 650], { ...clamp, easing: easeOut });
  const B: Placed = { x: beaverX, y: FEET, size: BEAV };
  const bh = toScene(B, { x: 206, y: 20 });
  const W: Placed = { x: wolfX, y: FEET, size: WOLF, flip: frame < dropped };
  const hugging = frame >= hug;
  return (
    <Camera from={1} to={1.05}>
      <Bedroom door={1} wardrobe={interpolate(frame, [popped - 4, popped + 8], [0, 1], clamp)} peek={frame < popped}>
        <BedFront />
        {frame >= popped - 2 ? <Bunny kind="granny" x={grannyX} y={FEET} size={GRAN} flip pose={hugging ? "hug" : "stand"} walk={frame < hug && frame > popped + 10 ? 1 : 0} eyes={hugging ? "happy" : "wide"} seed={4} /> : null}
        {frame >= dropped ? (
          <div style={{ position: "absolute", left: 790, top: FEET - 110 }}>
            <svg viewBox="-60 -20 120 120" width={130} height={130}>
              <BasketShape />
            </svg>
          </div>
        ) : null}
        {wolfX < 2200 ? (
          <>
            <Wolf {...W} walk={frame >= dropped ? 1 : 0} eyes={frame >= shoo ? "surprised" : "grumpy"} seed={1} />
            <WolfDisguise {...W} basket={frame < dropped} walk={frame >= dropped ? 1 : 0} seed={1} />
          </>
        ) : null}
        <Bunny x={redX} y={FEET} size={RED} pose={hugging ? "hug" : "stand"} walk={frame > popped + 10 && frame < hug ? 1 : 0} eyes={frame >= popped ? "happy" : "wide"} />
        <Beaver {...B} stomp={frame < shoo - 4} pose={frame >= shoo && frame < dropped + 30 ? "shoo" : frame >= shared ? "wave" : "stand"} eyes={frame >= shoo && frame < dropped + 30 ? "firm" : "happy"} mouthOpen={frame >= shoo && frame < dropped ? Math.abs(Math.sin(frame / 3)) * 0.7 : 0} logs={frame < shoo - 4} />
        <Bubble x={bh.x} y={bh.y} tail="left" width={520} fontSize={54} color={C.mint} text={{ en: "Shoo, wolf! Off you go!", es: "¡Fuera, lobo! ¡Vete de aquí!" }} pop={during(frame, shoo, dropped + 20)} />
        {hugging
          ? [0, 1, 2, 3].map((i) => <Heart key={i} x={640 + i * 110} y={520 - ((frame * 1.3 + i * 40) % 150)} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />)
          : null}
        {frame >= shared ? (
          <>
            <Muffin x={660} y={FEET - 330 - Math.sin(frame / 8) * 6} size={80} />
            <Muffin x={860} y={FEET - 340 - Math.sin(frame / 8 + 1) * 6} size={80} />
            <Muffin x={beaverX + 120} y={FEET - 240 - Math.sin(frame / 8 + 2) * 6} size={70} />
          </>
        ) : null}
      </Bedroom>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("stay on the path"), cue("stay on the path") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("And if you ever"), cue("And if you ever") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#DDF1EC" }}>
      <Woods trees={[]} path={false}>
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
            <div style={{ fontSize: 58, fontWeight: 700, color: RC.capeDark, marginBottom: 20 }}>
              {t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}
            </div>
            <div style={{ fontSize: 62, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
              {t({ en: "Stay on the path, and don’t tell strangers your plans.", es: "Quédate en el camino, y no les cuentes tus planes a los desconocidos." })}
            </div>
            <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.pinkDark, lineHeight: 1.25, opacity: echo }}>
              {t({ en: "If you ever need help, ask a grown-up you trust.", es: "Si necesitas ayuda, pídesela a un adulto de confianza." })}
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
        <Bunny x={190} y={1066} size={330} pose={end > 0 ? "wave" : "stand"} eyes={end > 0 ? "happy" : "open"} />
        <Bunny kind="granny" x={1560} y={1066} size={310} flip eyes="happy" seed={2} />
        <Beaver x={1790} y={1066} size={330} flip pose={end > 0 ? "wave" : "stand"} eyes="happy" seed={3} />
      </Woods>
    </AbsoluteFill>
  );
};
