/**
 * The scenes of the Odyssey stickman cartoon. Each scene is a pure function of its
 * local frame `f` and draws into a shared 1080×1920 SVG. The story beats (narration,
 * chapter titles, years) live in `OdysseyStickman.tsx`; this file is only pictures.
 *
 * Layout contract: keep the action between y≈300 and y≈1420 — the HUD sits above and
 * the narration card below.
 */

import React from "react";
import { Easing, interpolate } from "remotion";
import {
  Axe,
  Bag,
  Birds,
  Cloud,
  Flames,
  GRASS,
  Ground,
  Gusts,
  Heart,
  Horse,
  Island,
  Moon,
  Note,
  PAPER,
  Palace,
  Pig,
  Puff,
  RED,
  Raft,
  Rain,
  Rock,
  STONE,
  Scylla,
  Sea,
  Sheep,
  Ship,
  Smoke,
  Sparkle,
  Star,
  Sun,
  Walls,
  Whirlpool,
  Zzz,
} from "./Props";
import {
  INK,
  Stickman,
  cheerPose,
  cowerPose,
  hugPose,
  joints,
  pullPose,
  rowPose,
  runPose,
  sitPose,
  standPose,
  thrustPose,
  walkPose,
  wavePose,
  worldPoint,
  type Pose,
} from "./Stickman";

export type SceneProps = { f: number; d: number; font: string };

const iv = (f: number, input: number[], output: number[], ease?: (t: number) => number) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
const inOut = Easing.inOut(Easing.cubic);

/** Odysseus's costume — red crest and cape — so he reads instantly without a face. */
const HERO = { helmet: true, cape: RED } as const;
const PENELOPE = { dress: "#3b6ea5", hair: "#5a3a22" } as const;
const GREEK_CRESTS = ["#2f4f7f", "#3f6b3a", "#6b3f7a"];

const Night: React.FC<{ o: number }> = ({ o }) => <rect x={0} y={0} width={1080} height={1920} fill="#1e2a4a" opacity={o} />;

/* ------------------------------------------------------------------ 0 · intro */
export const Intro: React.FC<SceneProps> = ({ f, font }) => {
  const pop = iv(f, [0, 22], [0.6, 1], Easing.out(Easing.back(1.6)));
  return (
    <g>
      <Sun x={850} y={440} f={f} />
      <Cloud x={220 + f * 0.6} y={420} s={0.9} />
      <Birds f={f} x={300} y={620} />
      <Sea f={f} y={1150} />
      <Ship x={iv(f, [0, 120], [460, 620])} y={1250} f={f} s={1.25} crew={4} />
      <g transform={`translate(540 760) scale(${pop})`} opacity={iv(f, [0, 10], [0, 1])}>
        <text textAnchor="middle" fontFamily={font} fontSize={150} fill={INK} y={0}>
          THE
        </text>
        <text textAnchor="middle" fontFamily={font} fontSize={170} fill={RED} stroke={INK} strokeWidth={5} y={170}>
          ODYSSEY
        </text>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ 1 · Ithaca */
export const Ithaca: React.FC<SceneProps> = ({ f }) => {
  const walking = f > 60 && f < 150;
  const ox = iv(f, [60, 150], [450, 640], inOut);
  const oPose: Pose = walking ? walkPose(f) : f >= 150 ? wavePose(f) : standPose(f);
  const holdBaby: Pose = { lArm: [55, 110], rArm: [65, 120], lLeg: [-8, -8], rLeg: [8, 8] };
  const pPose: Pose = f > 90 ? { ...wavePose(f, 1), lArm: [55, 110] } : holdBaby;
  return (
    <g>
      <Sun x={880} y={430} f={f} />
      <Cloud x={300 + f * 0.4} y={470} s={0.8} />
      <Birds f={f} x={420} y={600} />
      <Sea f={f} y={1275} />
      <Ship x={930} y={1280} f={f} s={0.62} crew={3} />
      <Ground y={1250} from={-40} to={720} />
      <Palace x={210} y={1245} s={0.78} />
      <Stickman x={330} y={1250} pose={pPose} {...PENELOPE} baby />
      <Stickman x={ox} y={1250} face={f >= 150 || f <= 60 ? -1 : 1} pose={oPose} {...HERO} />
      {f < 80 ? <Heart x={390} y={iv(f, [5, 70], [1000, 860])} s={iv(f, [5, 25], [0, 1.2])} opacity={iv(f, [55, 78], [1, 0])} /> : null}
    </g>
  );
};

/* ------------------------------------------------------------------ 2 · sail to Troy */
export const SailToTroy: React.FC<SceneProps> = ({ f, d }) => (
  <g>
    <Sun x={900} y={440} f={f} />
    <Cloud x={180 + f * 0.6} y={460} s={0.8} />
    <Cloud x={760 + f * 0.4} y={620} s={0.6} />
    <Ship x={120 + f * 1.4} y={1035} f={f} s={0.42} oars={false} sail="#2f4f7f" />
    <Ship x={640 + f * 1.1} y={1010} f={f} s={0.36} oars={false} sail="#3f6b3a" />
    <Sea f={f} y={1080} />
    <Ship x={iv(f, [0, d], [280, 700])} y={1220} f={f} s={1.05} crew={3}>
      <Stickman x={120} y={-12} s={0.9} pose={{ lArm: [-12, -6], rArm: [100, 100], lLeg: [-8, -8], rLeg: [8, 8], lean: 6 }} {...HERO} />
    </Ship>
  </g>
);

/* ------------------------------------------------------------------ 3 · siege */
export const Siege: React.FC<SceneProps> = ({ f }) => {
  const ground = 1260;
  return (
    <g>
      <Sun x={180} y={430} f={f} r={55} />
      <Ground y={ground} color="#dcc48e" />
      {[640, 740, 840, 940, 1040].map((tx, i) => (
        <Stickman key={tx} x={tx} y={800} s={0.55} face={-1} pose={thrustPose(f, i)} helmet crest="#6b3f1f" item="spear" itemAngle={-20} />
      ))}
      <Walls left={580} top={730} ground={ground} f={f} />
      {[0, 1, 2, 3, 4].map((i) => {
        const t = ((f + i * 23) % 55) / 55;
        const sx = 650 + i * 80;
        const ex = 150 + i * 85;
        const ax = sx + (ex - sx) * t;
        const ay = 720 + (1150 - 720) * t - Math.sin(t * Math.PI) * 220;
        const vx = ex - sx;
        const vy = 430 - Math.cos(t * Math.PI) * Math.PI * 220;
        const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${ax} ${ay}) rotate(${ang})`}>
            <line x1={-34} y1={0} x2={22} y2={0} stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <path d="M 22 -7 L 36 0 L 22 7 Z" fill={INK} />
          </g>
        );
      })}
      {[110, 230, 350, 470].map((gx, i) => {
        const x = gx + Math.sin(f * 0.06 + i) * 26;
        const hero = i === 2;
        return (
          <g key={gx}>
            <circle cx={x - 20} cy={ground - 6} r={16 + Math.sin(f * 0.3 + i) * 5} fill="#c9b07c" opacity={0.7} />
            <Stickman
              x={x}
              y={ground}
              pose={thrustPose(f, i * 1.3)}
              helmet
              crest={hero ? RED : GREEK_CRESTS[i % 3]}
              cape={hero ? RED : undefined}
              shield
              item="spear"
              itemAngle={60}
            />
          </g>
        );
      })}
    </g>
  );
};

/* ------------------------------------------------------------------ 4 · Trojan horse */
export const TrojanHorse: React.FC<SceneProps> = ({ f }) => {
  const ground = 1260;
  const hx = iv(f, [0, 110], [230, 470], inOut);
  const night = iv(f, [105, 135], [0, 0.6]);
  const pullers = iv(f, [108, 125], [1, 0]);
  const hatch = iv(f, [138, 152], [0, 1]);
  const drops = [150, 166, 182].map((s, i) => ({
    y: iv(f, [s, s + 14], [ground - 135, ground], Easing.in(Easing.quad)),
    x: hx - 10 - iv(f, [s + 14, s + 40], [0, 80 + i * 70]),
    show: f >= s,
    hero: i === 0,
  }));
  return (
    <g>
      <Sun x={180} y={430 + night * 400} f={f} r={55} />
      <Ground y={ground} color="#dcc48e" />
      <Walls left={660} top={720} ground={ground} gate={880} gateOpen={1} f={f} />
      <Horse x={hx} y={ground} f={f} rolling={f < 110} hatch={hatch} />
      {pullers > 0 ? (
        <g opacity={pullers}>
          {[0, 1].map((i) => {
            const px = hx + 330 + i * 90;
            return (
              <g key={i}>
                <line x1={hx + 200} y1={ground - 340} x2={px - 36} y2={ground - 160} stroke="#7a4a1d" strokeWidth={5} />
                <Stickman x={px} y={ground} face={-1} pose={pullPose(f, i)} helmet crest="#6b3f1f" />
              </g>
            );
          })}
        </g>
      ) : null}
      {hatch > 0.5 ? (
        <line x1={hx - 40} y1={ground - 132} x2={hx - 30} y2={iv(f, [146, 154], [ground - 132, ground])} stroke="#7a4a1d" strokeWidth={5} />
      ) : null}
      {drops.map((s, i) =>
        s.show ? (
          <Stickman
            key={i}
            x={s.x}
            y={s.y}
            s={0.85}
            face={-1}
            pose={s.y < ground ? { lArm: [170, 180], rArm: [170, 180], lLeg: [-6, -6], rLeg: [6, 6] } : walkPose(f, 0.3, 22, i)}
            helmet
            crest={s.hero ? RED : GREEK_CRESTS[i]}
            cape={s.hero ? RED : undefined}
            item="sword"
          />
        ) : null,
      )}
      <Night o={night} />
      {night > 0
        ? Array.from({ length: 14 }, (_, i) => <Star key={i} x={(i * 173) % 1000 + 40} y={340 + ((i * 97) % 360)} f={f} i={i} />)
        : null}
      <Moon x={860} y={iv(f, [105, 150], [820, 470])} opacity={night / 0.6} />
    </g>
  );
};

/* ------------------------------------------------------------------ 5 · victory, sail home */
export const TroyFalls: React.FC<SceneProps> = ({ f, d }) => (
  <g>
    <Smoke x={760} y={880} f={f} />
    <Smoke x={960} y={890} f={f + 60} />
    <Walls left={640} top={900} ground={1110} f={f} />
    {[700, 820, 940, 1040].map((x, i) => (
      <Flames key={x} x={x} y={872} f={f + i * 7} s={0.8} />
    ))}
    <Sea f={f} y={1110} />
    <Ship x={iv(f, [0, d], [700, 320])} y={1240} f={f} face={-1} s={1.05}>
      {[-120, -40, 40].map((cx, i) => (
        <Stickman key={cx} x={cx} y={-12} s={0.75} pose={cheerPose(f, i)} helmet crest={i === 1 ? RED : GREEK_CRESTS[i]} cape={i === 1 ? RED : undefined} />
      ))}
    </Ship>
  </g>
);

/* ------------------------------------------------------------------ 6 · Cyclops */
export const Cyclops: React.FC<SceneProps> = ({ f }) => {
  const floor = 1300;
  const cx = 780;
  const cs = 2.3;
  const phase = f < 85 ? "roar" : f < 172 ? "sleep" : "hurt";
  const cPose: Pose =
    phase === "roar"
      ? { ...cheerPose(f * 0.5), lean: Math.sin(f * 0.4) * 4 }
      : phase === "sleep"
        ? sitPose(f)
        : { ...cowerPose(f), lLeg: [-10, -10], rLeg: [10, 10] };
  const eyeLocal = joints(sitPose(172)).head;
  const eye = worldPoint(eyeLocal, cx, floor, cs, -1);
  const charge = iv(f, [128, 172], [0, 1], Easing.in(Easing.quad));
  const menX = phase === "hurt" ? iv(f, [188, 240], [470, -160]) : f < 128 ? 230 : 230 + charge * 240;
  // The stake is carried at a fixed angle; when the charge completes (menX = 470) its tip lands on the eye.
  const stakeBase = { x: menX + 50, y: floor - 120 };
  const stakeTip = { x: stakeBase.x + (eye.x - 520), y: eye.y };
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#cdb998" />
      <path d="M -40 1960 L -40 300 Q 540 120 1120 300 L 1120 1960 Z" fill="#b8a27f" stroke={INK} strokeWidth={6} />
      <path d="M 60 1300 Q 70 560 540 470 Q 1010 560 1020 1300 Z" fill="#dcc9a6" stroke={INK} strokeWidth={6} />
      <rect x={-40} y={floor} width={1160} height={700} fill="#a8957a" stroke={INK} strokeWidth={6} />
      <circle cx={70} cy={1180} r={170} fill="#8f857a" stroke={INK} strokeWidth={6} />
      <Sheep x={440} y={floor} f={f} />
      <Sheep x={560} y={floor + 10} f={f + 20} />
      <Stickman x={cx} y={floor} s={cs} face={-1} pose={cPose} eye={phase === "roar" ? "open" : phase === "sleep" ? "shut" : "hurt"} color="#2c241c" />
      {phase === "sleep" ? <Zzz x={eye.x + 40} y={eye.y - 80} f={f} /> : null}
      {f >= 128 && f < 182 ? (
        <line
          x1={stakeBase.x}
          y1={stakeBase.y}
          x2={stakeTip.x}
          y2={stakeTip.y}
          stroke="#7a4a1d"
          strokeWidth={16}
          strokeLinecap="round"
        />
      ) : null}
      {[0, 1, 2].map((i) => (
        <Stickman
          key={i}
          x={menX - i * 75}
          y={floor}
          s={0.75}
          face={phase === "hurt" ? -1 : 1}
          pose={f < 128 ? cowerPose(f, i) : runPose(f, i)}
          helmet
          crest={i === 0 ? RED : GREEK_CRESTS[i]}
          cape={i === 0 ? RED : undefined}
        />
      ))}
      {f >= 170 && f < 196 ? (
        <g opacity={iv(f, [170, 176, 196], [0, 1, 0])}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <Sparkle key={a} x={eye.x + Math.sin((a * Math.PI) / 180) * 70} y={eye.y + Math.cos((a * Math.PI) / 180) * 70} r={26} rot={a} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ 7 · bag of winds */
export const BagOfWinds: React.FC<SceneProps> = ({ f }) => {
  const storm = iv(f, [108, 135], [0, 1]);
  const shipX = f < 110 ? iv(f, [0, 110], [360, 500]) : iv(f, [110, 210], [500, 170], Easing.out(Easing.quad));
  const islandX = iv(f, [110, 190], [860, 1320], Easing.in(Easing.quad));
  const open = iv(f, [96, 110], [0, 1]);
  return (
    <g>
      <Sun x={180} y={430} f={f} r={55} />
      <Island x={islandX} y={1110} s={0.5} f={f} palm={false} color={GRASS} />
      <Palace x={islandX} y={1065} s={0.22} />
      <text x={islandX} y={880} textAnchor="middle" fontFamily="Patrick Hand, sans-serif" fontSize={54} fill={INK} opacity={1 - storm}>
        ITHACA!
      </text>
      <Sea f={f} y={1120} amp={12 + storm * 22} speed={1 + storm} />
      <Ship x={shipX} y={1240} f={f} tilt={-storm * 9} crew={0}>
        <Stickman x={-120} y={-12} s={0.8} pose={sitPose(f)} {...HERO} />
        {storm < 0.5 ? <Zzz x={-110} y={-220} f={f} /> : null}
        <Bag x={80} y={-12} open={open} />
        <Stickman x={10} y={-12} s={0.75} pose={f < 110 ? pullPose(f) : cowerPose(f)} />
        <Stickman x={150} y={-12} s={0.75} face={-1} pose={f < 110 ? pullPose(f, 2) : cowerPose(f, 1)} />
      </Ship>
      <Puff x={shipX + 80} y={1150} t={iv(f, [106, 140], [0, 1])} color="#cfd6dd" />
      <rect x={0} y={0} width={1080} height={1920} fill="#5c6470" opacity={storm * 0.4} />
      <Gusts f={f} y={720} dir={-1} opacity={storm} />
      <Rain f={f} opacity={iv(f, [125, 145], [0, 1])} />
    </g>
  );
};

/* ------------------------------------------------------------------ 8 · Circe */
export const Circe: React.FC<SceneProps> = ({ f }) => {
  const ground = 1260;
  const menX = [520, 660, 800];
  const zap = iv(f, [52, 72], [0, 1]);
  const pigs = f >= 86 && f < 172;
  const oX = iv(f, [108, 150], [1180, 960], inOut);
  const aiming = f >= 40 && f < 80;
  const defeated = f >= 150;
  const cPose: Pose = defeated ? cowerPose(f) : aiming ? { ...standPose(f), rArm: [100, 100] } : standPose(f);
  return (
    <g>
      <Sun x={900} y={430} f={f} r={55} />
      <Ground y={ground} />
      <path d="M 40 1255 L 40 1010 Q 150 900 260 1010 L 260 1255 Z" fill={STONE} stroke={INK} strokeWidth={6} />
      <path d="M 20 1020 L 150 890 L 280 1020 Z" fill="#8a6a3c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Stickman x={290} y={ground} pose={cPose} dress="#7b4fa8" hair="#2a1a10" item={defeated ? null : "wand"} itemAngle={aiming ? 90 : 0} />
      {zap > 0 && zap < 1
        ? [0, 1, 2].map((i) => (
            <Sparkle key={i} x={400 + (menX[i] - 400) * zap} y={1080 - Math.sin(zap * Math.PI) * 120} r={20} rot={f * 10} />
          ))
        : null}
      {menX.map((x, i) =>
        pigs ? (
          <Pig key={x} x={x} y={ground} f={f + i * 9} face={-1} s={0.9} />
        ) : (
          <Stickman key={x} x={x} y={ground} face={-1} pose={f >= 172 ? cheerPose(f, i) : standPose(f, i)} helmet crest={GREEK_CRESTS[i]} />
        ),
      )}
      {menX.map((x) => (
        <React.Fragment key={x}>
          <Puff x={x} y={ground - 100} t={iv(f, [72, 100], [0, 1])} />
          <Puff x={x} y={ground - 100} t={iv(f, [160, 188], [0, 1])} color="#fff2b8" />
        </React.Fragment>
      ))}
      {f >= 108 ? (
        <Stickman x={oX} y={ground} face={-1} pose={f < 150 ? walkPose(f) : thrustPose(f)} {...HERO} item="sword" itemAngle={f < 150 ? 0 : 80} />
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ 9 · Sirens */
export const Sirens: React.FC<SceneProps> = ({ f, d }) => {
  const struggle = Math.sin(f * 0.6) * 9;
  return (
    <g>
      <Cloud x={260 + f * 0.3} y={460} s={0.8} />
      <Sea f={f} y={1150} />
      <Rock x={900} y={1190} w={380} h={300} />
      {[820, 970].map((x, i) => (
        <Stickman
          key={x}
          x={x}
          y={950 - i * 30}
          s={0.85}
          face={-1}
          pose={{ lArm: [-120, -150], rArm: [120 + Math.sin(f * 0.15 + i) * 15, 150], lLeg: [-8, -8], rLeg: [8, 8] }}
          hair={i ? "#c9a46a" : "#8a3a2a"}
          dress="#e9e1f2"
          wings="#ffffff"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const t = ((f * 0.9 + i * 30) % 200) / 200;
        return (
          <Note key={i} x={800 - t * 620} y={820 + Math.sin(t * 10 + i) * 50 + (i % 3) * 40} s={1 + (i % 2) * 0.3} />
        );
      })}
      <Ship x={iv(f, [0, d], [230, 470])} y={1250} f={f} crew={0}>
        <Stickman x={-150} y={30} s={0.6} pose={rowPose(f)} earplugs />
        <Stickman x={-80} y={30} s={0.6} pose={rowPose(f, 0.5)} earplugs />
        <Stickman x={110} y={30} s={0.6} pose={rowPose(f, 1)} earplugs />
        <Stickman
          x={0}
          y={-12}
          s={0.85}
          pose={{ lArm: [-25, -10], rArm: [-30, -15], lLeg: [-6, -6], rLeg: [6, 6], lean: struggle }}
          {...HERO}
        />
        {[-60, -110, -150].map((ry) => (
          <line key={ry} x1={-30} y1={ry} x2={30} y2={ry + 6} stroke="#7a4a1d" strokeWidth={9} strokeLinecap="round" />
        ))}
      </Ship>
    </g>
  );
};

/* ------------------------------------------------------------------ 10 · Scylla & Charybdis */
export const ScyllaCharybdis: React.FC<SceneProps> = ({ f, d }) => {
  const t = iv(f, [0, d], [0, 1], inOut);
  const grab = iv(f, [60, 85, 115], [0, 1, 0]);
  return (
    <g>
      <Sea f={f} y={1040} />
      <path d="M -40 1500 L -40 520 Q 120 480 210 640 Q 300 820 280 1050 Q 300 1300 240 1500 Z" fill="#a79c8c" stroke={INK} strokeWidth={6} />
      <Scylla x={250} y={940} f={f} grab={grab} />
      <Whirlpool x={840} y={1270} f={f} s={1} />
      <Ship x={iv(t, [0, 1], [520, 560])} y={iv(t, [0, 1], [1380, 1090])} f={f} s={iv(t, [0, 1], [0.95, 0.42])} crew={f < 95 ? 4 : 3} />
    </g>
  );
};

/* ------------------------------------------------------------------ 11 · Calypso */
export const Calypso: React.FC<SceneProps> = ({ f }) => {
  const cycle = (Math.sin(f * 0.13 - Math.PI / 2) + 1) / 2;
  const marks = Math.floor(iv(f, [10, 190], [0, 7]));
  return (
    <g>
      <Sun x={((f * 9) % 1300) - 110} y={620 - Math.sin((((f * 9) % 1300) / 1300) * Math.PI) * 220} f={f} r={50} />
      <Sea f={f} y={1250} />
      {[150, 950].map((x, i) => (
        <rect key={x} x={x - 40} y={1290 + i * 30} width={80} height={20} rx={8} fill="#a8743c" stroke={INK} strokeWidth={4} transform={`rotate(${15 - i * 30} ${x} 1300)`} />
      ))}
      <Island x={540} y={1280} s={1.35} f={f} />
      <Stickman x={340} y={1150} pose={standPose(f)} dress="#4f8a3c" hair="#c9a46a" />
      <Stickman x={650} y={1150} pose={sitPose(f)} {...HERO} />
      <g transform="translate(140 820)">
        <rect x={0} y={0} width={230} height={150} rx={14} fill={STONE} stroke={INK} strokeWidth={5} />
        {Array.from({ length: marks }, (_, i) => (
          <line key={i} x1={30 + i * 26} y1={30} x2={30 + i * 26} y2={120} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        ))}
      </g>
      <Night o={cycle * 0.4} />
    </g>
  );
};

/* ------------------------------------------------------------------ 12 · return as a beggar */
const Dog: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M -50 -26 Q -80 ${-50 + Math.sin(f * 0.8) * 16} -90 ${-40 + Math.sin(f * 0.8) * 20}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={0} cy={-22} rx={56} ry={22} fill="#a8743c" stroke={INK} strokeWidth={5} />
    <circle cx={58} cy={-38} r={22} fill="#a8743c" stroke={INK} strokeWidth={5} />
    <path d="M 50 -56 Q 40 -40 46 -26" fill="#7a4a1d" stroke={INK} strokeWidth={4} />
  </g>
);

export const Homecoming: React.FC<SceneProps> = ({ f }) => {
  const ground = 1260;
  const bx = iv(f, [0, 150], [260, 520]);
  return (
    <g>
      <Sun x={180} y={430} f={f} r={55} />
      <Sea f={f} y={1280} />
      <Raft x={120} y={1300} f={f} />
      <Ground y={ground} from={250} to={1120} />
      <Palace x={850} y={ground - 5} s={0.8} />
      {[720, 850, 980].map((x, i) => (
        <Stickman key={x} x={x} y={ground} s={0.8} face={i === 2 ? -1 : 1} pose={cheerPose(f, i * 1.4)} item="cup" color="#3a2a1a" />
      ))}
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 25) % 75) / 75;
        return <Note key={i} x={760 + i * 100 + t * 30} y={880 - t * 160} s={0.8} />;
      })}
      <Dog x={620} y={ground} f={f} />
      {f > 115 ? <Heart x={640} y={iv(f, [115, 170], [1180, 1060])} s={0.8} opacity={iv(f, [115, 125, 165, 178], [0, 1, 1, 0])} /> : null}
      <Stickman x={bx} y={ground} pose={{ ...walkPose(f, 0.18, 16), lean: 22 }} hood="#7a5c3e" item="staff" itemAngle={10} />
    </g>
  );
};

/* ------------------------------------------------------------------ 13 · the bow */
export const BowContest: React.FC<SceneProps> = ({ f }) => {
  const ground = 1260;
  const holeY = ground - 150;
  const axes = Array.from({ length: 12 }, (_, i) => 440 + i * 52);
  const revealed = f >= 108;
  const arrowX = iv(f, [130, 168], [420, 1180], Easing.in(Easing.quad));
  const suitor = iv(f, [62, 82], [1, 0]);
  const strain = Math.sin(f * 1.2) * 5;
  const aim: Pose = { lArm: [85, 80], rArm: [90, 90], lLeg: [-20, -20], rLeg: [22, 22] };
  return (
    <g>
      <rect x={-40} y={0} width={1160} height={ground} fill="#ecdcb8" />
      {[70, 1010].map((x) => (
        <rect key={x} x={x - 30} y={500} width={60} height={ground - 500} fill="#fffbe9" stroke={INK} strokeWidth={5} />
      ))}
      <rect x={-40} y={470} width={1160} height={40} fill={STONE} stroke={INK} strokeWidth={5} />
      <rect x={-40} y={ground} width={1160} height={700} fill={STONE} stroke={INK} strokeWidth={6} />
      <Stickman x={110} y={ground} s={0.95} pose={f >= 168 ? cheerPose(f) : { ...standPose(f), lArm: [120, 175], rArm: [130, 185] }} {...PENELOPE} />
      {axes.map((x) => (
        <Axe key={x} x={x} y={ground} />
      ))}
      {axes.map((x) =>
        arrowX > x && arrowX < x + 140 ? <Sparkle key={x} x={x} y={holeY} r={18} rot={f * 8} /> : null,
      )}
      {suitor > 0 ? (
        <Stickman x={230} y={ground} opacity={suitor} pose={{ lArm: [80 + strain, 70], rArm: [80 - strain, 80], lLeg: [-18, -18], rLeg: [18, 18], lean: strain }} item="bow" itemAngle={strain * 2} color="#3a2a1a" />
      ) : null}
      <Stickman
        x={revealed ? 330 : 360}
        y={ground}
        s={0.85}
        pose={revealed ? aim : { ...standPose(f), lean: 22 }}
        hood={revealed ? undefined : "#7a5c3e"}
        helmet={revealed}
        cape={revealed ? RED : undefined}
        item={revealed ? "bow" : "staff"}
      />
      {f >= 100 && f < 116 ? <Puff x={345} y={ground - 120} t={iv(f, [100, 116], [0, 1])} color="#fff2b8" /> : null}
      {f >= 130 && f < 172 ? (
        <g>
          <line x1={arrowX - 220} y1={holeY} x2={arrowX - 60} y2={holeY} stroke={INK} strokeWidth={3} opacity={0.4} strokeDasharray="10 10" />
          <line x1={arrowX - 60} y1={holeY} x2={arrowX} y2={holeY} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <path d={`M ${arrowX} ${holeY - 8} L ${arrowX + 18} ${holeY} L ${arrowX} ${holeY + 8} Z`} fill={INK} />
        </g>
      ) : null}
    </g>
  );
};

/* ------------------------------------------------------------------ 14 · reunion & end card */
export const Reunion: React.FC<SceneProps> = ({ f, font }) => {
  const ground = 1260;
  const meet = iv(f, [0, 70], [0, 1], inOut);
  const hugging = f >= 70;
  const card = iv(f, [150, 175], [0, 1]);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#f2a65a" opacity={0.28} />
      <Sun x={170} y={1250} f={f} r={120} color="#f59a3c" />
      <Ground y={ground} />
      <Palace x={880} y={ground - 5} s={0.7} />
      <Stickman x={260} y={ground} s={0.9} pose={f >= 85 ? cheerPose(f) : standPose(f)} />
      <Stickman x={iv(meet, [0, 1], [380, 500])} y={ground} pose={hugging ? hugPose() : walkPose(f)} {...HERO} />
      <Stickman x={iv(meet, [0, 1], [760, 590])} y={ground} face={-1} pose={hugging ? hugPose() : walkPose(f, 0.28, 26, 1)} {...PENELOPE} />
      {hugging
        ? [0, 1, 2, 3].map((i) => {
            const t = ((f - 70 + i * 22) % 90) / 90;
            return <Heart key={i} x={545 + Math.sin(t * 6 + i) * 60} y={1000 - t * 300} s={0.6 + (i % 2) * 0.3} opacity={1 - t} />;
          })
        : null}
      <g opacity={card}>
        <rect x={0} y={0} width={1080} height={1920} fill={PAPER} opacity={0.55} />
        <g transform={`translate(540 640) scale(${iv(f, [150, 178], [0.8, 1], Easing.out(Easing.back(1.5)))})`}>
          <text textAnchor="middle" fontFamily={font} fontSize={120} fill={INK}>
            THE
          </text>
          <text textAnchor="middle" fontFamily={font} fontSize={150} y={150} fill={RED} stroke={INK} strokeWidth={5}>
            ODYSSEY
          </text>
          <text textAnchor="middle" fontFamily="Patrick Hand, sans-serif" fontSize={58} y={250} fill={INK}>
            20 years · 1 way home
          </text>
        </g>
      </g>
    </g>
  );
};
