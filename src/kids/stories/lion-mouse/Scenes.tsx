/**
 * The Lion and the Mouse — one component per story beat. Each runs inside its own
 * <Sequence>, so `useCurrentFrame()` is scene-local; beats are cued to narration phrases.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bubble, C, Camera, Heart, Sparkle, clamp, cueFrame, easeInOut, easeOut, popAt, useT, type Placed } from "../../kit";
import { LC, Lion, Litter, Mouse, RecyclingBin, Scooter, lionPawTop, lionToScene, type LitterKind } from "./Characters";
import { GROUND_Y, Savanna } from "./Backgrounds";
import type { Scene } from "./story";

type SceneProps = { scene: Scene };

const useCue = (scene: Scene) => {
  const { fps } = useVideoConfig();
  return (p: string) => cueFrame(scene, p, fps);
};

/** Interpolate a point along keyframed positions. */
const along = (frame: number, at: number[], pts: { x: number; y: number }[]) => ({
  x: interpolate(frame, at, pts.map((p) => p.x), { ...clamp, easing: easeInOut }),
  y: interpolate(frame, at, pts.map((p) => p.y), { ...clamp, easing: easeInOut }),
});

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

/* ───────────────────────────── 1 · Title ───────────────────────────── */

export const TitleScene: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const t = useT();
  const word = (i: number) => interpolate(frame, [8 + i * 8, 26 + i * 8], [0, 1], { ...clamp, easing: easeOut });
  const lines = [t({ en: "The Lion", es: "El León" }), t({ en: "and the", es: "y el" }), t({ en: "Mouse", es: "Ratón" })];
  const mouseX = interpolate(frame, [0, 40], [2100, 1580], { ...clamp, easing: easeOut });
  return (
    <Savanna treeX={null}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 240 }}>
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
                fontSize: i === 1 ? 64 : 124,
                fontWeight: 700,
                color: i === 0 ? LC.maneDark : i === 2 ? C.lavenderDark : C.ink,
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
      <Lion x={360} y={GROUND_Y + 8} size={460} pose="lie" mouthOpen={frame > 30 ? 0.1 : 0} />
      <Mouse x={mouseX} y={GROUND_Y} size={200} flip scooter ride={frame < 40 ? 1 : 0} />
    </Savanna>
  );
};

/* ───────────────────────────── 2 · The nap ───────────────────────────── */

export const NapScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const lion: Placed = { x: 860, y: GROUND_Y + 8, size: 620 };
  const nose = lionToScene(lion, { x: 360, y: 250 });
  const rumble = cue("Rumble");
  const big = interpolate(frame, [rumble, rumble + 20], [0.6, 1], clamp);
  return (
    <Camera from={1} to={1.07}>
      <Savanna treeX={720}>
        <Lion {...lion} pose="lie" eyes="closed" />
        <Snores x={nose.x} y={nose.y - 60} opacity={big} />
        {/* a butterfly drifts by */}
        <Butterfly x={interpolate(frame, [0, 500], [1700, 1100], clamp)} y={420 + Math.sin(frame / 14) * 40} />
      </Savanna>
    </Camera>
  );
};

const Butterfly: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const flap = 0.4 + Math.abs(Math.sin(frame / 3)) * 0.6;
  return (
    <svg viewBox="-50 -50 100 100" width={90} height={90} style={{ position: "absolute", left: x - 45, top: y - 45 }}>
      <g style={{ scale: `${flap} 1` }}>
        <ellipse cx={-22} cy={-12} rx={22} ry={18} fill={C.pink} />
        <ellipse cx={22} cy={-12} rx={22} ry={18} fill={C.pink} />
        <ellipse cx={-16} cy={14} rx={14} ry={12} fill={C.lavender} />
        <ellipse cx={16} cy={14} rx={14} ry={12} fill={C.lavender} />
      </g>
      <rect x={-3} y={-20} width={6} height={42} rx={3} fill={C.ink} />
    </svg>
  );
};

/* ───────────────────────────── 3 · The scooter ───────────────────────────── */

export const SCOOTER_LION: Placed = { x: 1060, y: GROUND_Y + 8, size: 600 };
const MUZZLE_TOP = { x: 345, y: 270 };

export const ScooterScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const L = SCOOTER_LION;
  const at = [cue("Along came"), cue("She rolled"), cue("tail, over"), cue("over his back"), cue("and onto"), cue("his nose!")];
  const pts = [
    { x: -150, y: GROUND_Y },
    lionToScene(L, { x: 14, y: 386 }),
    lionToScene(L, { x: 80, y: 342 }),
    lionToScene(L, { x: 190, y: 276 }),
    lionToScene(L, { x: 290, y: 150 }),
    lionToScene(L, MUZZLE_TOP),
  ];
  const p = along(frame, at, pts);
  const q = along(frame + 2, at, pts);
  const slope = Math.max(-35, Math.min(35, (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI));
  const moving = frame > at[0] && frame < at[5];
  const onNose = frame >= at[5];
  const zip = cue("Zip!");
  const oops = cue("Oops!");
  const t = useT();
  return (
    <Camera from={1} to={1.05}>
      <Savanna treeX={560}>
        <Lion {...L} pose="lie" eyes="closed" twitch={onNose} />
        <Snores x={lionToScene(L, { x: 360, y: 250 }).x} y={360} opacity={interpolate(frame, [at[4] - 10, at[4]], [1, 0], clamp)} />
        <Mouse x={p.x} y={p.y} size={140} scooter ride={moving ? 1 : 0} rotate={moving ? slope : 0} mouthOpen={frame > oops && frame < oops + 40 ? 1 : 0} />
        <Bubble
          x={pts[1].x - 60}
          y={pts[1].y - 190}
          tail="left"
          width={460}
          fontSize={60}
          color={C.butter}
          text={t({ en: "Zip! Zoom!", es: "¡Zip! ¡Zum!" })}
          pop={popAt(frame, zip, 8) * interpolate(frame, [oops + 20, oops + 30], [1, 0], clamp)}
        />
        {[0, 1, 2].map((i) => (
          <Sparkle key={i} x={pts[5].x - 60 + i * 60} y={pts[5].y - 200 - (i % 2) * 40} size={44} t={(frame - at[5] - i * 6) / 8} />
        ))}
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 4 · Caught ───────────────────────────── */

export const CAUGHT_LION: Placed = { x: 820, y: GROUND_Y + 8, size: 640 };

export const CaughtScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const L = CAUGHT_LION;
  const eyeAt = cue("opened one");
  const scoop = cue("gently scooped");
  const who = cue("“Who is");
  const please = cue("“Oh, please");
  const oneDay = cue("“One day");
  const pawUp = interpolate(frame, [scoop + 8, scoop + 34], [0, 1], { ...clamp, easing: easeInOut });
  const hop = interpolate(frame, [scoop, scoop + 12], [0, 1], { ...clamp, easing: easeInOut });
  const nose = lionToScene(L, MUZZLE_TOP);
  const paw = lionToScene(L, lionPawTop(pawUp));
  const mx = interpolate(hop, [0, 1], [nose.x, paw.x]);
  const my = interpolate(hop, [0, 1], [nose.y, paw.y]) - Math.sin(hop * Math.PI) * 60;
  const lionTalking = frame > who && frame < please;
  const mouseTalking = frame > please;
  const out = (a: number, b: number) => popAt(frame, a, 8) * interpolate(frame, [b - 6, b], [1, 0], clamp);
  return (
    <Camera from={1.02} to={1.08}>
      <Savanna treeX={300}>
        <Scooter x={1560} y={GROUND_Y} size={150} />
        <Lion
          {...L}
          pose="lie"
          eyes={frame < eyeAt ? "closed" : frame < scoop + 20 ? "one" : "open"}
          pawUp={pawUp}
          mouthOpen={lionTalking ? Math.abs(Math.sin(frame / 4)) * 0.7 : 0}
        />
        <Mouse
          x={mx}
          y={my}
          size={140}
          flip={hop > 0.5}
          shake={frame > scoop + 34 && frame < please ? 2.5 : 0}
          mouthOpen={mouseTalking ? Math.abs(Math.sin(frame / 3)) : 0}
          headTilt={mouseTalking ? -8 : 0}
        />
        <Bubble x={900} y={470} tail="left" width={600} fontSize={52} text={t({ en: "Who is tickling my nose?", es: "¿Quién me hace cosquillas?" })} pop={out(who, please)} />
        <Bubble x={1200} y={560} tail="left" width={520} fontSize={52} color={C.mint} text={t({ en: "Please let me go!", es: "¡Por favor, suéltame!" })} pop={out(please, oneDay)} />
        <Bubble x={1200} y={560} tail="left" width={560} fontSize={52} color={C.mint} text={t({ en: "One day, I'll help you too!", es: "¡Un día, yo también te ayudaré!" })} pop={popAt(frame, oneDay, 8)} />
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 5 · The laugh ───────────────────────────── */

export const LaughScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const L = CAUGHT_LION;
  const ho = cue("“Ho ho ho");
  const kind = cue("But he was kind");
  const open = cue("opened his paw");
  const off = cue("off she scooted");
  const laughing = frame < kind;
  const pawUp = interpolate(frame, [open, open + 24], [1, 0], { ...clamp, easing: easeInOut });
  const paw = lionToScene(L, lionPawTop(pawUp));
  const hop = interpolate(frame, [open + 24, open + 40], [0, 1], { ...clamp, easing: easeInOut });
  const scooterX = 1340;
  const ride = interpolate(frame, [off + 4, off + 50], [scooterX, 2150], { ...clamp, easing: easeInOut });
  const onScooter = hop >= 1;
  const mx = onScooter ? ride : interpolate(hop, [0, 1], [paw.x, scooterX]);
  const my = onScooter ? GROUND_Y : interpolate(hop, [0, 1], [paw.y, GROUND_Y]) - Math.sin(hop * Math.PI) * 80;
  return (
    <Camera from={1.06} to={1.0}>
      <Savanna treeX={300}>
        {!onScooter ? <Scooter x={scooterX} y={GROUND_Y} size={150} /> : null}
        <Lion
          {...L}
          pose="lie"
          eyes={laughing && frame > 10 ? "closed" : "open"}
          laugh={laughing}
          pawUp={pawUp}
          mouthOpen={laughing ? 0.6 + Math.abs(Math.sin(frame / 3)) * 0.4 : 0}
        />
        <Mouse
          x={mx}
          y={my}
          size={onScooter ? 150 : 140}
          flip={!onScooter}
          scooter={onScooter}
          ride={onScooter && frame > off ? 1 : 0}
          headTilt={laughing ? 10 : 0}
          mouthOpen={frame > kind && frame < open ? 0.6 : 0}
        />
        {[0, 1, 2].map((i) => (
          <Bubble
            key={i}
            x={560 + i * 230}
            y={440 - i * 60}
            tail="left"
            width={220}
            fontSize={58}
            color={[C.butter, C.peach, C.pink][i]}
            text={t({ en: "Ho!", es: "¡Jo!" })}
            pop={popAt(frame, ho + i * 9, 8) * interpolate(frame, [kind - 10, kind], [1, 0], clamp)}
          />
        ))}
        {frame > kind ? <Heart x={lionToScene(L, { x: 300, y: 150 }).x} y={340} size={80} beat={Math.max(0, Math.sin((frame - kind) / 6)) * 0.5 + 0.1} /> : null}
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 6 · The net ───────────────────────────── */

export const NetScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const stuck = cue("and his paw");
  const wriggle = cue("The more he");
  const help = cue("“Help!”");
  const x = interpolate(frame, [0, stuck + 10], [260, 900], clamp);
  const walking = frame < stuck + 10;
  const net = interpolate(frame, [stuck + 4, stuck + 24], [0, 1], clamp);
  return (
    <Camera from={1} to={1.06}>
      <Savanna treeX={1500} longGrass>
        <Litter kind="can" x={1330} y={GROUND_Y - 10} size={70} rotate={80} />
        <Litter kind="bottle" x={1480} y={GROUND_Y - 6} size={80} rotate={-70} />
        <Litter kind="paper" x={1650} y={GROUND_Y - 4} size={60} />
        <Lion
          x={x}
          y={GROUND_Y + 6}
          size={560}
          pose="stand"
          walk={walking ? 1 : 0}
          net={net}
          worried={frame > stuck + 10}
          wriggle={frame > wriggle && frame < help + 60 ? 7 : 0}
          mouthOpen={frame > help ? 0.4 + Math.abs(Math.sin(frame / 5)) * 0.5 : frame > stuck + 10 ? 0.3 : 0}
        />
        <Bubble x={1060} y={420} tail="left" width={420} fontSize={78} color={C.butter} text={t({ en: "Help!", es: "¡Ayuda!" })} pop={popAt(frame, help, 8)} />
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 7 · The rescue ───────────────────────────── */

export const RescueScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const heard = cue("heard the roar");
  const hold = cue("“Hold still");
  const nibbleAt = cue("Nibble, nibble");
  const free = cue("was free");
  const rideX = interpolate(frame, [heard, hold - 8], [2150, 1140], { ...clamp, easing: easeInOut });
  const parked = frame >= hold - 8;
  const hop = interpolate(frame, [hold - 8, hold + 6], [0, 1], { ...clamp, easing: easeInOut });
  const mouseX = parked ? interpolate(hop, [0, 1], [1140, 960]) : rideX;
  const netCut = interpolate(frame, [nibbleAt, free], [0, 1], clamp);
  const isFree = frame > free;
  const jump = isFree ? Math.abs(Math.sin((frame - free) / 6)) * -40 * interpolate(frame, [free, free + 50], [1, 0], clamp) : 0;
  const snips = [cue("snip! Nibble"), cue("snip! One")];
  return (
    <Camera from={1.02} to={1.07}>
      <Savanna treeX={1500} longGrass>
        <Lion
          x={760}
          y={GROUND_Y + 6 + jump}
          size={600}
          pose="stand"
          net={interpolate(frame, [free, free + 10], [1, 0], clamp)}
          netCut={netCut}
          worried={!isFree}
          wriggle={frame < hold ? 4 : 0}
          mouthOpen={isFree ? 0.7 : 0}
          eyes="open"
        />
        {parked ? <Scooter x={1140} y={GROUND_Y} size={150} flip /> : null}
        <Mouse
          x={mouseX}
          y={GROUND_Y - Math.sin(hop * Math.PI) * 50}
          size={parked ? 160 : 150}
          flip
          scooter={!parked}
          ride={!parked && frame > heard ? 1 : 0}
          nibble={frame > nibbleAt && !isFree}
          wave={isFree}
          mouthOpen={frame > hold && frame < nibbleAt ? Math.abs(Math.sin(frame / 3)) : 0}
        />
        <Bubble
          x={1000}
          y={600}
          tail="left"
          width={520}
          fontSize={52}
          color={C.mint}
          text={t({ en: "Hold still, my friend!", es: "¡Quieto, amigo mío!" })}
          pop={popAt(frame, hold, 8) * interpolate(frame, [nibbleAt - 6, nibbleAt], [1, 0], clamp)}
        />
        {snips.map((s, i) => (
          <Bubble
            key={i}
            x={1000 + i * 260}
            y={560 - i * 60}
            tail="left"
            width={240}
            fontSize={58}
            color={C.butter}
            text={t({ en: "Snip!", es: "¡Clic!" })}
            pop={popAt(frame, s, 8) * interpolate(frame, [s + 30, s + 38], [1, 0], clamp)}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Sparkle key={i} x={600 + i * 110} y={300 + (i % 2) * 70} size={56} t={(frame - free - i * 5) / 8} />
        ))}
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 8 · The clean-up crew ───────────────────────────── */

const BINS = [
  { x: 1290, color: LC.binBlue },
  { x: 1510, color: LC.binMint },
  { x: 1730, color: LC.binButter },
];

const TOSSES: { kind: LitterKind; from: number; bin: number; cue: string }[] = [
  { kind: "rope", from: 900, bin: 0, cue: "the old net" },
  { kind: "can", from: 1010, bin: 1, cue: "all the litter" },
  { kind: "bottle", from: 1110, bin: 2, cue: "in the grass" },
  { kind: "paper", from: 960, bin: 0, cue: "sorted it" },
];

export const CrewScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const L: Placed = { x: 500, y: GROUND_Y + 8, size: 560 };
  const together = cue("Then together");
  const crew = cue("And that was");
  const pawUp = interpolate(frame, [0, 20, together - 10, together + 10], [0, 1, 1, 0], { ...clamp, easing: easeInOut });
  const paw = lionToScene(L, lionPawTop(pawUp));
  const hop = interpolate(frame, [together + 10, together + 26], [0, 1], { ...clamp, easing: easeInOut });
  const mx = interpolate(hop, [0, 1], [paw.x, 800]);
  const my = interpolate(hop, [0, 1], [paw.y, GROUND_Y]) - Math.sin(hop * Math.PI) * 70;
  return (
    <Camera from={1} to={1.05}>
      <Savanna treeX={null} evening>
        {BINS.map((b, i) => {
          const landed = TOSSES.filter((s) => s.bin === i).map((s) => cue(s.cue) + 26);
          const bump = landed.reduce((m, f) => Math.max(m, interpolate(frame, [f, f + 4, f + 12], [0, 1, 0], clamp)), 0);
          return <RecyclingBin key={i} x={b.x} y={GROUND_Y + 6} color={b.color} bump={bump} />;
        })}
        {TOSSES.map((s, i) => {
          const start = cue(s.cue);
          const k = interpolate(frame, [start, start + 26], [0, 1], { ...clamp, easing: easeInOut });
          const toX = BINS[s.bin].x;
          const x = interpolate(k, [0, 1], [s.from, toX]);
          const y = interpolate(k, [0, 1], [GROUND_Y - 20, GROUND_Y - 200]) - Math.sin(k * Math.PI) * 220;
          return k < 1 ? <Litter key={i} kind={s.kind} x={x} y={y} size={70} rotate={k * 360} /> : null;
        })}
        <Lion {...L} pose="lie" pawUp={pawUp} mouthOpen={frame > crew ? 0.5 : 0} />
        <Mouse x={mx} y={my} size={140} flip={hop < 0.5} wave={frame > crew} mouthOpen={frame > crew ? 0.6 : 0} />
        {frame < together + 10
          ? [0, 1, 2].map((i) => (
              <Heart key={i} x={paw.x - 80 + i * 70} y={paw.y - 200 - ((frame * 1.4 + i * 50) % 140)} size={46} beat={0.2} color={i % 2 ? C.pink : C.pinkDark} />
            ))
          : null}
        {/* the crew's banner */}
        <div
          style={{
            position: "absolute",
            left: 960 - 380,
            top: 150,
            width: 760,
            padding: "26px 0",
            background: C.cream,
            borderRadius: 40,
            border: `8px solid ${LC.binMint}`,
            textAlign: "center",
            fontSize: 76,
            fontWeight: 700,
            color: C.leafDark,
            scale: `${interpolate(popAt(frame, crew, 14), [0, 0.7, 1], [0, 1.12, 1])}`,
            rotate: `${Math.sin(frame / 14) * 2}deg`,
            boxShadow: "0 12px 0 rgba(94,75,110,0.14)",
          }}
        >
          {t({ en: "Clean-Up Crew!", es: "¡Equipo de Limpieza!" })}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Sparkle key={i} x={560 + i * 270} y={130 + (i % 2) * 170} size={54} t={(frame - crew - i * 6) / 8} />
        ))}
      </Savanna>
    </Camera>
  );
};

/* ───────────────────────────── 9 · Moral ───────────────────────────── */

export const MoralScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cue = useCue(scene);
  const t = useT();
  const card = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: easeOut });
  const body = interpolate(frame, [cue("no act"), cue("no act") + 16], [0, 1], clamp);
  const echo = interpolate(frame, [cue("Even little"), cue("Even little") + 16], [0, 1], clamp);
  const end = popAt(frame, cue("The end!"), 14);
  return (
    <AbsoluteFill style={{ backgroundColor: LC.ground }}>
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
          <div style={{ fontSize: 58, fontWeight: 700, color: LC.maneDark, marginBottom: 22 }}>
            {t({ en: "The Moral of the Story", es: "La moraleja de la historia" })}
          </div>
          <div style={{ fontSize: 70, fontWeight: 600, color: C.ink, lineHeight: 1.2, opacity: body, translate: `0px ${(1 - body) * 20}px` }}>
            {t({ en: "No act of kindness is ever too small.", es: "Ningún acto de bondad es demasiado pequeño." })}
          </div>
          <div style={{ marginTop: 22, fontSize: 46, fontWeight: 500, color: C.lavenderDark, lineHeight: 1.25, opacity: echo }}>
            {t({
              en: "Little friends can do big things, for each other and for our planet.",
              es: "Los amigos pequeños pueden hacer cosas grandes, unos por otros y por nuestro planeta.",
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
      <Lion x={210} y={1070} size={360} pose="lie" mouthOpen={end > 0 ? 0.5 : 0} />
      <Mouse x={1730} y={1060} size={220} flip wave={end > 0} />
    </AbsoluteFill>
  );
};
