/**
 * The Three Little Pigs — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Placed } from "../../kit";
import { BrickHouse, Cottage, Drifting, GROUND_Y, Gust, StickHouse, StrawHouse, Street } from "./Backgrounds";
import { MusicNotes, PC, Pig, Speaker, Wolf, toScene, type PigKind } from "./Characters";
import type { Scene } from "./story";

type SceneProps = { scene: Scene };

const useCue = (scene: Scene) => {
  const { fps } = useVideoConfig();
  return (p: string) => cueFrame(scene, p, fps);
};

/** Pop in at `a`, out at `b`. */
const inOut = (frame: number, a: number, b: number) => popAt(frame, a, 8) * interpolate(frame, [b - 6, b], [1, 0], clamp);

const PIG = 300;
const WOLF = 440;
const FEET = GROUND_Y + 10;

const pigHead = (p: Placed) => toScene({ size: PIG, ...p }, { x: 208, y: 50 });
const wolfHead = (p: Placed) => toScene({ size: WOLF, ...p }, { x: 230, y: 30 });
const wolfMouth = (p: Placed) => toScene({ size: WOLF, ...p }, { x: 330, y: 172 });

/** Floating "z z z" for a sleepy wolf. */
const Zzz: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 20) % 60) / 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + t * 70 + i * 10,
              top: y - t * 150,
              fontSize: 44 + i * 10,
              fontWeight: 700,
              color: C.lavenderDark,
              opacity: opacity * interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
            }}
          >
            z
          </div>
        );
      })}
    </>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Three", es: "Los Tres" }), t({ en: "Little Pigs", es: "Cerditos" })];
  return (
    <Street trees={[1800]} fence={[[0, 520]]}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 300 }}>
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
                color: i === 0 ? PC.brickDark : C.pinkDark,
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
      <Pig kind="straw" x={300} y={FEET} size={PIG} wave={frame > 24} />
      <Pig kind="sticks" x={1480} y={FEET} size={PIG} flip dance={frame > 30} seed={3} />
      <Pig kind="brick" x={1690} y={FEET} size={PIG} flip hold="trowel" seed={6} />
    </Street>
  );
};

/* ───────────────────────────── 2 · Off they go ───────────────────────────── */

const LEAVERS: { kind: PigKind; off: number }[] = [
  { kind: "brick", off: 0 },
  { kind: "sticks", off: 210 },
  { kind: "straw", off: 420 },
];

export const LeaveScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const waved = cue("Mama Pig waved");
  const build = cue("“Build strong");
  const walkX = interpolate(frame, [6, waved], [640, 1200], clamp);
  const walking = frame < waved;
  const M: Placed = { x: 600, y: FEET, size: 340 };
  const mh = toScene(M, { x: 208, y: 50 });
  return (
    <Camera from={1} to={1.05}>
      <Street trees={[1780]} fence={[[0, 120]]}>
        <Cottage x={300} />
        <Pig kind="mama" {...M} wave={frame > waved - 10} mouthOpen={frame > build ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} />
        {LEAVERS.map(({ kind, off }, i) => (
          <Pig
            key={kind}
            kind={kind}
            x={walkX + off}
            y={FEET}
            size={PIG}
            hold={walking || kind !== "brick" ? "bundle" : null}
            walk={walking ? 1 : 0}
            flip={!walking}
            wave={!walking && frame > waved + 8 + i * 6 && kind === "brick"}
            eyes={!walking ? "happy" : "open"}
            seed={i * 4}
          />
        ))}
        <Bubble x={mh.x + 30} y={mh.y} tail="left" width={600} fontSize={52} color={C.butter} text={{ en: "Build strong houses, my darlings!", es: "¡Construyan casas fuertes, mis amores!" }} pop={popAt(frame, build, 8)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 3 · The straw house ───────────────────────────── */

/** A hammock between two posts; `children` (a pig) is drawn between the back and front fabric. */
const Hammock: React.FC<{ x: number; children?: React.ReactNode }> = ({ x, children }) => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame / 18) * 2.5;
  return (
    <>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
        <rect x={x - 230} y={GROUND_Y - 330} width={22} height={340} rx={10} fill={C.trunkDark} />
        <rect x={x + 210} y={GROUND_Y - 330} width={22} height={340} rx={10} fill={C.trunkDark} />
        <path d={`M ${x - 220} ${GROUND_Y - 300} Q ${x} ${GROUND_Y - 130} ${x + 220} ${GROUND_Y - 300}`} stroke={C.lavenderDark} strokeWidth={10} fill="none" />
      </svg>
      <AbsoluteFill style={{ rotate: `${swing}deg`, transformOrigin: `${x}px ${GROUND_Y - 300}px` }}>
        {children}
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
          <path
            d={`M ${x - 220} ${GROUND_Y - 300} Q ${x - 60} ${GROUND_Y - 120} ${x} ${GROUND_Y - 120} Q ${x + 60} ${GROUND_Y - 120} ${x + 220} ${GROUND_Y - 300} Q ${x} ${GROUND_Y - 210} ${x - 220} ${GROUND_Y - 300} Z`}
            fill={C.pink}
          />
          {[-120, -40, 40, 120].map((dx) => (
            <line key={dx} x1={x + dx} y1={GROUND_Y - 214 + Math.abs(dx) * 0.3} x2={x + dx * 0.9} y2={GROUND_Y - 126 - Math.abs(dx) * 0.4} stroke={C.pinkDark} strokeWidth={5} opacity={0.6} />
          ))}
        </svg>
      </AbsoluteFill>
    </>
  );
};

export const StrawScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const quick = cue("“Straw is quick");
  const piled = cue("He piled");
  const flop = cue("then flopped");
  const done = cue("“All done");
  const build = interpolate(frame, [piled - 10, flop], [0, 1], clamp);
  const toHammock = interpolate(frame, [flop - 4, flop + 16], [0, 1], { ...clamp, easing: easeInOut });
  const inHammock = toHammock >= 1;
  const P: Placed = { x: 900, y: FEET };
  const ph = pigHead(P);
  return (
    <Camera from={1.02} to={1.07}>
      <Street trees={[1840]} fence={[[1500, 1920]]}>
        <StrawHouse x={1270} build={build} />
        {build > 0 && build < 1
          ? [0, 1, 2].map((i) => <Sparkle key={i} x={1120 + i * 150} y={560 + (i % 2) * 90} size={56} t={(frame - piled - i * 7) / 6} color={C.butterDark} />)
          : null}
        <Hammock x={480}>
          {inHammock ? (
            <Pig kind="straw" x={640} y={GROUND_Y - 262} size={300} rotate={-74} hold="tablet" eyes={frame > done ? "happy" : "open"} mouthOpen={frame > done && frame < done + 45 ? 0.6 : 0} />
          ) : null}
        </Hammock>
        {!inHammock ? (
          <Pig
            kind="straw"
            x={interpolate(toHammock, [0, 1], [P.x, 560])}
            y={FEET}
            size={PIG}
            flip={toHammock > 0}
            bounce={frame > piled && frame < flop ? 0.5 : 0}
            walk={toHammock > 0 ? 1 : 0}
            mouthOpen={frame > quick && frame < piled ? 0.6 : 0}
            hold={frame > piled - 10 && toHammock === 0 ? "bundle" : null}
          />
        ) : null}
        <Bubble x={ph.x + 20} y={ph.y} tail="left" width={460} fontSize={56} color={C.butter} text={{ en: "Straw is quick!", es: "¡La paja es rápida!" }} pop={inOut(frame, quick, piled + 20)} />
        <Bubble x={430} y={470} tail="left" width={520} fontSize={54} color={C.mint} text={{ en: "All done! Time to play!", es: "¡Listo! ¡A jugar!" }} pop={popAt(frame, done, 8)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 4 · The stick house ───────────────────────────── */

export const SticksScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const quick = cue("“Sticks are quick");
  const tied = cue("She tied");
  const danced = cue("then danced");
  const fin = cue("“Finished");
  const build = interpolate(frame, [tied - 10, danced], [0, 1], clamp);
  const P: Placed = { x: 760, y: FEET };
  const ph = pigHead(P);
  return (
    <Camera from={1.02} to={1.07}>
      <Street trees={[1830]} fence={[[1450, 1920]]}>
        <StrawHouse x={180} s={0.8} />
        <StickHouse x={1200} build={build} />
        {build > 0 && build < 1
          ? [0, 1, 2].map((i) => <Sparkle key={i} x={1050 + i * 150} y={560 + (i % 2) * 90} size={56} t={(frame - tied - i * 7) / 6} color={C.butterDark} />)
          : null}
        <Speaker x={1600} y={FEET} size={130} on={frame > danced} />
        {frame > danced ? <MusicNotes x={1560} y={700} /> : null}
        <Pig kind="sticks" {...P} size={PIG} hold={frame < tied ? "bundle" : null} bounce={frame > tied && frame < danced ? 0.4 : 0} dance={frame > danced} eyes={frame > danced ? "happy" : "open"} mouthOpen={(frame > quick && frame < tied) || (frame > fin && frame < fin + 40) ? 0.6 : 0} />
        <Bubble x={ph.x - 20} y={ph.y} tail="right" width={520} fontSize={54} color={C.mint} text={{ en: "Sticks are quick too!", es: "¡Los palitos también son rápidos!" }} pop={inOut(frame, quick, tied + 20)} />
        <Bubble x={ph.x - 20} y={ph.y} tail="right" width={500} fontSize={54} color={C.butter} text={{ en: "Finished! Let’s dance!", es: "¡Terminé! ¡A bailar!" }} pop={popAt(frame, fin, 8)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The brick house ───────────────────────────── */

export const BricksScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const byBrick = cue("Brick by brick");
  const solarAt = cue("solar panels");
  const bellAt = cue("video doorbell");
  const slow = cue("“Slow and strong");
  const build = interpolate(frame, [12, solarAt - 6], [0.04, 1], clamp);
  const solar = popAt(frame, solarAt, 14);
  const bell = popAt(frame, bellAt, 14);
  const P: Placed = { x: 760, y: FEET };
  const ph = pigHead(P);
  const working = frame < solarAt;
  return (
    <Camera from={1.02} to={1.07}>
      <Street trees={[200]} fence={[[1580, 1920]]}>
        <BrickHouse x={1210} build={build} solar={solar} bell={bell} />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={1020 + i * 80} y={560 - i * 60} size={60} t={(frame - solarAt - i * 5) / 7} color={C.cream} />
        ))}
        {[0, 1].map((i) => (
          <Sparkle key={`b${i}`} x={1290 + i * 70} y={740 - i * 50} size={48} t={(frame - bellAt - i * 5) / 7} color={C.butterDark} />
        ))}
        {/* a little stack of bricks */}
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
          {[0, 1, 2].map((r) =>
            [0, 1, 2 - r].slice(0, 3 - r).map((k) => (
              <rect key={`${r}-${k}`} x={500 + k * 70 + r * 35} y={GROUND_Y - 34 - r * 34} width={64} height={30} rx={5} fill={(r + k) % 2 ? PC.brick : PC.brickDark} opacity={interpolate(build, [0.7, 1], [1, 0.35], clamp)} />
            )),
          )}
        </svg>
        <Pig kind="brick" {...P} size={PIG} hold="trowel" work={working && frame > byBrick - 20} cheer={frame > slow} eyes={frame > slow ? "happy" : "open"} mouthOpen={frame > slow && frame < slow + 40 ? 0.6 : 0} />
        <Bubble x={ph.x - 30} y={ph.y} tail="right" width={480} fontSize={56} color={C.butter} text={{ en: "Slow and strong!", es: "¡Despacito y fuerte!" }} pop={popAt(frame, slow, 8)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 6 · Huff and puff (straw) ───────────────────────────── */

export const WolfStrawScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const ask = cue("“Little pig");
  const notBy = cue("“Not by");
  const huff = cue("“Then I’ll");
  const whoosh = cue("Whoosh");
  const ran = cue("and the little pig ran");
  const wolfX = interpolate(frame, [0, ask - 4], [-260, 560], { ...clamp, easing: easeOut });
  const W: Placed = { x: wolfX, y: FEET };
  const wh = wolfHead(W);
  const mouth = wolfMouth(W);
  const puff = interpolate(frame, [huff, whoosh - 2], [0, 1], clamp) * (frame < whoosh ? 1 : 0);
  const blowing = frame >= whoosh && frame < whoosh + 40;
  const blown = interpolate(frame, [whoosh + 2, whoosh + 34], [0, 1], { ...clamp, easing: easeOut });
  const pigX = interpolate(frame, [ran - 6, ran + 50], [1240, 2150], clamp);
  const HOUSE_X = 1180;
  return (
    <Camera from={1} to={1.05}>
      <Street trees={[1840]} fence={[[0, 260]]}>
        <StrawHouse x={HOUSE_X} peek={["straw"]} blown={blown} />
        <Drifting x={HOUSE_X + 300} kind="straw" amount={interpolate(frame, [whoosh + 20, whoosh + 40], [0, 1], clamp)} />
        {blown > 0.3 ? <Pig kind="straw" x={pigX} y={FEET} size={PIG} run={frame > ran - 6} eyes="wide" mouthOpen={0.5} /> : null}
        <Gust x={mouth.x + 10} y={mouth.y} length={620} amount={blowing ? interpolate(frame, [whoosh, whoosh + 4, whoosh + 32, whoosh + 40], [0, 1, 1, 0], clamp) : 0} />
        <Wolf {...W} size={WOLF} walk={frame < ask - 4 ? 1 : 0} puff={puff} blow={blowing} eyes={frame > whoosh + 30 ? "surprised" : "grumpy"} mouthOpen={(frame > ask && frame < notBy) || (frame > huff && frame < huff + 30) ? Math.abs(Math.sin(frame / 3)) * 0.7 : 0} />
        <Bubble x={wh.x + 40} y={wh.y} tail="left" width={560} fontSize={48} color={C.cream} text={{ en: "Little pig, little pig, let me come in!", es: "¡Cerdito, cerdito, déjame entrar!" }} pop={inOut(frame, ask, notBy)} />
        <Bubble x={1330} y={600} tail="right" width={560} fontSize={48} color={C.butter} text={{ en: "Not by the hair of my chinny chin chin!", es: "¡No, no, por los pelitos de mi barbilla!" }} pop={inOut(frame, notBy, huff)} />
        <Bubble x={wh.x + 40} y={wh.y} tail="left" width={540} fontSize={48} color={C.cream} text={{ en: "Then I’ll huff, and I’ll puff…", es: "Entonces soplaré, y soplaré…" }} pop={inOut(frame, huff, whoosh)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 7 · Sticks go flying ───────────────────────────── */

export const WolfSticksScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const whoosh = cue("Whoosh");
  const ran = cue("The two little pigs");
  const W: Placed = { x: 560, y: FEET };
  const wh = wolfHead(W);
  const mouth = wolfMouth(W);
  const puff = interpolate(frame, [10, whoosh - 2], [0, 1], clamp) * (frame < whoosh ? 1 : 0);
  const blowing = frame >= whoosh && frame < whoosh + 40;
  const blown = interpolate(frame, [whoosh + 2, whoosh + 34], [0, 1], { ...clamp, easing: easeOut });
  const run = (start: number, delay: number) => interpolate(frame, [ran - 6 + delay, ran + 56 + delay], [start, 2200], clamp);
  const HOUSE_X = 1180;
  return (
    <Camera from={1} to={1.05}>
      <Street trees={[1860]} fence={[[0, 240]]}>
        <StickHouse x={HOUSE_X} peek={["straw", "sticks"]} blown={blown} />
        <Drifting x={HOUSE_X + 300} kind="sticks" amount={interpolate(frame, [whoosh + 20, whoosh + 40], [0, 1], clamp)} />
        {blown > 0.3 ? (
          <>
            <Pig kind="sticks" x={run(1290, 0)} y={FEET} size={PIG} run={frame > ran - 6} eyes="wide" mouthOpen={0.5} seed={2} />
            <Pig kind="straw" x={run(1120, 6)} y={FEET} size={PIG} run={frame > ran} eyes="wide" mouthOpen={0.5} seed={5} />
          </>
        ) : null}
        <Gust x={mouth.x + 10} y={mouth.y} length={620} amount={blowing ? interpolate(frame, [whoosh, whoosh + 4, whoosh + 32, whoosh + 40], [0, 1, 1, 0], clamp) : 0} />
        <Wolf {...W} size={WOLF} puff={puff} blow={blowing} eyes={frame > whoosh + 30 ? "surprised" : "grumpy"} />
        <Bubble x={wh.x + 40} y={wh.y} tail="left" width={420} fontSize={56} color={C.cream} text={{ en: "Huff… puff…", es: "Soplo… soplo…" }} pop={inOut(frame, 14, whoosh)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 8 · Ding dong ───────────────────────────── */

export const DoorbellScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const ask = cue("“Little pigs");
  const notBy = cue("“Not by");
  const huffed = cue("He huffed");
  const strong = cue("but the brick house");
  const outOf = cue("“I’m all out");
  const home = cue("and he went home");
  const HOUSE_X = 1320;
  const backX = interpolate(frame, [notBy + 10, huffed - 4], [1050, 760], { ...clamp, easing: easeInOut });
  const leaveX = interpolate(frame, [home, home + 110], [backX, -300], clamp);
  const wolfX = frame < home ? backX : leaveX;
  const W: Placed = { x: wolfX, y: FEET, flip: frame >= home };
  const wh = wolfHead(W);
  const mouth = wolfMouth(W);
  const puffing = frame > huffed && frame < strong;
  const cyc = ((frame - huffed) % 40) / 40;
  const puff = puffing ? interpolate(cyc, [0, 0.6, 0.7, 1], [0, 1, 0.2, 0]) : 0;
  const blow = puffing && cyc > 0.6;
  const tired = frame > outOf - 10;
  return (
    <Camera from={1} to={1.05}>
      <Street trees={[160]} fence={[[1580, 1920]]}>
        <BrickHouse x={HOUSE_X} s={1.3} peek={["straw", "sticks", "brick"]} ringing={frame < ask + 10} happy={frame > strong} talk={frame > notBy && frame < huffed ? Math.abs(Math.sin(frame / 3)) : 0} />
        {frame > strong
          ? [0, 1, 2, 3].map((i) => <Sparkle key={i} x={1080 + i * 150} y={330 + (i % 2) * 90} size={58} t={(frame - strong - i * 6) / 7} color={C.butterDark} />)
          : null}
        <Gust x={mouth.x + 10} y={mouth.y} length={260} amount={blow ? 1 : 0} />
        <Wolf
          {...W}
          size={WOLF}
          walk={(frame > notBy + 10 && frame < huffed - 4) || frame >= home ? 1 : 0}
          ring={frame < ask}
          puff={puff}
          blow={blow}
          droop={tired}
          eyes={frame >= home ? "tired" : tired ? "tired" : "grumpy"}
          yawn={frame >= home ? Math.max(0, Math.sin((frame - home) / 10)) : 0}
          mouthOpen={(frame > ask && frame < notBy) || (frame > outOf && frame < outOf + 40) ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0}
        />
        {frame >= home ? <Zzz x={wh.x + (W.flip ? -60 : 40)} y={wh.y} /> : null}
        <Bubble x={1240} y={300} tail="left" width={380} fontSize={52} color={C.butter} text={{ en: "Ding dong!", es: "¡Din, don!" }} pop={inOut(frame, 4, ask)} />
        <Bubble x={wh.x - 20} y={wh.y} tail="right" width={520} fontSize={50} color={C.cream} text={{ en: "Little pigs, let me come in!", es: "¡Cerditos, déjenme entrar!" }} pop={inOut(frame, ask, notBy)} />
        <Bubble x={1480} y={540} tail="right" width={500} fontSize={46} color={C.mint} text={{ en: "Not by the hair of our chinny chin chins!", es: "¡No, no, por los pelitos de nuestras barbillas!" }} pop={inOut(frame, notBy, huffed)} />
        <Bubble x={wh.x + 30} y={wh.y} tail="left" width={460} fontSize={50} color={C.cream} text={{ en: "I’m all out of puff…", es: "Me quedé sin aire…" }} pop={inOut(frame, outOf, home + 10)} />
      </Street>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Teamwork ───────────────────────────── */

const StringLights: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
      <path d="M 960 360 Q 1240 470 1560 380" stroke={C.ink} strokeWidth={3} fill="none" opacity={0.5} />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const x = 960 + t * 600;
        const y = 360 + Math.sin(t * Math.PI) * 100 + (t * 20);
        const on = (i + Math.floor(frame / 12)) % 3 !== 0;
        return <circle key={i} cx={x} cy={y + 14} r={11} fill={[C.butter, C.pink, C.mint][i % 3]} opacity={on ? 1 : 0.5} />;
      })}
    </svg>
  );
};

export const TogetherScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const next = cue("And the next day");
  const worked = cue("they worked together");
  const team = cue("“Teamwork");
  const day = interpolate(frame, [next - 6, next + 8], [0, 1], clamp);
  const build = interpolate(frame, [worked - 10, team - 4], [0.05, 1], clamp);
  const carry = (from: number, to: number, seed: number) => from + (to - from) * (0.5 + 0.5 * Math.sin((frame + seed * 20) / 22));
  return (
    <Camera from={1} to={1.05}>
      {/* dinner at dusk */}
      <AbsoluteFill style={{ opacity: 1 - day }}>
        <Street time="dusk" trees={[1840]}>
          <BrickHouse x={620} glow />
          <StringLights />
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute" }}>
            <rect x={1060} y={GROUND_Y - 150} width={440} height={26} rx={12} fill={C.trunk} />
            <rect x={1090} y={GROUND_Y - 130} width={18} height={130} rx={8} fill={C.trunkDark} />
            <rect x={1452} y={GROUND_Y - 130} width={18} height={130} rx={8} fill={C.trunkDark} />
            {[1150, 1280, 1410].map((x) => (
              <g key={x}>
                <path d={`M ${x - 40} ${GROUND_Y - 156} Q ${x} ${GROUND_Y - 110} ${x + 40} ${GROUND_Y - 156} Z`} fill={C.lavender} />
                <ellipse cx={x} cy={GROUND_Y - 156} rx={40} ry={8} fill={C.butterDark} />
                {[0, 1].map((i) => {
                  const t = ((frame + i * 25 + x) % 50) / 50;
                  return <path key={i} d={`M ${x - 8 + i * 16} ${GROUND_Y - 170 - t * 60} q 8 -12 0 -24`} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - t} />;
                })}
              </g>
            ))}
          </svg>
          <Pig kind="straw" x={1000} y={FEET} size={PIG * 0.9} hold="spoon" eyes="happy" seed={1} />
          <Pig kind="sticks" x={1290} y={FEET + 40} size={PIG * 0.9} hold="spoon" seed={4} />
          <Pig kind="brick" x={1580} y={FEET} size={PIG * 0.9} flip hold="spoon" eyes="happy" seed={7} />
          {[0, 1, 2].map((i) => (
            <Heart key={i} x={1180 + i * 100} y={470 - ((frame * 1.2 + i * 40) % 140)} size={44} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />
          ))}
        </Street>
      </AbsoluteFill>
      {/* building together the next day */}
      {day > 0 ? (
        <AbsoluteFill style={{ opacity: day }}>
          <Street trees={[1860]}>
            <BrickHouse x={400} />
            <BrickHouse x={960} build={build} solar={interpolate(build, [0.9, 1], [0, 1], clamp)} bell={interpolate(build, [0.9, 1], [0, 1], clamp)} />
            <BrickHouse x={1520} build={build} solar={interpolate(build, [0.9, 1], [0, 1], clamp)} bell={interpolate(build, [0.9, 1], [0, 1], clamp)} />
            {frame > team ? (
              <>
                <Pig kind="straw" x={690} y={FEET} size={PIG} cheer eyes="happy" />
                <Pig kind="sticks" x={1240} y={FEET} size={PIG} cheer eyes="happy" seed={3} />
                <Pig kind="brick" x={1750} y={FEET} size={PIG} flip cheer eyes="happy" mouthOpen={frame < team + 40 ? 0.6 : 0} seed={6} />
                {[0, 1, 2, 3].map((i) => (
                  <Heart key={i} x={700 + i * 330} y={480 - ((frame * 1.3 + i * 40) % 150)} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />
                ))}
              </>
            ) : (
              <>
                <Pig kind="straw" x={carry(640, 820, 0)} y={FEET} size={PIG} hold="brick" walk={1} flip={Math.cos((frame + 0) / 22) < 0} />
                <Pig kind="sticks" x={carry(1180, 1320, 1)} y={FEET} size={PIG} hold="brick" walk={1} flip={Math.cos((frame + 20) / 22) < 0} seed={3} />
                <Pig kind="brick" x={1750} y={FEET} size={PIG} flip hold="trowel" work seed={6} />
              </>
            )}
            <Bubble x={1720} y={pigHead({ x: 1750, y: FEET }).y} tail="right" width={520} fontSize={54} color={C.butter} text={{ en: "Teamwork makes it easy!", es: "¡En equipo es más fácil!" }} pop={popAt(frame, team, 8)} />
          </Street>
        </AbsoluteFill>
      ) : null}
    </Camera>
  );
};

/* ───────────────────────────── 10 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("take your time"), cue("take your time") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("It's fun to play"), cue("It's fun to play") + 16], [0, 1], clamp);
  const help = interpolate(frame, [cue("And helping"), cue("And helping") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: "#D5EEF8" }}>
      <Street trees={[]}>
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
            <div style={{ fontSize: 58, fontWeight: 700, color: PC.brickDark, marginBottom: 20 }}>
              {t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}
            </div>
            <div style={{ fontSize: 66, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
              {t({ en: "Take your time, and do your work well.", es: "Tómate tu tiempo y haz bien tu trabajo." })}
            </div>
            <div style={{ marginTop: 20, fontSize: 46, fontWeight: 500, color: C.lavenderDark, lineHeight: 1.25, opacity: echo }}>
              {t({ en: "It’s fun to play, but finish the job first.", es: "Jugar es divertido, pero primero termina la tarea." })}
            </div>
            <div style={{ marginTop: 12, fontSize: 46, fontWeight: 500, color: C.pinkDark, lineHeight: 1.25, opacity: help }}>
              {t({ en: "Helping each other makes everything stronger.", es: "Ayudarnos unos a otros hace todo más fuerte." })}
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
        <Pig kind="straw" x={150} y={1066} size={310} wave={end > 0} />
        <Pig kind="sticks" x={360} y={1066} size={310} dance={end > 0} seed={3} />
        <Pig kind="brick" x={1760} y={1066} size={310} flip cheer={end > 0} eyes={end > 0 ? "happy" : "open"} seed={6} />
      </Street>
    </AbsoluteFill>
  );
};
