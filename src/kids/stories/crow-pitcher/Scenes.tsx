/**
 * The Crow and the Pitcher — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Localized, type Placed } from "../../kit";
import { BeanPoles, GROUND_Y, Garden, RaisedBed, RecycleBin, Shed, Sprinkler, Sunflower } from "./Backgrounds";
import { Bee, Crow, FallingPebble, PC, PebbleShape, Pitcher, Robot, Snail, pitcherRim, toScene, type CrowPose } from "./Characters";
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

const FEET = GROUND_Y + 20;
const PIP = 260;

const crowHead = (p: Placed) => toScene({ size: PIP, ...p }, { x: 250, y: 70 });

/** Big wobbly sound word ("Heave!", "Plink!"). */
const Shout: React.FC<{ x: number; y: number; text: Localized; pop: number; color?: string; size?: number }> = ({ x, y, text, pop, color = C.pinkDark, size = 100 }) => {
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

/** A little sweat drop (it's hot!). */
const Sweat: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) => {
  const frame = useCurrentFrame();
  if (!on) return null;
  const t = (frame % 40) / 40;
  return (
    <svg viewBox="-20 -30 40 50" width={40} height={50} style={{ position: "absolute", left: x - 20, top: y - 30 + t * 40, opacity: 1 - t }}>
      <path d="M 0 -26 Q 16 0 0 14 Q -16 0 0 -26 Z" fill={PC.water} />
    </svg>
  );
};

/** A glowing idea bulb. */
const Bulb: React.FC<{ x: number; y: number; pop: number }> = ({ x, y, pop }) => {
  const frame = useCurrentFrame();
  if (pop <= 0) return null;
  const glow = 0.6 + Math.sin(frame / 4) * 0.25;
  return (
    <svg viewBox="-80 -90 160 180" width={160} height={180} style={{ position: "absolute", left: x - 80, top: y - 90, scale: `${interpolate(pop, [0, 0.7, 1], [0, 1.2, 1])}`, overflow: "visible" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={-5} y={-86} width={10} height={24} rx={5} fill={C.butterDark} opacity={glow} style={{ rotate: `${i * 45}deg`, transformOrigin: "0px -10px" }} />
      ))}
      <circle cx={0} cy={-10} r={44} fill={C.butter} />
      <path d="M -14 -10 Q 0 10 14 -10" stroke={C.butterDark} strokeWidth={5} fill="none" />
      <rect x={-20} y={30} width={40} height={14} rx={5} fill={C.lavenderDark} />
      <rect x={-16} y={46} width={32} height={10} rx={5} fill={C.lavenderDark} />
    </svg>
  );
};

/** A stack of upturned flowerpots with a little heap of pebbles on top. Top centre at (x, top). */
const PotStack: React.FC<{ x: number; top: number; pebbles: number }> = ({ x, top, pebbles }) => {
  const h = FEET - top;
  const pot = h / 3;
  return (
    <svg viewBox={`-150 0 300 ${h}`} width={300} height={h} style={{ position: "absolute", left: x - 150, top, overflow: "visible" }}>
      {[0, 1, 2].map((i) => {
        const y = i * pot;
        const wTop = 70 + i * 14;
        const wBot = 100 + i * 14;
        return (
          <g key={i}>
            <path d={`M ${-wTop} ${y + 22} L ${wTop} ${y + 22} L ${wBot} ${y + pot} L ${-wBot} ${y + pot} Z`} fill="#F2B79B" />
            <rect x={-wTop - 6} y={y} width={(wTop + 6) * 2} height={26} rx={8} fill="#E8A486" />
          </g>
        );
      })}
      {Array.from({ length: Math.max(0, Math.round(pebbles)) }).map((_, i) => (
        <PebbleShape key={i} cx={-36 + (i % 4) * 24 + (i >= 4 ? 12 : 0)} cy={-12 - (i >= 4 ? 20 : 0)} r={14} tone={i} />
      ))}
    </svg>
  );
};

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Crow", es: "El Cuervo" }), t({ en: "and the Pitcher", es: "y la Jarra" })];
  const fly = interpolate(frame, [0, 50], [0, 1], { ...clamp, easing: easeOut });
  const landed = frame >= 50;
  return (
    <Garden
      scenery={
        <>
          <RaisedBed x={60} w={420} />
          <BeanPoles x={1720} />
        </>
      }
    >
      <Pitcher id="title" x={1500} y={FEET} h={380} level={0.14} shine={frame / 10} />
      <Crow
        x={interpolate(fly, [0, 1], [-200, 1180])}
        y={interpolate(fly, [0, 0.7, 1], [420, 520, FEET])}
        size={PIP}
        pose={landed ? (frame > 64 ? "cheer" : "stand") : "fly"}
        eyes="happy"
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 380 }}>
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
              key={i}
              style={{
                fontSize: 124,
                fontWeight: 700,
                color: i === 0 ? PC.crowDark : "#6FB7DA",
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
    </Garden>
  );
};

/* ───────────────────────────── 2 · A hot day ───────────────────────────── */

export const GardenScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const cue = useCue(scene);
  const blazing = cue("The sun was blazing");
  const drooping = cue("the flowers were drooping");
  const asleep = cue("the sprinklers were fast asleep");
  const sunset = cue("They only switched on");
  const thirsty = cue("“I’m so thirsty!”");
  const droop = interpolate(frame, [drooping, drooping + 30], [0, 1], { ...clamp, easing: easeInOut });
  const flyX = interpolate(frame, [0, sunset], [-160, 1150], { ...clamp, easing: easeInOut });
  const land = interpolate(frame, [sunset, thirsty - 6], [0, 1], { ...clamp, easing: easeInOut });
  const x = flyX + land * 250;
  const y = interpolate(land, [0, 1], [380 + Math.sin(frame / 10) * 20, FEET]);
  const landed = land >= 1;
  const sunPulse = frame >= blazing ? 1 + Math.sin((frame - blazing) / 5) * 0.08 : 1;
  const P: Placed = { x, y, size: PIP };
  const head = crowHead(P);
  return (
    <Camera from={1} to={1.04}>
      <Garden
        heat
        scenery={
          <>
            {frame >= blazing ? <circle cx={1580} cy={170} r={150 * sunPulse} fill={C.butter} opacity={0.35 * popAt(frame, blazing, 12)} /> : null}
            <RaisedBed x={80} w={420} droop={droop} />
            <Sunflower x={640} droop={droop} seed={1} />
            <Sunflower x={760} h={290} droop={droop} seed={2} />
            <Sprinkler x={1080} zzz={frame >= asleep} />
            <BeanPoles x={1700} />
          </>
        }
      >
        {/* timer pop-up: "on at sunset" */}
        {frame >= sunset ? (
          <div
            style={{
              position: "absolute",
              left: 1000,
              top: 470,
              width: 360,
              background: C.cream,
              borderRadius: 30,
              padding: "16px 20px",
              textAlign: "center",
              fontSize: 40,
              fontWeight: 700,
              color: C.ink,
              boxShadow: "0 8px 0 rgba(94,75,110,0.12)",
              scale: `${interpolate(popAt(frame, sunset, 10), [0, 0.7, 1], [0, 1.1, 1])}`,
              opacity: interpolate(frame, [thirsty - 10, thirsty], [1, 0], clamp),
            }}
          >
            {t({ en: "ON at sunset 🌅", es: "Se enciende al atardecer 🌅" })}
          </div>
        ) : null}
        <Crow {...P} pose={landed ? "stand" : "fly"} eyes={landed ? "worried" : "open"} mouthOpen={frame >= thirsty && frame < thirsty + 40 ? 0.8 : 0} headTilt={landed ? 8 : 0} />
        <Sweat x={head.x - 70} y={head.y + 30} on={landed} />
        <Bubble x={head.x + 10} y={head.y - 10} tail="right" width={480} fontSize={52} text={{ en: "I’m so thirsty!", es: "¡Tengo mucha sed!" }} pop={popAt(frame, thirsty, 8)} />
      </Garden>
    </Camera>
  );
};

/* ───────────────────────────── 3 · The pitcher ───────────────────────────── */

export const PitcherScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const cue = useCue(scene);
  const shiny = cue("something shiny");
  const tall = cue("A tall glass pitcher!");
  const bottom = cue("And at the very bottom");
  const pushed = cue("Pip pushed her beak");
  const reach = cue("but she couldn’t reach");
  const short = cue("Her beak was just too short.");
  const PX = 1080;
  const H = 470;
  const rim = pitcherRim(PX, FEET, H);
  const hopT = interpolate(frame, [tall, tall + 30], [0, 1], { ...clamp, easing: easeInOut });
  const up = interpolate(frame, [pushed - 12, pushed + 4], [0, 1], { ...clamp, easing: easeInOut });
  const down = interpolate(frame, [short, short + 14], [0, 1], { ...clamp, easing: easeInOut });
  const perched = up > 0 && down < 1;
  const groundX = interpolate(hopT, [0, 1], [480, 800]);
  const perchFeet = { x: rim.x - rim.w / 2 - 6, y: rim.y + 4 };
  const x = perched ? interpolate(up - down, [0, 1], [800, perchFeet.x]) : groundX;
  const y = perched ? interpolate(up - down, [0, 1], [FEET, perchFeet.y]) - Math.sin((up - down) * Math.PI) * 120 : FEET - (hopT > 0 && hopT < 1 ? Math.abs(Math.sin(hopT * Math.PI * 3)) * 50 : 0);
  const diving = up >= 1 && frame >= pushed + 6 && frame < short;
  const pose: CrowPose = diving ? "peck" : perched && up < 1 ? "fly" : "stand";
  const waterTop = { x: PX + 20, y: FEET - H + (H / 160) * (158 - 0.14 * 150) };
  const beakTip = { x: perchFeet.x + 137 * (PIP / 220), y: perchFeet.y + 66 * (PIP / 220) };
  const gap = frame >= reach && frame < short ? popAt(frame, reach, 10) : 0;
  const P: Placed = { x, y, size: PIP };
  const head = crowHead(P);
  return (
    <Camera from={1} to={1.06}>
      <Garden
        scenery={
          <>
            <Sunflower x={170} droop={1} seed={3} />
            <RaisedBed x={1480} w={420} droop={0.8} />
            <BeanPoles x={1330} />
          </>
        }
      >
        <Pitcher id="p3" x={PX} y={FEET} h={H} level={0.14} shine={frame >= shiny ? (frame - shiny) / 8 : 0} />
        {frame >= bottom && frame < pushed ? (
          <svg viewBox="-60 -60 120 120" width={120} height={120} style={{ position: "absolute", left: waterTop.x - 60, top: waterTop.y - 150 + Math.sin(frame / 4) * 10, opacity: popAt(frame, bottom, 10) }}>
            <path d="M -18 -50 L 18 -50 L 18 0 L 40 0 L 0 46 L -40 0 L -18 0 Z" fill={C.pinkDark} />
          </svg>
        ) : null}
        <Crow {...P} pose={pose} eyes={frame >= reach && frame < short + 10 ? "worried" : frame >= shiny && frame < pushed ? "wide" : "open"} headTilt={frame >= shiny && frame < tall ? -10 : 0} mouthOpen={frame >= reach && frame < reach + 30 ? 0.5 : 0} />
        <Pitcher id="p3f" x={PX} y={FEET} h={H} front />
        {gap > 0 ? (
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: gap }}>
            <line x1={beakTip.x} y1={beakTip.y + 14} x2={beakTip.x} y2={waterTop.y - 10} stroke={C.pinkDark} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" />
          </svg>
        ) : null}
        {gap > 0 ? <Shout x={beakTip.x + 230} y={(beakTip.y + waterTop.y) / 2} text={{ en: "Too far!", es: "¡Muy lejos!" }} pop={gap} size={80} /> : null}
        {frame >= tall && frame < bottom + 20 ? <Bubble x={head.x + 20} y={head.y} tail="left" width={420} fontSize={48} text={{ en: "Water!", es: "¡Agua!" }} pop={popAt(frame, bottom, 8)} /> : null}
        {frame >= short ? <Shout x={760} y={300} text={t({ en: "Too short!", es: "¡Muy corto!" })} pop={popAt(frame, short, 10)} size={90} color={PC.crowDark} /> : null}
      </Garden>
    </Camera>
  );
};

/* ───────────────────────────── 4 · Pip tries ───────────────────────────── */

export const TriesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const heave = cue("Heave!");
  const stretched = cue("She stretched up");
  const notClose = cue("Not even close!");
  const snail = cue("A sleepy snail");
  const tooHard = cue("“Too hard");
  const no = cue("“No,” said Pip");
  const think = cue("“I’m going to think.”");
  const PX = 920;
  const H = 470;
  const rim = pitcherRim(PX, FEET, H);
  const wobble = frame >= heave && frame < heave + 40 ? Math.sin((frame - heave) / 2.5) * 2.4 * (1 - (frame - heave) / 40) : 0;
  const pose: CrowPose = frame < stretched ? (frame >= heave - 20 ? "push" : "stand") : frame < snail ? "stretch" : frame >= think ? "think" : "stand";
  const P: Placed = { x: 650, y: FEET, size: PIP };
  const head = crowHead(P);
  const peek = interpolate(frame, [snail, snail + 24], [0, 1], { ...clamp, easing: easeOut });
  const S: Placed = { x: 1330, y: FEET + 6, size: 300, flip: true };
  const sHead = toScene(S, { x: 330, y: 200 });
  const measure = frame >= notClose - 10 && frame < snail ? popAt(frame, notClose - 10, 10) : 0;
  return (
    <Camera from={1} to={1.05}>
      <Garden
        scenery={
          <>
            <RaisedBed x={40} w={360} droop={0.8} />
            <BeanPoles x={1720} />
          </>
        }
      >
        <Pitcher id="p4" x={PX} y={FEET} h={H} level={0.14} rotate={wobble} />
        <Pitcher id="p4f" x={PX} y={FEET} h={H} front rotate={wobble} />
        <Crow {...P} pose={pose} eyes={frame >= no && frame < think ? "determined" : frame >= heave && frame < stretched ? "worried" : frame >= think ? "open" : "open"} mouthOpen={frame >= heave && frame < heave + 16 ? 0.8 : 0} />
        <Sweat x={head.x - 60} y={head.y + 40} on={frame >= heave + 10 && frame < stretched} />
        <Shout x={head.x + 40} y={head.y - 80} text={{ en: "Heave!", es: "¡Upa!" }} pop={frame < stretched - 6 ? popAt(frame, heave, 8) : 0} />
        {measure > 0 ? (
          <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: measure }}>
            <line x1={560} y1={rim.y} x2={rim.x + rim.w / 2 + 40} y2={rim.y} stroke={C.pinkDark} strokeWidth={8} strokeDasharray="4 18" strokeLinecap="round" />
            <path d={`M 560 ${rim.y + 20} L 560 ${head.y - 34}`} stroke={C.pinkDark} strokeWidth={8} strokeLinecap="round" />
            <path d={`M 544 ${rim.y + 36} L 560 ${rim.y + 16} L 576 ${rim.y + 36}`} stroke={C.pinkDark} strokeWidth={8} fill="none" strokeLinecap="round" />
          </svg>
        ) : null}
        <Shout x={420} y={rim.y - 60} text={{ en: "Not even close!", es: "¡Ni de cerca!" }} pop={measure > 0 ? popAt(frame, notClose, 8) : 0} size={70} color={PC.crowDark} />
        <Snail {...S} peek={peek} eyes={frame < no ? "sleepy" : "wide"} mouthOpen={frame >= tooHard && frame < no ? Math.abs(Math.sin(frame / 3)) * 0.7 : 0} />
        <Bubble x={sHead.x - 20} y={sHead.y - 30} tail="right" width={560} fontSize={46} text={{ en: "Too hard, little crow. Why not give up?", es: "Es muy difícil, cuervita. ¿Por qué no te rindes?" }} pop={frame < no ? popAt(frame, tooHard, 8) : 0} />
        <Bubble x={head.x + 10} y={head.y - 10} tail="left" width={500} fontSize={50} color={C.butter} text={{ en: "No! I’m going to think.", es: "¡No! Voy a pensar." }} pop={popAt(frame, no, 8)} />
        {frame >= think + 10
          ? [0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: head.x - 140 - i * 46,
                  top: head.y - 40 - i * 40,
                  width: 26 + i * 12,
                  height: 26 + i * 12,
                  borderRadius: "50%",
                  background: C.cream,
                  boxShadow: "0 5px 0 rgba(94,75,110,0.12)",
                  scale: `${popAt(frame, think + 10 + i * 8, 8)}`,
                }}
              />
            ))
          : null}
      </Garden>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The poster ───────────────────────────── */

export const PosterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const shed = cue("On the shed");
  const showed = cue("It showed a glass");
  const drop = cue("“Drop stones");
  const thatsIt = cue("“That’s it!”");
  const experiment = cue("“An experiment!”");
  const zoom = interpolate(frame, [shed, shed + 40, thatsIt - 10, thatsIt + 20], [1, 1.28, 1.28, 1], { ...clamp, easing: easeInOut });
  const posterT = interpolate(frame, [drop, drop + 75], [0, 1], clamp);
  const looking = frame < shed ? Math.sin(frame / 12) * 12 : 0;
  const cheering = frame >= thatsIt;
  const P: Placed = { x: 1180, y: FEET, size: PIP, flip: frame < shed + 10 ? Math.floor(frame / 30) % 2 === 1 : !cheering };
  const head = crowHead(P);
  return (
    <AbsoluteFill style={{ scale: `${zoom}`, transformOrigin: "420px 690px" }}>
      <Garden
        scenery={
          <>
            <RecycleBin x={1460} />
            <Sunflower x={1620} droop={0.9} seed={4} />
            <BeanPoles x={1820} h={460} />
          </>
        }
      >
        <Shed x={160} w={640} posterT={posterT} />
        {frame >= showed && frame < drop + 80
          ? [0, 1].map((i) => <Sparkle key={i} x={240 + i * 340} y={560 + i * 30} size={50} t={(frame - showed - i * 6) / 6} />)
          : null}
        <Pitcher id="p5" x={1660} y={FEET} h={300} level={0.14} />
        <Crow {...P} pose={cheering ? "cheer" : "stand"} eyes={cheering ? "happy" : frame >= drop ? "wide" : "open"} headTilt={looking} hop={cheering && frame < thatsIt + 30 ? 1 : 0} mouthOpen={frame >= experiment && frame < experiment + 30 ? 0.8 : 0} />
        <Bulb x={head.x - 10} y={head.y - 130} pop={popAt(frame, thatsIt, 10)} />
        {cheering ? [0, 1, 2, 3].map((i) => <Sparkle key={i} x={head.x - 200 + i * 130} y={head.y - 40 - (i % 2) * 80} size={56} t={(frame - thatsIt - i * 5) / 6} />) : null}
        <Bubble x={head.x - 30} y={head.y - 40} tail="right" width={480} fontSize={52} color={C.butter} text={{ en: "An experiment!", es: "¡Un experimento!" }} pop={popAt(frame, experiment, 8)} />
      </Garden>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── 6 · The robot ───────────────────────────── */

export const RobotScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const tray = cue("carrying a tray");
  const excuse = cue("“Excuse me,”");
  const blinked = cue("The robot blinked");
  const beep = cue("“Beep boop!");
  const arrive = tray + 50;
  const rx = interpolate(frame, [0, arrive], [2250, 1340], { ...clamp, easing: easeOut });
  const R: Placed = { x: rx, y: FEET, size: 400 };
  const rHead = toScene(R, { x: 280, y: 160 });
  const P: Placed = { x: 800, y: FEET, size: PIP };
  const head = crowHead(P);
  return (
    <Camera from={1} to={1.05}>
      <Garden
        scenery={
          <>
            <RaisedBed x={1250} w={600} droop={0.7} />
            <Sunflower x={120} droop={0.9} seed={5} />
          </>
        }
      >
        <Pitcher id="p6" x={420} y={FEET} h={400} level={0.14} />
        <Pitcher id="p6f" x={420} y={FEET} h={400} front />
        <Robot {...R} rolling={frame < arrive} pebbles={8} blink={frame >= blinked} love={frame >= beep} />
        <Crow {...P} pose={frame >= beep + 10 ? "cheer" : "stand"} eyes={frame >= beep + 10 ? "happy" : frame >= tray - 10 && frame < excuse ? "wide" : "open"} headTilt={frame >= excuse && frame < blinked ? 8 : 0} mouthOpen={frame >= excuse && frame < blinked ? Math.abs(Math.sin(frame / 3)) * 0.6 : 0} hop={frame >= beep + 10 ? 0.6 : 0} />
        {frame >= tray && frame < excuse ? [0, 1, 2].map((i) => <Sparkle key={i} x={rx - 90 + i * 90} y={FEET - 300 - (i % 2) * 40} size={44} t={(frame - tray - i * 5) / 6} />) : null}
        <Bubble x={head.x + 20} y={head.y - 10} tail="left" width={560} fontSize={48} text={{ en: "May I borrow a few pebbles, please?", es: "¿Me prestas unas piedritas, por favor?" }} pop={frame < beep ? popAt(frame, excuse, 8) : 0} />
        <Bubble x={rHead.x} y={rHead.y - 40} tail="right" width={480} fontSize={52} color={C.mint} text={{ en: "Beep boop! Yes, you may!", es: "¡Bip bup! ¡Sí, claro!" }} pop={popAt(frame, beep, 8)} />
        {frame >= beep ? [0, 1, 2].map((i) => <Heart key={i} x={rHead.x - 60 + i * 70} y={rHead.y - 200 - ((frame - beep) * 1.4 + i * 30) % 120} size={44} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />) : null}
      </Garden>
    </Camera>
  );
};

/* ───────────────────────────── 7 · Plink, plink ───────────────────────────── */

const BIG = { x: 960, h: 560 };
const LEVEL0 = 0.14;
const PER_PEBBLE = 0.087;
const PERCH = { x: 845, y: pitcherRim(BIG.x, FEET, BIG.h).y + 2 };
const STACK = { x: 650, top: 440 };

/** Where Pip is and what she's doing, given the landing frames of each pebble. */
const pipCycle = (frame: number, lands: number[]) => {
  const next = lands.findIndex((d) => frame < d + 4);
  if (next < 0) return { pose: "stand" as CrowPose, flip: false, pebble: false, open: 0 };
  const d = lands[next];
  if (frame < d - 26) return { pose: "stand" as CrowPose, flip: false, pebble: false, open: 0 };
  if (frame < d - 17) return { pose: "peck" as CrowPose, flip: true, pebble: false, open: 0.3 };
  if (frame < d - 10) return { pose: "stand" as CrowPose, flip: false, pebble: true, open: 0 };
  return { pose: "drop" as CrowPose, flip: false, pebble: false, open: 0.9 };
};

const landedCount = (frame: number, lands: number[]) => lands.filter((d) => frame >= d).length;

const BEAK_DROP = { x: PERCH.x + 161 * (PIP / 260), y: PERCH.y - 87 * (PIP / 260) };

export const PebblesScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const one = cue("Plink! One.");
  const two = cue("Plink! Two.");
  const three = cue("Plink! Three.");
  const every = cue("With every pebble");
  const stretched = cue("The snail stretched");
  const working = cue("“It’s working!”");
  const lands = [cue("One by one") + 30, one + 6, two + 6, three + 6, every + 20, every + 50];
  const count = landedCount(frame, lands);
  const level = LEVEL0 + count * PER_PEBBLE;
  const c = pipCycle(frame, lands);
  const bed = { x: BIG.x, y: FEET - 40 };
  const S: Placed = { x: 320, y: FEET + 6, size: 300 };
  const sHead = toScene(S, { x: 330, y: 200 });
  const numbers = [one, two, three];
  return (
    <Camera from={1.02} to={1.06}>
      <Garden backdrop={false} scenery={<BeanPoles x={1560} h={600} />}>
        <PotStack x={STACK.x} top={STACK.top} pebbles={8 - count} />
        <Pitcher id="p7" x={BIG.x} y={FEET} h={BIG.h} level={level} pebbles={count} />
        {lands.map((d, i) => (
          <FallingPebble key={i} a={BEAK_DROP} b={bed} t={(frame - (d - 10)) / 10} r={16} />
        ))}
        <Crow x={PERCH.x} y={PERCH.y} size={PIP} pose={c.pose} flip={c.flip} pebble={c.pebble} mouthOpen={c.open} eyes={frame >= working ? "happy" : "open"} />
        <Pitcher id="p7f" x={BIG.x} y={FEET} h={BIG.h} front />
        {lands.map((d, i) => (
          <Shout key={i} x={BIG.x + 330} y={500 - (i % 2) * 70} text={{ en: "Plink!", es: "¡Plin!" }} pop={frame >= d && frame < d + 22 ? popAt(frame, d, 6) : 0} size={80} color="#6FB7DA" />
        ))}
        {numbers.map((n, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 1320 + i * 150,
              top: 600,
              width: 120,
              height: 120,
              borderRadius: 60,
              background: C.cream,
              color: PC.crowDark,
              fontSize: 84,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: "120px",
              boxShadow: "0 8px 0 rgba(94,75,110,0.12)",
              scale: `${interpolate(popAt(frame, n + 8, 10), [0, 0.7, 1], [0, 1.2, 1])}`,
              opacity: interpolate(frame, [every + 10, every + 24], [1, 0], clamp),
            }}
          >
            {i + 1}
          </div>
        ))}
        <Snail {...S} peek={1} stretch={frame >= stretched ? popAt(frame, stretched, 20) : 0} eyes={frame >= working ? "happy" : "wide"} mouthOpen={frame >= working && frame < working + 30 ? 0.8 : 0} />
        <Bubble x={sHead.x + 10} y={sHead.y - 90} tail="left" width={440} fontSize={52} color={C.butter} text={{ en: "It’s working!", es: "¡Está funcionando!" }} pop={popAt(frame, working, 8)} />
      </Garden>
    </Camera>
  );
};

/* ───────────────────────────── 8 · A long, cool drink ───────────────────────────── */

export const DrinkScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const atLast = cue("At last");
  const drink = cue("Pip took a long");
  const ahh = cue("“Ahhh!”");
  const shared = cue("Then she shared");
  const snailToo = cue("and the snail too");
  const back = cue("and put every pebble back");
  const sunsetAt = cue("And at sunset");
  const whoosh = cue("the sprinklers whooshed");
  const danced = cue("everyone danced");
  const quick = [10, 24, 38].map((d) => d + scene.lead * 30);
  const count = 6 + quick.filter((d) => frame >= d).length;
  const returnT = interpolate(frame, [back, sunsetAt - 10], [0, 8], clamp);
  const returned = Math.floor(returnT);
  const inPitcher = Math.max(0, count - returned);
  const level = Math.min(0.92, LEVEL0 + inPitcher * PER_PEBBLE);
  const a = phase(frame, 0, sunsetAt);
  const b = phase(frame, sunsetAt);
  const drinking = frame >= drink && frame < ahh;
  const beeT = interpolate(frame, [shared, shared + 30], [0, 1], { ...clamp, easing: easeInOut });
  const R: Placed = { x: 1480, y: FEET, size: 380 };
  const trayAt = toScene(R, { x: 200, y: 130 });
  const S: Placed = { x: 320, y: FEET + 6, size: 300 };
  const sHead = toScene(S, { x: 330, y: 200 });
  const head = crowHead({ x: PERCH.x, y: PERCH.y });
  const sunset = interpolate(frame, [sunsetAt, sunsetAt + 40], [0, 1], clamp);
  const spray = interpolate(frame, [whoosh, whoosh + 16], [0, 1], clamp);
  const dance = frame >= danced - 10;
  return (
    <>
      <Phase o={a}>
        <Camera from={1.04} to={1.0}>
          <Garden backdrop={false} scenery={<BeanPoles x={1720} h={600} />}>
            <PotStack x={STACK.x} top={STACK.top} pebbles={0} />
            <Pitcher id="p8" x={BIG.x} y={FEET} h={BIG.h} level={level} pebbles={inPitcher} />
            {quick.map((d, i) => (
              <FallingPebble key={i} a={BEAK_DROP} b={{ x: BIG.x, y: FEET - 60 }} t={(frame - (d - 10)) / 10} r={16} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <FallingPebble key={`r${i}`} a={{ x: BIG.x + 40, y: PERCH.y - 20 }} b={{ x: trayAt.x - 60 + (i % 4) * 40, y: trayAt.y }} t={(returnT - i) * 1.2} r={16} />
            ))}
            <Robot {...R} pebbles={returned} love={frame >= back} />
            <Crow
              x={PERCH.x}
              y={PERCH.y}
              size={PIP}
              pose={frame < atLast ? "drop" : drinking ? "drink" : frame >= shared ? "cheer" : "stand"}
              mouthOpen={frame < atLast ? 0.9 : frame >= ahh && frame < ahh + 24 ? 0.9 : 0}
              eyes={drinking || frame >= ahh ? "happy" : "wide"}
            />
            <Pitcher id="p8f" x={BIG.x} y={FEET} h={BIG.h} front />
            {frame >= atLast && frame < drink ? [0, 1, 2].map((i) => <Sparkle key={i} x={BIG.x - 80 + i * 80} y={PERCH.y + 20 - (i % 2) * 50} size={50} t={(frame - atLast - i * 5) / 6} />) : null}
            <Bubble x={head.x + 40} y={head.y - 20} tail="left" width={300} fontSize={60} color={C.mint} text={{ en: "Ahhh!", es: "¡Aaah!" }} pop={frame < shared + 10 ? popAt(frame, ahh, 8) : 0} />
            <Bee x={interpolate(beeT, [0, 1], [1950, BIG.x + 90])} y={interpolate(beeT, [0, 1], [260, PERCH.y + 10]) + Math.sin(frame / 5) * 10} size={110} flip happy={beeT >= 1} />
            {/* the snail's leaf cup of water */}
            {frame >= snailToo ? (
              <svg viewBox="-80 -40 160 80" width={160} height={80} style={{ position: "absolute", left: 500, top: FEET - 70, scale: `${popAt(frame, snailToo, 10)}` }}>
                <path d="M -70 0 Q 0 50 70 0 Q 0 -10 -70 0 Z" fill={C.leafDark} />
                <ellipse cx={0} cy={6} rx={46} ry={10} fill={PC.water} />
              </svg>
            ) : null}
            <Snail {...S} eyes={frame >= snailToo ? "happy" : "open"} />
            {frame >= snailToo ? [0, 1].map((i) => <Heart key={i} x={sHead.x - 40 + i * 70} y={sHead.y - 60 - ((frame - snailToo) * 1.2 + i * 40) % 100} size={40} beat={0.2} color={i ? C.pink : C.pinkDark} />) : null}
          </Garden>
        </Camera>
      </Phase>
      <Phase o={b}>
        <Garden
          sunset={sunset}
          scenery={
            <>
              <RaisedBed x={40} w={360} droop={1 - spray} />
              <Sunflower x={470} droop={1 - spray} seed={6} />
              <Sprinkler x={720} spray={spray} />
              <Sprinkler x={1250} spray={spray} />
              <BeanPoles x={1840} h={460} />
            </>
          }
        >
          <Pitcher id="p8b" x={1660} y={FEET} h={300} level={0.6} pebbles={0} />
          <Snail x={540} y={FEET + 6} size={270} dance={dance} eyes="happy" seed={1} />
          <Crow x={960} y={FEET} size={PIP} pose={dance ? "dance" : "stand"} eyes="happy" seed={2} />
          <Robot x={1380} y={FEET} size={300} love blink={dance} pebbles={8} seed={3} />
          <Bee x={960 + Math.cos(frame / 14) * 260} y={420 + Math.sin(frame / 14) * 80} size={100} flip={Math.sin(frame / 14) > 0} happy />
          {dance ? [0, 1, 2, 3].map((i) => <Sparkle key={i} x={500 + i * 300} y={330 + (i % 2) * 90} size={54} t={(frame - danced - i * 6) / 7} color={C.pink} />) : null}
        </Garden>
      </Phase>
    </>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("little by little"), cue("little by little") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("When something seems"), cue("When something seems") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <Garden sunset={0.5}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 200 }}>
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
          <div style={{ fontSize: 58, fontWeight: 700, color: PC.crowDark, marginBottom: 20 }}>{t({ en: "The Moral of the Story", es: "La moraleja del cuento" })}</div>
          <div style={{ fontSize: 66, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            {t({ en: "Little by little does the trick.", es: "Poquito a poquito se logra mucho." })}
          </div>
          <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.pinkDark, lineHeight: 1.25, opacity: echo }}>
            {t({ en: "Too hard? Stop, think, and try a new idea, just like a scientist!", es: "¿Muy difícil? Detente, piensa y prueba una idea nueva, ¡como una científica!" })}
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
      <Crow x={200} y={1070} size={300} pose={end > 0 ? "cheer" : "stand"} eyes={end > 0 ? "happy" : "open"} />
      <Snail x={1500} y={1070} size={230} flip eyes="happy" dance={end > 0} seed={2} />
      <Robot x={1760} y={1070} size={300} love={end > 0} seed={3} />
      <Bee x={1630} y={720 + Math.sin(frame / 8) * 16} size={100} flip happy />
    </Garden>
  );
};
